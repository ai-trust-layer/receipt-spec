// docs/js/verify-ui.js
(function () {
  const $ = (id) => document.getElementById(id);
  const nameOf = (f) => (f && f.name) ? f.name : '—';

  // SHA-256 utilitar pentru hashes_ok
  async function sha256Hex(str) {
    const enc = new TextEncoder().encode(str);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2,"0"))
      .join("");
  }

  function publishMessage(txt) {
    const out = $('resultMessage');
    if (out) {
      if (!out.hasAttribute('aria-live')) out.setAttribute('aria-live', 'polite');
      out.textContent = txt;
    }
  }

  // Schema-only validation (real Ajv validation against the chosen schema)
  async function manualValidate() {
    const fr = $('fReceipt');
    const fs = $('fSchema');
    if (!(fr?.files?.[0] && fs?.files?.[0])) {
      publishMessage('Selectează ambele fișiere (receipt + schema) și apasă Verify.');
      return { ok: null, errors: [{ message: 'missing files' }] };
    }

    const [rTxt, sTxt] = await Promise.all([fr.files[0].text(), fs.files[0].text()]);
    const data = JSON.parse(rTxt);
    const schema = JSON.parse(sTxt);

    // --- minimal hashes check ---
    let hashes_ok = 'unknown';
    try {
      const rawHash = data && typeof data === 'object' ? data.output_hash : undefined;
      const expect = rawHash ? String(rawHash).replace(/^sha256:/i, '').toLowerCase() : undefined;
      // normalizează și când output nu e string pur (ex. obiect/array):
      const outputStr = typeof data.output === 'string' ? data.output : (data.output ? JSON.stringify(data.output) : null);
      if (expect && outputStr) {
        const calc = (await sha256Hex(outputStr)).toLowerCase();
        hashes_ok = (calc === expect);
      }
    } catch (_e) {
      hashes_ok = false;
    }

    // Ajv7 is vendored locally (real validation, no network)
    const ajv = new Ajv7({ allErrors: true, strict: false });
    try { if (typeof window.addAjvFormats === 'function') window.addAjvFormats(ajv); } catch {}

    const validate = ajv.compile(schema);
    const ok = validate(data);

    const verdict = ok ? 'Verdict: PASS (schema_ok=true)' : 'Verdict: FAIL (schema_ok=false)';
    publishMessage(verdict + `  |  hashes_ok: ${hashes_ok}`);
    
    // Salvează în window.last pentru ZIP
    window.last = window.last || {};
    window.last.receiptText = rTxt;
    window.last.schemaText = sTxt;
    window.last.validation = { schema_ok: ok, hashes_ok: hashes_ok, errors: validate.errors || [] };
    
    return { ok, hashes_ok, errors: validate.errors || [] };
  }

  // Guards: enable Verify only when both files are chosen; show filenames live
  function verifyUIInit() {
    const fr = $('fReceipt');
    const fs = $('fSchema');
    const btn = $('btnVerify');
    if (!(fr && fs && btn)) return;

    const reflect = () => {
      const rec = fr.files && fr.files[0];
      const sch = fs.files && fs.files[0];
      btn.disabled = !(rec && sch);
      publishMessage(`Receipt: ${nameOf(rec)}  |  Schema: ${nameOf(sch)}`);
    };

    fr.addEventListener('change', reflect);
    fs.addEventListener('change', reflect);
    reflect();
  }

  function wireButton() {
    const btn = $('btnVerify');
    if (!btn) return;
    btn.addEventListener('click', () => {
      manualValidate().catch((e) => {
        console.error('unexpected:', e);
        publishMessage('Verdict: FAIL (unexpected error)');
      });
    });
  }

  // Expose for Console/manual tests if needed
  window.manualValidate = manualValidate;
  window.verifyUIInit = verifyUIInit;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { verifyUIInit(); wireButton(); }, { once: true });
  } else {
    verifyUIInit(); wireButton();
  }
})();
