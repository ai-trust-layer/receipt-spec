#!/usr/bin/env node
import { webcrypto as crypto } from 'node:crypto';
import fs from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
const args = process.argv;
const cmd = args[2];
const receiptPath = args[3];
const schemaPath = args[5];
if (cmd!=='verify') { console.error('Usage: receipt-verify verify <receipt.json> --schema <schema.json>'); process.exit(2); }
const [rTxt,sTxt] = await Promise.all([fs.readFile(receiptPath,'utf8'), fs.readFile(schemaPath,'utf8')]);
const data = JSON.parse(rTxt), schema = JSON.parse(sTxt);
const ajv = new Ajv2020({allErrors:true, strict:false});
const validate = ajv.compile(schema);
const ok = validate(data);
const encoder = new TextEncoder();
const buf = await crypto.subtle.digest('SHA-256', encoder.encode(data.output||''));
const calc = Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
const expect = (data.output_hash||'').replace(/^sha256:/i,'').toLowerCase();
const hashes_ok = expect ? (calc===expect) : 'unknown';
console.log(JSON.stringify({schema_ok:ok, hashes_ok, signature_ok:false, format:'v1.1', errors: validate.errors||[]}, null, 2));
process.exit(ok?0:1);
