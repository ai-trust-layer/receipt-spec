// Minimal SHA-256 hex helper
async function sha256Hex(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2,"0"))
    .join("");
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
  const bz = document.getElementById('btnZip'); if (bz) bz.disabled = false;
}

// ZIP
async function makeZip() {
  const zip = new JSZip();
  zip.file('receipt.json', window.last?.receiptText ?? '');
  zip.file('schema.json',  window.last?.schemaText ?? '');
  const checksLines = [];
  checksLines.push(`schema_ok: ${window.last?.validation?.schema_ok ?? 'unknown'}`);
  if (typeof window.last?.validation?.hashes_ok !== 'undefined') {
    checksLines.push(`hashes_ok: ${window.last.validation.hashes_ok}`);
  }
  checksLines.push(`timestamp: ${new Date().toISOString()}`);
  const checks = checksLines.join('\n');
  zip.file('checks.txt', checks);
  const links = [
    window.last?.validation?.tx_url  ? `Tx: ${window.last.validation.tx_url}`   : '',
    window.last?.validation?.doi_url ? `DOI: ${window.last.validation.doi_url}` : ''
  ].filter(Boolean).join('\n') || 'no-links';
  zip.file('links.txt', links);
  const blob = await zip.generateAsync({type:'blob'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'audit-pack.zip';
  a.click();
  URL.revokeObjectURL(a.href);
}

// wire ZIP o singură dată
(function wireZip(){
  const btn = document.getElementById('btnZip');
  if (btn && !btn._wired) {
    btn.addEventListener('click', async () => {
      if (!window.last?.receiptText || !window.last?.schemaText || !window.last?.validation) { alert('Run Verify first'); return; }
      await makeZip();
    });
    btn._wired = true;
  }
})();

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
        const schema = JSON.parse(st);

        const ajv = new window.Ajv7({ allErrors:true, strict:false });
        if (typeof window.addAjvFormats === 'function') window.addAjvFormats(ajv);

        const validate = ajv.compile(schema);
        const ok = validate(data);
        window.last = window.last || {};
        window.last.validation = {
          schema_ok: ok,
          hashes_ok: hashes_ok,
          errors: validate.errors || []
        };
        window.last.receiptText = rt;
        window.last.schemaText = st;
        out.textContent = ok ? 'Verdict: PASS (schema_ok=true)' : 'Verdict: FAIL (schema_ok=false)';
        out.textContent += `  |  hashes_ok: ${hashes_ok}`;

        const bz = document.getElementById('btnZip'); if (bz) bz.disabled = false;
      } catch (e) {
        console.error('verify error:', e);
        out.textContent = 'Verdict: FAIL (unexpected_error)';
      }
    });
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
  const bz  = document.getElementById('btnZip');
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
