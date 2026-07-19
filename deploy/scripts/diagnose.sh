#!/usr/bin/env bash
# Diagnóstico completo do stack projeto-sge no servidor
set -uo pipefail
# sem set -e: o diagnóstico deve rodar até o fim mesmo com falhas parciais

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

ok()   { printf '\033[0;32m[OK]\033[0m %s\n' "$*"; }
fail() { printf '\033[0;31m[FAIL]\033[0m %s\n' "$*"; }
info() { printf '\033[0;34m[INFO]\033[0m %s\n' "$*"; }
section() { printf '\n========== %s ==========\n' "$*"; }

ERRORS=0
mark_fail() { fail "$*"; ERRORS=$((ERRORS + 1)); }

check_prerequisites
ensure_env

section "1. Containers projeto-sge"
docker ps -a --filter "name=projeto-sge" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
for c in projeto-sge-web projeto-sge-api projeto-sge-db; do
  if docker ps --format '{{.Names}}' | grep -qx "$c"; then
    ok "Container $c em execução"
  else
    mark_fail "Container $c NÃO está em execução"
  fi
done

section "2. Logs recentes (erros)"
for c in projeto-sge-web projeto-sge-api projeto-sge-db; do
  info "--- $c (últimas 40 linhas / grep error) ---"
  docker logs --tail 40 "$c" 2>&1 | tail -40 || true
  if docker logs --tail 200 "$c" 2>&1 | grep -iE 'error|exception|fatal|econnrefused|enotfound' | tail -10; then
    mark_fail "Encontradas mensagens de erro nos logs de $c (veja acima)"
  else
    ok "Sem erros óbvios recentes em $c"
  fi
done

section "3. Rede Docker"
docker network inspect projeto-sge_net --format '{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null || mark_fail "Rede projeto-sge_net ausente"
for c in projeto-sge-web projeto-sge-api projeto-sge-db; do
  nets="$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' "$c" 2>/dev/null || echo "")"
  if echo "$nets" | grep -q 'projeto-sge_net'; then
    ok "$c na rede projeto-sge_net"
  else
    mark_fail "$c fora da rede projeto-sge_net (nets: $nets)"
  fi
done

section "4. Comunicação interna web → api → db"
if docker exec projeto-sge-web wget -qO- http://api:3010/health 2>/dev/null; then
  echo
  ok "web → api:3010/health OK"
else
  mark_fail "web NÃO alcança api:3010/health"
fi

if docker exec projeto-sge-api wget -qO- http://127.0.0.1:3010/health 2>/dev/null; then
  echo
  ok "api health local OK"
else
  mark_fail "api health local FALHOU"
fi

# ping pode não existir; usa getent/wget
if docker exec projeto-sge-api getent hosts db >/dev/null 2>&1 || docker exec projeto-sge-api nslookup db >/dev/null 2>&1; then
  ok "api resolve hostname 'db'"
else
  info "nslookup/getent indisponível; tentando conexão TCP 3306"
fi

section "5. Variáveis de ambiente da API"
docker exec projeto-sge-api sh -c 'echo DB_DRIVER=$DB_DRIVER; echo MYSQL_HOST=$MYSQL_HOST; echo MYSQL_PORT=$MYSQL_PORT; echo MYSQL_DATABASE=$MYSQL_DATABASE; echo MYSQL_USER=$MYSQL_USER; echo SQLITE_PATH=$SQLITE_PATH; echo JWT_SECRET_LEN=${#JWT_SECRET}'
DB_DRIVER_VAL="$(docker exec projeto-sge-api sh -c 'echo -n $DB_DRIVER')"
info "Driver ativo: ${DB_DRIVER_VAL:-sqlite(default)}"
if [[ "${DB_DRIVER_VAL:-sqlite}" == "sqlite" ]]; then
  info "MariaDB (projeto-sge-db) está UP mas a API usa SQLite no volume api_data — isso é o padrão do projeto."
fi

