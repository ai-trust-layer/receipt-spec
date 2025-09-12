name: Pilot request
description: Apply to run an AI Trust Receipts pilot
labels: ["pilot"]
body:
  - type: input
    id: company
    attributes: { label: Company, placeholder: e.g., ACME Bank }
    validations: { required: true }
  - type: input
    id: contact
    attributes: { label: Contact (email), placeholder: name@example.com }
    validations: { required: true }
  - type: textarea
    id: usecase
    attributes: { label: Use case, description: What flow(s) will generate receipts? }
    validations: { required: true }
  - type: dropdown
    id: evidence
    attributes:
      label: Target Evidence Level (initial)
      options: [E1 Schema-only, E2 Anchored, E3 Attested, E4 Certified]
    validations: { required: true }
  - type: textarea
    id: kpis
    attributes:
      label: Success criteria
      description: KPIs (e.g., TTE<5s, Coverage>95%, P95<200ms)
  - type: textarea
    id: regs
    attributes:
      label: Regulatory context
      description: e.g., AI Act (EU), GDPR, HIPAA, SOX, etc.
