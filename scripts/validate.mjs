import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const schemaPath = 'schema/receipt.schema.json';
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const validate = ajv.compile(schema);

const files = fs.readdirSync('examples').filter(f => f.endsWith('.json')).sort();

let ok = 0, fail = 0;
for (const f of files) {
  const p = path.join('examples', f);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const valid = validate(data);
  if (valid) {
    console.log(`PASS  ${f}`);
    ok++;
  } else {
    console.log(`FAIL  ${f}`);
    console.log(ajv.errorsText(validate.errors, { separator: '\n' }));
    fail++;
  }
}

console.log(`\nSummary: PASS=${ok} FAIL=${fail}`);
process.exit(fail > 0 ? 1 : 0);
