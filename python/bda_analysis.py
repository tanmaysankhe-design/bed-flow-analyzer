"""
Hospital Resource Utilization Analytics — BDA pipeline
BE Computer Engineering | Big Data Analytics mini-project

Pipeline:  raw CSV -> preprocessing -> K-Means (utilization groups)
           -> Linear Regression (next-period occupied beds)
           -> analysis_results.csv + powerbi_export.csv

Only two algorithms are used, as required by the project statement.

Run:  python generate_dataset.py && python bda_analysis.py
"""

import json
import os
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler

BASE = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE, "..", "data")
RAW = os.path.join(DATA_DIR, "hospital_resource_data.csv")

CLUSTER_FEATURES = [
    "occupancy_rate",
    "admissions",
    "avg_length_of_stay",
    "staff_utilization",
]
REG_FEATURES = ["admissions", "avg_length_of_stay", "staff_on_duty", "prev_occupied_beds"]


# ----------------------------------------------------------------- 1. LOAD
def load() -> pd.DataFrame:
    df = pd.read_csv(RAW)
    print(f"[1] Loaded {len(df)} rows, {df['department'].nunique()} departments")
    return df


# -------------------------------------------------------- 2. PREPROCESSING
def preprocess(df: pd.DataFrame) -> pd.DataFrame:
    df = df.drop_duplicates().copy()
    df = df.dropna(subset=["occupied_beds", "total_beds", "admissions"])
    df["occupied_beds"] = df[["occupied_beds", "total_beds"]].min(axis=1)

    # derived features
    df["occupancy_rate"] = (df["occupied_beds"] / df["total_beds"] * 100).round(2)
    df["beds_per_staff"] = (df["occupied_beds"] / df["staff_on_duty"]).round(3)
    # staff utilization = patient-days handled per staff member, scaled to %
    load_per_staff = df["admissions"] * df["avg_length_of_stay"] / df["staff_on_duty"]
    df["staff_utilization"] = (
        load_per_staff / load_per_staff.max() * 100
    ).round(2)

    df["month_index"] = (
        pd.to_datetime(df["month"]).dt.year * 12 + pd.to_datetime(df["month"]).dt.month
    )
    df["month_index"] -= df["month_index"].min()
    df = df.sort_values(["department", "month_index"]).reset_index(drop=True)
    df["prev_occupied_beds"] = (
        df.groupby("department")["occupied_beds"].shift(1).fillna(df["occupied_beds"])
    )
    print("[2] Preprocessing done: derived occupancy_rate, staff_utilization, lag feature")
    return df


# ----------------------------------------------------- 3. K-MEANS CLUSTERING
def run_kmeans(df: pd.DataFrame, k: int = 3):
    X = StandardScaler().fit_transform(df[CLUSTER_FEATURES])
    km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(X)
    df["cluster_id"] = km.labels_

    # name clusters by mean occupancy: lowest -> Low, highest -> High
    order = df.groupby("cluster_id")["occupancy_rate"].mean().sort_values().index.tolist()
    names = ["Low Utilization", "Moderate Utilization", "High Utilization"][:k]
    mapping = {cid: names[i] for i, cid in enumerate(order)}
    df["utilization_cluster"] = df["cluster_id"].map(mapping)

    summary = (
        df.groupby("utilization_cluster")
        .agg(
            records=("occupancy_rate", "size"),
            avg_occupancy_rate=("occupancy_rate", "mean"),
            avg_admissions=("admissions", "mean"),
            avg_length_of_stay=("avg_length_of_stay", "mean"),
            avg_staff_utilization=("staff_utilization", "mean"),
        )
        .round(2)
        .reset_index()
    )
    print("[3] K-Means (k=3), inertia =", round(km.inertia_, 2))
    print(summary.to_string(index=False))
    return df, summary, float(km.inertia_)


