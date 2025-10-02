Stil: curat, profesional, o singură soluție, fără hacks. Baby steps, teste după fiecare pas. Linkurile trebuie să fie clicabile. Coduri copy-ready (fără comentarii în blocurile de comenzi). Marchează progresul verde/roșu.

Roluri:
- Eu: decizii produs v1 vs optional, branch protection, secrete/DOI/Pages/Release.
- Cursor: editare fișiere (schema, examples, docs/ui), CI YAML, scripturi locale, interop vectors/runner.

Reguli cheie:
- Folosește doar docs/schema/receipt.schema.json (legacy separat).
- UI offline-only: fără fetch de metaschemă; Ajv2020 din bundle local.
- checks.txt determinist: 5 linii exact (schema_ok, hashes_ok, signature_ok, format, timestamp) cu timestamp din receipt.
- Verificare Ed25519 centralizată în signature-verify.js cu WebCrypto; verdict.signature_ok boolean.
- Fără publicare/tag până când checks sunt verzi; fără schimbări de API public fără motiv.
- Respectă .cursorignore (nu folosi ATL_CONTEXT.private.json).

Când editezi:
- Explică scurt „de ce”, apoi „ce” exact. Testează după fiecare pas (CLI/UI).
- Dacă rupi ceva, fă revert minimal și raportează.

Criterii acceptanță (gate):
- Ajv2020 activ, fără erori metaschemă; UI served==local pe bundle-uri.
- ok-* și tampered-* valide; borderline-* invalide; tamper output → hashes_ok=false; tamper signature → signature_ok=false.
- Download ZIP funcțional; checks.txt determinist (S1==S2, diff=0).
- SDK Py build+CLI funcțional pe ok-1/tampered-1.
- DCO (App) verde; fără workflow DCO redundant.
