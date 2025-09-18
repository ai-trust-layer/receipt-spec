# Cursor Context (privat)

- Contextul privat trăiește în `.cursor/context/ATL_CONTEXT.private.json` și **nu se comite**.
- La începutul oricărui task:
  1) Deschide fișierul de context
  2) Respectă `rules`, `workflow`, `commands`
  3) Urmează `next_actions` și `blockers`
- Orice modificare majoră: cere confirmare și arată comenzi de test (Ajv, serve no-cache, tamper).

