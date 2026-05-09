from pydantic import BaseModel, Field
from typing import Dict, Any

class PMIRequest(BaseModel):
    """Input features for PMI (Postmortem Interval) prediction."""

    # Numeric features
    Age: float = Field(..., description="Age of the deceased in years")
    Height: float = Field(..., description="Height in cm")
    Weight: float = Field(..., description="Weight in kg")
    Putrefaction: float = Field(..., description="Putrefaction indicator (0 = absent, 1 = present)")
    Algor_Mortis: float = Field(..., alias="Algor Mortis", description="Body temperature in Celsius")
    Vitreous_Potassium: float = Field(..., alias="Vitreous Potassium", description="Potassium level (mEq/L)")

    # Categorical features
    Sex: str = Field(..., description="Sex (Male, Female, Other)")
    Putre_level: str = Field(..., description="Putrefaction level: None, Mild, Moderate, Advanced, Severe")
    Rigor_Mortis: str = Field(..., alias="Rigor Mortis", description="Rigor Mortis status")
    Livor_Mortis: str = Field(..., alias="Livor Mortis", description="Livor Mortis status")
    Stomach_Contents: str = Field(..., alias="Stomach Contents", description="State of stomach contents")
    Entomology: str = Field(..., description="Entomology status (e.g., No insects present, Eggs only)")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "Age": 45,
                "Height": 175.0,
                "Weight": 80.0,
                "Putrefaction": 0,
                "Algor Mortis": 22.5,
                "Vitreous Potassium": 7.5,
                "Sex": "Male",
                "Putre_level": "Mild",
                "Rigor Mortis": "Developing",
                "Livor Mortis": "Fixed (dependent areas)",
                "Stomach Contents": "Empty",
                "Entomology": "No insects present"
            }
        }
    }


class PMIResponse(BaseModel):
    """Response payload with PMI prediction, confidence, and explanation."""
    predicted_pmi_hours: float
    confidence_score: float
    explanation: Dict[str, Any]  # Can hold floats or strings for fallback messages
    message: str
