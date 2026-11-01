// ProFix — anúncios do CRM (fotos, descrição, preço) na vitrine. SÓ LEITURA (ação pública anunciosPublicos). Falhou ou vazio = a página fica como está.
(function () {
  'use strict';
  var API = (window.PROFIX_SITE || {}).API_URL || '', WA = 'https://wa.me/5515981128309?text=';
  var vl = document.getElementById('vitrine-lista'), sv = document.getElementById('anuncios-serv-lista');
  if (!API || !window.fetch || (!vl && !sv)) return;
  var brl = function (n) { return 'R$ ' + Number(n || 0).toFixed(2).replace('.', ','); };
  var el = function (tag, cls, filhos) { var e = document.createElement(tag); if (cls) e.className = cls; (filhos || []).forEach(function (x) { if (x) e.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); }); return e; };
  var okUrl = function (u) { return /^https:\/\/(drive\.google\.com\/thumbnail\?|lh3\.googleusercontent\.com\/)/.test(String(u || '')); };
  var st = document.createElement('style');
  st.textContent = '.an-gal{position:relative;margin:-4px -4px 10px}.an-trilho{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:0;border-radius:10px;scrollbar-width:none}.an-trilho::-webkit-scrollbar{display:none}' +
    '.an-trilho button{flex:0 0 100%;scroll-snap-align:start;border:0;padding:0;background:#e9edf2;cursor:zoom-in}.an-trilho img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}' +
    '.an-pontos{display:flex;gap:6px;justify-content:center;margin-top:6px}.an-pontos span{width:8px;height:8px;border-radius:50%;background:#c5cbd3}.an-pontos span.on{background:#16a34a}' +
    '.an-cont{position:absolute;right:8px;top:8px;background:rgba(0,0,0,.6);color:#fff;font-size:12px;padding:2px 8px;border-radius:99px}.an-specs{list-style:none;padding:0;margin:6px 0;font-size:14px}.an-specs li{padding:2px 0}.an-specs b{font-weight:600}' +
    '.an-desc{white-space:pre-line;font-size:14px;color:inherit;opacity:.9}.an-desc.curta{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}.an-mais{background:none;border:0;color:#16a34a;padding:0;font:inherit;cursor:pointer;margin-bottom:8px}' +
    '.an-lb{position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:1000;display:flex;align-items:center;justify-content:center}.an-lb img{max-width:100%;max-height:86vh;object-fit:contain}' +
    '.an-lb button{position:absolute;background:rgba(255,255,255,.15);color:#fff;border:0;border-radius:99px;width:44px;height:44px;font-size:22px;cursor:pointer}.an-lb .f{top:12px;right:12px}.an-lb .a{left:8px;top:50%}.an-lb .p{right:8px;top:50%}.an-lb .n{bottom:14px;left:50%;transform:translateX(-50%);width:auto;padding:0 14px;font-size:14px;height:32px}';
  document.head.appendChild(st);
  function lightbox(fotos, i, tit) {
    var lb = el('div', 'an-lb'), im = new Image(), n = el('button', 'n'), fe = el('button', 'f', ['×']), a = el('button', 'a', ['‹']), p = el('button', 'p', ['›']);
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Fotos de ' + tit); fe.setAttribute('aria-label', 'Fechar'); a.setAttribute('aria-label', 'Foto anterior'); p.setAttribute('aria-label', 'Próxima foto');
    var mostra = function () { im.src = fotos[i].url; im.alt = tit + ' – foto ' + (i + 1); n.textContent = (i + 1) + ' / ' + fotos.length; };
    var fim = function () { lb.remove(); document.removeEventListener('keydown', tc); }, tc = function (e) { if (e.key === 'Escape') fim(); if (e.key === 'ArrowRight') { i = (i + 1) % fotos.length; mostra(); } if (e.key === 'ArrowLeft') { i = (i - 1 + fotos.length) % fotos.length; mostra(); } };
    fe.onclick = fim; a.onclick = function () { i = (i - 1 + fotos.length) % fotos.length; mostra(); }; p.onclick = function () { i = (i + 1) % fotos.length; mostra(); }; lb.onclick = function (e) { if (e.target === lb) fim(); };
    lb.appendChild(im); lb.appendChild(fe); if (fotos.length > 1) { lb.appendChild(a); lb.appendChild(p); } lb.appendChild(n); document.body.appendChild(lb); document.addEventListener('keydown', tc); mostra(); fe.focus();
  }
  function galeria(fotos, tit) {
    fotos = (fotos || []).filter(function (f) { return f && okUrl(f.url); }).slice(0, 20); if (!fotos.length) return null;
    var g = el('div', 'an-gal'), tr = el('div', 'an-trilho'), pt = el('div', 'an-pontos'), ct = el('span', 'an-cont', ['1/' + fotos.length]);
    fotos.forEach(function (f, i) { var b = el('button'), im = new Image(); b.type = 'button'; b.setAttribute('aria-label', 'Ampliar foto ' + (i + 1) + ' de ' + tit);
      im.src = f.url; im.alt = tit + ' – foto ' + (i + 1); im.loading = i ? 'lazy' : 'eager'; im.decoding = 'async'; im.width = 800; im.height = 600; im.onerror = function () { b.remove(); if (!tr.children.length) g.remove(); };
      b.appendChild(im); b.onclick = function () { lightbox(fotos, i, tit); }; tr.appendChild(b); pt.appendChild(el('span', i ? '' : 'on')); });
    tr.addEventListener('scroll', function () { var i = Math.round(tr.scrollLeft / Math.max(tr.clientWidth, 1)); ct.textContent = (i + 1) + '/' + fotos.length; [].forEach.call(pt.children, function (s, k) { s.className = k === i ? 'on' : ''; }); }, { passive: true });
    g.appendChild(tr); if (fotos.length > 1) { g.appendChild(ct); g.appendChild(pt); } return g;
  }
  function card(a, vendido) {
    var c = el('article', 'card pc-venda anuncio'); c.setAttribute('data-anuncio', a.id || ''); var g = galeria(a.fotos, a.titulo || 'ProFix'); if (g) c.appendChild(g);
    c.appendChild(el('h3', '', [String(a.titulo || '')])); if (a.condicao) c.appendChild(el('p', 'obs', [String(a.condicao)]));
    if (a.specs && a.specs.length) { var ul = el('ul', 'an-specs'); a.specs.slice(0, 10).forEach(function (s) { ul.appendChild(el('li', '', [el('b', '', [String(s[0]) + ': ']), String(s[1])])); }); c.appendChild(ul); }
    if (a.descricao) { var d = el('p', 'an-desc curta', [String(a.descricao)]); c.appendChild(d); if (String(a.descricao).length > 160) { var m = el('button', 'an-mais', ['Ler mais']); m.type = 'button'; m.onclick = function () { var cu = d.classList.toggle('curta'); m.textContent = cu ? 'Ler mais' : 'Ler menos'; }; c.appendChild(m); } }
    if (vendido) c.appendChild(el('p', 'obs', ['Vendido']));
    else { if (a.preco) c.appendChild(el('div', 'preco', [(a.aPartir ? 'a partir de ' : '') + brl(a.preco)]));
      var w = el('a', 'btn peq', [a.tipo === 'Serviço' ? 'Agendar' : 'Tenho interesse']); w.href = WA + encodeURIComponent('Oi, Pedro! Vi no site o anúncio ' + (a.id || '') + ' (' + (a.titulo || '') + ').' + (a.tipo === 'Serviço' ? ' Quero agendar.' : ' Ainda está disponível?')); w.target = '_blank'; w.rel = 'noopener'; c.appendChild(w); }
    return c;
  }
  fetch(API, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ acao: 'anunciosPublicos', args: {} }) }).then(function (r) { return r.json(); }).then(function (j) {
    if (!j || j.ok !== true) return;
    if (vl && Array.isArray(j.pcs)) {
      var ids = j.pcs.concat(j.vendidos || []).map(function (a) { return a.vinculo; }).filter(Boolean);
      // o anúncio (com fotos) substitui o card simples do mesmo PC vindo da vitrine
      var tira = function () { document.querySelectorAll('#vitrine-lista .pc-venda:not(.anuncio), #vendidos-lista .pc-venda:not(.anuncio)').forEach(function (c) { var h = (c.querySelector('a') || {}).href || '', t = c.textContent;
        if (ids.some(function (id) { return h.indexOf(encodeURIComponent(' ' + id + ' ')) >= 0 || h.indexOf(encodeURIComponent('PC ' + id)) >= 0; })) c.remove(); }); };
      j.pcs.forEach(function (a) { vl.insertBefore(card(a, false), vl.firstChild ? null : null); });
      var vd = document.getElementById('vendidos-lista'); if (vd && (j.vendidos || []).length) { j.vendidos.forEach(function (a) { vd.appendChild(card(a, true)); }); var vb = document.getElementById('vendidos-box'); if (vb) vb.hidden = false; }
      tira(); try { new MutationObserver(tira).observe(vl, { childList: true }); if (vd) new MutationObserver(tira).observe(vd, { childList: true }); } catch (e) {}
      if (j.pcs.length) { var vz = document.getElementById('vitrine-vazia'); if (vz) vz.hidden = true; }
      vl.setAttribute('data-anuncios', String(j.pcs.length));
    }
    if (sv && Array.isArray(j.servicos) && j.servicos.length) { j.servicos.forEach(function (a) { sv.appendChild(card(a, false)); }); var sec = document.getElementById('anuncios-serv'); if (sec) sec.hidden = false; }
  }).catch(function () {});
})();
