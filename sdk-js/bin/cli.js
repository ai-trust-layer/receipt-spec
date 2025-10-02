#!/usr/bin/env node
import { webcrypto as crypto } from 'node:crypto';
import fs from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

function usage() {
  console.log('Usage: atl-receipts verify <receipt.json> --schema <schema.json> [--pretty]');
  console.log('Output JSON: {"schema_ok":bool,"hashes_ok":bool,"signature_ok":bool,"format":"v1.1"}');
}

const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd || cmd === '--help' || cmd === '-h') {
  usage();
  process.exit(0);
}

if (cmd !== 'verify') {
  usage();
  process.exit(2);
}

let receiptPath = null;
let schemaPath = null;

if (args[1] && !args[1].startsWith('-')) {
  receiptPath = args[1];
}
for (let i = 2; i < args.length; i++) {
  const a = args[i];
  if (a === '--schema' && i + 1 < args.length) {
    schemaPath = args[i + 1];
    i++;
  }
}

if (!receiptPath || !schemaPath) {
  usage();
  process.exit(2);
}

const pretty = args.includes('--pretty');

async function main() {
  const [rTxt, sTxt] = await Promise.all([
    fs.readFile(receiptPath, 'utf8'),
    fs.readFile(schemaPath, 'utf8')
  ]);

  const data = JSON.parse(rTxt);
  const schema = JSON.parse(sTxt);

  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const schema_ok = validate(data) === true;

  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(data.output || ''));
  const calc = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  const expect = String(data.output_hash || '').replace(/^sha256:/i, '').toLowerCase();
  const hashes_ok = expect.length > 0 && calc === expect;

  const result = {
    schema_ok,
    hashes_ok,
    signature_ok: false,
    format: 'v1.1',
    errors: validate.errors || []
  };

  const out = pretty ? JSON.stringify(result, null, 2) : JSON.stringify(result);
  console.log(out);
  process.exit(schema_ok && hashes_ok ? 0 : 1);
}

main().catch(err => {
  console.error(String(err && err.stack ? err.stack : err));
  process.exit(1);
});