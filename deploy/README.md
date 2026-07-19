# Deploy — 16Flow / projeto-sge

Infraestrutura Docker para implantação em produção do módulo PM (`sge-pm-api` + `sge-pm-web`).

## Pré-requisitos

- Docker 24+
- Docker Compose v2
- Bash (Linux, macOS, Git Bash ou WSL no Windows)
- Nginx no host (recomendado) para publicar o caminho `/16flow`

## Início rápido

```bash
cd deploy
cp .env.example .env
# Edite .env (JWT_SECRET, senhas MySQL)
chmod +x deploy.sh scripts/*.sh
./deploy.sh
```

A aplicação fica em **`http://SEU-SERVIDOR/16flow/`** (não usa as portas 80/8080 do host).

O container `web` escuta só em `127.0.0.1:9080`. Configure o nginx do host:

```bash
# Instala o include /16flow DENTRO do server :80 do host (não use conf.d sozinho)
sudo bash scripts/install-host-proxy.sh
# Diagnóstico:
./deploy.sh diagnose
```

Acesso no navegador: **`http://IP-DO-SERVIDOR/16flow/`**  
(Não use `http://IP:9080` de outra máquina — a porta 9080 escuta só em `127.0.0.1`.)

### Importar backlog (Kanban de Progressão)

O seed inicial **não** popula o backlog. Sem este passo, o Kanban de Progressão fica vazio:

```bash
./deploy.sh import-backlog
# reimportar do zero (apaga itens atuais):
./deploy.sh import-backlog --force
```

Credenciais usadas no login da API (sobrescreva no `.env` se necessário):

- `ADMIN_EMAIL` (padrão: `gestor@sge.local`)
- `ADMIN_PASSWORD` (padrão: `Sge@2026`)

Depois recarregue **`/16flow/kanban`** — devem aparecer ~115 cards.

## HTTPS

O TLS é feito no **nginx do host** (o container `web` continua em `127.0.0.1:9080`). Use o script `scripts/enable-https.sh`, que gera `/etc/nginx/conf.d/16flow-https.conf` sem mexer nos outros sites.

**Domínio público (certificado gratuito Let's Encrypt):**

```bash
# o domínio precisa apontar (DNS A) para o IP do servidor e a porta 80 estar acessível
sudo apt-get install -y certbot
sudo bash scripts/enable-https.sh --domain 16flow.seudominio.com --email voce@dominio.com
# acesso: https://16flow.seudominio.com/16flow/  (com redirect automático de HTTP)
```

**IP / rede interna (certificado self-signed):**

```bash
sudo bash scripts/enable-https.sh --self-signed            # detecta o IP do host
# ou informando o IP:
sudo bash scripts/enable-https.sh --self-signed --host 191.x.x.x
# acesso: https://IP-DO-SERVIDOR/16flow/  (navegador exibirá aviso — normal para self-signed)
```

Notas:
- O frontend usa caminhos relativos ao `/16flow/`, então não há conteúdo misto: as chamadas de API passam pelo mesmo HTTPS.
- No modo self-signed o script **não** cria um `server :80`, para não interferir em outros apps do host (o `/16flow` em HTTP continua ativo via `install-host-proxy.sh`).
- Renovação Let's Encrypt: o `certbot` instala o timer automático; após renovar, rode `systemctl reload nginx`.

## Isolamento de outras stacks

O Compose usa o projeto fixo **`projeto-sge`** (não o nome da pasta `deploy`), rede `projeto-sge_net` e containers `projeto-sge-*`.

- `./deploy.sh start|update` **não** usa `--remove-orphans` (não derruba `sga`, MySQL, Portainer, etc.).
- `./deploy.sh stop|clean` afeta **somente** os containers do `projeto-sge`.

Se ainda existirem containers antigos `deploy-api-1` / `deploy-web-1`, remova só eles após subir o novo stack:

```bash
docker rm -f deploy-api-1 deploy-web-1 deploy-db-1 2>/dev/null || true
```

Para reaproveitar dados SQLite do volume antigo `deploy_api_data`:

```bash
docker run --rm -v deploy_api_data:/from -v projeto-sge_api_data:/to alpine \
  sh -c 'cp -a /from/. /to/'
```

## Serviços

| Serviço | Descrição |
|---------|-----------|
| `web`   | Nginx — frontend React em `/16flow` e proxy `/16flow/api`, `/16flow/avatars`, `/16flow/crawl` |
| `api`   | API Node.js (16flow-api) |
| `db`    | MariaDB 11 — persistência relacional (pronto para `DB_DRIVER=mysql`) |

Por padrão a API utiliza **SQLite** em volume persistente (`api_data`), pois o schema completo do sistema está implementado para SQLite. O MariaDB é provisionado e validado pelo healthcheck; para usar MySQL, defina `DB_DRIVER=mysql` no `.env` (requer migrations SQL atualizadas).

## Scripts

| Script | Função |
|--------|--------|
| `./deploy.sh` | Build + start |
| `./deploy.sh build` | Apenas build |
| `./deploy.sh stop` | Parar containers |
| `./deploy.sh restart` | Reiniciar |
| `./deploy.sh update` | Rebuild + restart |
| `./deploy.sh backup` | Backup dos volumes |
| `./deploy.sh restore <pasta>` | Restaurar backup |
| `./deploy.sh clean [--images]` | Limpar containers/imagens |
| `./deploy.sh package` | Gerar pacote `.tar.gz` |
| `./deploy.sh diagnose` | Diagnóstico (rede, logs, HTTP, backlog) |
| `./deploy.sh import-backlog` | Importar crawl no Kanban (`--force` para reimportar) |

## Volumes persistentes

- `mariadb_data` — dados MariaDB
- `api_data` — banco SQLite e dados da API
- `api_avatars` — uploads de avatar

## Variáveis principais (.env)

- `JWT_SECRET` — obrigatório em produção
- `VITE_BASE_PATH` — caminho público (padrão: `/16flow`)
- `WEB_BIND` — bind do host (padrão: `127.0.0.1`)
- `WEB_PORT` — porta loopback (padrão: `9080`, evita conflito com 80/8080)
- `DB_DRIVER` — `sqlite` (padrão) ou `mysql`
- `MYSQL_*` — credenciais do container `db`

## Pacote de distribuição

```bash
./deploy.sh package
```

Gera `deploy/dist/projeto-sge-<versão>-<data>.tar.gz` apenas com arquivos necessários para execução.
