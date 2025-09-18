import json

FIELD_ORDER = [
    "id", "issued_at", "timestamp",
    "model_version", "policy_version", "policy_hash",
    "input_hash", "output_hash"
]

def canonical_subset(data: dict) -> dict:
    out = {}
    for k in FIELD_ORDER:
        if k in data:
            out[k] = data[k]
    return out

def canonical_bytes(obj: dict) -> bytes:
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"), sort_keys=True).encode("utf-8")
