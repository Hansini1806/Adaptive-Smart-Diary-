from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.model_service import EmotionModelService, get_model_service
from app.schemas import EmotionAnalysisRequest, EmotionAnalysisResponse
from app.supabase_auth import require_supabase_user, save_emotion_analysis


settings = get_settings()
app = FastAPI(
    title="Adaptive Smart Diary Emotion API",
    description="Diary-text emotion inference using a trained PyTorch BiLSTM.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)


def require_model() -> EmotionModelService:
    try:
        return get_model_service(str(settings.emotion_model_dir))
    except (FileNotFoundError, RuntimeError, ValueError, KeyError) as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "The trained emotion model is not available. "
                "Follow ml/README.md to download data and train the model."
            ),
        ) from error


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post(
    "/api/emotions/analyze",
    response_model=EmotionAnalysisResponse,
)
async def analyze_emotion(
    request: EmotionAnalysisRequest,
    user: dict[str, str] = Depends(require_supabase_user),
    model_service: EmotionModelService = Depends(require_model),
) -> EmotionAnalysisResponse:
    prediction = model_service.predict(request.text)
    probabilities = prediction["probabilities"]

    analysis_id = None
    if request.diary_entry_id is not None:
        saved_id = await save_emotion_analysis(
            access_token=user["access_token"],
            user_id=user["id"],
            diary_entry_id=str(request.diary_entry_id),
            emotion=str(prediction["emotion"]),
            confidence=float(prediction["confidence"]),
            probabilities=probabilities,
            model_version=str(prediction["model_version"]),
        )
        analysis_id = UUID(saved_id)

    return EmotionAnalysisResponse(
        emotion=str(prediction["emotion"]),
        confidence=float(prediction["confidence"]),
        probabilities=probabilities,
        model_version=str(prediction["model_version"]),
        analysis_id=analysis_id,
    )
