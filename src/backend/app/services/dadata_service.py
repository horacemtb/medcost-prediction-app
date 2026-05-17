import json
import logging
import os
from typing import Any
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

logger = logging.getLogger(__name__)

BASE_URL = "https://cleaner.dadata.ru/api/v1/clean"


def _call_dadata(endpoint: str, query: str) -> dict[str, Any] | None:
    api_key = os.getenv("DADATA_API_KEY")
    if not api_key:
        return None

    url = f"{BASE_URL}/{endpoint}"
    body = json.dumps([query]).encode("utf-8")

    headers: dict[str, str] = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Token {api_key}",
    }
    api_secret = os.getenv("DADATA_API_SECRET")
    if api_secret:
        headers["X-Secret"] = api_secret

    try:
        req = Request(url, data=body, headers=headers)
        with urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode("utf-8"))
        if isinstance(result, list) and len(result) > 0:
            return result[0]
        return None
    except (HTTPError, URLError, json.JSONDecodeError, OSError) as exc:
        logger.warning("Dadata %s failed: %s", endpoint, exc)
        return None


def clean_full_name(raw: str | None) -> str | None:
    if not raw:
        return None
    stripped = raw.strip()
    if not stripped:
        return None
    result = _call_dadata("name", stripped)
    if result is None or not result.get("result"):
        return stripped
    return result["result"]


def clean_address(raw: str | None) -> str | None:
    if not raw:
        return None
    stripped = raw.strip()
    if not stripped:
        return None
    result = _call_dadata("address", stripped)
    if result is None or not result.get("result"):
        return stripped
    return result["result"]


def clean_phone(raw: str | None) -> str | None:
    if not raw:
        return None
    stripped = raw.strip()
    if not stripped:
        return None
    result = _call_dadata("phone", stripped)
    if result is None or not result.get("phone"):
        return stripped
    return result["phone"]
