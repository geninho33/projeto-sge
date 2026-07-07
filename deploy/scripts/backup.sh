#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

check_prerequisites
ensure_env

mkdir -p "${BACKUP_DIR}"
STAMP="$(date +%Y%m%d_%H%M%S)"
TARGET="${BACKUP_DIR}/backup_${STAMP}"
mkdir -p "${TARGET}"

log "Gerando backup em ${TARGET}..."

cp "${ENV_FILE}" "${TARGET}/.env" 2>/dev/null || true

backup_volume() {
  local vol="$1"
  local file="$2"
  if docker volume inspect "${vol}" >/dev/null 2>&1; then
    log "  Volume: ${vol}"
    docker run --rm \
      -v "${vol}:/data:ro" \
      -v "${TARGET}:/backup" \
      alpine:3.20 \
      sh -c "cd /data && tar czf /backup/${file} ."
  else
    warn "  Volume ${vol} não encontrado, ignorando."
  fi
}

COMPOSE_PROJECT="${COMPOSE_PROJECT_NAME:-$(basename "${DEPLOY_DIR}")}"

for suffix in mariadb_data api_data api_avatars; do
  vol="${COMPOSE_PROJECT}_${suffix}"
  backup_volume "${vol}" "${suffix}.tar.gz"
done

log "Backup concluído: ${TARGET}"
