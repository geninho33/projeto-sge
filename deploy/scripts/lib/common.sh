#!/usr/bin/env bash
# Biblioteca compartilhada dos scripts de deploy

set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROJECT_ROOT="$(cd "${DEPLOY_DIR}/.." && pwd)"
COMPOSE_FILE="${DEPLOY_DIR}/docker-compose.yml"
ENV_FILE="${DEPLOY_DIR}/.env"
BACKUP_DIR="${DEPLOY_DIR}/backups"

log()  { printf '\033[0;32m[deploy]\033[0m %s\n' "$*"; }
warn() { printf '\033[0;33m[deploy]\033[0m %s\n' "$*" >&2; }
err()  { printf '\033[0;31m[deploy]\033[0m %s\n' "$*" >&2; }

die() {
  err "$@"
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Comando obrigatório não encontrado: $1"
}

check_prerequisites() {
  require_cmd docker
  docker compose version >/dev/null 2>&1 || die "Docker Compose v2 é obrigatório (docker compose)."
  docker info >/dev/null 2>&1 || die "Docker daemon não está em execução."
}

ensure_env() {
  if [[ ! -f "${ENV_FILE}" ]]; then
    if [[ -f "${DEPLOY_DIR}/.env.example" ]]; then
      warn "Arquivo .env não encontrado. Copiando de .env.example..."
      cp "${DEPLOY_DIR}/.env.example" "${ENV_FILE}"
      warn "Revise ${ENV_FILE} antes de usar em produção."
    else
      die "Arquivo .env ausente. Crie a partir de deploy/.env.example"
    fi
  fi
}

compose() {
  # -p projeto-sge garante isolamento mesmo se o diretório se chamar "deploy"
  docker compose -p projeto-sge -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" "$@"
}

wait_healthy() {
  local service="$1"
  local max="${2:-60}"
  local i=0
  log "Aguardando serviço '${service}' ficar saudável..."
  while (( i < max )); do
    local status
    status="$(compose ps --format json "${service}" 2>/dev/null | head -1 || true)"
    if echo "${status}" | grep -q '"Health":"healthy"'; then
      log "Serviço '${service}' saudável."
      return 0
    fi
    if compose ps "${service}" 2>/dev/null | grep -q "(healthy)"; then
      log "Serviço '${service}' saudável."
      return 0
    fi
    sleep 2
    ((i++))
  done
  die "Timeout aguardando saúde do serviço: ${service}"
}
