import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error
import os
from clean_data import clean_dataset

# ─── Constants ───────────────────────────────────────────────────────────────
DATA_PATH = "forensic_autopsy_3000.csv"
MODEL_PATH = "pmi_model.pkl"

FEATURES = [
    "Algor Mortis", "Rigor Mortis", "Livor Mortis", "Stomach Contents",
    "Vitreous Potassium", "Entomology", "Age", "Sex", "Putrefaction",
    "Putre_level", "Height", "Weight"
]

NUMERIC_FEATURES = [
    "Algor Mortis", "Vitreous Potassium", "Age", "Height", "Weight", "Putrefaction"
]

CATEGORICAL_FEATURES = [
    "Sex", "Rigor Mortis", "Livor Mortis", "Stomach Contents", "Entomology", "Putre_level"
]


# ─── Synthetic Target Generation ─────────────────────────────────────────────
def generate_synthetic_pmi(df):
    """
    Generates a realistic 'PMI_hours' target using forensic literature rules.

    Key relationships modelled:
      - Vitreous Potassium  → positive (Stürner-like equation)
      - Algor Mortis (temp) → negative (Newton's law of cooling)
      - Rigor Mortis stage  → ordinal time progression
      - Livor Mortis stage  → ordinal time progression
      - Stomach Contents    → ordinal digestion clock
      - Entomology stage    → insect colonisation timeline
      - Putrefaction level  → late-interval decomposition marker

    Each indicator independently estimates a PMI; the final value is a
    weighted average so the features act as correlated estimators of the
    same underlying interval rather than stacking additively.
    """
    estimates = []   # list of (weight, series)

    # 1. Vitreous Potassium  (higher K+ -> longer PMI)
    #    Approximate: PMI_h ~ 5.26 * K - 14.7  (simplified Sturner)
    k_val = pd.to_numeric(df["Vitreous Potassium"], errors="coerce").fillna(5.0)
    k_pmi = np.maximum(0, 5.26 * k_val - 14.7)
    estimates.append((0.30, k_pmi))

    # 2. Algor Mortis  (lower body temp -> longer PMI)
    #    Approximate: PMI_h ~ (37 - temp) * 1.5
    temp = pd.to_numeric(df["Algor Mortis"], errors="coerce").fillna(37.0)
    temp_pmi = np.maximum(0, (37.0 - temp) * 1.5)
    estimates.append((0.20, temp_pmi))

    # 3. Rigor Mortis  (ordinal stage -> typical hours post-mortem)
    rigor_map = {
        "None": 1,
        "Beginning (jaw/neck)": 4,
        "Developing": 8,
        "Full/Fixed": 18,
        "Resolving": 30,
        "Resolved": 48,
    }
    rigor_pmi = df["Rigor Mortis"].map(rigor_map).fillna(12)
    estimates.append((0.12, rigor_pmi))

    # 4. Livor Mortis  (ordinal stage -> typical hours)
    livor_map = {
        "None": 1,
        "Faint posterior": 4,
        "Developing (faint)": 8,
        "Pronounced (fixed posterior)": 18,
        "Fixed (dependent areas)": 36,
    }
    livor_pmi = df["Livor Mortis"].map(livor_map).fillna(10)
    estimates.append((0.10, livor_pmi))

    # 5. Stomach Contents  (digestion clock)
    stomach_map = {
        "Undigested food (recent meal)": 2,
        "Partially digested": 5,
        "Minimal residue": 10,
        "Fully digested": 18,
        "Empty": 24,
    }
    stomach_pmi = df["Stomach Contents"].map(stomach_map).fillna(10)
    estimates.append((0.05, stomach_pmi))

    # 6. Entomology  (insect colonisation timeline — dominates late cases)
    ent_map = {
        "No insects present": 0,
        "Eggs only": 24,
        "1st instar larvae": 48,
        "2nd instar larvae": 96,
    }
    ent_pmi = df["Entomology"].map(ent_map).fillna(0)
    estimates.append((0.10, ent_pmi))

    # 7. Putrefaction Level  (late-interval decomposition)
    putre_map = {
        "None": 0,
        "Mild": 24,
        "Moderate": 72,
        "Advanced": 144,
        "Severe": 240,
    }
    putre_pmi = df["Putre_level"].map(putre_map).fillna(0)
    estimates.append((0.13, putre_pmi))

    # Weighted average
    total_w = sum(w for w, _ in estimates)
    pmi = sum(w * s for w, s in estimates) / total_w

    # Add Gaussian noise for realism (+/- ~3 hrs)
    noise = np.random.normal(0, 3, len(df))
    pmi = np.maximum(0.5, pmi + noise)
    return np.round(pmi, 1)


# ─── Training ────────────────────────────────────────────────────────────────
def train():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}.")

    print("Loading data...")
    df = pd.read_csv(DATA_PATH)

    missing_cols = [c for c in FEATURES if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing columns in dataset: {missing_cols}")

    # Clean the full dataframe first (fixes NaN categories, negatives, etc.)
    print("Cleaning dataset...")
    df = clean_dataset(df)

    df = df[FEATURES].copy()

    # Coerce numeric columns
    for col in NUMERIC_FEATURES:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    print("Generating synthetic PMI target...")
    df["PMI_hours"] = generate_synthetic_pmi(df)

    X = df[FEATURES]
    y = df["PMI_hours"]

    # ── Preprocessing pipeline ────────────────────────────────────────────
    numeric_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    categorical_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ])

    preprocessor = ColumnTransformer([
        ("num", numeric_transformer, NUMERIC_FEATURES),
        ("cat", categorical_transformer, CATEGORICAL_FEATURES),
    ])

    model = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(
            n_estimators=150,
            max_depth=12,
            random_state=42,
        )),
    ])

    # ── Train / test split ────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print("Training Random Forest Regressor...")
    model.fit(X_train, y_train)

    r2 = model.score(X_test, y_test)
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"  R2 score : {r2:.4f}")
    print(f"  MAE      : {mae:.2f} hours")

    print(f"Saving model to {MODEL_PATH}...")
    joblib.dump(model, MODEL_PATH)
    print("Training complete.")


if __name__ == "__main__":
    train()
