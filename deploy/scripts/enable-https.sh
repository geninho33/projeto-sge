#!/usr/bin/env bash
# Habilita HTTPS para o 16Flow no nginx do HOST.
#
# Dois modos:
#   1) Domínio público (certificado gratuito Let's Encrypt):
#        sudo bash deploy/scripts/enable-https.sh --domain 16flow.seudominio.com [--email voce@dominio.com]
#
#   2) IP / rede interna (certificado self-signed — navegador mostrará aviso):
#        sudo bash deploy/scripts/enable-https.sh --self-signed [--host 191.x.x.x]
#
# Resultado: cria /etc/nginx/conf.d/16flow-https.conf com redirect 80->443
# e proxy https://.../16flow/ -> 127.0.0.1:9080. Não mexe nos outros sites.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TEMPLATE="${DEPLOY_DIR}/nginx/host-16flow-https.conf.template"
OUT_CONF="/etc/nginx/conf.d/16flow-https.conf"
SSL_DIR="/etc/nginx/ssl"

MODE=""
DOMAIN=""
EMAIL=""
HOSTNAME_VALUE=""

usage() {
  grep -E '^#( |$)' "$0" | sed 's/^# \{0,1\}//'
  exit "${1:-0}"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain) MODE="domain"; DOMAIN="${2:-}"; shift 2 ;;
    --email) EMAIL="${2:-}"; shift 2 ;;
    --self-signed) MODE="self"; shift ;;
    --host) HOSTNAME_VALUE="${2:-}"; shift 2 ;;
    -h|--help) usage 0 ;;
    *) echo "Opção desconhecida: $1" >&2; usage 1 ;;
  esac
done

if [[ "${EUID}" -ne 0 ]]; then
  echo "Execute com sudo: sudo bash $0 ..." >&2
  exit 1
fi

if [[ ! -f "${TEMPLATE}" ]]; then
  echo "Template não encontrado: ${TEMPLATE}" >&2
  exit 1
fi

if ! command -v nginx >/dev/null 2>&1; then
  echo "nginx não encontrado no host. Instale o nginx antes de continuar." >&2
  exit 1
fi

# render <server_name> <cert> <key> <with_http_redirect: yes|no>
render() {
  local server_name="$1" cert="$2" key="$3" with_redirect="${4:-yes}"
  local src="${TEMPLATE}"
  if [[ "${with_redirect}" == "no" ]]; then
    # Remove o bloco BEGIN_HTTP_REDIRECT..END_HTTP_REDIRECT para não
    # criar um server :80 que possa capturar tráfego de outros apps.
    src="$(mktemp)"
    awk '/# >>> BEGIN_HTTP_REDIRECT/{skip=1} !skip{print} /# <<< END_HTTP_REDIRECT/{skip=0}' \
      "${TEMPLATE}" > "${src}"
  fi
  sed -e "s#__SERVER_NAME__#${server_name}#g" \
      -e "s#__SSL_CERT__#${cert}#g" \
      -e "s#__SSL_KEY__#${key}#g" \
      "${src}" > "${OUT_CONF}"
  [[ "${with_redirect}" == "no" ]] && rm -f "${src}"
  echo "Config gerada: ${OUT_CONF}"
}

# Config temporária só com o :80 (ACME + redirect), usada antes de existir
# o certificado para permitir a emissão via webroot sem quebrar o nginx -t.
render_http_only() {
  local server_name="$1"
  awk '/# >>> BEGIN_HTTP_REDIRECT/{keep=1} keep{print} /# <<< END_HTTP_REDIRECT/{keep=0}' \
    "${TEMPLATE}" | sed -e "s#__SERVER_NAME__#${server_name}#g" > "${OUT_CONF}"
  echo "Config HTTP temporária gerada: ${OUT_CONF}"
}

reload_nginx() {
  nginx -t
  systemctl reload nginx 2>/dev/null || service nginx reload
  echo "nginx recarregado."
}

case "${MODE}" in
  self)
    HOSTNAME_VALUE="${HOSTNAME_VALUE:-$(hostname -I 2>/dev/null | awk '{print $1}')}"
    HOSTNAME_VALUE="${HOSTNAME_VALUE:-_}"
    mkdir -p "${SSL_DIR}"
    CERT="${SSL_DIR}/16flow-selfsigned.crt"
    KEY="${SSL_DIR}/16flow-selfsigned.key"
    if [[ ! -f "${CERT}" || ! -f "${KEY}" ]]; then
      echo "Gerando certificado self-signed para ${HOSTNAME_VALUE}..."
      openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
        -keyout "${KEY}" -out "${CERT}" \
        -subj "/CN=${HOSTNAME_VALUE}" \
        -addext "subjectAltName=IP:${HOSTNAME_VALUE}" 2>/dev/null \
        || openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
             -keyout "${KEY}" -out "${CERT}" -subj "/CN=${HOSTNAME_VALUE}"
    else
      echo "Certificado self-signed já existe em ${SSL_DIR}, reutilizando."
    fi
    # server_name "_" aceita qualquer host (IP); sem redirect :80 para
    # não interferir em outros apps do host (o /16flow em HTTP continua ativo).
    render "_" "${CERT}" "${KEY}" "no"
    reload_nginx
    echo
    echo "Pronto. Acesse: https://${HOSTNAME_VALUE}/16flow/"
    echo "AVISO: certificado self-signed -> o navegador exibirá alerta de segurança (normal)."
    ;;

  domain)
    if [[ -z "${DOMAIN}" ]]; then
      echo "Informe o domínio: --domain 16flow.seudominio.com" >&2
      exit 1
    fi
    if ! command -v certbot >/dev/null 2>&1; then
      echo "certbot não encontrado. Instale com:  apt-get update && apt-get install -y certbot" >&2
      exit 1
    fi
    mkdir -p /var/www/certbot
    LIVE_DIR="/etc/letsencrypt/live/${DOMAIN}"
    if [[ ! -f "${LIVE_DIR}/fullchain.pem" ]]; then
      echo "Emitindo certificado Let's Encrypt para ${DOMAIN} (webroot)..."
      # 1) sobe apenas o :80 (ACME + redirect) para o certbot validar
      render_http_only "${DOMAIN}"
      reload_nginx
      EMAIL_ARG="--register-unsafely-without-email"
      [[ -n "${EMAIL}" ]] && EMAIL_ARG="--email ${EMAIL}"
      certbot certonly --webroot -w /var/www/certbot \
        -d "${DOMAIN}" --non-interactive --agree-tos ${EMAIL_ARG}
    else
      echo "Certificado Let's Encrypt já existe para ${DOMAIN}, reutilizando."
    fi
    render "${DOMAIN}" "${LIVE_DIR}/fullchain.pem" "${LIVE_DIR}/privkey.pem" "yes"
    reload_nginx
    echo
    echo "Pronto. Acesse: https://${DOMAIN}/16flow/"
    echo "Renovação automática: certbot já instala o timer. Após renovar, rode 'systemctl reload nginx'."
    ;;

  *)
    echo "Escolha um modo: --domain <dominio> OU --self-signed" >&2
    usage 1
    ;;
esac
