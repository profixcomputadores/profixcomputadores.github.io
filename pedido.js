// ProFix — Pedido guiado (contato.html). Ao enviar: 1) abre o WhatsApp com o texto pronto (o cliente toca em enviar); 2) grava o lead no CRM (cadastroPublico, tipo 'pedido').
(function () {
  'use strict';
  var f = document.getElementById('pedido'); if (!f) return;
  var API = (window.PROFIX_SITE || {}).API_URL || '', WA = 'https://wa.me/5515981128309?text=';
  var $ = function (i) { return document.getElementById(i); };
  var et = [].slice.call(f.querySelectorAll('.pg-etapa')), at = 0, er = $('pg-erro');
  var marcado = function (n) { var e = f.querySelector('input[name="' + n + '"]:checked'); return e ? e.value : ''; };
  var campo = function (n) { var e = f.querySelector('[name="' + n + '"]'); return e ? String(e.value || '').trim() : ''; };
  var dig = function (v) { return String(v || '').replace(/\D/g, ''); };
  var mask = function (v) { var d = dig(v).slice(0, 11); if (d.length <= 2) return d.length ? '(' + d : ''; var n = d.slice(2); return '(' + d.slice(0, 2) + ') ' + (n.length > 8 ? n.slice(0, 5) + '-' + n.slice(5) : n.length > 4 ? n.slice(0, 4) + '-' + n.slice(4) : n); };
  function aviso() { var nb = marcado('equipamento') === 'Notebook' && (marcado('servico') === 'Não sei, quero ajuda' || /placa|tela|teclado|conector|carca|dobradi|bateria/i.test(campo('detalhes')));
    $('pg-aviso-nb').hidden = !(nb && at >= 2); }
  function mostra(k, foco) { at = k; et.forEach(function (e, j) { e.hidden = j !== k; });
    $('pg-prog').textContent = 'Etapa ' + (k + 1) + ' de ' + et.length; $('pg-barra').style.width = ((k + 1) / et.length * 100) + '%';
    $('pg-voltar').hidden = k === 0; $('pg-seguir').hidden = k === et.length - 1; $('pg-enviar').hidden = k !== et.length - 1; er.textContent = ''; aviso();
    if (foco) { var l = et[k].querySelector('legend'); l.setAttribute('tabindex', '-1'); try { l.focus({ preventScroll: true }); } catch (e) {} var r = f.getBoundingClientRect(); if (r.top < 0 || r.top > innerHeight * 0.6) f.scrollIntoView({ block: 'start' }); } }
  function falta(k) { var c = et[k].getAttribute('data-campo'); return c && !marcado(c) ? 'Escolha uma opção para continuar.' : ''; }
  f.classList.add('js'); mostra(0, false);
  $('pg-seguir').addEventListener('click', function () { var m = falta(at); if (m) { er.textContent = m; var i = et[at].querySelector('input'); if (i) i.focus(); return; } mostra(at + 1, true); });
  $('pg-voltar').addEventListener('click', function () { if (at > 0) mostra(at - 1, true); });
  f.addEventListener('change', aviso); f.addEventListener('input', aviso);
  $('pg-tel').addEventListener('input', function () { this.value = mask(this.value); });
  document.querySelectorAll('.pg-zona[data-regiao]').forEach(function (a) { a.addEventListener('click', function () {
    var r = f.querySelector('input[name="regiao"][value="' + a.getAttribute('data-regiao') + '"]'); if (r) r.checked = true; }); });
  function texto(d) { return ['Oi, Pedro! Vim pelo site da ProFix.', 'Atendimento: ' + d.tipoCliente, 'Equipamento: ' + d.equipamento, 'Preciso de: ' + d.servico,
    'O que acontece: ' + (d.detalhes || '-'), 'Região: ' + d.regiao, 'Nome: ' + d.nome].join('\n'); }
  function ss(k) { try { return sessionStorage.getItem(k) || ''; } catch (e) { return ''; } }
  f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    for (var k = 0; k < et.length - 1; k++) { var m = falta(k); if (m) { mostra(k, true); er.textContent = m; return; } }
    var d = { tipoCliente: marcado('tipoCliente'), equipamento: marcado('equipamento'), servico: marcado('servico'), detalhes: campo('detalhes').slice(0, 300), regiao: marcado('regiao'), nome: campo('nome'), telefone: campo('telefone') };
    var t = dig(d.telefone);
    if (d.nome.length < 2 || d.nome.length > 80) { er.textContent = 'Informe seu nome (2 a 80 letras).'; $('pg-nome').setAttribute('aria-invalid', 'true'); $('pg-nome').focus(); return; }
    if ((t.length !== 10 && t.length !== 11) || t.charAt(0) === '0') { er.textContent = 'Informe seu WhatsApp com DDD (10 ou 11 dígitos).'; $('pg-tel').setAttribute('aria-invalid', 'true'); $('pg-tel').focus(); return; }
    // E-mail só vai ao CRM se a caixa "Aceito receber por e-mail…" estiver MARCADA; sem a marca, é descartado aqui (e no servidor).
    var em = campo('email').toLowerCase(), aceita = !!($('pg-aceita') && $('pg-aceita').checked);
    if (aceita && !/^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]{2,}$/.test(em)) { er.textContent = em ? 'Confira seu e-mail (ex.: voce@exemplo.com) ou desmarque a opção de receber avisos por e-mail.' : 'Informe seu e-mail ou desmarque a opção de receber avisos por e-mail.'; $('pg-email').setAttribute('aria-invalid', 'true'); $('pg-email').focus(); return; }
    var url = WA + encodeURIComponent(texto(d));
    // 1) WhatsApp aberto dentro do próprio toque (celular não bloqueia); se bloquear, fica o botão real logo abaixo.
    var w = null; try { w = window.open(url, '_blank'); if (w) w.opener = null; } catch (e) {}
    $('pg-wa').href = url; f.hidden = true; var ok = $('pg-ok'); ok.hidden = false; try { ok.focus({ preventScroll: true }); } catch (e) {} ok.scrollIntoView({ block: 'center' });
    // 2) Lead no CRM (Leads do site / Pedidos do site). Falhou = o pedido segue pelo WhatsApp.
    if (!API || !window.fetch) return;
    var o = String(ss('pf_origem')).replace(/[^a-z0-9-]/g, '').slice(0, 20);
    var c = { nome: d.nome, telefone: d.telefone, cidade: d.regiao === 'Outra cidade da região' ? '' : 'Sorocaba', servico: (d.servico + ' · ' + d.equipamento).slice(0, 120), consentimento: true,
      site: campo('site'), tipo: 'pedido', origemPagina: ('site|contato|pedido' + (o ? '|' + o : '')).slice(0, 60), tipoCliente: d.tipoCliente, equipamento: d.equipamento, regiao: d.regiao, detalhes: d.detalhes };
    if (aceita && em) { c.email = em.slice(0, 120); c.aceitaEmail = true; }
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) { var v = ss('pf_' + k); if (/^[A-Za-z0-9_.-]{1,60}$/.test(v)) c[k] = v; });
    fetch(API, { method: 'POST', redirect: 'follow', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ acao: 'cadastroPublico', args: c }) })
      .then(function (r) { return r.json(); }).then(function (j) { f.setAttribute('data-crm', j && j.ok ? 'ok' : 'erro'); }).catch(function () { f.setAttribute('data-crm', 'erro'); });
  });
})();
