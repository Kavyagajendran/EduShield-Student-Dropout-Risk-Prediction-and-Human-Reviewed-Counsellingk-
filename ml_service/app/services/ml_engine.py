import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple

from app.schemas import (
    StudentFeatures, PredictionResponse, SHAPFeatureContribution,
    SuggestedIntervention, BatchPredictionResponse, BatchPredictionItem
)

class MLEngine:
    def __init__(self):
        self.preprocessor = None
        self.champion_model = None
        self.explainer = None
        self.benchmark_metrics: Dict[str, Any] = {}
        self.feature_metadata: Dict[str, Any] = {}
        self.all_feature_names: List[str] = []
        self.is_loaded = False

    def load_artifacts(self, base_models_path: str = None):
        if base_models_path is None:
            curr_dir = os.path.dirname(os.path.abspath(__file__))
            base_models_path = os.path.abspath(os.path.join(curr_dir, "..", "..", "..", "models"))
        
        print(f"Loading ML artifacts from: {base_models_path}")
        preprocessor_path = os.path.join(base_models_path, "preprocessor.joblib")
        model_path = os.path.join(base_models_path, "champion_lightgbm.joblib")
        explainer_path = os.path.join(base_models_path, "shap_explainer.joblib")
        metrics_path = os.path.join(base_models_path, "benchmark_metrics.json")
        metadata_path = os.path.join(base_models_path, "feature_metadata.json")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}. Run training pipeline first.")

        self.preprocessor = joblib.load(preprocessor_path)
        self.champion_model = joblib.load(model_path)
        self.explainer = joblib.load(explainer_path)

        with open(metrics_path, "r") as f:
            self.benchmark_metrics = json.load(f)

        with open(metadata_path, "r") as f:
            self.feature_metadata = json.load(f)

        # Reconstruct transformed feature names
        cat_encoder = self.preprocessor.named_transformers_["cat"]
        cat_features = list(cat_encoder.get_feature_names_out(self.feature_metadata["categorical_features"]))
        self.all_feature_names = self.feature_metadata["numeric_features"] + cat_features

        self.is_loaded = True
        print(f"MLEngine successfully initialized with champion model: LightGBM ({len(self.all_feature_names)} features).")

    def _prepare_dataframe(self, student: StudentFeatures) -> pd.DataFrame:
        data = student.model_dump()
        # Keep only features used in training
        req_cols = self.feature_metadata["numeric_features"] + self.feature_metadata["categorical_features"]
        filtered = {k: [data.get(k)] for k in req_cols}
        return pd.DataFrame(filtered)

    def predict_student(self, student: StudentFeatures) -> PredictionResponse:
        if not self.is_loaded:
            self.load_artifacts()

        df_input = self._prepare_dataframe(student)
        X_trans = self.preprocessor.transform(df_input)

        # Predict probability
        probs = self.champion_model.predict_proba(X_trans)[0]
        prob_dropout = float(probs[1])
        prob_retained = float(probs[0])

        # Risk categorization
        if prob_dropout >= 0.65:
            risk_category = "High"
            pred_label = "Dropout Risk"
        elif prob_dropout >= 0.35:
            risk_category = "Moderate"
            pred_label = "Moderate Risk / Watchlist"
        else:
            risk_category = "Low"
            pred_label = "Retained / Low Risk"

        confidence = float(max(prob_dropout, prob_retained))

        # Real SHAP computation
        shap_raw = self.explainer.shap_values(X_trans)
        if isinstance(shap_raw, list):
            sample_shap = shap_raw[1][0]
        elif len(shap_raw.shape) == 3:
            sample_shap = shap_raw[0, :, 1]
        elif len(shap_raw.shape) == 2:
            sample_shap = shap_raw[0]
        else:
            sample_shap = shap_raw

        # Expected value
        ev = self.explainer.expected_value
        if isinstance(ev, (list, np.ndarray)):
            base_val = float(ev[1]) if len(ev) > 1 else float(ev[0])
        else:
            base_val = float(ev)

        # Build feature contributions
        contributions: List[SHAPFeatureContribution] = []
        raw_dict = student.model_dump()

        for idx, feat_name in enumerate(self.all_feature_names):
            s_val = float(sample_shap[idx])
            # Determine original value and label
            orig_feature = feat_name.split("_")[0] if "_" in feat_name else feat_name
            # Check if this is a one-hot feature
            matched_orig = None
            for cat_col in self.feature_metadata["categorical_features"]:
                if feat_name.startswith(f"{cat_col}_"):
                    matched_orig = cat_col
                    break
            
            if matched_orig:
                feature_key = matched_orig
                orig_val = raw_dict.get(matched_orig, "N/A")
                label = f"{matched_orig.replace('_', ' ').title()} ({feat_name.replace(matched_orig + '_', '')})"
            else:
                feature_key = feat_name
                orig_val = raw_dict.get(feat_name, "N/A")
                label = feat_name.replace('_', ' ').title()

            direction = "increases_risk" if s_val > 0 else "decreases_risk"
            desc = self.feature_metadata["descriptions"].get(feature_key, f"Impact of {label}")

            contributions.append(SHAPFeatureContribution(
                feature=feat_name,
                feature_label=label,
                original_value=orig_val,
                shap_value=round(s_val, 4),
                direction=direction,
                magnitude=round(abs(s_val), 4),
                description=desc
            ))

        # Sort contributions by absolute magnitude
        contributions.sort(key=lambda c: c.magnitude, reverse=True)
        top_contribs = contributions[:8]
        positive_contribs = [c for c in contributions if c.direction == "increases_risk"][:5]
        negative_contribs = [c for c in contributions if c.direction == "decreases_risk"][:5]

        # Plain language explanation synthesis
        explanation = self._generate_explanation(student, prob_dropout, risk_category, positive_contribs, negative_contribs)

        # Suggested areas for human review and structured interventions
        review_areas, interventions = self._generate_interventions(student, prob_dropout, risk_category, positive_contribs)

        # Flag for human review policy:
        # Require human review if risk is High or Moderate, or if critical thresholds are breached
        requires_review = (
            prob_dropout >= 0.40 or
            student.backlog_count >= 2 or
            student.attendance_rate < 75.0 or
            student.tuition_fees_up_to_date == 0 or
            student.stress_level_score >= 8
        )

        return PredictionResponse(
            student_id=student.student_id or "STU-UNKNOWN",
            dropout_risk_probability=round(prob_dropout, 4),
            risk_percentage=round(prob_dropout * 100, 1),
            risk_category=risk_category,
            prediction_label=pred_label,
            champion_model="LightGBM",
            base_value=round(base_val, 4),
            confidence_score=round(confidence, 4),
            top_contributing_features=top_contribs,
            positive_contributions=positive_contribs,
            negative_contributions=negative_contribs,
            plain_language_explanation=explanation,
            suggested_areas_for_review=review_areas,
            suggested_interventions=interventions,
            requires_human_review=requires_review
        )

    def _generate_explanation(
        self, student: StudentFeatures, prob: float, category: str,
        pos_contribs: List[SHAPFeatureContribution], neg_contribs: List[SHAPFeatureContribution]
    ) -> str:
        pct = round(prob * 100, 1)
        lines = [f"Student {student.student_id} is evaluated as **{category} Risk** with an estimated dropout probability of {pct}%."]

        if pos_contribs:
            top_pos_names = [f"{c.feature_label} (value: {c.original_value})" for c in pos_contribs[:3]]
            lines.append(f"Primary risk drivers elevating dropout likelihood include: {', '.join(top_pos_names)}.")
        
        if neg_contribs:
            top_neg_names = [f"{c.feature_label} (value: {c.original_value})" for c in neg_contribs[:3]]
            lines.append(f"Protective academic/behavioural assets that mitigate risk include: {', '.join(top_neg_names)}.")

        if category == "High":
            lines.append("Urgent human faculty review and proactive counselling engagement are strongly recommended.")
        elif category == "Moderate":
            lines.append("Advisory check-in and targeted academic monitoring are recommended to prevent further escalation.")
        else:
            lines.append("Current indicators reflect stable academic progression. Maintain standard institutional support.")

        return " ".join(lines)

    def _generate_interventions(
        self, student: StudentFeatures, prob: float, category: str,
        pos_contribs: List[SHAPFeatureContribution]
    ) -> Tuple[List[str], List[SuggestedIntervention]]:
        areas = []
        interventions = []

        # 1. Academic Performance & Backlogs
        if student.backlog_count > 0 or student.gpa_current < 2.5:
            areas.append("Academic Tutoring & Remedial Backlog Support")
            interventions.append(SuggestedIntervention(
                category="Academic",
                title="Remedial Course Tutoring & Coursework Catch-Up Plan",
                rationale=f"Student currently carries {student.backlog_count} uncleared backlog(s) with GPA of {student.gpa_current:.2f}.",
                priority="High" if student.backlog_count >= 2 else "Medium",
                suggested_action="Schedule one-on-one session with departmental academic advisor; assign peer tutor for backlog subjects."
            ))

        # 2. Attendance & Lecture Engagement
        if student.attendance_rate < 75.0 or student.lab_attendance_rate < 75.0:
            areas.append("Attendance Regularity Review")
            interventions.append(SuggestedIntervention(
                category="Attendance",
                title="Attendance Restoration & Schedule Feasibility Check",
                rationale=f"Lecture attendance ({student.attendance_rate:.1f}%) and/or lab attendance ({student.lab_attendance_rate:.1f}%) are below the 75% statutory threshold.",
                priority="High" if student.attendance_rate < 65.0 else "Medium",
                suggested_action="Review potential transit or scheduling conflicts; establish weekly attendance check-ins with faculty mentor."
            ))

        # 3. Financial Support & Tuition Fees
        if student.tuition_fees_up_to_date == 0 or (student.family_income_bracket == "Low" and student.scholarship_recipient == 0):
            areas.append("Institutional Financial Aid & Tuition Payment Plan")
            interventions.append(SuggestedIntervention(
                category="Financial",
                title="Bursary Referral and Deferred Fee Payment Scheduling",
                rationale="Unsettled tuition fees or socio-economic distress present a prominent non-academic attrition hazard.",
                priority="High" if student.tuition_fees_up_to_date == 0 else "Medium",
                suggested_action="Connect student to Financial Aid Office to explore emergency grants, instalment plans, or work-study programs."
            ))

        # 4. Psychological Stress & Well-being
        if student.stress_level_score >= 7 or student.sleep_hours_per_day < 5.5:
            areas.append("Confidential Campus Well-Being Counselling")
            interventions.append(SuggestedIntervention(
                category="Well-being",
                title="Voluntary Wellness Check & Stress Reduction Counselling",
                rationale=f"Self-reported stress level is elevated ({student.stress_level_score}/10) with average sleep duration of {student.sleep_hours_per_day}h.",
                priority="High" if student.stress_level_score >= 8 else "Medium",
                suggested_action="Provide a voluntary, non-stigmatizing referral to university counselling services for mental health support."
            ))

        # 5. Digital Engagement & Belonging
        if student.lms_logins_per_week < 8 or student.social_belonging_score <= 4:
            areas.append("Campus Community Integration & Study Group Mentorship")
            interventions.append(SuggestedIntervention(
                category="Engagement",
                title="Student Peer Group Onboarding & LMS Engagement Session",
                rationale=f"Low portal interaction ({student.lms_logins_per_week} logins/wk) and belonging index ({student.social_belonging_score}/10) signal isolation.",
                priority="Medium",
                suggested_action="Encourage participation in departmental student chapters and study groups; conduct digital portal orientation."
            ))

        if not areas:
            areas.append("General Academic Advising")
            interventions.append(SuggestedIntervention(
                category="Academic",
                title="Routine Semester Milestone Review",
                rationale="Student profile exhibits healthy retention metrics across all domains.",
                priority="Standard",
                suggested_action="Encourage continued participation in honors projects, extracurriculars, and internship placement preparation."
            ))

        return areas, interventions

    def batch_predict(self, students: List[StudentFeatures]) -> BatchPredictionResponse:
        results = []
        high_cnt = 0
        mod_cnt = 0
        low_cnt = 0

        for stu in students:
            pred = self.predict_student(stu)
            if pred.risk_category == "High":
                high_cnt += 1
            elif pred.risk_category == "Moderate":
                mod_cnt += 1
            else:
                low_cnt += 1

            top_pos = pred.positive_contributions[0].feature_label if pred.positive_contributions else "Stable Indicators"
            results.append(BatchPredictionItem(
                student_id=pred.student_id,
                dropout_risk_probability=pred.dropout_risk_probability,
                risk_category=pred.risk_category,
                prediction_label=pred.prediction_label,
                top_risk_driver=top_pos,
                requires_human_review=pred.requires_human_review
            ))

        return BatchPredictionResponse(
            total_processed=len(students),
            high_risk_count=high_cnt,
            moderate_risk_count=mod_cnt,
            low_risk_count=low_cnt,
            results=results
        )

# Global engine singleton
ml_engine = MLEngine()

