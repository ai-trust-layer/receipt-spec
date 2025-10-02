SPDX-License-Identifier: Apache-2.0
Copyright (c) 2025 AI Trust Layer

(function () {
  "use strict";

  function b64urlToBytes(b64url) {
    const s = String(b64url).replace(/-/g, '+').replace(/_/g, '/');
    const pad = s.length % 4 === 2 ? '==' : s.length % 4 === 3 ? '=' : '';
    const bin = atob(s + pad);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function canonicalize(x) {
    if (x === null || typeof x !== "object") return JSON.stringify(x);
    if (Array.isArray(x)) return "[" + x.map(canonicalize).join(",") + "]";
    const keys = Object.keys(x).sort();
    const parts = [];
    for (const k of keys) {
      const v = x[k];
      if (typeof v === "undefined") continue;
      parts.push(JSON.stringify(k) + ":" + canonicalize(v));
    }
    return "{" + parts.join(",") + "}";
  }

  const FIELD_ORDER = [
    "id","issued_at","timestamp",
    "model_version","policy_version","policy_hash",
    "input_hash","output_hash"
  ];

  function canonicalSubset(data) {
    const sub = {};
    for (const k of FIELD_ORDER) {
      if (Object.prototype.hasOwnProperty.call(data, k)) sub[k] = data[k];
    }
    return sub;
  }

  async function verifySignatureEd25519(data) {
    try {
      if (!data || !data.signature) return false;
      const sig = data.signature;
      if (String(sig.alg) !== "Ed25519") return false;
      if (!sig.key || !sig.value) return false;

      const payload = new TextEncoder().encode(canonicalize(canonicalSubset(data)));
      const pubKey = await crypto.subtle.importKey(
        "raw",
        b64urlToBytes(sig.key),
        { name: "Ed25519" },
        false,
        ["verify"]
      );
      const ok = await crypto.subtle.verify(
        "Ed25519",
        pubKey,
        b64urlToBytes(sig.value),
        payload
      );
      return ok === true;
    } catch (e) {
      return false;
    }
  }

  window.verifySignatureEd25519 = verifySignatureEd25519;
})();