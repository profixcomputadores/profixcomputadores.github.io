// ProFix — site multipágina. Integrações com o CRM (Apps Script): catálogo e vitrine (só leitura), cadastro de contato e contagem de cliques no WhatsApp.
(function () {
  'use strict';
  var $ = function (i) { return document.getElementById(i); };
  var API = (window.PROFIX_SITE || {}).API_URL || '';
  var WA = 'https://wa.me/5515981128309?text=';
  // Menu (hambúrguer no celular)
  var mb = $('menu-btn'), nav = $('nav-topo');
  if (mb && nav) {
    mb.addEventListener('click', function () { var a = nav.classList.toggle('aberto'); mb.setAttribute('aria-expanded', a ? 'true' : 'false'); mb.setAttribute('aria-label', a ? 'Fechar menu' : 'Abrir menu'); document.body.classList.toggle('menu-aberto', a); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('aberto')) mb.click(); });
  }
  function digitos(v) { return String(v || '').replace(/\D/g, ''); }
  function mascara(v) { var d = digitos(v).slice(0, 11); if (d.length <= 2) return d.length ? '(' + d : '';
    var r = '(' + d.slice(0, 2) + ') ', n = d.slice(2); return r + (n.length > 8 ? n.slice(0, 5) + '-' + n.slice(5) : n.length > 4 ? n.slice(0, 4) + '-' + n.slice(4) : n); }
  function origemUrl() { var v = ''; try { var q = new URLSearchParams(location.search); v = q.get('origem') || q.get('utm_source') || '';
    v = String(v).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20); if (v) sessionStorage.setItem('pf_origem', v); else v = sessionStorage.getItem('pf_origem') || ''; } catch (e) {}
    return String(v).replace(/[^a-z0-9-]/g, '').slice(0, 20); }
  var UTM = ['utm_source', 'utm_medium', 'utm_campaign'];
  function limparUtm(v) { v = String(v || ''); return /^[A-Za-z0-9_.-]{1,60}$/.test(v) ? v : ''; }
  try { var q0 = new URLSearchParams(location.search); UTM.forEach(function (k) { var v = limparUtm(q0.get(k)); if (v) sessionStorage.setItem('pf_' + k, v); }); } catch (e) {}
  function utms() { var o = {}; UTM.forEach(function (k) { var v = ''; try { v = limparUtm(sessionStorage.getItem('pf_' + k)); } catch (e) {} if (v) o[k] = v; }); return o; }
  function pagina() { return (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index'; }
  // Contagem de cliques no WhatsApp (sem dado pessoal, falha em silêncio)
  function registrarClique(tipo, org) {
    if (!API) return;
    try { var corpo = JSON.stringify({ acao: 'registrarClique', args: { tipo: tipo, origem: String(org || 'direto').replace(/[^A-Za-z0-9_.-]/g, '').slice(0, 40) || 'direto' } });
      if (!(navigator.sendBeacon && navigator.sendBeacon(API, new Blob([corpo], { type: 'text/plain;charset=UTF-8' }))))
        fetch(API, { method: 'POST', body: corpo, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, keepalive: true, mode: 'no-cors' }).catch(function () {});
    } catch (e) {}
  }
  function lugar(el) { if (el.closest('.topo')) return 'topo'; if (el.closest('footer')) return 'rodape'; if (el.id === 'wa-flutuante') return 'flutuante'; return pagina(); }
  document.addEventListener('click', function (ev) { var a = ev.target.closest && ev.target.closest('a[href]'); if (a && /^https:\/\/wa\.me\//.test(a.href)) registrarClique('whatsapp', lugar(a)); }, true);
  // Formulário de contato (cadastroPublico) — só na página de contato
  var f = $('form');
  if (f) {
    $('telefone').addEventListener('input', function () { this.value = mascara(this.value); });
    f.addEventListener('focusin', function x() { f.removeEventListener('focusin', x); registrarClique('formulario_aberto', 'contato'); });
    f.addEventListener('submit', function (ev) {
      ev.preventDefault(); var b = $('enviar'); if (b.disabled) return; var txt = b.textContent;
      ['nome', 'telefone', 'consentimento'].forEach(function (i) { $(i).removeAttribute('aria-invalid'); });
      var o = origemUrl(), c = { nome: $('nome').value.trim(), telefone: $('telefone').value.trim(), cidade: '', servico: [$('equipamento').value, $('servico').value.trim()].filter(String).join(' — ').slice(0, 300),
        consentimento: $('consentimento').checked === true, site: $('pf_ref_z').value, tipo: 'retorno', origemPagina: o ? 'site-netlify|' + o : 'site-netlify' };
      var cm = $('conheceu').value; if (cm) c.comoConheceu = cm; var u = utms(); Object.keys(u).forEach(function (k) { c[k] = u[k]; });
      var erro = null, d = digitos(c.telefone);
      if (c.nome.length < 2 || c.nome.length > 80) erro = ['nome', 'Informe seu nome (2 a 80 letras).'];
      else if (d.length !== 10 && d.length !== 11) erro = ['telefone', 'Informe um telefone com DDD (10 ou 11 dígitos).'];
      else if (!c.consentimento) erro = ['consentimento', 'Marque a autorização para podermos entrar em contato.'];
      if (erro) { $('erro').textContent = erro[1]; $(erro[0]).setAttribute('aria-invalid', 'true'); $(erro[0]).focus(); return; }
      if (!API) { $('erro').textContent = 'Cadastro indisponível no momento. Chame no WhatsApp (15) 98112-8309.'; return; }
      $('erro').textContent = ''; b.disabled = true; b.textContent = 'Enviando…';
      fetch(API, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ acao: 'cadastroPublico', args: c }) })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (j && j.ok === true) { f.hidden = true; $('sucesso').hidden = false; return; } throw Object.assign(new Error((j && j.erro) || 'Não foi possível enviar. Tente de novo.'), { srv: true }); })
        .catch(function (e) { $('erro').textContent = e.srv ? e.message : 'Sem conexão. Confira a internet e tente de novo.'; })
        .then(function () { b.disabled = false; b.textContent = txt; });
    });
  }
  // Formulário compacto "Prefere que a gente chame você?" (index/serviços) — mesmo cadastroPublico, marcado como pedido de retorno
  document.querySelectorAll('form.form-retorno').forEach(function (fr) {
    var q = function (n) { return fr.querySelector('[name="' + n + '"]'); }, er = fr.querySelector('.erro'), b = fr.querySelector('button'), ok = fr.parentNode.querySelector('.fr-ok');
    q('telefone').addEventListener('input', function () { this.value = mascara(this.value); });
    fr.addEventListener('submit', function (ev) {
      ev.preventDefault(); if (b.disabled) return; var txt = b.textContent;
      ['nome', 'telefone', 'consentimento'].forEach(function (n) { q(n).removeAttribute('aria-invalid'); });
      var o = origemUrl(), pg = fr.getAttribute('data-pagina') || pagina(), c = { nome: q('nome').value.trim(), telefone: q('telefone').value.trim(), cidade: '', servico: 'Pedido de retorno pelo site',
        consentimento: q('consentimento').checked === true, site: q('site').value, tipo: 'retorno', origemPagina: ('site-netlify|' + pg + (o ? '|' + o : '')).slice(0, 60) };
      var u = utms(); Object.keys(u).forEach(function (k) { c[k] = u[k]; });
      var erro = null, d = digitos(c.telefone);
      if (c.nome.length < 2 || c.nome.length > 80) erro = ['nome', 'Informe seu nome (2 a 80 letras).'];
      else if ((d.length !== 10 && d.length !== 11) || d.charAt(0) === '0') erro = ['telefone', 'Informe um telefone com DDD (10 ou 11 dígitos).'];
      else if (!c.consentimento) erro = ['consentimento', 'Marque a autorização para o Pedro poder te chamar.'];
      if (erro) { er.textContent = erro[1]; q(erro[0]).setAttribute('aria-invalid', 'true'); q(erro[0]).focus(); return; }
      if (!API) { er.textContent = 'Indisponível no momento. Chame no WhatsApp (15) 98112-8309.'; return; }
      er.textContent = ''; b.disabled = true; b.textContent = 'Enviando…'; registrarClique('formulario_aberto', 'retorno-' + pg);
      fetch(API, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ acao: 'cadastroPublico', args: c }) })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (j && j.ok === true) { fr.hidden = true; if (ok) { ok.hidden = false; ok.setAttribute('tabindex', '-1'); ok.focus(); } return; } throw Object.assign(new Error((j && j.erro) || 'Não foi possível enviar. Tente de novo.'), { srv: true }); })
        .catch(function (e) { er.textContent = e.srv ? e.message : 'Sem conexão. Confira a internet e tente de novo.'; })
        .then(function () { b.disabled = false; b.textContent = txt; });
    });
  });
  // Acompanhamento: só link público (?os=<código>) ou código com letras e 8+ caracteres. Telefone ou número puro NÃO servem.
  var fo = $('form-os');
  if (fo) fo.addEventListener('submit', function (ev) {
    ev.preventDefault(); var v = $('os-num').value.trim(), m = v.match(/[?&]os=([A-Za-z0-9_-]{8,})/), cod = m ? m[1] : (/^[A-Za-z0-9_-]{8,}$/.test(v) && /[A-Za-z]/.test(v) ? v : '');
    if (!cod) { $('os-erro').textContent = 'Cole o link ou o código que recebeu no WhatsApp. Telefone ou número da OS não servem; sem o código, use o botão do WhatsApp abaixo.'; $('os-num').focus(); return; }
    if (!API) { $('os-erro').textContent = 'Consulta indisponível agora. Chame no WhatsApp.'; return; }
    $('os-erro').textContent = ''; window.open(API + '?os=' + encodeURIComponent(cod), '_blank', 'noopener');
  });
  // Fotos reais dos PCs (config.js)
  var F = (window.PROFIX_SITE || {}).FOTOS_PCS || {};
  document.querySelectorAll('figure.foto[data-foto]').forEach(function (fig) {
    var d = F['pc' + fig.getAttribute('data-foto')]; if (!d || !d.arquivo) return;
    var img = new Image(); img.loading = 'lazy'; img.decoding = 'async'; img.width = 800; img.height = 600; img.alt = d.alt || '';
    img.hidden = true; img.onload = function () { var ph = fig.querySelector('.ph'); if (ph) ph.remove(); img.hidden = false; }; img.onerror = function () { img.remove(); };
    img.src = 'img/pcs/' + d.arquivo; fig.insertBefore(img, fig.firstChild);
  });
  // CRM (só leitura): catálogo atualiza a tabela fixa; vitrine preenche PCs à venda. Falhou ou vazio = fica o conteúdo fixo.
  if (!API || !window.fetch) return;
  var brl = function (n) { return 'R$ ' + Number(n || 0).toFixed(2).replace('.', ','); };
  var el = function (tag, cls, filhos) { var e = document.createElement(tag); if (cls) e.className = cls; (filhos || []).forEach(function (x) { if (x) e.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); }); return e; };
  var post = function (acao) { return fetch(API, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ acao: acao, args: {} }) }).then(function (r) { return r.json(); }); };
  var norm = function (s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); };
  var ALIAS = { 'diagnostico': 'diagnostico tecnico', 'montagem': 'montagem de pc', 'pasta termica': 'pasta termica premium', 'suporte remoto': 'suporte remoto planos para empresas', 'planos b2b para empresas': 'suporte remoto planos para empresas' };
  var ul = $('tabela-lista');
  if (ul) post('catalogoPublico').then(function (j) {
    var l = (j && j.ok && j.servicos) || []; if (!l.length) return;
    var linhas = {}; ul.querySelectorAll('li').forEach(function (li) { linhas[norm(li.querySelector('span').textContent)] = li; });
    l.forEach(function (s) { if (!s || !s.nome || !(Number(s.valor) > 0)) return; var k = norm(s.nome), li = linhas[k] || linhas[ALIAS[k]];
      var pr = (s.aPartir ? 'a partir de ' : '') + brl(s.valor);
      if (li) li.querySelector('b').textContent = pr; else { li = el('li', '', [el('span', '', [String(s.nome)]), el('b', '', [pr])]); ul.appendChild(li); linhas[k] = li; } });
    ul.setAttribute('data-fonte', 'crm');
  }).catch(function () {});
  var vl = $('vitrine-lista');
  if (vl) post('vitrinePublica').then(function (j) {
    if (!j || !j.ok) return; var d = j.disponiveis || [], v = j.vendidos || [];
    var card = function (p, vendido) { var a = el('article', 'card pc-venda');
      if (p.foto && /^https:\/\//.test(p.foto)) { var im = new Image(); im.src = p.foto; im.alt = p.titulo || 'PC ProFix'; im.loading = 'lazy'; im.width = 800; im.height = 600; im.className = 'pc-foto'; im.onerror = function () { im.remove(); }; a.appendChild(im); }
      a.appendChild(el('h3', '', [String(p.titulo || 'PC ProFix')])); if (p.specs) a.appendChild(el('p', '', [String(p.specs)]));
      if (vendido) a.appendChild(el('p', 'obs', ['Vendido' + (p.vendidoEm ? ' em ' + String(p.vendidoEm).split('-').reverse().join('/') : '')]));
      else { if (p.preco) a.appendChild(el('div', 'preco', [brl(p.preco)])); if (p.status === 'Reservado') a.appendChild(el('p', 'obs', ['Reservado']));
        var w = el('a', 'btn peq', ['Tenho interesse']); w.href = WA + encodeURIComponent('Oi, Pedro! Vi no site o PC ' + (p.id || '') + ' (' + (p.titulo || '') + '). Ainda está disponível?'); w.target = '_blank'; w.rel = 'noopener'; a.appendChild(w); }
      return a; };
    d.forEach(function (p) { vl.appendChild(card(p, false)); }); v.forEach(function (p) { $('vendidos-lista').appendChild(card(p, true)); });
    if (d.length) $('vitrine-vazia').hidden = true; if (v.length) $('vendidos-box').hidden = false;
  }).catch(function () {});
})();
