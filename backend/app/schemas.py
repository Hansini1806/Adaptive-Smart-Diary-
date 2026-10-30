from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class EmotionAnalysisRequest(BaseModel):
    text: str = Field(min_length=1, max_length=20_000)
    diary_entry_id: UUID | None = None

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Diary text must contain at least one non-whitespace character.")
        return value


class EmotionAnalysisResponse(BaseModel):
    emotion: str
    confidence: float = Field(ge=0, le=1)
    probabilities: dict[str, float]
    model_version: str
    analysis_id: UUID | None = None
