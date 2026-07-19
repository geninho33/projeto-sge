#!/usr/bin/env bash
# Importa o crawl (crawl-report.json) para o Kanban de Progressão via API autenticada.
#
# Uso:
#   ./deploy.sh import-backlog
#   ./deploy.sh import-backlog --force          # apaga e reimporta
#   ADMIN_EMAIL=... ADMIN_PASSWORD=... ./deploy.sh import-backlog
#
# Pré-requisito: containers projeto-sge-api e projeto-sge-web saudáveis.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

check_prerequisites
ensure_env

FORCE=false
for arg in "$@"; do
  case "$arg" in
    --force|-f) FORCE=true ;;
    -h|--help)
      sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
  esac
done

# Carrega defaults do .env se existirem
set -a
# shellcheck disable=SC1090
source "${ENV_FILE}" 2>/dev/null || true
set +a

WEB_PORT="${WEB_PORT:-9080}"
WEB_BIND="${WEB_BIND:-127.0.0.1}"
BASE_PATH="${VITE_BASE_PATH:-/16flow}"
BASE_PATH="${BASE_PATH%/}"
API_BASE="http://${WEB_BIND}:${WEB_PORT}${BASE_PATH}/api"

ADMIN_EMAIL="${ADMIN_EMAIL:-gestor@sge.local}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Sge@2026}"

require_cmd curl

if ! docker ps --format '{{.Names}}' | grep -qx 'projeto-sge-api'; then
  die "Container projeto-sge-api não está rodando. Execute: ./deploy.sh start"
fi

count_backlog() {
  docker exec projeto-sge-api node -e \
    "const D=require('better-sqlite3'); const d=new D('/repo/sge-pm-api/data/sge_pm.sqlite'); try { console.log(d.prepare('SELECT COUNT(*) AS c FROM sge_pm_backlog_item').get().c); } catch(e) { console.log('ERR'); }" \
    2>/dev/null || echo "ERR"
}

BEFORE="$(count_backlog)"
log "Itens de backlog atuais: ${BEFORE}"

if [[ "${BEFORE}" != "0" && "${BEFORE}" != "ERR" && "${FORCE}" != "true" ]]; then
  log "Backlog já populado (${BEFORE} itens). Use --force para reimportar."
  log "Kanban: ${BASE_PATH}/kanban"
  exit 0
fi

if ! docker exec projeto-sge-api sh -c 'test -f /repo/crawl/crawl-report.json'; then
  die "crawl-report.json ausente na imagem API (/repo/crawl/). Rebuild: ./deploy.sh build && ./deploy.sh update"
fi

log "Autenticando como ${ADMIN_EMAIL}..."
LOGIN_JSON="$(curl -sS -X POST "${API_BASE}/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"senha\":\"${ADMIN_PASSWORD}\"}")"

TOKEN="$(printf '%s' "${LOGIN_JSON}" | sed -n 's/.*"token"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
if [[ -z "${TOKEN}" ]]; then
  err "Login falhou. Resposta: ${LOGIN_JSON}"
  die "Verifique ADMIN_EMAIL / ADMIN_PASSWORD (padrão: gestor@sge.local / Sge@2026)."
fi

log "Importando backlog (force=${FORCE})..."
IMPORT_JSON="$(curl -sS -X POST "${API_BASE}/admin/import-backlog" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d "{\"force\":${FORCE}}")"

IMPORTED="$(printf '%s' "${IMPORT_JSON}" | sed -n 's/.*"imported"[[:space:]]*:[[:space:]]*\([0-9]*\).*/\1/p')"
TOTAL="$(printf '%s' "${IMPORT_JSON}" | sed -n 's/.*"total"[[:space:]]*:[[:space:]]*\([0-9]*\).*/\1/p')"

if [[ -z "${IMPORTED}" ]]; then
  err "Importação falhou. Resposta: ${IMPORT_JSON}"
  die "Confira logs: docker logs projeto-sge-api --tail 80"
fi

AFTER="$(count_backlog)"
log "Importados ${IMPORTED} de ${TOTAL:-?} itens. Contagem na tabela: ${AFTER}"
log "Recarregue o Kanban de Progressão: ${BASE_PATH}/kanban"
