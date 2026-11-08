// ProFix — planos (preços/itens) vindos do CRM (ação pública planosPublicos, só leitura). Falhou = fica o texto do HTML.
(function () {
  'use strict';
  var API = (window.PROFIX_SITE || {}).API_URL || ''; var g = document.getElementById('pl-grade');
  if (!API || !window.fetch || !g) return;
  var brl = function (n) { var s = Number(n || 0).toFixed(2).split('.'); return 'R$ ' + s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + s[1]; };
  var proib = /garantia|\bpix\b|\bsla\b/i;
  fetch(API, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ acao: 'planosPublicos', args: {} }) })
    .then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.ok || !Array.isArray(d.planos)) return;
      d.planos.forEach(function (p) {
        var c = g.querySelector('[data-plano="' + String(p.chave).replace(/[^a-z]/g, '') + '"]'); if (!c || !(Number(p.preco) >= 215.7)) return;
        c.querySelector('.pl-preco').textContent = brl(p.preco);
        if (p.nome) c.querySelector('.pl-nome').textContent = p.nome;
        if (p.paraQuem && !proib.test(p.paraQuem)) c.querySelector('.pl-para').textContent = p.paraQuem;
        var inc = (p.inclui || []).filter(function (s) { return s && !proib.test(s); });
        if (inc.length) { var ul = c.querySelector('.pl-inc'); ul.textContent = ''; inc.forEach(function (s) { var li = document.createElement('li'); li.textContent = s; ul.appendChild(li); }); }
        document.querySelectorAll('.pl-tab td[data-p="' + p.chave + '"]').forEach(function (td) { var k = td.getAttribute('data-k');
          if (k === 'preco') td.textContent = brl(p.preco) + '/mês'; else if (k === 'maq' && p.maquinas) td.textContent = 'até ' + p.maquinas; else if (k === 'vis' && p.visitas) td.textContent = p.visitas; else if (k === 'pri' && p.prioridade) td.textContent = p.prioridade; });
        if (p.chave === 'essencial') { var e = document.querySelector('.pl-preco-ess'); if (e) e.textContent = brl(p.preco); }
      });
      d.planos.length && g.querySelectorAll('.pl-card').forEach(function (c) { if (!d.planos.some(function (p) { return p.chave === c.getAttribute('data-plano'); })) c.hidden = true; });
    }).catch(function () {});
})();
