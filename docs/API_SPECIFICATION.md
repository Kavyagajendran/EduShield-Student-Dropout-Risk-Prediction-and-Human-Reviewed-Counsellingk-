# EduShield RESTful API Specification

## 1. Overview
The EduShield platform operates two interconnected API tiers:
1. **Backend Application API** (`http://localhost:5000/api`): Node.js/Express service orchestrating authentication, database queries, resource authorization, counselling cases, and audit logging.
2. **Machine Learning & XAI API** (`http://localhost:8000`): Python/FastAPI service serving real-time LightGBM predictions, 7-model comparative benchmark metrics, and TreeSHAP feature attributions.

---

## 2. Authentication Protocol
All endpoints under `/api` (except `/api/auth/login`, `/api/auth/register`, and `/api/health`) require a Bearer token in the HTTP Authorization header:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

---

## 3. Backend Endpoints (`/api`)

### 3.1 Authentication & Profile
- `POST /api/auth/login`: Authenticate credentials and obtain JWT token.
  - Body: `{ "email": "admin@edushield.edu", "password": "AdminPass123!" }`
  - Response: `{ "message": "Login successful", "token": "...", "user": { ... } }`
- `POST /api/auth/register`: Create user account (Admin only).
- `GET /api/auth/me`: Retrieve current logged-in user session with role scopes.

### 3.2 Student Management
- `GET /api/students`: Retrieve paginated student roster with search and filter queries.
  - Query parameters: `page`, `limit`, `search`, `department`, `riskCategory`, `requiresReview`, `sortBy`, `sortOrder`.
  - Scoping: Automatically scoped to assigned students for faculty, own record for students.
- `GET /api/students/:studentId`: Retrieve single student record and academic metrics.
- `POST /api/students`: Create new student (Admin only).
- `PUT /api/students/:studentId`: Update student attributes or voluntary well-being scores.
- `DELETE /api/students/:studentId`: Delete student record (Admin only).
- `POST /api/students/import/csv`: Upload and ingest student cohort CSV (`multipart/form-data`, file key: `file`).

### 3.3 Predictions & Explainable AI
- `POST /api/predictions/:studentId`: Execute live machine-learning inference & TreeSHAP attribution for a student. Returns predicted probability, risk tier, positive/negative factor contributions, plain-language explanation, and suggested interventions. Updates student's risk category and saves to `PredictionRecord`.
- `GET /api/predictions/:studentId/latest`: Fetch the most recent evaluated prediction record.
- `GET /api/predictions/:studentId/history`: Fetch longitudinal prediction history for trend analysis.

### 3.4 Human-Reviewed Counselling
- `POST /api/counselling`: Create a new counselling referral for a student.
  - Body: `{ "student_id": "...", "category": "Academic", "urgency": "High", "reason": "...", "targetGoals": [...] }`
- `GET /api/counselling`: List referrals (filtered by `status`, `category`, `urgency`, or `studentId`).
- `GET /api/counselling/:referralId`: Fetch detailed case file with full session log and action plan.
- `POST /api/counselling/:referralId/sessions`: Log an intervention session with counsellor notes, applied strategies, student response, and next follow-up date. Sets case status to "In Progress".
- `PUT /api/counselling/:referralId/action-plan`: Update target goals, milestones, or progress rating.
- `PUT /api/counselling/:referralId/resolve`: Mark referral case as resolved, recording final outcome.

### 3.5 Institutional Analytics & Reports
- `GET /api/analytics/dashboard`: Fetch aggregated cohort statistics, risk distribution bins, department attrition breakdown, and attendance vs GPA scatter plot samples.
- `GET /api/reports/institutional`: Generate comprehensive institutional retention report.
  - Query parameters: `department`, `riskCategory`, `format` (`json` or `csv`).

### 3.6 Models Benchmark & Feature Importance
- `GET /api/models/benchmark`: Proxies verified comparative metrics and ROC curve coordinates for all 7 benchmark algorithms.
- `GET /api/models/feature-importance`: Proxies global TreeSHAP feature importance rankings.

### 3.7 Compliance Audit Logs
- `GET /api/audit`: Retrieve immutable security audit trail (Admin only). Query: `limit`.

---

## 4. Machine Learning Service Endpoints (`http://localhost:8000`)

- `GET /health`: Health check, status of loaded model artifacts, and active champion model.
- `POST /predict`: Predict dropout risk and compute exact TreeSHAP explanations for a student feature payload.
- `POST /batch-predict`: High-throughput batch prediction for student feature lists.
- `GET /models/benchmark`: Returns 7-model benchmark metrics, confusion matrices, and ROC coordinates.
- `GET /models/feature-importance`: Returns global SHAP importance hierarchy.
- `GET /models/champion`: Detailed metadata and hyperparameters for the deployed LightGBM model.