section "6. Banco / schema"
if [[ "${DB_DRIVER_VAL:-sqlite}" == "sqlite" ]]; then
  if docker exec projeto-sge-api sh -c 'test -f /repo/sge-pm-api/data/sge_pm.sqlite'; then
    ok "Arquivo SQLite existe"
    docker exec projeto-sge-api sh -c 'ls -la /repo/sge-pm-api/data/sge_pm.sqlite'
    TABLES="$(docker exec projeto-sge-api sh -c "node -e \"const Database=require('better-sqlite3'); const d=new Database('/repo/sge-pm-api/data/sge_pm.sqlite'); console.log(d.prepare(\\\"SELECT COUNT(*) AS c FROM sqlite_master WHERE type='table'\\\").get().c);\"" 2>/dev/null || echo "ERR")"
    if [[ "$TABLES" =~ ^[0-9]+$ ]] && (( TABLES > 5 )); then
      ok "SQLite com $TABLES tabelas"
    else
      mark_fail "Não foi possível listar tabelas SQLite (resultado: $TABLES)"
    fi
    BACKLOG="$(docker exec projeto-sge-api sh -c "node -e \"const Database=require('better-sqlite3'); const d=new Database('/repo/sge-pm-api/data/sge_pm.sqlite'); try { console.log(d.prepare('SELECT COUNT(*) AS c FROM sge_pm_backlog_item').get().c); } catch(e){ console.log('ERR'); }\"" 2>/dev/null || echo "ERR")"
    info "Itens de backlog: $BACKLOG"
    if [[ "$BACKLOG" == "0" ]]; then
      mark_fail "Backlog vazio — execute: ./deploy.sh import-backlog"
    fi
  else
    mark_fail "SQLite ausente em /repo/sge-pm-api/data/sge_pm.sqlite"
  fi
else
  info "DB_DRIVER=mysql — validar conexão MariaDB"
  docker exec projeto-sge-db mariadb -u"${MYSQL_USER:-sge_pm}" -p"${MYSQL_PASSWORD:-}" -e "SHOW TABLES;" "${MYSQL_DATABASE:-sge_pm}" 2>&1 | head -30 || mark_fail "Falha ao listar tabelas no MariaDB"
fi

section "7. Endpoints HTTP (loopback do host)"
WEB_PORT="$(grep -E '^WEB_PORT=' "${ENV_FILE}" 2>/dev/null | cut -d= -f2- || echo 9080)"
WEB_BIND="$(grep -E '^WEB_BIND=' "${ENV_FILE}" 2>/dev/null | cut -d= -f2- || echo 127.0.0.1)"
info "Testando http://${WEB_BIND}:${WEB_PORT}/16flow/"

code_health="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${WEB_PORT}/16flow/health" || echo 000)"
code_app="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${WEB_PORT}/16flow/" || echo 000)"
code_api="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${WEB_PORT}/16flow/api/auth/login" -X POST -H 'Content-Type: application/json' -d '{}' || echo 000)"

[[ "$code_health" == "200" ]] && ok "GET /16flow/health → $code_health" || mark_fail "GET /16flow/health → $code_health (esperado 200)"
[[ "$code_app" =~ ^(200|301|302)$ ]] && ok "GET /16flow/ → $code_app" || mark_fail "GET /16flow/ → $code_app"
[[ "$code_api" =~ ^(400|401|422)$ ]] && ok "POST /16flow/api/auth/login responde ($code_api) — proxy API OK" || mark_fail "POST /16flow/api/auth/login → $code_api"

section "8. Nginx do HOST (porta 80 → /16flow)"
if command -v nginx >/dev/null 2>&1 || [[ -d /etc/nginx ]]; then
  if grep -Rsl '16flow' /etc/nginx 2>/dev/null | head -5; then
    ok "Referência a 16flow encontrada em /etc/nginx"
  else
    mark_fail "Nenhuma config /16flow em /etc/nginx — acesso externo via :80 NÃO funcionará"
  fi
  code_host="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1/16flow/" || echo 000)"
  if [[ "$code_host" =~ ^(200|301|302)$ ]]; then
    ok "GET http://127.0.0.1/16flow/ → $code_host"
  else
    mark_fail "GET http://127.0.0.1/16flow/ → $code_host (proxy do host ausente ou inválido)"
  fi
else
  mark_fail "Nginx do host não encontrado — configure o proxy ou exponha WEB_BIND=0.0.0.0"
fi

section "9. Portas e conflitos"
ss -tlnp 2>/dev/null | grep -E ':80 |:8080 |:9080 |:13080 ' || netstat -tlnp 2>/dev/null | grep -E ':80 |:8080 |:9080 ' || true
info "projeto-sge-web está em 127.0.0.1:9080 — NÃO é acessível de outro PC em http://IP:9080 (só localhost)"
info "Acesso externo correto: http://IP-DO-SERVIDOR/16flow/ (via nginx do host na porta 80)"

section "10. Recursos do servidor"
df -h / | tail -1
free -h 2>/dev/null | head -2 || true
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" projeto-sge-web projeto-sge-api projeto-sge-db 2>/dev/null || true

section "RESUMO"
if (( ERRORS == 0 )); then
  ok "Nenhuma falha crítica detectada pelo diagnóstico."
else
  fail "$ERRORS falha(s) encontrada(s). Veja os [FAIL] acima."
fi

echo
info "URL esperada no navegador: http://$(hostname -I 2>/dev/null | awk '{print $1}')/16flow/"
exit "$ERRORS"
