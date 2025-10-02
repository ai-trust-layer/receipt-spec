function ensureMsgHost() {
  let el = document.getElementById('resultMessage');
  if (!el) {
    el = document.createElement('p');
    el.id = 'resultMessage';
    el.style.marginTop = '8px';
    el.style.fontWeight = '600';
    (document.getElementById('app') || document.body).appendChild(el);
  }
  return el;
}
function renderValidation(v) {
  const el = ensureMsgHost();
  el.textContent = v.schema_ok ? 'Verdict: PASS (schema_ok=true)' : 'Verdict: FAIL (schema_ok=false)';
}
async function verifySchema(receiptText, schemaText) {
  const ajv = new Ajv7({ allErrors: true, strict: false });
  addAjvFormats(ajv);
  const schema = JSON.parse(schemaText);
  const data   = JSON.parse(receiptText);
  const validate = ajv.compile(schema);
  const ok = validate(data);
  return { schema_ok: ok, errors: validate.errors || [] };
}
(function wireVerify(){
  const fr = document.getElementById('fReceipt');
  const fs = document.getElementById('fSchema');
  const btn = document.getElementById('btnVerify');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const rFile = fr && fr.files && fr.files[0];
    const sFile = fs && fs.files && fs.files[0];
    if (!rFile || !sFile) { alert('Load both Receipt and Schema'); return; }
    const [receiptText, schemaText] = await Promise.all([rFile.text(), sFile.text()]);
    const v = await verifySchema(receiptText, schemaText);
    window.last = window.last || {};
    window.last.receiptText = receiptText;
    window.last.schemaText  = schemaText;
    window.last.validation  = v;
    renderValidation(v);
  });
})();
