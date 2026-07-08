import json
from pathlib import Path


API_KEYS_PATH = Path(__file__).with_name("api_keys.json")


def load_api_key(name: str) -> str:
    if not API_KEYS_PATH.exists():
        raise SystemExit(f"Missing {API_KEYS_PATH}. Create it with your API keys.")

    keys = json.loads(API_KEYS_PATH.read_text(encoding="utf-8"))
    api_key = keys.get(name)
    if not api_key or api_key.startswith("put-your-"):
        raise SystemExit(f"Missing {name} in {API_KEYS_PATH}.")

    return api_key
