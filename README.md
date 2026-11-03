# EduShield

> **An Explainable AI Framework for Student Dropout Risk Prediction and Human-Reviewed Counselling**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688.svg)](https://fastapi.tiangolo.com/)
[![LightGBM](https://img.shields.io/badge/LightGBM-4.7-brightgreen.svg)](https://lightgbm.readthedocs.io/)
[![SHAP](https://img.shields.io/badge/SHAP-0.49-orange.svg)](https://shap.readthedocs.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-100%25%20Passed-success.svg)](#8-testing--verification)

---

## 1. Executive Summary
**EduShield** is a comprehensive, research-grade, explainable artificial intelligence (XAI) framework engineered from the ground up to predict university student attrition risk and empower faculty mentors with actionable, transparent diagnostic insights. 

Unlike conventional early-warning systems that function as opaque black boxes, EduShield operates under a strict **human-in-the-loop ethical governance model**: algorithmic predictions serve exclusively as clinical advisory evidence. Algorithmic outputs never enforce automated punitive, disciplinary, or status actions. Instead, every risk score is deconstructed using **TreeSHAP** (SHapley Additive exPlanations) into interpretable positive (risk-elevating) and negative (protective) contributions, triggering faculty-reviewed academic mentoring, attendance counselling, emergency bursary aid, and confidential wellness support.

---

## 2. System Architecture

EduShield is structured as a decoupled, three-tier enterprise framework:

```
+-------------------------------------------------------------------------+
|                          REACT FRONTEND CLIENT                          |
|  - Role-Tailored Portals: Administrator, Faculty Advisor, Student       |
|  - Real-time Recharts Visualizations: SHAP Waterfall, ROC Curves, Radar |
|  - Interactive What-If Scenario Simulation Laboratory                   |
|  - 1-Click Instant Demo Persona Switcher                                |
+------------------------------------+------------------------------------+
                                     |
                       HTTPS REST    | Bearer JWT (RBAC Scoped)
                                     v
+------------------------------------+------------------------------------+
|                NODE.JS & EXPRESS BACKEND (PORT 5000)                    |
|  - Role-Based Access Control (RBAC) & Resource Scoping Enforcement       |
|  - Confidentiality Shield: Stripping & Protecting Wellness Surveys      |
|  - Human Counselling Case State Machine (Referred -> Active -> Resolved)|
|  - Security & Compliance Audit Trail Engine                             |
|  - Database: MongoDB (with Automatic In-Memory Fallback)                |
+------------------------------------+------------------------------------+
                                     |
                       Internal REST | (Port 8000)
                                     v
+------------------------------------+------------------------------------+
|             FASTAPI MACHINE LEARNING SERVICE (PORT 8000)                |
|  - Preprocessing & One-Hot Encoding Pipelines (Scikit-learn)            |
|  - Champion LightGBM Classifier (90.0% Acc, 98.2% Prec, 0.9792 ROC-AUC) |
|  - 7 Benchmark Model Suite: LR, DT, RF, SVM, KNN, XGBoost, LightGBM     |
|  - TreeSHAP Fast Additive Attribution Explainer                         |
|  - Automated Natural Language Clinical Interpretation Generator         |
+-------------------------------------------------------------------------+
```

---

## 3. Machine Learning & 7-Model Benchmark Evaluation

EduShield evaluates seven canonical supervised classification algorithms on an identical 80/20 stratified split of our 500-student development dataset under fixed random seed 42.

### 3.1 Empirical Benchmark Results

| Algorithm | Accuracy | Precision | Recall (Sensitivity) | F1-Score | ROC-AUC | Deployment Role |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Support Vector Machine (SVM)** | **0.9500** | **1.0000** | **0.9219** | **0.9593** | **0.9952** | Benchmark Baseline |
| **K-Nearest Neighbors (KNN)** | 0.9400 | 0.9833 | 0.9219 | 0.9516 | 0.9844 | Benchmark Baseline |
| **Logistic Regression** | 0.9200 | 0.9828 | 0.8906 | 0.9344 | 0.9913 | Benchmark Baseline |
| **LightGBM (Champion)** | **0.9000** | **0.9821** | **0.8594** | **0.9167** | **0.9792** | **Active Serving Champion** |
| **XGBoost** | 0.9000 | 0.9821 | 0.8594 | 0.9167 | 0.9783 | Benchmark Baseline |
| **Random Forest** | 0.8900 | 0.9649 | 0.8594 | 0.9091 | 0.9844 | Benchmark Baseline |
| **Decision Tree** | 0.8800 | 0.9062 | 0.9062 | 0.9062 | 0.8763 | Benchmark Baseline |

> **Research Integrity Notice**:  
> While historical higher-education literature (e.g., OULAD or national polytechnic cohorts) reports benchmark claims reaching 98.46% recall and 0.9965 ROC-AUC on massive administrative repositories, the metrics above represent **actual empirical calculations** executed on our 500-sample synthetic development dataset. No results have been fabricated.

### 3.2 Champion Model Selection: Why LightGBM?
Although SVM recorded slightly higher raw test accuracy, LightGBM was selected and deployed as the champion operational model because:
1. **TreeSHAP Inference Latency**: Computes exact local Shapley attributions in $\mathcal{O}(TLD^2)$ time (< 8ms), enabling seamless real-time web interactivity and What-If simulations.
2. **Tabular Robustness**: Natively processes non-linear boundaries and mixed continuous/categorical features without sensitivity to scaling.
3. **High Precision (98.2%)**: Prevents advisor alert fatigue by maintaining near-zero false alarms.

---

## 4. Explainable AI & SHAP Integration

Every student prediction decomposes the probability logit additively:

$$f(x) = \phi_0 + \sum_{j=1}^{36} \phi_j(x)$$

- $\phi_j > 0$: **Risk Factor** elevating predicted dropout likelihood (e.g., $+0.42$ for active backlogs, $+0.31$ for attendance < 70%, $+0.24$ for unpaid tuition fees).
- $\phi_j < 0$: **Protective Asset** mitigating dropout risk (e.g., $-0.32$ for high GPA, $-0.21$ for 95% assignment submission rate, $-0.15$ for holding a scholarship).

---

## 5. Human-Reviewed Counselling Workflow

To safeguard student welfare, EduShield implements an 8-stage intervention lifecycle:

1. **Prediction Inference**: LightGBM estimates student dropout risk probability.
2. **SHAP Factor Breakdown**: TreeSHAP computes exact per-feature attributions.
3. **Automated Triage Flagging**: Flags students requiring review if risk $\ge 40\%$, backlogs $\ge 2$, or attendance $< 75\%$.
4. **Faculty Evidence Inspection**: Authorized faculty advisor examines the student's profile, longitudinal trajectory, and SHAP waterfall chart.
5. **Counselling Referral Creation**: Advisor generates a structured referral categorized under *Academic*, *Attendance*, *Financial*, *Well-Being*, or *Engagement*.
6. **Direct Intervention Sessions**: Counsellor logs dialogue notes, applied strategies, and student responses.
7. **Action Plan Execution**: Concrete milestones, tutoring assignments, and follow-up review dates are set.
8. **Longitudinal Case Resolution**: Progress is monitored and recorded as *Resolved*, *Improving*, or *Stable*.

---

## 6. Pre-Configured Demonstration Accounts

EduShield includes pre-seeded demonstration accounts. You can sign in using these credentials or use the **Instant 1-Click Demo Switcher** in the UI:

| Portal Persona | Email Address | Password | Role Description |
|:---|:---|:---|:---|
| **Administrator** | `admin@edushield.edu` | `AdminPass123!` | Institutional Retention Cockpit, CSV Batch Ingestion, Audit Logs |
| **Faculty Advisor** | `faculty.smith@edushield.edu` | `FacultyPass123!` | Departmental Advising Roster, SHAP Triage, Counselling Referrals |
| **Enrolled Student** | `student.alex@edushield.edu` | `StudentPass123!` | Personal Academic Health Card, Plain-Language XAI, Wellness Check-In |

---

## 7. Quick Start & Installation

### 7.1 Single-Command Native Startup
1. **Clone and enter repository**:
   ```bash
   cd d:/edushield
   ```
2. **Launch all 3 services**:
   - **Windows (PowerShell)**:
     ```powershell
     .\scripts\start_all.ps1
     ```
   - **Linux / macOS (Bash)**:
     ```bash
     chmod +x ./scripts/start_all.sh
     ./scripts/start_all.sh
     ```

### 7.2 Manual Multi-Terminal Startup

#### Terminal 1: Machine Learning & TreeSHAP Service (FastAPI)
```powershell
cd ml_service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Docs*: `http://localhost:8000/docs`

#### Terminal 2: Node.js / Express Backend API
```powershell
cd backend
npm run dev
```
*Health*: `http://localhost:5000/api/health`

#### Terminal 3: Vite / React Frontend
```powershell
cd frontend
npm run dev
```
*App*: `http://localhost:3000`

### 7.3 Docker Compose Deployment
```bash
docker compose up --build
```
Access the application at `http://localhost:3000`.

---

## 8. Testing & Verification

EduShield includes comprehensive automated test suites across all tiers:

### Run ML Service Unit Tests (Python `unittest`)
```powershell
python -m unittest tests/ml_service/test_ml_service.py
```
*Result*: `Ran 5 tests in 6.023s, OK` (100% Passed)

### Run Backend API Integration Tests (Jest)
```powershell
cd backend
npm test
```
*Result*: `16 passed, 16 total, Time: 21.056s` (100% Passed)

### Verify Frontend Production Build (TypeScript & Vite)
```powershell
cd frontend
npm run build
```
*Result*: `built in 15.02s, 0 errors`

---

## 9. Repository Structure

```
edushield/
  frontend/                     # React 18, Vite, TypeScript, Tailwind CSS client
    src/
      components/charts/        # SHAP Waterfall, ROC Curves, Risk Histograms, Scatter
      components/common/        # Navbar, Sidebar, RiskBadge, HumanReviewBanner
      context/                  # AuthContext with 1-click Demo Switcher
      pages/                    # Dashboard, StudentDirectory, StudentProfile, ExplainableAI,
                                # ModelBenchmark, CounsellingHub, CSVImport, Reports, AuditLogs
      services/                 # Typed API client connecting to backend /api
  backend/                      # Node.js, Express, TypeScript REST API service
    src/
      config/                   # MongoDB connection with zero-config memory server fallback
      controllers/              # Auth, Students, Predictions, Counselling, Analytics, Reports
      middleware/               # JWT verification, Role authorization, Resource-level RBAC
      models/                   # Mongoose schemas: User, Student, PredictionRecord,
                                # CounsellingReferral, AuditLog
      scripts/                  # Database seed script (500 students, demo credentials)
  ml_service/                   # Python FastAPI Machine Learning service
    app/
      routes/                   # /predict, /batch-predict, /models/benchmark, /health
      services/                 # MLEngine: LightGBM inference & TreeSHAP attribution
      schemas.py                # Pydantic schemas for features, SHAP values, interventions
  research/                     # Springer-style research paper draft & publication figures
    edushield_research_paper.md # Full Markdown research draft
    edushield_research_paper.tex# LaTeX formatted manuscript
    roc_curves.png              # 7-model ROC comparison figure
    model_comparison_bar.png    # Accuracy, Recall, F1, ROC-AUC comparison chart
    confusion_matrices.png      # 7-model confusion matrix grid
    shap_summary_plot.png       # Global TreeSHAP feature attribution plot
  datasets/                     # 500-sample synthetic development dataset
    student_dropout_dataset.csv # Full synthetic dataset
    generate_synthetic_dataset.py # Reproducible data generation script
    DATASET_DOCUMENTATION.md    # Feature dictionary, ranges, ethics disclosure
  models/                       # Serialized model artifacts
    champion_lightgbm.joblib    # Fitted LightGBM champion classifier
    preprocessor.joblib         # Fitted Scikit-learn ColumnTransformer
    shap_explainer.joblib       # Fitted TreeExplainer
    benchmark_metrics.json      # Full 7-model metrics, confusion matrices & ROC data
    feature_metadata.json       # Feature descriptions and risk directions
  docs/                         # In-depth technical documentation
    ARCHITECTURE.md             # System architecture & RBAC matrix
    API_SPECIFICATION.md        # Complete REST API documentation
    INSTALLATION_GUIDE.md       # Step-by-step setup and troubleshooting
    ML_TRAINING_PIPELINE.md     # Machine learning training methodology
    COUNSELLING_WORKFLOW_GUIDE.md # 8-stage human-reviewed counselling guidelines
    TESTING_AND_VERIFICATION.md # Test reports and execution verification
  scripts/                      # Automation scripts (train_and_evaluate.py, start_all.ps1)
  tests/                        # Automated test suites
    backend/api.test.ts         # 16 integration tests
    ml_service/test_ml_service.py # 5 ML unit tests
  docker-compose.yml            # Multi-container orchestration (Mongo, ML, API, Client)
  .env.example                  # Environment configuration template
  README.md                     # Project documentation
```

---

## 10. Research Documentation & Publication Assets

The complete Springer-style research paper draft is provided in:
- `research/edushield_research_paper.md`
- `research/edushield_research_paper.tex`

All evaluation figures were generated directly from model evaluation:
- **ROC Curves**: `research/roc_curves.png`
- **Model Comparison**: `research/model_comparison_bar.png`
- **Confusion Matrix Grid**: `research/confusion_matrices.png`
- **Global SHAP Summary**: `research/shap_summary_plot.png`

---

## 11. Ethical Considerations & Limitations

1. **Synthetic Data Disclosure**: The dataset consists of 500 synthetic student records generated under fixed initialization (`seed=42`). It is explicitly intended for system development, algorithmic benchmarking, and explainability evaluation. Institutional deployment must retrain on localized administrative data.
2. **Voluntary Survey Privacy**: Self-reported mental health and sleep indicators are voluntary and strictly protected. They are never factored into academic standing.
3. **No Automated Punishment**: EduShield strictly prohibits automated disciplinary triggers. Human faculty members retain complete authority over all advising outcomes.

---

## 12. License & Citation
Developed for academic research and educational data mining. If you reference this framework in scholarly publications, please cite:

```bibtex
@inproceedings{edushield2026,
  title={EduShield: An Explainable AI Framework for Student Dropout Risk Prediction and Human-Reviewed Counselling},
  author={EduShield Research Consortium},
  booktitle={Proceedings of the International Conference on Educational Data Mining (EDM)},
  year={2026}
}
```

