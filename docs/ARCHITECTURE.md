# EduShield System Architecture Specification

## 1. Architectural Philosophy & Overview
**EduShield** is an Explainable AI (XAI) framework architected to predict student dropout risk and support faculty-guided human interventions in higher education institutions. The system is designed around three fundamental engineering principles:

1. **Separation of Concerns**: Strict decoupling across the interactive presentation layer (React + Vite), the secure persistence and business logic orchestrator (Node.js + Express), and the specialized machine-learning/XAI engine (FastAPI + LightGBM + TreeSHAP).
2. **Explainability by Design**: Machine learning inference does not terminate at a scalar risk probability; every prediction computes local additive Shapley values attributing positive (risk-elevating) and negative (risk-mitigating) impacts to specific student indicators.
3. **Human-in-the-Loop Governance**: Algorithmic outputs serve strictly as clinical advisory evidence. No disciplinary, status, or punitive action may ever be executed automatically by the model.

---

## 2. High-Level Tier Architecture

```
                    +------------------------------------+
                    |       REACT FRONTEND CLIENT        |
                    |  - Admin, Faculty, Student Portals |
                    |  - Recharts XAI Visualizations    |
                    |  - What-If Simulation Laboratory   |
                    +-----------------+------------------+
                                      |
                      HTTPS (JSON REST) | Bearer JWT Token
                                      v
                    +-----------------+------------------+
                    |      NODE.JS / EXPRESS BACKEND     |
                    |  - Role-Based Access Control       |
                    |  - Resource Scoping & Privacy      |
                    |  - Counselling State Machine       |
                    |  - Security & Audit Logging        |
                    +--------+------------------+--------+
                             |                  |
            Mongoose Protocol |                  | Internal REST (Port 8000)
                             v                  v
       +---------------------+---+   +----------+----------------------+
       |   MONGODB PERSISTENCE   |   |   FASTAPI ML SERVICE (PYTHON)   |
       |  - Users & Credentials  |   |  - LightGBM Champion Classifier |
       |  - Student Cohorts      |   |  - TreeSHAP Explainer Engine    |
       |  - Prediction Records   |   |  - 7 Benchmark Algorithm Models |
       |  - Counselling Cases    |   |  - Natural Language Synthesis   |
       |  - Immutable Audit Logs |   +---------------------------------+
       +-------------------------+
```

---

## 3. Tier Responsibilities & Component Details

### 3.1 Tier 1: Frontend Presentation Tier
- **Framework**: React 18, Vite, TypeScript, Tailwind CSS.
- **Routing**: React Router DOM (v6) with declarative role-gated routes.
- **Visualizations**: Recharts rendering interactive SHAP waterfall attributions, 7-model ROC curves, risk distribution histograms, and multi-variable scatter plots.
- **Icons**: Lucide React.
- **State Management**: React Context (`AuthContext`) managing session tokens, user profiles, and 1-click demo role switching.

### 3.2 Tier 2: Backend API & Orchestration Tier
- **Runtime**: Node.js v20+, Express.js, TypeScript.
- **Security & Authorization**:
  - Passwords hashed using `bcryptjs` with salt rounds = 10.
  - Authentication via stateless signed JSON Web Tokens (`jsonwebtoken`, 24h expiration).
  - Role-Based Access Control (`requireRoles("admin", "faculty", "student")`).
  - Resource-Level Scope Enforcement (`enforceStudentAccessScope`): Faculty are constrained to their assigned advisory roster or academic department; students can strictly access their own personal record.
- **Data Protection Safeguards**: Sensitive voluntary well-being surveys (perceived stress, nightly sleep, commute duration, social belonging) are isolated and masked from unauthorized public reports.
- **Audit Logging**: Every sensitive action (`VIEW_STUDENT_PROFILE`, `EXECUTE_PREDICTION`, `CREATE_COUNSELLING_REFERRAL`, `CSV_IMPORT`) is logged to an immutable MongoDB collection with actor ID, action, timestamp, and client IP.

### 3.3 Tier 3: Machine Learning & Explainability Tier
- **Runtime**: Python 3.10+, FastAPI, Uvicorn.
- **Inference Models**: Serialized Scikit-learn preprocessing pipeline, Champion LightGBM classifier, and 6 comparative benchmark algorithms.
- **Explainability**: SHAP `TreeExplainer` calculating exact polynomial-time Shapley values for LightGBM.
- **Clinical Synthesis**: Automatically translates numerical SHAP values into natural-language diagnostic summaries and prioritised intervention recommendations for advisors.

---

## 4. Role-Based Access Control (RBAC) Matrix

| Resource / Action | Administrator | Faculty Advisor | Enrolled Student |
|:---|:---:|:---:|:---:|
| **Institutional Retention Cockpit** | Full Access | Scoped to Department | Personal Health View |
| **Student Directory** | All Records | Assigned / Department | Forbidden |
| **Student Risk Profile & SHAP** | Full Access | Scoped to Assigned | Own Profile Only |
| **Trigger Live ML Prediction** | Allowed | Allowed (Assigned) | Forbidden |
| **Create Counselling Referral** | Allowed | Allowed | Forbidden |
| **Log Counselling Session** | Allowed | Allowed | Read Own Action Plan |
| **CSV Batch Cohort Ingestion** | Allowed | Forbidden | Forbidden |
| **7-Model Benchmark & ROC View**| Full Access | Full Access | Full Access |
| **Interactive SHAP Simulator** | Full Access | Full Access | Full Access |
| **Voluntary Wellness Check-In** | Read Only | Read Only (Assigned) | Submit & Update Own |
| **Institutional Reports Export**| Full Export | Departmental Export | Forbidden |
| **Security & Compliance Audits** | Full Access | Forbidden | Forbidden |