# -------------------------------------------------- 4. LINEAR REGRESSION
def run_regression(df: pd.DataFrame):
    train = df[df["month_index"] < df["month_index"].max() - 5]
    test = df[df["month_index"] >= df["month_index"].max() - 5]

    model = LinearRegression().fit(train[REG_FEATURES], train["occupied_beds"])
    df["predicted_occupied_beds"] = model.predict(df[REG_FEATURES]).round(1)

    pred_test = model.predict(test[REG_FEATURES])
    mae = float(mean_absolute_error(test["occupied_beds"], pred_test))
    r2 = float(r2_score(test["occupied_beds"], pred_test))

    coefs = dict(zip(REG_FEATURES, np.round(model.coef_, 4).tolist()))
    print(f"[4] Linear Regression  MAE={mae:.2f} beds  R2={r2:.3f}")
    print("    coefficients:", coefs, "intercept:", round(float(model.intercept_), 3))

    # next-period forecast per department (uses each department's latest month)
    forecasts = []
    for dept, g in df.groupby("department"):
        last = g.sort_values("month_index").iloc[-1]
        nxt = pd.DataFrame([{
            "admissions": last["admissions"],
            "avg_length_of_stay": last["avg_length_of_stay"],
            "staff_on_duty": last["staff_on_duty"],
            "prev_occupied_beds": last["occupied_beds"],
        }])
        forecasts.append({
            "department": dept,
            "last_month": last["month"],
            "last_occupied_beds": int(last["occupied_beds"]),
            "total_beds": int(last["total_beds"]),
            "predicted_next_occupied_beds": round(float(model.predict(nxt)[0]), 1),
        })
    return df, {
        "mae": round(mae, 2),
        "r2": round(r2, 3),
        "intercept": round(float(model.intercept_), 3),
        "coefficients": coefs,
        "train_rows": int(len(train)),
        "test_rows": int(len(test)),
    }, pd.DataFrame(forecasts)


# ---------------------------------------------------------------- 5. EXPORT
def export(df, clusters, metrics, forecasts, inertia):
    os.makedirs(DATA_DIR, exist_ok=True)

    results_cols = [
        "month", "department", "total_beds", "occupied_beds", "admissions",
        "avg_length_of_stay", "staff_on_duty", "equipment_utilization_pct",
        "occupancy_rate", "staff_utilization", "beds_per_staff",
        "utilization_cluster", "predicted_occupied_beds",
    ]
    results = df[results_cols].copy()
    results["prediction_error"] = (
        results["occupied_beds"] - results["predicted_occupied_beds"]
    ).round(1)
    results.to_csv(os.path.join(DATA_DIR, "analysis_results.csv"), index=False)

    # Power BI ready: flat, typed, one row per department-month
    pbi = results.copy()
    pbi.insert(0, "date", pd.to_datetime(pbi["month"] + "-01").dt.strftime("%Y-%m-%d"))
    pbi["year"] = pd.to_datetime(pbi["date"]).dt.year
    pbi["month_name"] = pd.to_datetime(pbi["date"]).dt.strftime("%b")
    pbi["free_beds"] = pbi["total_beds"] - pbi["occupied_beds"]
    pbi["is_high_utilization"] = (pbi["utilization_cluster"] == "High Utilization").astype(int)
    pbi.to_csv(os.path.join(DATA_DIR, "powerbi_export.csv"), index=False)

    clusters.to_csv(os.path.join(DATA_DIR, "cluster_summary.csv"), index=False)
    forecasts.to_csv(os.path.join(DATA_DIR, "forecast_next_period.csv"), index=False)

    with open(os.path.join(DATA_DIR, "model_metrics.json"), "w") as f:
        json.dump({"kmeans_inertia": round(inertia, 2), "regression": metrics}, f, indent=2)

    print("[5] Exported analysis_results.csv, powerbi_export.csv, cluster_summary.csv,")
    print("    forecast_next_period.csv, model_metrics.json ->", os.path.abspath(DATA_DIR))


if __name__ == "__main__":
    data = preprocess(load())
    data, cluster_summary, inertia = run_kmeans(data)
    data, reg_metrics, forecast_df = run_regression(data)
    export(data, cluster_summary, reg_metrics, forecast_df, inertia)
    print("Done. Data is synthetic and for academic demonstration only.")
