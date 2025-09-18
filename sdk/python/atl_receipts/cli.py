import json, sys, click
from pathlib import Path
from .verify import verify_receipt

@click.command()
@click.option("--schema", "schema_path", required=True, type=click.Path(exists=True, dir_okay=False))
@click.option("--receipt", "receipt_path", required=True, type=click.Path(exists=True, dir_okay=False))
def main(schema_path, receipt_path):
    schema = json.loads(Path(schema_path).read_text(encoding="utf-8"))
    receipt = json.loads(Path(receipt_path).read_text(encoding="utf-8"))
    verdict = verify_receipt(receipt, schema)
    print(json.dumps(verdict, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
