# RFC-0001: Extensions Registry
Problem: allow vendor/project-specific fields without breaking interop.
Proposal: namespaced `x_ext:{vendor:{...}}`, documented in /extensions/.
Compatibility: receipts MUST validate without extensions present.
