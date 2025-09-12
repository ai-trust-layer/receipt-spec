# Proof Gallery
Exemple pentru demo (încarcă fiecare fișier în `docs/verify.html`):
- ok-1.json / ok-2.json / ok-3.json → așteptat PASS
- borderline-1.json, highrisk-1.json → PASS (dar trustscore mai mic)
- blocked-1.json → FAIL (policy)
- tampered-1.json / tampered-2.json → FAIL (hash mismatch)
- reanchor-1.json → PASS (cu două ancore, include Tx real)
