# Pilot SOW (Statement of Work)

## Scope
Implementarea și validarea AI Trust Receipts în 1–2 fluxuri critice (read-only), fără a modifica deciziile modelului.

## Timeline
8–12 săptămâni în două faze:
- Faza A (4–6 săpt.): integrare, tuning, validare internă
- Faza B (4–6 săpt.): rulare pilot cu utilizatori selectați

## Deliverables
- Integrare SDK (JS/Py) cu receipt-uri v1.0
- Verificare offline-first + ancorare batched
- Dashboard minimal KPI (export CSV)
- Raport final pilot (rezultate și recomandări)

## KPIs (acceptance)
- Time-to-Evidence (TTE) < 5s pentru 95% din interacțiuni
- Coverage > 95% din interacțiuni au receipt valid
- P95 verify latency: schema-only < 200ms; cu ancoră externă < 2s
- 0 incidente critice de integritate (hash mismatch)

## Data & Security
- Fără PII în receipt-uri; doar hash-uri și metadate tehnice
- Chei client păstrate de client; noi nu stocăm secrete
- Logs opționale, anonimizate; retenție agreată

## Roles
- Client: owner al mediului, date și politici
- Noi: integrare, verificare, observabilitate

## Support
- Business hours CET, răspuns inițial ≤ 1 zi lucrătoare

## Exit Criteria
- Toți KPI atingi sau plan de remediere acceptat de client
- Handoff: documentație, scripturi, configurări

## Commercials
- Fee fix pilot + costuri variabile ancorare (dacă se aplică)
- Milestone-based; 30/40/30
