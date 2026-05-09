from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, BackgroundTasks
import pandas as pd
import numpy as np
import joblib
import os

from schemas import PMIRequest, PMIResponse
from train_model import train as run_training, MODEL_PATH, FEATURES, NUMERIC_FEATURES, CATEGORICAL_FEATURES

# ─── Global model holder ─────────────────────────────────────────────────────
model = None


def load_model():
    """Load the saved model from disk (if it exists)."""
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(f"Model loaded from {MODEL_PATH}")
    else:
        model = None
        print("WARNING: No trained model found. Train the model first.")


# ─── Lifespan (replaces deprecated on_event) ─────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield  # app runs here


app = FastAPI(
    title="Time of Death (PMI) Prediction API",
    description="Predict Postmortem Interval in hours from 12 forensic autopsy features.",
    version="1.0.0",
    lifespan=lifespan,
)


# ─── Feature importance helper ────────────────────────────────────────────────
def extract_feature_importance(pipeline):
    """
    Extract per-feature importance from the trained pipeline and map
    one-hot-encoded columns back to the original 12 base features.
    """
    try:
        preprocessor = pipeline.named_steps["preprocessor"]
        rf = pipeline.named_steps["regressor"]

        encoded_names = list(preprocessor.get_feature_names_out())
        importances = rf.feature_importances_

        # Aggregate one-hot columns back to their base feature
        base_importance = {}
        for enc_name, imp in zip(encoded_names, importances):
            matched = False
            # Check numeric features first (they have prefix "num__")
            for col in NUMERIC_FEATURES:
                tag = f"num__{col}"
                if enc_name == tag:
                    base_importance[col] = base_importance.get(col, 0.0) + imp
                    matched = True
                    break
            if matched:
                continue
            # Check categorical features (prefix "cat__<col>_<value>")
            for col in CATEGORICAL_FEATURES:
                tag = f"cat__{col}_"
                if enc_name.startswith(tag):
                    base_importance[col] = base_importance.get(col, 0.0) + imp
                    matched = True
                    break
            if not matched:
                # Fallback — accumulate under the raw encoded name
                base_importance[enc_name] = base_importance.get(enc_name, 0.0) + imp

        # Sort descending and normalise to percentages
        sorted_items = sorted(base_importance.items(), key=lambda x: x[1], reverse=True)
        total = sum(v for _, v in sorted_items) or 1.0
        return {k: round(v / total * 100, 2) for k, v in sorted_items}

    except Exception as e:
        print(f"Feature importance extraction failed: {e}")
        return {"info": 0.0}  # safe fallback that satisfies Dict[str, Any]


# ─── Endpoints ────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "message": "Welcome to the PMI Prediction API. Visit /docs for interactive documentation."
    }


@app.post("/predict", response_model=PMIResponse)
async def predict_pmi(request: PMIRequest):
    """Predict Postmortem Interval (hours) from 12 forensic features."""
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Train the model first via POST /train.",
        )

    try:
        # Build a single-row DataFrame with the exact column names the model expects
        data_dict = request.model_dump(by_alias=True)
        df = pd.DataFrame([data_dict])

        # Main prediction
        prediction = model.predict(df)[0]

        # Confidence score: measure inter-tree agreement using
        # coefficient of variation (std / mean).  A lower CV means
        # the trees agree more strongly on the prediction.
        rf = model.named_steps["regressor"]
        preprocessed = model.named_steps["preprocessor"].transform(df)
        tree_preds = np.array([t.predict(preprocessed)[0] for t in rf.estimators_])
        std_dev = float(np.std(tree_preds))
        mean_pred = float(np.mean(tree_preds))

        # CV-based confidence: CV=0 -> 100%, CV>=1 -> ~0%
        if mean_pred > 0:
            cv = std_dev / mean_pred
            confidence = max(0.0, min(100.0, (1 - cv) * 100))
        else:
            confidence = 50.0  # fallback for edge cases

        # Feature importance
        explanation = extract_feature_importance(model)

        return PMIResponse(
            predicted_pmi_hours=round(float(prediction), 1),
            confidence_score=round(confidence, 1),
            explanation=explanation,
            message="Prediction successful.",
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {e}")


@app.post("/train")
async def train_endpoint(background_tasks: BackgroundTasks):
    """Retrain the model in the background using the CSV on disk."""

    def _train():
        try:
            run_training()
            load_model()
            print("Model retrained and reloaded.")
        except Exception as e:
            print(f"Training failed: {e}")

    background_tasks.add_task(_train)
    return {"message": "Training started in the background. Check server logs for progress."}
