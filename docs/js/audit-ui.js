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
  const bz = document.getElementById('btnZip'); if (bz) bz.disabled = false;
}

// ZIP
async function makeZip() {
  const zip = new JSZip();
  zip.file('receipt.json', window.last?.receiptText ?? '');
  zip.file('schema.json',  window.last?.schemaText ?? '');
  const checks = [
    `schema_ok=${window.last?.validation?.schema_ok ?? 'unknown'}`,
    `timestamp=${new Date().toISOString()}`
  ].join('\n');
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
          out.textContent = 'Select both files first.'; return;
        }
        const [rt, st] = await Promise.all([fr.files[0].text(), fs.files[0].text()]);
        const data   = JSON.parse(rt);
        const schema = JSON.parse(st);

        const ajv = new window.Ajv7({ allErrors:true, strict:false });
        if (typeof window.addAjvFormats === 'function') window.addAjvFormats(ajv);

        const validate = ajv.compile(schema);
        const ok = validate(data);
        window.last = window.last || {};
        window.last.validation = { schema_ok: ok, errors: validate.errors || [] };
        window.last.receiptText = rt;
        window.last.schemaText = st;
        out.textContent = ok ? 'Verdict: PASS (schema_ok=true)' : 'Verdict: FAIL (schema_ok=false)';

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
