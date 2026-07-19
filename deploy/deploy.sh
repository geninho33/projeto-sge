#!/usr/bin/env bash
# Deploy completo do 16Flow (projeto-sge)
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS="${DEPLOY_DIR}/scripts"

err() { printf '\033[0;31m[deploy]\033[0m %s\n' "$*" >&2; }

usage() {
  cat <<EOF
Uso: ./deploy.sh [comando]

Comandos:
  deploy    Build + start (padrão)
  build     Constrói as imagens
  start     Inicia os containers
  stop      Para os containers
  restart   Reinicia os containers
  update    Rebuild e reinicia
  backup    Backup dos volumes
  restore   Restaura backup (./deploy.sh restore <pasta>)
  clean     Remove containers (--images para remover imagens)
  package   Gera pacote .tar.gz de distribuição
  diagnose  Diagnóstico completo (rede, logs, HTTP, nginx host)
  help      Exibe esta ajuda
EOF
}

cmd="${1:-deploy}"

case "${cmd}" in
  deploy)
    bash "${SCRIPTS}/build.sh"
    bash "${SCRIPTS}/start.sh"
    ;;
  build)   bash "${SCRIPTS}/build.sh" ;;
  start)   bash "${SCRIPTS}/start.sh" ;;
  stop)    bash "${SCRIPTS}/stop.sh" ;;
  restart) bash "${SCRIPTS}/restart.sh" ;;
  update)  bash "${SCRIPTS}/update.sh" ;;
  backup)  bash "${SCRIPTS}/backup.sh" ;;
  restore)
    [[ -n "${2:-}" ]] || { err "Informe o diretório do backup."; exit 1; }
    bash "${SCRIPTS}/restore.sh" "$2"
    ;;
  clean)   bash "${SCRIPTS}/clean.sh" "${2:-}" ;;
  package) bash "${SCRIPTS}/package.sh" ;;
  diagnose) bash "${SCRIPTS}/diagnose.sh" ;;
  help|-h|--help) usage ;;
  *)
    err "Comando desconhecido: ${cmd}"
    usage
    exit 1
    ;;
esac
