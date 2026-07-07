#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

VERSION="$(node -p "require('${PROJECT_ROOT}/package.json').version" 2>/dev/null || echo '1.0.0')"
STAMP="$(date +%Y%m%d)"
OUT_DIR="${DEPLOY_DIR}/dist"
ARCHIVE="projeto-sge-${VERSION}-${STAMP}.tar.gz"

mkdir -p "${OUT_DIR}"

log "Gerando pacote de distribuição: ${ARCHIVE}"

tar -czf "${OUT_DIR}/${ARCHIVE}" \
  --exclude='node_modules' \
  --exclude='**/node_modules' \
  --exclude='**/dist' \
  --exclude='**/.vite' \
  --exclude='**/.env' \
  --exclude='**/.env.local' \
  --exclude='.git' \
  --exclude='docs' \
  --exclude='genexus' \
  --exclude='sge-bff' \
  --exclude='sge-web' \
  --exclude='packages' \
  --exclude='deploy/dist' \
  --exclude='deploy/backups' \
  --exclude='crawl/screenshots' \
  --exclude='**/*.log' \
  --exclude='**/__tests__' \
  --exclude='**/*.test.js' \
  --exclude='**/*.spec.js' \
  -C "${PROJECT_ROOT}" \
  deploy \
  sge-pm-api \
  sge-pm-web \
  crawl/crawl-report.json \
  crawl/dependencias-trees \
  package.json \
  package-lock.json \
  README.md

log "Pacote criado: ${OUT_DIR}/${ARCHIVE}"
log "Tamanho: $(du -h "${OUT_DIR}/${ARCHIVE}" | cut -f1)"
