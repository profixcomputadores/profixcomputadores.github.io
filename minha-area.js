// ProFix — Minha Área do cliente. Tudo é validado no servidor (Apps Script); aqui só mostra. Sessão só nesta aba (sessionStorage).
(function () {
  'use strict';
  var API = (window.PROFIX_SITE || {}).API_URL || '', K = 'profix_ma_s', WA = 'https://wa.me/5515981128309?text=';
  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  var api = function (acao, args) { return fetch(API, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ acao: acao, args: args || {} }) }).then(function (r) { return r.json(); }); };
  var ses = function (v) { try { if (v === undefined) return sessionStorage.getItem(K) || ''; if (v) sessionStorage.setItem(K, v); else sessionStorage.removeItem(K); } catch (e) { return ''; } };
  var erro = function (id, t) { var e = $(id); if (e) e.textContent = t || ''; };
  var ocupado = function (f, sim) { var b = f.querySelector('button[type=submit]'); if (b) { b.disabled = sim; b.setAttribute('aria-busy', sim ? 'true' : 'false'); } };
  function aba(qual) { ['entrar', 'primeiro'].forEach(function (a) { var b = $('ma-aba-' + a), p = $('ma-p-' + a); if (b) b.setAttribute('aria-selected', a === qual ? 'true' : 'false'); if (p) p.hidden = a !== qual; }); }
  function mostrar(logado) { $('ma-login').hidden = logado; $('ma-area').hidden = !logado; }
  var FRASE = { 'recebido': 'Seu equipamento está com a gente. Agora fazemos a avaliação; nenhum serviço é feito sem a sua aprovação.', 'em avaliação': 'Estamos avaliando o equipamento para te passar um orçamento claro.',
    'aguardando aprovação': 'Seu orçamento está pronto. Veja com calma e escolha o que preferir.', 'aprovado': 'Orçamento aprovado. Obrigado! Em breve começamos o serviço.',
    'em andamento': 'O serviço está em andamento. Avisamos você quando terminar.', 'em reparo': 'O serviço está em andamento. Avisamos você quando terminar.',
    'aguardando peça': 'Estamos aguardando a peça chegar para continuar. Assim que ela chegar, te avisamos; ainda não há data confirmada pelo fornecedor.',
    'pronto': 'Pronto para retirar! ✅ Combine o melhor horário com a gente.', 'entregue': 'Entregue. Sua garantia de 30 dias conta a partir da data de entrega.',
    'orçamento recusado': 'Tudo certo, este atendimento foi encerrado. Se precisar de algo, é só chamar.', 'cancelado': 'Tudo certo, este atendimento foi encerrado. Se precisar de algo, é só chamar.' };
  function brl(n) { return 'R$ ' + Number(n || 0).toFixed(2).replace('.', ','); }
  function cartao(o) {
    var c = el('article', 'card ma-os'), h = el('h3', null, (o.equipamentos && o.equipamentos[0] ? o.equipamentos.map(function (e) { return e.identificacao; }).join(', ') : 'Atendimento') );
    var st = el('span', 'ma-st' + (o.aguardandoResposta ? ' alerta' : (o.cancelado || o.status === 'Entregue') ? ' cinza' : ''), o.status || '');
    c.appendChild(h); c.appendChild(el('p', 'muted', 'OS ' + o.os + (o.entrada ? ' · entrada ' + o.entrada : '') + (o.servico ? ' · ' + o.servico : ''))); c.appendChild(st);
    var fr = FRASE[String(o.status || '').toLowerCase()]; if (fr) c.appendChild(el('p', 'ma-frase', fr));
    if (o.previsaoEntrega && !o.cancelado && o.status !== 'Entregue' && !/aguardando pe[çc]a/i.test(o.status || '')) c.appendChild(el('p', null, 'Previsão de entrega: ' + o.previsaoEntrega));
    var tl = el('ol', 'ma-tl'); (o.linhaDoTempo || []).forEach(function (e) { tl.appendChild(el('li', e.situacao, e.etapa + (e.data ? ' · ' + e.data : ''))); }); if (!o.cancelado) c.appendChild(tl);
    if (o.orcamento && o.orcamento.total != null) { var p = el('p'); p.appendChild(el('b', null, 'Orçamento: ' + brl(o.orcamento.total))); if (o.orcamento.validoAte) p.appendChild(document.createTextNode(' · válido até ' + o.orcamento.validoAte)); if (o.orcamento.aprovacao && o.orcamento.aprovacao !== 'Pendente') p.appendChild(document.createTextNode(' · ' + o.orcamento.aprovacao)); c.appendChild(p); }
    var nOS = String(o.os || '').replace(/^OS[\s-]*/i, '');
    var ag = o.agendamento, quando = ag && /^\d{4}-\d{2}-\d{2}$/.test(ag.data || '') && /^\d{2}:\d{2}$/.test(ag.hora || '') ? new Date(ag.data + 'T' + ag.hora + ':00-03:00') : null;
    if (quando && quando.getTime() > Date.now() && !o.cancelado && !o.finalizada) { // agendamento futuro: Confirmar / Mudar horário (textos da seção 10)
      var dBR = ag.dataBR || (ag.data.slice(8, 10) + '/' + ag.data.slice(5, 7) + '/' + ag.data.slice(0, 4)), bx = el('div', 'ma-ag');
      bx.appendChild(el('p', 'ma-ag-t', 'Atendimento marcado')); // cartão "Seu agendamento" (textos-area-do-cliente.md 12.1)
      bx.appendChild(el('p', 'ma-ag-q', (ag.dia ? ag.dia + ', ' : '') + dBR + ', às ' + ag.hora + (ag.tipo ? ' · ' + ag.tipo : '')));
      var lk = function (cls, txt, msg) { var a = el('a', cls, txt); a.href = WA + encodeURIComponent(msg); a.target = '_blank'; a.rel = 'noopener'; return a; }, ac = el('div', 'ma-ag-ac');
      ac.appendChild(lk('btn peq ma-ag-ok', 'Confirmar agendamento', 'Oi, Pedro! Confirmo meu horário de *' + (ag.dia ? ag.dia + ', ' : '') + dBR + ', às ' + ag.hora + '* (OS ' + nOS + '). Até lá! 🙂'));
      ac.appendChild(lk('btn sec peq ma-ag-mudar', 'Preciso mudar o horário', 'Oi, Pedro! Não vou conseguir no horário de ' + dBR + ' às ' + ag.hora + ' (OS ' + nOS + '). Podemos remarcar?'));
      bx.appendChild(ac); c.appendChild(bx);
    } else if (!o.cancelado && !o.finalizada && /^pronto/i.test(o.status || '')) { // pronto e sem horário: 12.1 "Sem horário"
      var sh = el('div', 'ma-ag ma-ag-sem'), sp = el('p', 'ma-ag-q', 'Ainda não tem horário marcado. Combine pelo '), wl = el('a', null, 'WhatsApp (15) 98112-8309');
      wl.href = WA + encodeURIComponent('Oi, Pedro! Sobre a OS ' + nOS + '...'); wl.target = '_blank'; wl.rel = 'noopener'; sp.appendChild(wl); sp.appendChild(document.createTextNode('.')); sh.appendChild(sp); c.appendChild(sh);
    }
    if (o.finalizada || (!o.cancelado && /^(entregue|finalizad)/i.test(o.status || ''))) { // pedido de avaliação em TODA OS entregue (sem filtro, regra do Google)
      var av = el('div', 'ma-av'); av.appendChild(el('h4', null, 'Tudo certo com seu computador? 💚'));
      av.appendChild(el('p', null, 'Sua avaliação no Google ajuda muito a ProFix, que é um negócio pequeno aqui de Sorocaba. Leva menos de 1 minuto.'));
      var g = el('a', 'btn ma-av-google', 'Avaliar a ProFix no Google'); g.href = 'https://g.page/r/CZQuYc9gn5lJECE/review'; g.target = '_blank'; g.rel = 'noopener'; av.appendChild(g);
      var w = el('a', 'ma-av-wa', 'Teve algum problema? Falar com o Pedro no WhatsApp'); w.href = WA + encodeURIComponent('Oi, Pedro! Sobre a OS ' + nOS + '...'); w.target = '_blank'; w.rel = 'noopener'; av.appendChild(w);
      c.appendChild(av);
    }
    if (o.link && /^https:\/\/script\.google\.com\//.test(o.link)) { var a = el('a', 'btn' + (o.aguardandoResposta ? '' : ' sec peq'), o.aguardandoResposta ? 'Ver e aprovar o orçamento' : (o.avaliacao && o.avaliacao.pode ? 'Ver detalhes e avaliar' : 'Ver detalhes')); a.href = o.link; a.target = '_blank'; a.rel = 'noopener'; c.appendChild(a); }
    return c;
  }
  function carregarOS() {
    var l = $('ma-lista'); l.textContent = ''; l.appendChild(el('p', 'muted', 'Carregando suas OS…'));
    return api('maMinhasOS', { sessao: ses() }).then(function (d) {
      if (!d || !d.ok) { if (d && d.codigo === 'SESSAO') { ses(null); mostrar(false); aba('entrar'); erro('ma-erro-entrar', d.erro); return; } l.textContent = ''; l.appendChild(el('p', 'erro', (d && d.erro) || 'Não foi possível carregar.')); return; }
      $('ma-ola').textContent = 'Olá, ' + (d.primeiroNome || 'cliente') + '!'; $('ma-login-mask').textContent = d.login ? 'Entrou como ' + d.login : '';
      l.textContent = '';
      if (!d.os.length) { var v = el('div', 'card vazio'); v.appendChild(el('h3', null, 'Nenhuma OS por aqui ainda')); v.appendChild(el('p', null, 'Quando você deixar um equipamento com a ProFix, o atendimento aparece aqui.')); l.appendChild(v); return; }
      d.os.forEach(function (o) { l.appendChild(cartao(o)); });
      if (d.total > d.mostrando) l.appendChild(el('p', 'obs', 'Mostrando as ' + d.mostrando + ' OS mais recentes de ' + d.total + '.'));
    }).catch(function () { l.textContent = ''; l.appendChild(el('p', 'erro', 'Não conseguimos falar com a ProFix agora. Confira sua internet e tente de novo em instantes.')); });
  }
  function entrou(r) { ses(r.sessao); ['ma-senha', 'ma-c-senha', 'ma-c-senha2'].forEach(function (i) { if ($(i)) $(i).value = ''; }); mostrar(true); carregarOS(); window.scrollTo(0, 0); }
  function init() {
    if (!$('ma-login')) return;
    $('ma-aba-entrar').onclick = function () { aba('entrar'); }; $('ma-aba-primeiro').onclick = function () { aba('primeiro'); };
    var q = new URLSearchParams(location.search); if (q.get('codigo') || q.get('os')) { aba('primeiro'); $('ma-c-prova').value = q.get('codigo') || q.get('os'); } else aba('entrar');
    if (!API || !window.fetch) { erro('ma-erro-entrar', 'Seu navegador não conseguiu abrir a Minha Área. Tente outro navegador ou fale com a ProFix pelo WhatsApp.'); return; }
    $('ma-f-entrar').onsubmit = function (ev) { ev.preventDefault(); var f = this; erro('ma-erro-entrar', '');
      var lg = $('ma-login-in').value.trim(), s = $('ma-senha').value; if (!lg || !s) return erro('ma-erro-entrar', 'Preencha seu WhatsApp ou e-mail e a senha, por favor.');
      ocupado(f, true); api('maLogin', { login: lg, senha: s }).then(function (r) { ocupado(f, false); if (r && r.ok) entrou(r); else erro('ma-erro-entrar', (r && r.erro) || 'Não conseguimos entrar com esses dados. Confira o WhatsApp/e-mail e a senha e tente de novo.'); })
        .catch(function () { ocupado(f, false); erro('ma-erro-entrar', 'Não conseguimos falar com a ProFix agora. Confira sua internet e tente de novo em instantes.'); }); };
    $('ma-f-primeiro').onsubmit = function (ev) { ev.preventDefault(); var f = this; erro('ma-erro-primeiro', '');
      var pv = $('ma-c-prova').value.trim(), lg = $('ma-c-login').value.trim(), s = $('ma-c-senha').value, s2 = $('ma-c-senha2').value;
      if (!pv || !lg || !s) return erro('ma-erro-primeiro', 'Preencha todos os campos.');
      if (s !== s2) return erro('ma-erro-primeiro', 'As duas senhas não estão iguais. Pode digitar de novo?');
      if (s.length < 8 || !/[a-zA-Z]/.test(s) || !/\d/.test(s)) return erro('ma-erro-primeiro', 'A senha precisa ter de 8 a 128 caracteres, com letras e números.');
      var a = { login: lg, senha: s }; if (/^[A-Za-z2-9]{4}-?[A-Za-z2-9]{4}$/.test(pv)) a.codigo = pv; else a.link = pv;
      ocupado(f, true); api('maCriarConta', a).then(function (r) { ocupado(f, false); if (r && r.ok) entrou(r); else erro('ma-erro-primeiro', (r && r.erro) || 'Não foi possível criar o acesso.'); })
        .catch(function () { ocupado(f, false); erro('ma-erro-primeiro', 'Não conseguimos falar com a ProFix agora. Confira sua internet e tente de novo em instantes.'); }); };
    $('ma-sair').onclick = function () { var s = ses(); ses(null); mostrar(false); aba('entrar'); if (s) api('maSair', { sessao: s }).catch(function () {}); };
    $('ma-atualizar').onclick = carregarOS;
    $('ma-f-troca').onsubmit = function (ev) { ev.preventDefault(); var f = this; erro('ma-erro-troca', '');
      var at = $('ma-t-atual').value, nv = $('ma-t-nova').value; if (nv.length < 8 || !/[a-zA-Z]/.test(nv) || !/\d/.test(nv)) return erro('ma-erro-troca', 'A senha nova precisa ter de 8 a 128 caracteres, com letras e números.');
      ocupado(f, true); api('maTrocarSenha', { sessao: ses(), atual: at, nova: nv }).then(function (r) { ocupado(f, false); if (r && r.ok) { if (r.sessao) ses(r.sessao); f.reset(); erro('ma-erro-troca', ''); $('ma-troca-ok').hidden = false; } else erro('ma-erro-troca', (r && r.erro) || 'Não foi possível trocar.'); })
        .catch(function () { ocupado(f, false); erro('ma-erro-troca', 'Sem conexão agora. Tente de novo em instantes.'); }); };
    if (ses()) { mostrar(true); carregarOS(); } else mostrar(false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
