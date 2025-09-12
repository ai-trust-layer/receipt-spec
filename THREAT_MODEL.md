# Threat Model (v0)
Assets: schema, release-uri, examples, site static, SDK-uri.
Adversari: actor extern, contributor malițios, supply-chain.

Riscuri cheie:
- Inserare de backdoor în SDK sau în UI (supply chain)
- Expunere de secrete în repo
- Receipt-uri invalide dar „acceptate” din cauza configurării greșite
- Linkuri către explorere compromise

Măsuri:
- Branch protection, review obligatoriu, verif. CI
- .env ignorat, scan secrete, semnături release + checksums
- Interop suite obligatoriu pe PR-urile de spec
- Fallback explorer + schema-only mode în UI
