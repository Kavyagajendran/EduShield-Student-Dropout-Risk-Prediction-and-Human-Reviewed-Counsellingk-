# EduShield Complete Installation & Deployment Guide

## 1. System Requirements & Prerequisites
- **Operating System**: Windows, macOS, or Linux.
- **Node.js**: v20.0.0 or higher (`node -v`).
- **Python**: v3.10.0 or higher (`python --version`).
- **Package Managers**: `npm` v10+ and `pip`.
- **Database**: Standard MongoDB instance (optional; EduShield includes an automatic in-memory MongoDB server fallback that starts with zero configuration if no daemon is running).
- **Docker**: Docker Engine 24+ and Docker Compose v2+ (optional for containerized deployment).

---

## 2. Fast Track: Single-Command Native Startup

### 2.1 Clone / Enter Project Directory
```powershell
cd D:\edushield
```

### 2.2 Seed Database (Runs Automatically or Manually)
The database has already been seeded with 500 synthetic student records and demo credentials. To re-seed at any time:
```powershell
cd backend
npm run seed
cd ..
```

### 2.3 Start All Three Tiers

#### Terminal 1: Machine Learning & TreeSHAP Service (Port 8000)
```powershell
cd D:\edushield\ml_service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Verification*: Open `http://localhost:8000/docs` in your browser to inspect interactive OpenAPI documentation.

#### Terminal 2: Node.js Backend API Service (Port 5000)
```powershell
cd D:\edushield\backend
npm run dev
```
*Verification*: Open `http://localhost:5000/api/health`.

#### Terminal 3: React Frontend Application (Port 3000)
```powershell
cd D:\edushield\frontend
npm run dev
```
*Verification*: Open `http://localhost:3000` in your web browser.

---

## 3. Containerized Deployment via Docker Compose

EduShield includes a production-grade multi-stage `docker-compose.yml` orchestrating MongoDB, the FastAPI ML service, the Node.js backend, and the Vite/Nginx frontend.

To build and start all containers in one command:
```bash
docker compose up --build
```

To stop containers:
```bash
docker compose down
```

---

## 4. Pre-configured Demonstration Accounts

EduShield includes pre-configured, pre-seeded demonstration accounts with full role permissions. You can sign in using these credentials directly or use the **1-Click Demo Persona Switcher** on the login page:

| Role Portal | Email Address | Password | Name & Department |
|:---|:---|:---|:---|
| **Administrator** | `admin@edushield.edu` | `AdminPass123!` | Dr. Eleanor Vance (Academic Administration) |
| **Faculty Advisor** | `faculty.smith@edushield.edu` | `FacultyPass123!` | Prof. Robert Smith (Computer Science) |
| **Enrolled Student** | `student.alex@edushield.edu` | `StudentPass123!` | Alex Chen (`STU-2026-1000`, Computer Science) |

---

## 5. Local Application and Documentation URLs

- **React Dashboard Portal**: `http://localhost:3000`
- **Backend API Health Check**: `http://localhost:5000/api/health`
- **ML Service OpenAPI (Swagger)**: `http://localhost:8000/docs`
- **ML Service ReDoc**: `http://localhost:8000/redoc`

---

## 6. Troubleshooting Common Issues

### 6.1 Port 5000 / 8000 / 3000 Already in Use
If another service is utilizing these default ports, specify alternative ports in your environment:
```powershell
# In backend/.env
PORT=5001

# In ml_service
python -m uvicorn app.main:app --port 8001
```

### 6.2 MongoDB Connection Failures
EduShield's `backend/src/config/db.ts` contains an automatic fallback mechanism: if connection to `mongodb://127.0.0.1:27017` fails or times out within 2.5 seconds, it automatically spins up `mongodb-memory-server` in RAM. You do not need to install or start a local MongoDB daemon manually.

