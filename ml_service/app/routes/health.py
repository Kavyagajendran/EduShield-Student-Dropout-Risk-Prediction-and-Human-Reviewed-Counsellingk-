from fastapi import APIRouter
from app.services.ml_engine import ml_engine

router = APIRouter(tags=["Health"])

@router.get("/health", summary="Service health status")
def health_check():
    return {
        "status": "healthy",
        "service": "EduShield ML Service",
        "version": "1.0.0",
        "model_loaded": ml_engine.is_loaded,
        "champion_model": ml_engine.benchmark_metrics.get("champion_model", "LightGBM") if ml_engine.is_loaded else None
    }

