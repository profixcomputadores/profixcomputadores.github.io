#!/bin/bash
# Publica o site da ProFix no GitHub Pages (conta Profix123ok, dona da organização profixcomputadores). NÃO mexe no repositório profix-app.
# Pré-requisito (uma vez): gh auth login  (entrar com a conta profix123ok)
# Uso: ./publicar.sh   -> cria (se não existir) profixcomputadores/profixcomputadores.github.io, envia e liga o Pages
set -euo pipefail
cd "$(dirname "$0")"; DONO=profixcomputadores; REPO=profixcomputadores.github.io; CONTA=Profix123ok
[ "$REPO" = "profix-app" ] && { echo "Nunca usar profix-app"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "Faça login: gh auth login"; exit 1; }
[ "$(gh api user -q .login | tr A-Z a-z)" = "$(echo $CONTA | tr A-Z a-z)" ] || { echo "Logado com outra conta; entre com $CONTA"; exit 1; }
python3 /workspace/profix/site-netlify/testes/build_site_pro.py >/dev/null
find . -mindepth 1 -maxdepth 1 ! -name .git ! -name README.md ! -name publicar.sh -exec rm -rf {} +
cp -a /workspace/profix/site-netlify/site-pro/. ./ && rm -f _headers
git add -A; git commit -qm "site: atualização $(date +%F' '%H:%M)" || true
gh repo view $DONO/$REPO >/dev/null 2>&1 || gh repo create $DONO/$REPO --public --description "Site da ProFix Computadores (Sorocaba)" --homepage "https://$DONO.github.io/"
git remote get-url origin >/dev/null 2>&1 || git remote add origin https://github.com/$DONO/$REPO.git
gh auth setup-git; git push -u origin main
gh api -X POST repos/$DONO/$REPO/pages -f 'source[branch]=main' -f 'source[path]=/' >/dev/null 2>&1 || gh api -X PUT repos/$DONO/$REPO/pages -f 'source[branch]=main' -f 'source[path]=/' >/dev/null
echo "Aguardando o Pages publicar…"; for i in $(seq 1 40); do c=$(curl -s -o /dev/null -w '%{http_code}' https://$DONO.github.io/); [ "$c" = 200 ] && { echo "NO AR: https://$DONO.github.io/"; exit 0; }; sleep 15; done
echo "Ainda não respondeu 200; confira https://github.com/$DONO/$REPO/settings/pages"
