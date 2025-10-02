Instalare (local, dev):
python3 -m venv .venv
. .venv/bin/activate
pip install -U pip build
python -m build sdk/python
pip install sdk/python/dist/*.whl

CLI:
atl-receipts --schema docs/schema/receipt.schema.json --receipt docs/examples/ok-1.json
