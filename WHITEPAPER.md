AI Trust Layer — Verifiable Receipts v1.1

Abstract
- Verificare locală, deterministă, fără rețea, pentru proveniența rezultatelor AI.

Receipt schema (v1.1)
- câmpuri, tipuri, timestamp/issued_at.

Determinism
- checks.txt cu 5 linii: schema_ok, hashes_ok, signature_ok, format, timestamp.

Canonical subset and signature
- ordinea câmpurilor semnate, normalizare, Ed25519.

Threat model
- tamper output, semnătură invalidă, metaschemă offline, supply-chain.

Interoperability
- raport cu C2PA, SCITT, COSE Receipts.

Test vectors
- ok-1, ok-2, tampered-output, tampered-sig.
