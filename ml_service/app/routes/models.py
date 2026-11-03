from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.services.ml_engine import ml_engine
from app.schemas import BenchmarkMetricsResponse

router = APIRouter(prefix="/models", tags=["Model Benchmark & Explainability"])

@router.get("/benchmark", response_model=BenchmarkMetricsResponse, summary="Retrieve 7-model comparative benchmark metrics")
def get_benchmark_metrics():
    if not ml_engine.is_loaded:
        ml_engine.load_artifacts()
    return ml_engine.benchmark_metrics

@router.get("/feature-importance", summary="Retrieve global SHAP feature importance rankings")
def get_global_feature_importance():
    if not ml_engine.is_loaded:
        ml_engine.load_artifacts()
    return {
        "champion_model": ml_engine.benchmark_metrics.get("champion_model", "LightGBM"),
        "global_importance": ml_engine.benchmark_metrics.get("global_feature_importance", []),
        "feature_descriptions": ml_engine.feature_metadata.get("descriptions", {})
    }

@router.get("/champion", summary="Details regarding the deployed champion model")
def get_champion_details():
    if not ml_engine.is_loaded:
        ml_engine.load_artifacts()
    champ_name = ml_engine.benchmark_metrics.get("champion_model", "LightGBM")
    champ_metrics = ml_engine.benchmark_metrics.get("models", {}).get(champ_name, {})
    return {
        "champion_model": champ_name,
        "status": "Deployed & Serving",
        "framework": "LightGBM + TreeSHAP",
        "rationale": ml_engine.benchmark_metrics.get("selection_rationale", ""),
        "evaluation_metrics": champ_metrics
    }

