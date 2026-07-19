#!/usr/bin/env bash
# Instala o proxy /16flow no nginx do HOST (dentro do server :80 existente)
set -euo pipefail

SNIPPET_SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/nginx/host-proxy-16flow.conf"
INCLUDE_LINE="include ${SNIPPET_SRC};"
MARKER="# projeto-sge-16flow-proxy"

if [[ ! -f "${SNIPPET_SRC}" ]]; then
  echo "Arquivo não encontrado: ${SNIPPET_SRC}" >&2
  exit 1
fi

if [[ "${EUID}" -ne 0 ]]; then
  echo "Execute com sudo: sudo bash $0" >&2
  exit 1
fi

# Preferência: sites-enabled/default ou primeiro server na 80
TARGET=""
for f in /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/* /etc/nginx/conf.d/default.conf; do
  if [[ -f "$f" ]] && grep -qE 'listen\s+80\b' "$f" 2>/dev/null; then
    TARGET="$f"
    break
  fi
done

if [[ -z "${TARGET}" ]]; then
  echo "Não achei um server listening 80. Inclua manualmente no seu server {}:"
  echo "  ${INCLUDE_LINE}"
  exit 1
fi

if grep -q 'projeto-sge-16flow-proxy\|host-proxy-16flow' "${TARGET}"; then
  echo "Proxy /16flow já referenciado em ${TARGET}"
else
  # Insere o include antes do último }
  cp -a "${TARGET}" "${TARGET}.bak.$(date +%Y%m%d%H%M%S)"
  # shellcheck disable=SC2016
  awk -v line="    ${MARKER}\n    ${INCLUDE_LINE}" '
    BEGIN { done=0 }
    /^}/ && !done { print line; done=1 }
    { print }
  ' "${TARGET}" > "${TARGET}.tmp"
  mv "${TARGET}.tmp" "${TARGET}"
  echo "Include adicionado em ${TARGET}"
fi

nginx -t
systemctl reload nginx
echo "OK — teste: curl -I http://127.0.0.1/16flow/"
