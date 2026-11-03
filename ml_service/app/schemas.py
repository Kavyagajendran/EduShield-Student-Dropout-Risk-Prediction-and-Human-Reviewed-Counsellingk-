from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class StudentFeatures(BaseModel):
    student_id: Optional[str] = Field(default="STU-SAMPLE", description="Student identifier")
    department: str = Field(default="Computer Science", description="Academic department")
    current_semester: int = Field(default=3, ge=1, le=8, description="Current semester (1-8)")
    gpa_current: float = Field(default=2.8, ge=0.0, le=4.0, description="Current cumulative GPA (0.0 - 4.0)")
    gpa_previous_semester: float = Field(default=2.9, ge=0.0, le=4.0, description="Previous semester GPA")
    high_school_gpa: float = Field(default=3.2, ge=0.0, le=4.0, description="High school entry GPA")
    credits_completed_ratio: float = Field(default=0.85, ge=0.0, le=1.0, description="Ratio of completed to attempted credits")
    attendance_rate: float = Field(default=78.5, ge=0.0, le=100.0, description="Lecture attendance percentage")
    lab_attendance_rate: float = Field(default=82.0, ge=0.0, le=100.0, description="Lab attendance percentage")
    backlog_count: int = Field(default=1, ge=0, description="Number of uncleared backlogs")
    repeated_courses_count: int = Field(default=0, ge=0, description="Courses repeated")
    assignment_submission_rate: float = Field(default=80.0, ge=0.0, le=100.0, description="Assignment submission percentage")
    quiz_average_score: float = Field(default=74.0, ge=0.0, le=100.0, description="Quiz average percentage")
    lms_logins_per_week: int = Field(default=12, ge=0, description="LMS logins per week")
    forum_participation_count: int = Field(default=4, ge=0, description="Forum posts/replies")
    library_checkouts: int = Field(default=5, ge=0, description="Library books borrowed")
    video_watch_ratio: float = Field(default=0.75, ge=0.0, le=1.0, description="Lecture video completion ratio")
    study_hours_per_week: float = Field(default=14.0, ge=0.0, description="Weekly self study hours")
    scholarship_recipient: int = Field(default=0, ge=0, le=1, description="1 if scholarship recipient else 0")
    tuition_fees_up_to_date: int = Field(default=1, ge=0, le=1, description="1 if fees paid up to date, 0 if arrears")
    parental_education_level: str = Field(default="Bachelor", description="Highest parental education")
    family_income_bracket: str = Field(default="Medium", description="Low, Medium, or High")
    stress_level_score: int = Field(default=5, ge=1, le=10, description="Stress level 1-10")
    sleep_hours_per_day: float = Field(default=7.0, ge=0.0, le=24.0, description="Average sleep hours")
    commute_time_minutes: int = Field(default=35, ge=0, description="Commute time in minutes")
    social_belonging_score: int = Field(default=6, ge=1, le=10, description="Social belonging 1-10")

class SHAPFeatureContribution(BaseModel):
    feature: str
    feature_label: str
    original_value: Any
    shap_value: float
    direction: str  # "increases_risk" or "decreases_risk"
    magnitude: float
    description: str

class SuggestedIntervention(BaseModel):
    category: str  # "Academic", "Attendance", "Financial", "Well-being", "Engagement"
    title: str
    rationale: str
    priority: str  # "High", "Medium", "Standard"
    suggested_action: str

class PredictionResponse(BaseModel):
    student_id: str
    dropout_risk_probability: float
    risk_percentage: float
    risk_category: str  # "Low", "Moderate", "High"
    prediction_label: str  # "Retained / Low Risk" or "Dropout Risk"
    champion_model: str
    base_value: float
    confidence_score: float
    top_contributing_features: List[SHAPFeatureContribution]
    positive_contributions: List[SHAPFeatureContribution]
    negative_contributions: List[SHAPFeatureContribution]
    plain_language_explanation: str
    suggested_areas_for_review: List[str]
    suggested_interventions: List[SuggestedIntervention]
    requires_human_review: bool

class BatchPredictionItem(BaseModel):
    student_id: str
    dropout_risk_probability: float
    risk_category: str
    prediction_label: str
    top_risk_driver: str
    requires_human_review: bool

class BatchPredictionResponse(BaseModel):
    total_processed: int
    high_risk_count: int
    moderate_risk_count: int
    low_risk_count: int
    results: List[BatchPredictionItem]

class ModelBenchmarkItem(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    confusion_matrix: List[List[int]]
    classification_report: Dict[str, Any]

class BenchmarkMetricsResponse(BaseModel):
    timestamp: str
    dataset_sample_size: int
    train_samples: int
    test_samples: int
    champion_model: str
    selection_rationale: str
    models: Dict[str, ModelBenchmarkItem]
    roc_curves: Dict[str, Any]
    global_feature_importance: List[Dict[str, Any]]

