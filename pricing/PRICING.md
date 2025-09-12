# Pricing & Evidence Levels

## Evidence Levels
- E1 Starter (schema-only): validare structură și câmpuri
- E2 Anchored (hash + ancorare on-chain batch): proof imutabil
- E3 Attested (semnături + policy hash): origine atestată
- E4 Certified (audite extern + TEE atestation): enterprise

## Tiers (indicativ; final se agrează în SOW)
- Starter (E1): volum mic, dev/test
- Regulated (E1–E2): compliance-first, ancorare batch
- Certified (E1–E3): semnături, policy packs, rapoarte
- Enterprise (E1–E4): SLA, audit, suport dedicat

## Unit Economics (guidance)
- Verify schema-only: inclus în licență SDK
- Anchoring batch: cost chain + mică taxă per 1k receipts
- Attestations: per key/tenant/lună
- Suport & SLA: lunar

Transparență: clienții pot rula totul self-hosted; costurile chain sunt vizibile public.
