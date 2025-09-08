# Receipt Standard v1.0 — Draft

## 1. Scope
Vendor-neutral, per-response receipts for AI decisions. Focus: integrity and verifiability.

## 2. Terminology
- Receipt: cryptographic record of an AI interaction.
- Anchor: public reference (e.g., L2 tx) proving timestamp and integrity.

## 3. Receipt Fields (overview)
id, issued_at, model_version, policy_version, policy_hash, input_hash, output_hash, timestamp, proof_refs[], trustscore, signature.

## 4. JSON Schema
See schema/receipt.schema.json

## 5. Verification
1) Validate JSON Schema.
2) Recompute input/output hashes.
3) Check signature.
4) Check anchors (finality, re-anchors).

## 6. Security & Privacy
No raw inputs/outputs; only salted commitments. Policy content is not exposed; only version + hash.

## 7. Versioning
Semver for spec, policy packs, and SDKs. Backward compatibility guaranteed within major versions.

## 8. Examples
See /examples
