# How to verify a receipt (60s)
1. Open **audit.html** or **verify.html**.
2. Select a receipt (e.g. `proof-gallery/ok-1.json`) and the schema (`docs/receipt.schema.json`).
3. Click **Verify**.
- PASS → download **audit pack (.zip)** with `receipt.json`, `schema.json`, `checks.txt`, `links.txt`.
- Try a tampered sample (e.g. `tampered-1.json`) → FAIL.
- no-op: branch protection sanity 2025-09-13 18:36:29Z
- sanity 2025-09-13 18:54:33Z

