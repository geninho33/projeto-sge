#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

check_prerequisites
ensure_env

log "Iniciando containers do projeto-sge (não afeta outras stacks)..."
# Sem --remove-orphans: evita derrubar containers de outros projetos (ex.: sga, mysql-*)
compose up -d

wait_healthy db 90
wait_healthy api 90
wait_healthy web 60

WEB_PORT="$(grep -E '^WEB_PORT=' "${ENV_FILE}" | cut -d= -f2- || echo 9080)"
WEB_BIND="$(grep -E '^WEB_BIND=' "${ENV_FILE}" | cut -d= -f2- || echo 127.0.0.1)"
log "Aplicação (caminho): http://localhost/16flow/  (via nginx do host)"
log "Container web (loopback): http://${WEB_BIND:-127.0.0.1}:${WEB_PORT:-9080}/16flow/"
log "Health: http://${WEB_BIND:-127.0.0.1}:${WEB_PORT:-9080}/16flow/health"
log "Kanban vazio? Importe o backlog: ./deploy.sh import-backlog"
