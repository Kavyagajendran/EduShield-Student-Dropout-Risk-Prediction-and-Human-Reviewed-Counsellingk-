from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.schemas import StudentFeatures, PredictionResponse, BatchPredictionResponse
from app.services.ml_engine import ml_engine

router = APIRouter(tags=["Predictions & Explainability"])

@router.post("/predict", response_model=PredictionResponse, summary="Predict student dropout risk with SHAP explanations")
def predict_student(student: StudentFeatures):
    try:
        return ml_engine.predict_student(student)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/batch-predict", response_model=BatchPredictionResponse, summary="Batch dropout risk assessment")
def batch_predict(students: List[StudentFeatures]):
    try:
        return ml_engine.batch_predict(students)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")

