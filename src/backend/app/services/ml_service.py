from __future__ import annotations

import os
from functools import lru_cache

import joblib
import pandas as pd
try:
    import shap
except Exception:  
    shap = None
from fastapi import HTTPException

MODEL_PATH = os.getenv("MODEL_PATH", "/app/models/rf_pipeline.joblib")


class MLService:
    def __init__(self, model_path: str):
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model file not found at {model_path}. Place rf_pipeline.joblib into backend/models/ before building."
            )
        self.pipeline = joblib.load(model_path)
        self.preprocessor = self.pipeline.named_steps["preprocess"]
        self.model = self.pipeline.named_steps["model"]
        if shap is None:
            raise RuntimeError("shap is required to initialize the real MLService")
        self.explainer = shap.TreeExplainer(self.model)

    def predict(self, payload: dict) -> float:
        sample = pd.DataFrame([payload])
        prediction = self.pipeline.predict(sample)[0]
        return round(float(prediction), 2)

    def explain_top_factors(self, payload: dict, top_k: int = 3) -> list[dict]:
        sample = pd.DataFrame([payload])
        sample_transformed = self.preprocessor.transform(sample)
        shap_values = self.explainer(sample_transformed)
        feature_names = self.preprocessor.get_feature_names_out()

        explanation = shap.Explanation(
            values=shap_values.values[0],
            base_values=shap_values.base_values[0],
            data=sample_transformed[0],
            feature_names=feature_names,
        )

        agg_df = self._aggregate_shap_values(explanation)
        top = agg_df.head(top_k)
        result = []
        for _, row in top.iterrows():
            shap_value = float(row["shap_value"])
            result.append(
                {
                    "feature_name": str(row["feature"]),
                    "feature_value": str(row["value"]),
                    "shap_value": round(shap_value, 2),
                    "direction": "increase" if shap_value >= 0 else "decrease",
                }
            )
        return result

    @staticmethod
    def _aggregate_shap_values(explanation: shap.Explanation) -> pd.DataFrame:
        feature_names = explanation.feature_names
        shap_values = explanation.values
        data = explanation.data

        aggregated = {}
        for i, name in enumerate(feature_names):
            clean_name = name.split("__", 1)[-1]
            if clean_name.startswith("physical_activity_level_"):
                base_feature = "physical_activity_level"
            elif clean_name.startswith("city_type_"):
                base_feature = "city_type"
            else:
                base_feature = clean_name

            if base_feature not in aggregated:
                aggregated[base_feature] = {
                    "shap_value": 0.0,
                    "feature_value": None,
                }

            aggregated[base_feature]["shap_value"] += float(shap_values[i])
            if aggregated[base_feature]["feature_value"] is None:
                aggregated[base_feature]["feature_value"] = data[i]

        df = pd.DataFrame(
            [
                {
                    "feature": feature,
                    "value": values["feature_value"],
                    "shap_value": values["shap_value"],
                }
                for feature, values in aggregated.items()
            ]
        )
        df["abs_value"] = df["shap_value"].abs()
        df = df.sort_values("abs_value", ascending=False).drop(columns=["abs_value"])
        return df


@lru_cache(maxsize=1)
def get_ml_service() -> MLService:
    
    ml_fake = os.getenv("ML_FAKE", "0").lower() in ("1", "true", "yes")
    if ml_fake:
        class FakeMLService:
            def predict(self, payload: dict) -> float:
                
                try:
                    nums = [v for v in payload.values() if isinstance(v, (int, float))]
                    return round(float(sum(nums)) if nums else 100.0, 2)
                except Exception:
                    return 100.0

            def explain_top_factors(self, payload: dict, top_k: int = 3) -> list[dict]:
                
                keys = list(payload.keys())
                res = []
                for i in range(min(top_k, len(keys))):
                    key = keys[i]
                    val = payload.get(key)
                    res.append({
                        "feature_name": key,
                        "feature_value": str(val),
                        "shap_value": round(1.0 / (i + 1), 3),
                        "direction": "increase",
                    })
                if not res:
                    res = [
                        {"feature_name": "bmi", "feature_value": "N/A", "shap_value": 0.5, "direction": "increase"}
                    ]
                return res

        return FakeMLService()

    try:
        return MLService(MODEL_PATH)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
