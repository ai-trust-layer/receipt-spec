SPDX-License-Identifier: Apache-2.0
Copyright (c) 2025 AI Trust Layer

// Initialize window.last safely
window.last = window.last || {};

// Minimal SHA-256 hex helper
async function sha256Hex(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2,"0"))
    .join("");
}

// Ed25519 signature verification helpers
function b64uToBytes(s) {
  // Convert base64url to base64, then decode
  const base64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
  return new Uint8Array(atob(padded).split('').map(c => c.charCodeAt(0)));
}

function hexToBytes(s) {
  const bytes = new Uint8Array(s.length / 2);
  for (let i = 0; i < s.length; i += 2) {
    bytes[i / 2] = parseInt(s.substr(i, 2), 16);
  }
  return bytes;
}

function textToBytes(s) {
  return new TextEncoder().encode(s);
}

function canonicalSubset(obj, keys) {
  const subset = {};
  for (const key of keys) {
    if (obj[key] !== undefined) {
      subset[key] = obj[key];
    }
  }
  return JSON.stringify(subset);
}

function detectFmt(s) {
  // Check if it's base64url (no padding, contains - or _)
  if (/^[A-Za-z0-9_-]+$/.test(s) && (s.includes('-') || s.includes('_'))) {
    return "b64u";
  }
  // Check if it's hex (only 0-9, a-f, A-F)
  if (/^[0-9a-fA-F]+$/.test(s)) {
    return "hex";
  }
  return null;
}

async function verifyEd25519(pubBytes, sigBytes, msgBytes) {
  try {
    // Check if Ed25519 is supported
    if (!crypto.subtle || !crypto.subtle.importKey) {
      return null; // unknown
    }
    
    const key = await crypto.subtle.importKey(
      "raw",
      pubBytes,
      { name: "Ed25519" },
      true,
      ["verify"]
    );
    
    return await crypto.subtle.verify(
      { name: "Ed25519" },
      key,
      sigBytes,
      msgBytes
    );
  } catch (e) {
    return null; // unknown (Ed25519 not supported or other error)
  }
}
// verdict în UI
function showResultMessage(result) {
  const host = document.getElementById('app') || document.body;
  let el = document.getElementById('resultMessage');
  if (!el) {
    el = document.createElement('p');
    el.id = 'resultMessage';
    el.style.marginTop = '8px';
    el.style.fontWeight = '600';
    host.appendChild(el);
  }
  el.textContent = result.schema_ok ? 'Verdict: PASS (schema_ok=true)' : 'Verdict: FAIL (schema_ok=false)';
  if ("hashes_ok" in result) el.textContent += `  |  hashes_ok: ${result.hashes_ok}`;
  if ("signature_ok" in result) el.textContent += `  |  signature_ok: ${result.signature_ok}`;
  const bz = document.getElementById('btnDownloadZip'); if (bz) bz.disabled = false;
}

// ZIP
async function makeZip() {
  const zip = new JSZip();
  zip.file('receipt.json', window.last?.receiptText ?? '');
  zip.file('schema.json',  window.last?.schemaText ?? '');
  
  let data;
  try {
    data = JSON.parse(window.last?.receiptText || '{}');
  } catch (_) {
    data = {};
  }

  const v = (window.last && window.last.validation) ? window.last.validation : {};

  const ts = (data && data.timestamp) ? String(data.timestamp)
         : (data && data.issued_at) ? String(data.issued_at)
         : "n/a";

  const checks = [
    "schema_ok: " + String(!!v.schema_ok),
    "hashes_ok: " + String(!!v.hashes_ok),
    "signature_ok: " + String(v.signature_ok === true),
    "format: v1.1",
    "timestamp: " + ts
  ].join("\n");

  zip.file('checks.txt', checks);
  const links = [
    window.last?.validation?.tx_url  ? `Tx: ${window.last.validation.tx_url}`   : '',
    window.last?.validation?.doi_url ? `DOI: ${window.last.validation.doi_url}` : ''
  ].filter(Boolean).join('\n') || 'no-links';
  zip.file('links.txt', links);
  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'audit.zip';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 0);
}


