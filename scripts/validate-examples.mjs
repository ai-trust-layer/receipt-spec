import fs from 'fs';
import path from 'path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const schema = JSON.parse(fs.readFileSync('schema/receipt.schema.json','utf8'));
const ajv = new Ajv2020({allErrors:true, strict:false});
addFormats(ajv);
const validate = ajv.compile(schema);

const dir = 'examples';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
let allOk = true;

for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
  const valid = validate(data);
  const ok = !!valid;
  allOk = allOk && ok;
  console.log(`${ok?'OK  ':'FAIL'} ${f}`);
  if (!ok) console.log(JSON.stringify(validate.errors, null, 2));
}

process.exit(allOk ? 0 : 1);
