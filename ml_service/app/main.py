from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.health import router as health_router
from app.routes.predict import router as predict_router
from app.routes.models import router as models_router
from app.services.ml_engine import ml_engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load ML artifacts
    print("Starting up EduShield ML Service...")
    try:
        ml_engine.load_artifacts()
    except Exception as e:
        print(f"Warning: Artifacts could not be loaded on startup: {e}")
    yield
    # Shutdown
    print("Shutting down EduShield ML Service...")

app = FastAPI(
    title="EduShield Machine Learning & Explainable AI Service",
    description="FastAPI service serving student dropout risk prediction, 7-model comparative evaluation, and SHAP explainability.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(predict_router)
app.include_router(models_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

