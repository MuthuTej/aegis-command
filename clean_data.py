"""
Data cleaning module for forensic_autopsy_3000.csv

Fixes the following verified issues:
  1. Putre_level is NaN when Putrefaction=0 -> fill with "None"
  2. Rigor Mortis / Livor Mortis are NaN for 175 fresh bodies (Putrefaction=0,
     temp ~37C) -> fill with "None"
  3. Abdominal cavity has 151 negative values -> clip to 0
  4. 86 children (Age<=10, Age unit='years') have adult-sized Height/Weight/organs
     -> their Age values are clearly wrong; we leave Age as-is but flag it,
     since Age is not the primary predictive feature for PMI and the model
     should still learn from their postmortem indicators.
"""
import pandas as pd
import numpy as np


def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Return a cleaned copy of the raw forensic dataframe.
    All fixes are documented and logged to stdout.
    """
    df = df.copy()
    fixes = 0

    # ── 1. Fill missing Putre_level with "None" when Putrefaction=0 ───────
    mask = (df["Putrefaction"] == 0) & (df["Putre_level"].isna())
    n = mask.sum()
    if n > 0:
        df.loc[mask, "Putre_level"] = "None"
        print(f"  [FIX] Filled {n} missing Putre_level -> 'None' (Putrefaction=0)")
        fixes += n

    # ── 2. Fill missing Rigor Mortis with "None" for fresh bodies ─────────
    mask = df["Rigor Mortis"].isna()
    n = mask.sum()
    if n > 0:
        df.loc[mask, "Rigor Mortis"] = "None"
        print(f"  [FIX] Filled {n} missing Rigor Mortis -> 'None'")
        fixes += n

    # ── 3. Fill missing Livor Mortis with "None" for fresh bodies ─────────
    mask = df["Livor Mortis"].isna()
    n = mask.sum()
    if n > 0:
        df.loc[mask, "Livor Mortis"] = "None"
        print(f"  [FIX] Filled {n} missing Livor Mortis -> 'None'")
        fixes += n

    # ── 4. Clip negative abdominal cavity values to 0 ────────────────────
    col = "abdominal cavity"
    if col in df.columns:
        neg = (df[col] < 0).sum()
        if neg > 0:
            df[col] = df[col].clip(lower=0)
            print(f"  [FIX] Clipped {neg} negative '{col}' values to 0")
            fixes += neg

    # ── 5. Flag children with implausible measurements (info only) ────────
    kids_mask = (df["Age unit"] == "years") & (df["Age"] <= 10)
    bad_kids = df[kids_mask & ((df["Height"] > 140) | (df["Weight"] > 40))]
    if len(bad_kids) > 0:
        print(f"  [WARN] {len(bad_kids)} children (age<=10) have adult-sized "
              f"Height/Weight — Age field likely incorrect. Rows kept as-is "
              f"since PMI features are still valid.")

    print(f"  Total cell-level fixes applied: {fixes}")
    return df