// --- bootstrap: robust Verify wiring (schema-only) ---
(function(){
  const boot = () => {
    const btn = document.getElementById('btnVerify');
    const fr  = document.getElementById('fReceipt');
    const fs  = document.getElementById('fSchema');
    const out = document.getElementById('resultMessage');
    if (!btn || !fr || !fs || !out) return;

    btn.addEventListener('click', async () => {
      try {
        if (!(fr.files && fr.files[0] && fs.files && fs.files[0])) {
          out.textContent = 'Select both files first.';
        document.dispatchEvent(new Event("atl:verify:done")); 
        }
        const [rt, st] = await Promise.all([fr.files[0].text(), fs.files[0].text()]);
        const data   = JSON.parse(rt);
        // --- minimal hashes check (local-only) ---
        let hashes_ok = 'unknown';
        try {
          const rawHash = data && typeof data === 'object' ? data.output_hash : undefined;
          // normalize forms like "sha256:<hex>" or plain hex
          const expect = rawHash ? String(rawHash).replace(/^sha256:/i, '').toLowerCase() : undefined;
          if (expect && data && typeof data.output === 'string') {
            const calc = (await sha256Hex(data.output)).toLowerCase();
            hashes_ok = (calc === expect);
          }
          // if `output` is missing, keep 'unknown'
        } catch (_e) {
          hashes_ok = false; // fail-safe on unexpected error
        }
        
        // --- Ed25519 signature check ---
        let signature_ok = false;
        try {
          if (typeof window.verifySignatureEd25519 === "function") {
            signature_ok = await window.verifySignatureEd25519(data);
          }
        } catch (e) {
          signature_ok = false;
        }
        const schema = JSON.parse(st);

        const ajv = new Ajv2020({ strict: true, allErrors: true });
        if (typeof window.ajvFormats === 'function') { window.ajvFormats(ajv); }

        const validate = ajv.compile(schema);
        const ok = validate(data);
        window.last = window.last || {};
        window.last.validation = {
          schema_ok: ok,
          hashes_ok: hashes_ok,
          signature_ok: signature_ok,
          errors: validate.errors || []
        };
        window.last.receiptText = rt;
        window.last.schemaText = st;
        out.textContent = ok ? 'Verdict: PASS (schema_ok=true)' : 'Verdict: FAIL (schema_ok=false)';
        out.textContent += `  |  hashes_ok: ${hashes_ok}`;
        out.textContent += `  |  signature_ok: ${signature_ok}`;

        const bz = document.getElementById('btnDownloadZip'); if (bz) bz.disabled = false;
      } catch (e) {
        console.error('verify error:', e);
        out.textContent = 'Verdict: FAIL (unexpected_error)';
      }
    });

    // Download button wiring
    const btnZip = document.getElementById('btnDownloadZip');
    if (btnZip && !btnZip.dataset.wired) {
      btnZip.disabled = true;
      btnZip.addEventListener('click', async (e) => {
        e.preventDefault();
        btnZip.disabled = true;
        try {
          await makeZip();
        } catch (err) {
          console.error('zip error', err);
        } finally {
          btnZip.disabled = false;
        }
      });
      btnZip.dataset.wired = '1';
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

// --- UX guards: enable Verify only when both files are selected; show filenames ---
(function(){
  const fr = document.getElementById('fReceipt');
  const fs = document.getElementById('fSchema');
  const btn = document.getElementById('btnVerify');
  const bz  = document.getElementById('btnDownloadZip');
  const out = document.getElementById('resultMessage');

  if (!fr || !fs || !btn) return;

  const $name = (f) => (f && f.name) ? f.name : '—';
  const showChosen = () => {
    const rec = fr.files && fr.files[0];
    const sch = fs.files && fs.files[0];
    const ok  = !!(rec && sch);
    btn.disabled = !ok;
    if (out && (rec || sch)) {
      out.textContent = `Receipt: ${$name(rec)}  |  Schema: ${$name(sch)}`;
    }
  };

  fr.addEventListener('change', showChosen);
  fs.addEventListener('change', showChosen);

  // initial state on load
  showChosen();

  // after any successful verify elsewhere in this file, enable ZIP
  document.addEventListener('atl:verify:done', () => { if (bz) bz.disabled = false; });
})();

// --- hashes_ok patch (appended safely) ---
(function(){
  async function sha256Hex(str){
    const enc = new TextEncoder().encode(str ?? "");
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
  }
  function extractExpect(receipt){
    const raw = (receipt && receipt.output_hash) ? String(receipt.output_hash) : "";
    const m = raw.replace(/^sha256:/i,"").trim().toLowerCase();
    return m.length===64 ? m : "";
  }
  async function computeHashesOk(receipt){
    try{
      const expect = extractExpect(receipt);
      if(!expect) return "unknown";
      const out = (typeof receipt.output === "string") ? receipt.output : JSON.stringify(receipt.output ?? "");
      const calc = (await sha256Hex(out)).toLowerCase();
      return (calc === expect);
    }catch(e){ return false; }
  }

  const orig = window.manualValidate;
  if(typeof orig === "function"){
    window.manualValidate = async function(){
      const res = await orig.apply(this, arguments);
      try{
        // calc hashes_ok and update verdict text + window.last.validation
        const fr = document.getElementById('fReceipt');
        const rTxt = await (fr?.files?.[0]?.text?.() ?? Promise.resolve("{}"));
        const data = JSON.parse(rTxt);

        const hashes_ok = await computeHashesOk(data);

        // update verdict line if present
        const el = document.getElementById('resultMessage') || document.getElementById('result');
        if(el && typeof el.textContent === 'string'){
          if(!/hashes_ok:/i.test(el.textContent)){
            el.textContent = el.textContent + "  |  hashes_ok: " + String(hashes_ok);
          }else{
            el.textContent = el.textContent.replace(/hashes_ok:\s*\S+/i, "hashes_ok: " + String(hashes_ok));
          }
        }

        // persist for ZIP
        window.last = window.last || {};
        window.last.validation = Object.assign(
          { schema_ok: null, errors: [] }, // defaults
          window.last.validation || {},
          { hashes_ok: hashes_ok }
        );
      }catch(_e){}
      return res;
    };
  }
})();

// --- signature_ok (Ed25519 via WebCrypto) ---
(function(){
  function b64uToBytes(s){
    const t = s.replace(/-/g,'+').replace(/_/g,'/');
    const pad = '==='.slice((t.length+3)%4);
    const bin = atob(t+pad);
    return Uint8Array.from(bin, c=>c.charCodeAt(0));
  }
  function hexToBytes(h){
    const m = (h||'').trim();
    if(!/^[0-9a-fA-F]+$/.test(m) || (m.length%2)) return null;
    const out = new Uint8Array(m.length/2);
    for(let i=0;i<out.length;i++) out[i]=parseInt(m.slice(i*2,i*2+2),16);
    return out;
  }
  function textBytes(s){ return new TextEncoder().encode(String(s??'')); }
  function canonicalSubset(obj, keys){
    const o={}; for(const k of keys){ if(obj&&obj[k]!==undefined) o[k]=obj[k]; }
    return JSON.stringify(o);
  }
  function detectFmt(s){
    if(typeof s!=='string') return null;
    if(/^[A-Za-z0-9_-]+$/.test(s)) return 'b64u';
    if(/^[0-9a-fA-F]+$/.test(s)) return 'hex';
    return null;
    }
  async function verifyEd25519(pubBytes, sigBytes, msgBytes){
    if(!(crypto.subtle && crypto.subtle.importKey)) return null;
    try{
      const key = await crypto.subtle.importKey(
        'raw', pubBytes, {name:'Ed25519'}, false, ['verify']
      );
      const ok = await crypto.subtle.verify({name:'Ed25519'}, key, sigBytes, msgBytes);
      return !!ok;
    }catch(_e){ return null; }
  }

  const original = window.manualValidate;
  if(typeof original === 'function'){
    window.manualValidate = async function(){
      const res = await original.apply(this, arguments);
      try{
        // citim receipt-ul selectat
        const fr = document.getElementById('fReceipt');
        const rTxt = await (fr?.files?.[0]?.text?.() ?? Promise.resolve('{}'));
        const receipt = JSON.parse(rTxt||'{}');

        // extragem semnătura
        let signature_ok = 'unknown';
        const sig = receipt && receipt.signature;
        if(sig && (sig.alg==='Ed25519' || sig.alg==='ed25519') && sig.value && sig.key){
          const vFmt = detectFmt(sig.value);
          const kFmt = detectFmt(sig.key);
          let sigBytes=null, pubBytes=null;
          if(vFmt==='b64u') sigBytes=b64uToBytes(sig.value);
          if(vFmt==='hex')  sigBytes=hexToBytes(sig.value);
          if(kFmt==='b64u') pubBytes=b64uToBytes(sig.key);
          if(kFmt==='hex')  pubBytes=hexToBytes(sig.key);

          if(sigBytes && pubBytes){
            const payloadStr = canonicalSubset(receipt, [
              'id','issued_at','model_version','policy_version',
              'input_hash','output_hash','timestamp'
            ]);
            const ok = await verifyEd25519(pubBytes, sigBytes, textBytes(payloadStr));
            signature_ok = (ok===null) ? 'unknown' : ok;
          }
        }

        // actualizăm verdictul din UI
        const el = document.getElementById('resultMessage') || document.getElementById('result');
        if(el && typeof el.textContent==='string'){
          const kv = 'signature_ok: ' + String(signature_ok);
          if(/signature_ok:/i.test(el.textContent)){
            el.textContent = el.textContent.replace(/signature_ok:\s*\S+/i, kv);
          }else{
            el.textContent = el.textContent + '  |  ' + kv;
          }
        }

        // persistăm pentru ZIP
        window.last = window.last || {};
        window.last.validation = Object.assign(
          { schema_ok:null, hashes_ok:'unknown', errors:[] },
          window.last.validation || {},
          { signature_ok }
        );
      }catch(_e){}
      return res;
    };
  }
})();

