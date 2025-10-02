import hashlib, json
from jsonschema import Draft202012Validator
from nacl.signing import VerifyKey
from .canonical import canonical_subset, canonical_bytes
from typing import Optional, Tuple

def _sha256_hex(s: str) -> str:
    h = hashlib.sha256()
    h.update(s.encode("utf-8"))
    return h.hexdigest()

def _b64url_to_bytes(s: str) -> bytes:
    import base64
    pad = '=' * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)

def _normalize_signature(data: dict) -> Tuple[Optional[bytes], Optional[bytes], str]:
    import base64
    def b64u(b):
        b = b.encode("ascii") if isinstance(b, str) else b
        return base64.urlsafe_b64decode(b + b"=" * (-len(b) % 4))
    sig_obj = data.get("signature")
    alg = "Ed25519"
    if sig_obj is None:
        return (None, None, "none")
    if isinstance(sig_obj, str):
        try:
            sig_b = b64u(sig_obj)
        except Exception:
            return (None, None, "none")
        key_str = None
        if "public_key" in data and isinstance(data["public_key"], str):
            key_str = data["public_key"]
        elif "signature_key" in data and isinstance(data["signature_key"], str):
            key_str = data["signature_key"]
        if not key_str:
            return (None, sig_b, alg)
        try:
            key_b = b64u(key_str)
        except Exception:
            return (None, sig_b, alg)
        return (key_b, sig_b, alg)
    if isinstance(sig_obj, dict):
        sig_str = sig_obj.get("sig")
        key_str = sig_obj.get("key") or data.get("public_key") or data.get("signature_key")
        a = (sig_obj.get("alg") or "Ed25519")
        alg = a if a else "Ed25519"
        if not sig_str:
            return (None, None, "none")
        try:
            sig_b = b64u(sig_str)
        except Exception:
            return (None, None, "none")
        if not key_str:
            return (None, sig_b, alg)
        try:
            key_b = b64u(key_str)
        except Exception:
            return (None, sig_b, alg)
        return (key_b, sig_b, alg)
    return (None, None, "none")

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

    # Normalize and verify signature
    pubkey_b, sig_b, alg = _normalize_signature(receipt)
    signature_ok = False
    if alg == "Ed25519" and pubkey_b and sig_b:
        try:
            subset = canonical_subset(receipt)
            message_bytes = canonical_bytes(subset)
            VerifyKey(pubkey_b).verify(message_bytes, sig_b)
            signature_ok = True
        except Exception:
            signature_ok = False
    else:
        signature_ok = False

    verdict = {
        "schema_ok": bool(schema_ok),
        "hashes_ok": bool(hashes_ok),
        "signature_ok": bool(signature_ok),
        "format": "v1.1"
    }
    return verdict
