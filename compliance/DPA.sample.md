# Data Processing Addendum (Sample)
Role: Project = processor of verification artifacts; Client = controller.

Processed data:
- Receipts JSON, hashes, timestamps, anchors

No personal data by default:
- Client confirms inputs do not contain personal data; if present, controller obligations apply

Security:
- Encryption in transit, integrity via hashes, immutable audit trail optional (on-chain)

Subprocessors:
- GitHub (hosting), GitHub Pages (static hosting), optional L2 testnets

Data retention:
- Spec repo public; no customer PII stored by default
- Logs optional, with retention agreed in SOW

Incident response:
- Notification within 72h with known scope and mitigations
