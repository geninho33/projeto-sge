#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

check_prerequisites
ensure_env

BACKUP_PATH="${1:-}"
[[ -n "${BACKUP_PATH}" ]] || die "Uso: $0 <diretório_do_backup>"

[[ -d "${BACKUP_PATH}" ]] || die "Diretório de backup não encontrado: ${BACKUP_PATH}"

log "Parando containers antes do restore..."
compose down

restore_volume() {
  local vol="$1"
  local archive="$2"
  [[ -f "${archive}" ]] || { warn "Arquivo ausente: ${archive}"; return 0; }
  log "Restaurando volume ${vol}..."
  docker volume create "${vol}" >/dev/null
  docker run --rm \
    -v "${vol}:/data" \
    -v "${BACKUP_PATH}:/backup:ro" \
    alpine:3.20 \
    sh -c "rm -rf /data/* /data/.[!.]* 2>/dev/null; tar xzf /backup/$(basename "${archive}") -C /data"
}

COMPOSE_PROJECT="${COMPOSE_PROJECT_NAME:-$(basename "${DEPLOY_DIR}")}"

restore_volume "${COMPOSE_PROJECT}_mariadb_data" "${BACKUP_PATH}/mariadb_data.tar.gz"
restore_volume "${COMPOSE_PROJECT}_api_data" "${BACKUP_PATH}/api_data.tar.gz"
restore_volume "${COMPOSE_PROJECT}_api_avatars" "${BACKUP_PATH}/api_avatars.tar.gz"

if [[ -f "${BACKUP_PATH}/.env" ]]; then
  cp "${BACKUP_PATH}/.env" "${ENV_FILE}"
  log "Arquivo .env restaurado."
fi

log "Iniciando containers após restore..."
"${SCRIPT_DIR}/start.sh"

log "Restore concluído."
