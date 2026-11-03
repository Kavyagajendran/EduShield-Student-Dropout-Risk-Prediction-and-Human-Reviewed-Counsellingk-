# EduShield Machine Learning Pipeline & Explainability Engine

## 1. Overview
The EduShield machine-learning pipeline trains, benchmarks, and serializes seven supervised learning algorithms for student dropout risk prediction, deploying **LightGBM** as the champion model with real-time **TreeSHAP** local and global feature attribution.

---

## 2. Feature Schema & Engineering
The pipeline ingests 25 primary student attributes across 8 pedagogical and socio-demographic domains:
1. **Academic Performance**: `current_semester`, `gpa_current`, `gpa_previous_semester`, `high_school_gpa`, `credits_completed_ratio`.
2. **Attendance Diligence**: `attendance_rate`, `lab_attendance_rate`.
3. **Academic Backlogs**: `backlog_count`, `repeated_courses_count`.
4. **Assessment Completion**: `assignment_submission_rate`, `quiz_average_score`.
5. **Behavioural Engagement**: `lms_logins_per_week`, `forum_participation_count`, `library_checkouts`.
6. **Study Intensity**: `video_watch_ratio`, `study_hours_per_week`.
7. **Socio-Economic Buffer**: `scholarship_recipient`, `tuition_fees_up_to_date`, `parental_education_level`, `family_income_bracket`.
8. **Voluntary Well-Being**: `stress_level_score`, `sleep_hours_per_day`, `commute_time_minutes`, `social_belonging_score`.

### Data Preprocessing Architecture
- **Continuous Features**: Scaled using `StandardScaler` to ensure zero mean and unit variance for distance and linear models (KNN, SVM, Logistic Regression).
- **Categorical Features**: Encoded using `OneHotEncoder(handle_unknown='ignore', sparse_output=False)` preventing unseen categorical crashes during inference.
- **Data Leakage Safeguards**: Preprocessing transformations are fit strictly on the 80% training split and applied to the 20% test fold.

---

## 3. The 7 Benchmark Models
The pipeline executes reproducible training on 400 training samples and evaluates on 100 held-out test samples under fixed seed 42:

1. **Logistic Regression**: Baseline linear classifier with $L_2$ penalty and `max_iter=1000`.
2. **Decision Tree Classifier**: CART algorithm with `max_depth=6`.
3. **Random Forest Classifier**: Ensemble of 100 de-correlated trees with `max_depth=8`.
4. **Support Vector Machine (SVM)**: Kernelized classifier with Radial Basis Function (RBF) kernel and Platt probability calibration.
5. **K-Nearest Neighbors (KNN)**: Non-parametric distance-weighted classifier with $k=7$.
6. **XGBoost**: Extreme Gradient Boosting with 100 estimators, `learning_rate=0.08`, `max_depth=4`.
7. **LightGBM (Champion)**: Leaf-wise gradient boosted trees with 100 estimators, `learning_rate=0.08`, `max_depth=5`.

---

## 4. Empirical Evaluation Metrics

| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Support Vector Machine** | 0.9500 | 1.0000 | 0.9219 | 0.9593 | 0.9952 |
| **K-Nearest Neighbors** | 0.9400 | 0.9833 | 0.9219 | 0.9516 | 0.9844 |
| **Logistic Regression** | 0.9200 | 0.9828 | 0.8906 | 0.9344 | 0.9913 |
| **LightGBM (Champion)** | 0.9000 | 0.9821 | 0.8594 | 0.9167 | 0.9792 |
| **XGBoost** | 0.9000 | 0.9821 | 0.8594 | 0.9167 | 0.9783 |
| **Random Forest** | 0.8900 | 0.9649 | 0.8594 | 0.9091 | 0.9844 |
| **Decision Tree** | 0.8800 | 0.9062 | 0.9062 | 0.9062 | 0.8763 |

---

## 5. TreeSHAP Explainability Formulation
Shapley values allocate additive contributions across all 36 features:
$$f(x) = \phi_0 + \sum_{j=1}^{36} \phi_j(x)$$
- $\phi_j > 0$: Increases predicted dropout risk (e.g., $+0.42$ for 3 backlogs).
- $\phi_j < 0$: Mitigates dropout risk / protective factor (e.g., $-0.28$ for 95% attendance).

TreeSHAP executes in polynomial time $\mathcal{O}(TLD^2)$, providing instantaneous local explanations during web request lifecycles.

---

## 6. How to Re-Run Model Training & Visualization
To regenerate all models, recalculate empirical metrics, and re-export the high-resolution publication charts:
```powershell
python scripts\train_and_evaluate.py
```
This updates:
- `models/champion_lightgbm.joblib`
- `models/preprocessor.joblib`
- `models/all_models.joblib`
- `models/shap_explainer.joblib`
- `models/benchmark_metrics.json`
- `models/feature_metadata.json`
- `research/roc_curves.png`
- `research/model_comparison_bar.png`
- `research/confusion_matrices.png`
- `research/shap_summary_plot.png`

