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
