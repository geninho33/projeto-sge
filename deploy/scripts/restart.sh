#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

check_prerequisites
ensure_env

log "Reiniciando containers..."
compose restart

wait_healthy db 90
wait_healthy api 90
wait_healthy web 60

log "Reinício concluído."
