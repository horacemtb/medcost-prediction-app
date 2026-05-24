from __future__ import annotations

import os
import sys
from functools import lru_cache

import joblib
import numpy as np
import pandas as pd
from fastapi import HTTPException
from sklearn.base import BaseEstimator, TransformerMixin

try:
    from catboost import Pool
except Exception:
    Pool = None

MODEL_PATH = os.getenv("MODEL_PATH", "/app/models/CatBoostRegressor.joblib")
DEFAULT_CATBOOST_CAT_FEATURES = ["city_type", "physical_activity_level"]


class BMICleaner(BaseEstimator, TransformerMixin):
    def __init__(self, bmi_col: str = "bmi", min_bmi: float = 12.0):
        self.bmi_col = bmi_col
        self.min_bmi = min_bmi

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()

        if self.bmi_col in X.columns:
            invalid_bmi_mask = X[self.bmi_col] < self.min_bmi
            X.loc[invalid_bmi_mask, self.bmi_col] = np.nan

        return X


class CatBoostMixedPreprocessor(BaseEstimator, TransformerMixin):
    def __init__(
        self,
        numeric_features,
        binary_features,
        catboost_cat_features,
    ):
        self.numeric_features = numeric_features
        self.binary_features = binary_features
        self.catboost_cat_features = catboost_cat_features

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        X_out = pd.DataFrame(index=X.index)

        X_out[self.numeric_features] = X[self.numeric_features]
        X_out[self.binary_features] = X[self.binary_features]

        for col in self.catboost_cat_features:
            X_out[col] = X[col].astype("object").where(X[col].notna(), "Missing")

        return X_out[
            self.numeric_features
            + self.binary_features
            + self.catboost_cat_features
        ]


def _register_joblib_helpers() -> None:
    # Register helper classes explicitly before joblib.load().
    main_module = sys.modules.get("__main__")
    if main_module is not None:
        setattr(main_module, "BMICleaner", BMICleaner)
        setattr(
            main_module,
            "CatBoostMixedPreprocessor",
            CatBoostMixedPreprocessor,
        )


class MLService:
    def __init__(self, model_path: str):
        if Pool is None:
            raise RuntimeError(
                "catboost is required to initialize the real MLService"
            )
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model file not found at {model_path}. Place CatBoostRegressor.joblib into backend/models/ before building."
            )

        _register_joblib_helpers()
        self.pipeline = joblib.load(model_path)
        self.preprocessor = self._resolve_preprocessor()
        self.model = self.pipeline.named_steps["model"]
        self.cat_features = self._resolve_cat_features()

    def predict(self, payload: dict) -> float:
        sample = pd.DataFrame([payload])
        prediction = self.pipeline.predict(sample)[0]
        return round(float(prediction), 2)

    def explain_top_factors(self, payload: dict, top_k: int = 3) -> list[dict]:
        sample = pd.DataFrame([payload])
        sample_transformed = self._transform_sample(sample)

        pool = Pool(sample_transformed, cat_features=self.cat_features)
        shap_values = self.model.get_feature_importance(pool, type="ShapValues")
        shap_feature_values = shap_values[:, :-1]

        factors_df = pd.DataFrame(
            {
                "feature": sample_transformed.columns,
                "value": [
                    sample_transformed.iloc[0][column]
                    for column in sample_transformed.columns
                ],
                "shap_value": shap_feature_values[0],
            }
        )
        factors_df["abs_value"] = factors_df["shap_value"].abs()
        top = (
            factors_df.sort_values("abs_value", ascending=False)
            .drop(columns=["abs_value"])
            .head(top_k)
        )

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

    def _resolve_preprocessor(self):
        for step_name in ("catboost_preprocessing", "preprocess"):
            if step_name in self.pipeline.named_steps:
                return self.pipeline.named_steps[step_name]
        raise KeyError(
            "Preprocessing step not found in pipeline. "
            "Expected 'catboost_preprocessing' step."
        )

    def _resolve_cat_features(self) -> list[str]:
        raw_features = getattr(
            self.preprocessor,
            "catboost_cat_features",
            DEFAULT_CATBOOST_CAT_FEATURES,
        )
        return list(raw_features)

    def _transform_sample(self, sample: pd.DataFrame) -> pd.DataFrame:
        sample_transformed = self.preprocessor.transform(sample)
        if isinstance(sample_transformed, pd.DataFrame):
            return sample_transformed

        feature_names = None
        if hasattr(self.preprocessor, "get_feature_names_out"):
            feature_names = list(self.preprocessor.get_feature_names_out())
        else:
            feature_names = list(sample.columns)

        return pd.DataFrame(
            sample_transformed,
            columns=feature_names,
            index=sample.index,
        )


@lru_cache(maxsize=1)
def get_ml_service() -> MLService:
    try:
        return MLService(MODEL_PATH)
    except (FileNotFoundError, KeyError, RuntimeError) as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
