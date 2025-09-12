# Security Roadmap
Scope: hardening pentru proiectul AI Trust Layer (spec + SDK + interop).

## 0–3 luni
- Threat model inițial și revizuire trimestrială
- Politici de gestionare a cheilor (no secrets in repo, .env ignorat, revocare chei)
- CI: SCA pe toate repo-urile, licențe aprobate, semnături pentru release

## 3–6 luni
- Pen-test extern pe UI și SDK-uri
- Logare verificări (tamper-evident) pentru demo
- Pregătire SOC 2 Type I (gap assessment, politici, evidențe)

## 6–12 luni
- Atestate TEE (SGX/Nitro) pentru anchoring service
- Rotire chei și HSM/KMS pentru semnarea release-urilor
- SOC 2 Type I, pregătire pentru Type II
