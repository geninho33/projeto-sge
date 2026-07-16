#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

check_prerequisites
ensure_env

PRUNE_IMAGES="${1:-}"

log "Parando e removendo apenas containers do projeto-sge..."
# down sem -v: preserva volumes; orphans só deste projeto Compose
compose down

if [[ "${PRUNE_IMAGES}" == "--images" ]]; then
  log "Removendo imagens do projeto-sge..."
  docker rmi projeto-sge-api:latest projeto-sge-web:latest 2>/dev/null || true
  docker image prune -f
fi

log "Limpeza do projeto-sge concluída (outras stacks intactas)."
