import os
import sys
import unittest
from fastapi.testclient import TestClient

root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(root_dir, "ml_service"))

from app.main import app
from app.services.ml_engine import ml_engine

class TestMLEngineAndAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        models_path = os.path.join(root_dir, "models")
        ml_engine.load_artifacts(base_models_path=models_path)
        cls.client = TestClient(app)

    def test_01_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["model_loaded"])
        self.assertEqual(data["champion_model"], "LightGBM")

    def test_02_benchmark_models_endpoint(self):
        response = self.client.get("/models/benchmark")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("models", data)
        self.assertEqual(len(data["models"]), 7)
        expected_models = [
            "Logistic Regression", "Decision Tree", "Random Forest",
            "Support Vector Machine", "K-Nearest Neighbors", "XGBoost", "LightGBM"
        ]
        for m in expected_models:
            self.assertIn(m, data["models"])
            metrics = data["models"][m]
            self.assertIn("accuracy", metrics)
            self.assertIn("recall", metrics)
            self.assertIn("f1_score", metrics)
            self.assertIn("roc_auc", metrics)
            self.assertIn("confusion_matrix", metrics)

    def test_03_high_risk_prediction_with_shap(self):
        high_risk_payload = {
            "student_id": "STU-TEST-RISK",
            "department": "Computer Science",
            "current_semester": 3,
            "gpa_current": 1.8,
            "gpa_previous_semester": 2.1,
            "high_school_gpa": 2.4,
            "credits_completed_ratio": 0.55,
            "attendance_rate": 58.0,
            "lab_attendance_rate": 55.0,
            "backlog_count": 3,
            "repeated_courses_count": 2,
            "assignment_submission_rate": 45.0,
            "quiz_average_score": 42.0,
            "lms_logins_per_week": 3,
            "forum_participation_count": 0,
            "library_checkouts": 1,
            "video_watch_ratio": 0.25,
            "study_hours_per_week": 4.0,
            "scholarship_recipient": 0,
            "tuition_fees_up_to_date": 0,
            "parental_education_level": "High School",
            "family_income_bracket": "Low",
            "stress_level_score": 9,
            "sleep_hours_per_day": 4.5,
            "commute_time_minutes": 85,
            "social_belonging_score": 2
        }
        response = self.client.post("/predict", json=high_risk_payload)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertEqual(res["student_id"], "STU-TEST-RISK")
        self.assertIn(res["risk_category"], ["High", "Moderate"])
        self.assertGreater(res["dropout_risk_probability"], 0.5)
        self.assertTrue(res["requires_human_review"])
        self.assertGreater(len(res["top_contributing_features"]), 0)
        self.assertGreater(len(res["positive_contributions"]), 0)
        self.assertGreater(len(res["suggested_interventions"]), 0)
        self.assertIn("plain_language_explanation", res)
        self.assertGreater(len(res["plain_language_explanation"]), 20)

    def test_04_low_risk_prediction_with_shap(self):
        low_risk_payload = {
            "student_id": "STU-TEST-HONORS",
            "department": "Computer Science",
            "current_semester": 4,
            "gpa_current": 3.85,
            "gpa_previous_semester": 3.9,
            "high_school_gpa": 3.9,
            "credits_completed_ratio": 1.0,
            "attendance_rate": 96.0,
            "lab_attendance_rate": 98.0,
            "backlog_count": 0,
            "repeated_courses_count": 0,
            "assignment_submission_rate": 98.0,
            "quiz_average_score": 92.0,
            "lms_logins_per_week": 22,
            "forum_participation_count": 14,
            "library_checkouts": 12,
            "video_watch_ratio": 0.95,
            "study_hours_per_week": 24.0,
            "scholarship_recipient": 1,
            "tuition_fees_up_to_date": 1,
            "parental_education_level": "Doctorate",
            "family_income_bracket": "High",
            "stress_level_score": 3,
            "sleep_hours_per_day": 7.5,
            "commute_time_minutes": 15,
            "social_belonging_score": 9
        }
        response = self.client.post("/predict", json=low_risk_payload)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertEqual(res["student_id"], "STU-TEST-HONORS")
        self.assertEqual(res["risk_category"], "Low")
        self.assertLess(res["dropout_risk_probability"], 0.35)
        self.assertGreater(len(res["negative_contributions"]), 0)

    def test_05_batch_predict(self):
        batch_payload = [
            {
                "student_id": "STU-1",
                "department": "IT",
                "current_semester": 2,
                "gpa_current": 3.5,
                "attendance_rate": 88.0,
                "backlog_count": 0,
                "assignment_submission_rate": 90.0,
                "tuition_fees_up_to_date": 1
            },
            {
                "student_id": "STU-2",
                "department": "EE",
                "current_semester": 5,
                "gpa_current": 2.1,
                "attendance_rate": 62.0,
                "backlog_count": 2,
                "assignment_submission_rate": 50.0,
                "tuition_fees_up_to_date": 0
            }
        ]
        response = self.client.post("/batch-predict", json=batch_payload)
        self.assertEqual(response.status_code, 200)
        res = response.json()
        self.assertEqual(res["total_processed"], 2)
        self.assertEqual(len(res["results"]), 2)

if __name__ == "__main__":
    unittest.main()
