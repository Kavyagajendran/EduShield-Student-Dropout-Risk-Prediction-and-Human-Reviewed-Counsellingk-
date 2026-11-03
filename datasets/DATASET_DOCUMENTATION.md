# EduShield Synthetic Development Dataset Documentation

## Overview
This document specifies the synthetic student dataset used for the development, training, and benchmarking of the **EduShield** Explainable AI Framework.

> **Research Transparency Notice**:
> This dataset contains **500 synthetic student records** generated under fixed pseudorandom initialization (seed=42). It is explicitly designated as a **synthetic development dataset** designed for model architecture development, algorithm benchmarking, explainability testing, and human-in-the-loop counselling workflow verification.
> It does **not** claim to reproduce the exact statistical distributions of historical production cohorts (e.g., the 4,424-record Polytech Portal dataset or OULAD dataset). All reported metrics on this dataset represent actual empirical calculations on this synthetic benchmark.

---

## Data Schema & Feature Dictionary

| Feature Name | Type | Range / Categories | Description | Domain Impact |
|:---|:---|:---|:---|:---|
| `student_id` | String | `STU-2026-1000` to `STU-2026-1499` | Unique student identifier | Identifier (excluded from ML features) |
| `department` | Categorical | CS, IT, EE, ME, CE, DS | Academic department | Administrative feature |
| `current_semester` | Integer | 1 to 8 | Current enrolled semester | Progression indicator |
| `gpa_current` | Float | 1.00 – 4.00 | Cumulative Grade Point Average in current program | Primary academic performance signal |
| `gpa_previous_semester` | Float | 1.00 – 4.00 | Prior semester GPA | Trend indicator of academic trajectory |
| `high_school_gpa` | Float | 1.50 – 4.00 | Entrance qualification GPA | Historical baseline capability |
| `credits_completed_ratio` | Float | 0.35 – 1.00 | Ratio of earned credits to attempted credits | Degree progression velocity |
| `attendance_rate` | Float | 30.0% – 100.0% | Overall lecture attendance percentage | Regularity and engagement indicator |
| `lab_attendance_rate` | Float | 25.0% – 100.0% | Practical laboratory attendance percentage | Practical coursework involvement |
| `backlog_count` | Integer | 0 – 5 | Number of active failed/uncleared course backlogs | Direct risk indicator for academic dismissal |
| `repeated_courses_count` | Integer | 0 – 4 | Number of courses currently being repeated | Remedial burden |
| `assignment_submission_rate`| Float | 20.0% – 100.0%| Percentage of homework & assignments submitted on time | Diligence and continuous evaluation |
| `quiz_average_score` | Float | 20.0% – 100.0%| Continuous assessment / formative quiz average | Ongoing subject mastery |
| `lms_logins_per_week` | Integer | 1 – 40 | Learning Management System logins per 7 days | Digital learning engagement |
| `forum_participation_count` | Integer | 0 – 35 | Discussion board queries, posts, and replies | Peer collaboration and active inquiry |
| `library_checkouts` | Integer | 0 – 30 | Physical/digital library transactions per term | Independent learning initiative |
| `video_watch_ratio` | Float | 0.10 – 1.00 | Completion ratio of assigned recorded lecture clips | Multimedia engagement |
| `study_hours_per_week` | Float | 2.0 – 35.0 | Self-reported or logged independent study hours | Academic effort intensity |
| `scholarship_recipient` | Binary | 0 (No), 1 (Yes) | Recipient of merit or need-based scholarship | Financial buffer against dropout |
| `tuition_fees_up_to_date` | Binary | 0 (Arrears), 1 (Current) | Institutional fee payment standing | Socio-economic vulnerability indicator |
| `parental_education_level` | Categorical | None, High School, Bachelor, Master, Doctorate | Highest parental educational attainment | First-generation student status proxy |
| `family_income_bracket` | Categorical | Low, Medium, High | Socio-economic income tier | Structural financial stress proxy |
| `stress_level_score` | Integer | 1 (Minimal) – 10 (Severe) | Self-reported voluntary well-being survey score | Mental health and burnout indicator |
| `sleep_hours_per_day` | Float | 3.5 – 9.5 | Average nightly sleep duration | Well-being & cognitive recovery metric |
| `commute_time_minutes` | Integer | 5 – 120 | One-way transit time to campus in minutes | Logistical burden and fatigue factor |
| `social_belonging_score` | Integer | 1 (Alienated) – 10 (Integrated) | Voluntary institutional belonging survey | Campus integration & community affinity |
| `dropout_risk` | Binary | 0 (Retained / Low Risk), 1 (Dropout Risk) | **Target Variable**: Ground truth risk indicator | Binary classification target |

---

## Class Distribution and Balance
- Total records: 500
- Class 0 (Retained / Low Risk): 180 (36.0%)
- Class 1 (Dropout Risk): 320 (64.0%)

## Feature Preprocessing & Pipeline Architecture
1. **Numerical features**: Imputed with median strategies, scaled using `StandardScaler` for distance/linear models and raw/scaled for tree models.
2. **Categorical features**: One-Hot Encoded with `handle_unknown="ignore"` to eliminate data leakage.
3. **Train-Test Split**: Stratified 80/20 split (400 train, 100 test) preserving class proportions.
4. **Data Leakage Safeguards**: No target information or post-enrolment exit outcome information is included in predictive features. Preprocessing parameters (`mean`, `std`, `categories`) are fit exclusively on the training fold and applied to the test fold.

