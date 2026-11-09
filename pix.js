// ProFix — % do desconto no Pix: UM lugar só. Vem do CRM (planosPublicos.pixPct, que o Pedro muda no painel); reserva em config.js (PIX_PCT_PADRAO). Nunca fixo no HTML.
(function () {
  'use strict';
  var C = window.PROFIX_SITE || {}, els = document.querySelectorAll('[data-pix-pct]'); if (!els.length) return;
  function aplica(n) { n = Number(n); if (!(isFinite(n) && n >= 0 && n <= 20)) return false; var t = n > 0 ? 'Pix à vista com ' + String(Math.round(n * 10) / 10).replace('.', ',') + '% de desconto' : 'Pix à vista';
    for (var i = 0; i < els.length; i++) { els[i].textContent = t; els[i].setAttribute('data-pix-pct', String(n)); } return true; }
  aplica(C.PIX_PCT_PADRAO != null ? C.PIX_PCT_PADRAO : 5);
  if (!C.API_URL || !window.fetch) return;
  fetch(C.API_URL, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ acao: 'planosPublicos', args: {} }) })
    .then(function (r) { return r.json(); }).then(function (d) { if (d && d.ok && typeof d.pixPct === 'number') aplica(d.pixPct); }).catch(function () {});
})();
