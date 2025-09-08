# Anchoring Guide (testnets)
## Compute SHA-256 of a file
shasum -a 256 receipt-spec-v1.pdf > CHECKSUMS.txt

## Example (etherscan-style data field)
- Network: Sepolia/Base-Amoy/Polygon-Amoy
- Data: `RECEIPT_SPEC_V1_SHA256=<HEX>`
Record TxID in `proof_refs` and keep finality policy (e.g., N blocks).
