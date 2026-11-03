"""
EduShield Synthetic Student Dataset Generator
----------------------------------------------
Generates a realistic, documented synthetic dataset for student dropout risk prediction
and explainable AI counselling workflows.

Features encompass:
- Academic performance (current GPA, previous GPA, high school GPA, credits completed ratio)
- Attendance (lecture attendance, lab attendance)
- Academic backlogs (backlog count, repeated courses)
- Assignment & assessment completion (assignment submission rate, quiz average score)
- Behaviour & participation (LMS logins per week, forum participation, library checkouts)
- Learning engagement (video watch ratio, study hours per week)
- Socio-economic support indicators (scholarship recipient, tuition fees up to date, parental education, income bracket)
- Voluntary well-being survey (stress level, sleep hours, commute time, social belonging index)
- Target: dropout_risk (0 = Retained / Low Risk, 1 = High Dropout Risk)

Dataset size: 500 records (exceeds the 450-record greenfield requirement)
Seed: 42 for complete reproducibility
"""

import os
import json
import numpy as np
import pandas as pd

def generate_synthetic_dataset(n_samples: int = 500, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)
    
    # 1. Base academic features
    # GPA on 0.0 - 4.0 scale
    gpa_current = np.clip(np.random.normal(loc=2.9, scale=0.65, size=n_samples), 1.0, 4.0)
    # Previous GPA correlated with current
    gpa_previous = np.clip(gpa_current + np.random.normal(loc=0.05, scale=0.3, size=n_samples), 1.0, 4.0)
    high_school_gpa = np.clip(np.random.normal(loc=3.2, scale=0.5, size=n_samples), 1.5, 4.0)
    
    # Credits completed ratio (0.4 to 1.0)
    credits_completed_ratio = np.clip(
        0.5 + 0.12 * gpa_current + np.random.normal(0, 0.08, size=n_samples),
        0.35, 1.0
    )
    
    # 2. Attendance features
    # Lecture attendance correlated with academic discipline
    attendance_rate = np.clip(
        40.0 + 13.0 * gpa_current + np.random.normal(0, 8.0, size=n_samples),
        30.0, 100.0
    )
    lab_attendance_rate = np.clip(
        attendance_rate + np.random.normal(loc=2.0, scale=6.0, size=n_samples),
        25.0, 100.0
    )
    
    # 3. Backlogs and repeats
    # Lower GPA -> higher chance of backlogs
    backlog_prob = np.clip(1.0 - (gpa_current / 3.8), 0.05, 0.85)
    backlog_count = np.random.binomial(n=5, p=backlog_prob, size=n_samples)
    repeated_courses = np.array([
        np.random.binomial(n=max(1, b), p=0.4) if b > 0 else 0
        for b in backlog_count
    ])
    
    # 4. Assignments & assessments
    assignment_rate = np.clip(
        35.0 + 15.0 * gpa_current + np.random.normal(0, 9.0, size=n_samples),
        20.0, 100.0
    )
    quiz_average = np.clip(
        assignment_rate * 0.8 + 10.0 * (gpa_current / 4.0) + np.random.normal(0, 6.0, size=n_samples),
        20.0, 100.0
    )
    
    # 5. Behaviour & participation
    lms_logins = np.clip(
        np.random.poisson(lam=np.clip(5 + 4 * gpa_current, 3, 25), size=n_samples),
        1, 40
    )
    forum_posts = np.clip(
        np.random.poisson(lam=np.clip(2 + 2 * gpa_current, 1, 15), size=n_samples),
        0, 35
    )
    library_visits = np.clip(
        np.random.poisson(lam=np.clip(3 + 2.5 * gpa_current, 1, 20), size=n_samples),
        0, 30
    )
    
    # 6. Learning engagement
    video_watch_ratio = np.clip(
        0.3 + 0.15 * gpa_current + np.random.normal(0, 0.12, size=n_samples),
        0.1, 1.0
    )
    study_hours = np.clip(
        4.0 + 4.5 * gpa_current + np.random.normal(0, 3.0, size=n_samples),
        2.0, 35.0
    )
    
    # 7. Socio-economic indicators
    # Income bracket
    income_brackets = ["Low", "Medium", "High"]
    income_probs = [0.35, 0.45, 0.20]
    family_income_bracket = np.random.choice(income_brackets, size=n_samples, p=income_probs)
    
    # Parental education
    parent_edu_levels = ["None", "High School", "Bachelor", "Master", "Doctorate"]
    parent_edu_probs = [0.10, 0.35, 0.35, 0.15, 0.05]
    parental_education = np.random.choice(parent_edu_levels, size=n_samples, p=parent_edu_probs)
    
    # Scholarship recipient
    scholarship = np.array([
        1 if (gpa[0] > 3.4 and inc in ["Low", "Medium"] and np.random.rand() < 0.7) or (np.random.rand() < 0.12)
        else 0
        for gpa, inc in zip(zip(gpa_current), family_income_bracket)
    ])
    
    # Tuition fees up to date
    tuition_paid_prob = np.array([
        0.65 if inc == "Low" and sch == 0 else (0.88 if inc == "Medium" else 0.96)
        for inc, sch in zip(family_income_bracket, scholarship)
    ])
    tuition_fees_up_to_date = np.random.binomial(n=1, p=tuition_paid_prob, size=n_samples)
    
    # 8. Well-being survey indicators (voluntary)
    # Stress score (1-10): higher when backlogs are high and income is low
    stress_base = 4.0 + 0.8 * backlog_count + (1.5 * (1 - tuition_fees_up_to_date)) + np.random.normal(0, 1.2, size=n_samples)
    stress_level = np.clip(np.round(stress_base), 1, 10).astype(int)
    
    sleep_hours = np.clip(
        7.5 - 0.25 * stress_level + np.random.normal(0, 0.8, size=n_samples),
        3.5, 9.5
    )
    
    commute_time = np.clip(
        np.random.gamma(shape=3.5, scale=10.0, size=n_samples),
        5, 120
    ).astype(int)
    
    social_belonging = np.clip(
        np.round(8.0 - 0.35 * stress_level + 0.1 * forum_posts + np.random.normal(0, 1.0, size=n_samples)),
        1, 10
    ).astype(int)
    
    # 9. Latent dropout propensity calculation (ground truth generation for synthetic evaluation)
    # Logit model combining domain indicators:
    # Strongest negative predictors: GPA, Attendance, Assignment rate, Tuition paid
    # Strongest positive predictors: Backlogs, High Stress, Long commute, Arrears
    z = (
        2.5
        - 1.45 * (gpa_current - 2.5)
        - 0.045 * (attendance_rate - 75.0)
        - 0.035 * (assignment_rate - 75.0)
        + 0.55 * backlog_count
        + 0.35 * repeated_courses
        - 0.85 * tuition_fees_up_to_date
        - 0.40 * scholarship
        - 0.80 * (credits_completed_ratio - 0.75)
        + 0.18 * (stress_level - 5)
        - 0.15 * (social_belonging - 5)
        + 0.008 * (commute_time - 35)
        - 0.04 * (study_hours - 12)
        + np.random.normal(0, 0.65, size=n_samples)
    )
    
    dropout_prob = 1.0 / (1.0 + np.exp(-z))
    dropout_risk = (dropout_prob >= 0.50).astype(int)
    
    # Student IDs & demographics for full contextual realism
    student_ids = [f"STU-2026-{1000 + i}" for i in range(n_samples)]
    departments = ["Computer Science", "Information Technology", "Electrical Engineering", 
                   "Mechanical Engineering", "Civil Engineering", "Data Science"]
    department_assigned = np.random.choice(departments, size=n_samples, p=[0.28, 0.22, 0.18, 0.14, 0.10, 0.08])
    semester_assigned = np.random.choice([1, 2, 3, 4, 5, 6, 7, 8], size=n_samples, p=[0.20, 0.18, 0.18, 0.14, 0.12, 0.08, 0.06, 0.04])
    
    df = pd.DataFrame({
        "student_id": student_ids,
        "department": department_assigned,
        "current_semester": semester_assigned,
        "gpa_current": np.round(gpa_current, 2),
        "gpa_previous_semester": np.round(gpa_previous, 2),
        "high_school_gpa": np.round(high_school_gpa, 2),
        "credits_completed_ratio": np.round(credits_completed_ratio, 3),
        "attendance_rate": np.round(attendance_rate, 1),
        "lab_attendance_rate": np.round(lab_attendance_rate, 1),
        "backlog_count": backlog_count,
        "repeated_courses_count": repeated_courses,
        "assignment_submission_rate": np.round(assignment_rate, 1),
        "quiz_average_score": np.round(quiz_average, 1),
        "lms_logins_per_week": lms_logins,
        "forum_participation_count": forum_posts,
        "library_checkouts": library_visits,
        "video_watch_ratio": np.round(video_watch_ratio, 2),
        "study_hours_per_week": np.round(study_hours, 1),
        "scholarship_recipient": scholarship,
        "tuition_fees_up_to_date": tuition_fees_up_to_date,
        "parental_education_level": parental_education,
        "family_income_bracket": family_income_bracket,
        "stress_level_score": stress_level,
        "sleep_hours_per_day": np.round(sleep_hours, 1),
        "commute_time_minutes": commute_time,
        "social_belonging_score": social_belonging,
        "dropout_risk": dropout_risk
    })
    
    return df

if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__))
    df = generate_synthetic_dataset(n_samples=500, random_seed=42)
    csv_path = os.path.join(out_dir, "student_dropout_dataset.csv")
    df.to_csv(csv_path, index=False)
    
    print(f"Generated synthetic dataset with {len(df)} records at: {csv_path}")
    print(f"Target distribution:\n{df['dropout_risk'].value_counts(normalize=True)}")
    print(f"Summary of key features:\n{df[['gpa_current', 'attendance_rate', 'backlog_count', 'dropout_risk']].groupby('dropout_risk').mean()}")

