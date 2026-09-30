"""
Hospital Resource Utilization Analytics — Synthetic Dataset Generator
BE Computer Engineering | Big Data Analytics mini-project

Creates `hospital_resource_data.csv`: 5 departments x 36 months = 180 rows.
Data is SYNTHETIC and produced only for academic demonstration.

Run:  python generate_dataset.py
"""

import os
import numpy as np
import pandas as pd

RNG = np.random.default_rng(42)
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

# department -> (total_beds, base occupancy rate, base LOS days, staff pool)
DEPARTMENTS = {
    "Emergency":        (80, 0.78, 2.1, 48),
    "General Medicine": (120, 0.71, 4.8, 60),
    "Surgery":          (70, 0.66, 5.6, 42),
    "ICU":              (40, 0.88, 7.4, 36),
    "Pediatrics":       (60, 0.58, 3.4, 30),
}

MONTHS = pd.date_range("2022-01-01", periods=36, freq="MS")


def seasonal(month_index: int) -> float:
    """Winter/monsoon load peaks, mild summer dip."""
    return 1.0 + 0.09 * np.sin(2 * np.pi * (month_index % 12) / 12.0 + 1.2)


def build() -> pd.DataFrame:
    rows = []
    for dept, (beds, base_occ, base_los, staff_pool) in DEPARTMENTS.items():
        for i, m in enumerate(MONTHS):
            trend = 1.0 + 0.0035 * i                       # slow yearly growth
            occ_rate = base_occ * trend * seasonal(i) + RNG.normal(0, 0.035)
            occ_rate = float(np.clip(occ_rate, 0.30, 0.99))

            occupied = int(round(beds * occ_rate))
            los = float(np.clip(base_los + RNG.normal(0, 0.45), 1.0, 12.0))
            # admissions follow bed-days / length of stay
            admissions = int(round((occupied * 30.0) / los * RNG.uniform(0.92, 1.08)))
            staff = int(round(staff_pool * (0.72 + 0.32 * occ_rate) + RNG.normal(0, 1.5)))
            equip = float(np.clip(occ_rate * 100 * RNG.uniform(0.85, 1.05), 25, 99))

            rows.append({
                "month": m.strftime("%Y-%m"),
                "department": dept,
                "total_beds": beds,
                "occupied_beds": occupied,
                "admissions": admissions,
                "avg_length_of_stay": round(los, 2),
                "staff_on_duty": staff,
                "equipment_utilization_pct": round(equip, 1),
            })
    return pd.DataFrame(rows)


if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)
    df = build()
    path = os.path.join(OUT_DIR, "hospital_resource_data.csv")
    df.to_csv(path, index=False)
    print(f"Wrote {len(df)} rows -> {path}")
