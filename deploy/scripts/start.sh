#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

check_prerequisites
ensure_env

log "Iniciando containers..."
compose up -d --remove-orphans

wait_healthy db 90
wait_healthy api 90
wait_healthy web 60

WEB_PORT="$(grep -E '^WEB_PORT=' "${ENV_FILE}" | cut -d= -f2- || echo 8080)"
log "Aplicação disponível em http://localhost:${WEB_PORT:-8080}"
log "Health API: http://localhost:${WEB_PORT:-8080}/health"
