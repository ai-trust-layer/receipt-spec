import hashlib, json
from jsonschema import Draft202012Validator
from nacl.signing import VerifyKey
from .canonical import canonical_subset, canonical_bytes

def _sha256_hex(s: str) -> str:
    h = hashlib.sha256()
    h.update(s.encode("utf-8"))
    return h.hexdigest()

def _b64url_to_bytes(s: str) -> bytes:
    import base64
    pad = '=' * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)

def verify_signature_ed25519(data: dict) -> bool:
    sig = data.get("signature")
    if not sig or sig.get("alg") != "Ed25519":
        return False
    key_b64 = sig.get("key")
    sig_b64 = sig.get("value")
    if not key_b64 or not sig_b64:
        return False
    subset = canonical_subset(data)
    msg = canonical_bytes(subset)
    try:
        vk = VerifyKey(_b64url_to_bytes(key_b64))
        vk.verify(msg, _b64url_to_bytes(sig_b64))
        return True
    except Exception:
        return False

def verify_receipt(receipt: dict, schema: dict) -> dict:
    v = Draft202012Validator(schema)
    schema_ok = True
    try:
        v.validate(receipt)
    except Exception:
        schema_ok = False

    out = receipt.get("output")
    out_hash = receipt.get("output_hash")
    hashes_ok = False
    if isinstance(out, str) and isinstance(out_hash, str):
        calc = _sha256_hex(out)
        hashes_ok = (out_hash.endswith(calc) or out_hash == calc)

    signature_ok = verify_signature_ed25519(receipt)

    verdict = {
        "schema_ok": bool(schema_ok),
        "hashes_ok": bool(hashes_ok),
        "signature_ok": bool(signature_ok),
        "format": "v1.1"
    }
    return verdict
