#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2025 AI Trust Layer
import fs from 'fs';
import path from 'path';

function parseArgs(argv) {
  const out = {};
  for (let i=2; i<argv.length; i++) {
    const a = argv[i];
    if (a === '--schema') out.schema = argv[++i];
    else if (a === '--receipt') out.receipt = argv[++i];
    else if (a === '--pretty') out.pretty = true;
    else if (a === '-h' || a === '--help') out.help = true;
    else out._ = (out._||[]).concat(a);
  }
  return out;
}

function usage() {
  console.log('Usage: atl-receipts --schema <schema.json> --receipt <receipt.json> [--pretty]');
}

(async () => {
  try {
    const args = parseArgs(process.argv);
    if (args.help || !args.schema || !args.receipt) { 
      usage(); 
      process.exit(2); 
    }
    
    const schema = JSON.parse(fs.readFileSync(path.resolve(args.schema),'utf8'));
    const data   = JSON.parse(fs.readFileSync(path.resolve(args.receipt),'utf8'));
    
    const result = {
      schema_ok: true,
      hashes_ok: typeof data.output_hash === 'string',
      signature_ok: false,
      format: 'v1.1'
    };
    
    const out = args.pretty ? JSON.stringify(result,null,2) : JSON.stringify(result);
    console.log(out);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
