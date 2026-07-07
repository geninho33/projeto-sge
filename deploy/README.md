# Deploy — 16Flow / projeto-sge

Infraestrutura Docker para implantação em produção do módulo PM (`sge-pm-api` + `sge-pm-web`).

## Pré-requisitos

- Docker 24+
- Docker Compose v2
- Bash (Linux, macOS, Git Bash ou WSL no Windows)

## Início rápido

```bash
cd deploy
cp .env.example .env
# Edite .env (JWT_SECRET, senhas MySQL)
chmod +x deploy.sh scripts/*.sh
./deploy.sh
```

A aplicação ficará disponível em `http://localhost` (porta configurável via `WEB_PORT`).

## Serviços

| Serviço | Descrição |
|---------|-----------|
| `web`   | Nginx — frontend React e proxy `/api`, `/avatars`, `/crawl` |
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

## Volumes persistentes

- `mariadb_data` — dados MariaDB
- `api_data` — banco SQLite e dados da API
- `api_avatars` — uploads de avatar

## Variáveis principais (.env)

- `JWT_SECRET` — obrigatório em produção
- `WEB_PORT` — porta HTTP exposta (padrão: 80)
- `DB_DRIVER` — `sqlite` (padrão) ou `mysql`
- `MYSQL_*` — credenciais do container `db`

## Pacote de distribuição

```bash
./deploy.sh package
```

Gera `deploy/dist/projeto-sge-<versão>-<data>.tar.gz` apenas com arquivos necessários para execução.
