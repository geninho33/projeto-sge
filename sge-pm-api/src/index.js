import { config } from "./config.js";
import { initDb } from "./db.js";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import { authMiddleware } from "./middleware/auth.js";
import projetoRouter from "./routes/projeto.js";
import backlogRouter from "./routes/backlog.js";
import sprintRouter from "./routes/sprint.js";
import usuariosRouter from "./routes/usuarios.js";
import skillsRouter from "./routes/skills.js";
import mapeamentoRouter from "./routes/mapeamento.js";
import migracoesRouter from "./routes/migracoes.js";
import adminRouter from "./routes/admin.js";
import kanbanRouter from "./routes/kanban.js";
import demandasRouter from "./routes/demandas.js";
import apontamentosRouter from "./routes/apontamentos.js";
import timerRouter from "./routes/timer.js";
import tramitacoesRouter from "./routes/tramitacoes.js";
import projetosRouter from "./routes/projetos.js";
import perfisRouter from "./routes/perfis.js";
import tiposAtividadeRouter from "./routes/tiposAtividade.js";
import atividadesRouter from "./routes/atividades.js";
import comentariosRouter from "./routes/comentarios.js";
import kanbanUsuarioRouter from "./routes/kanbanUsuario.js";
import consultaTarefasRouter from "./routes/consultaTarefas.js";
import consultaApontamentosRouter from "./routes/consultaApontamentos.js";

import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __apiRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const __projectRoot = existsSync(join(__apiRoot, "crawl"))
  ? __apiRoot
  : join(__apiRoot, "..");
const crawlDir = process.env.CRAWL_ROOT || join(__projectRoot, "crawl");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/avatars", express.static(join(process.cwd(), "public", "avatars")));
app.use("/crawl", express.static(crawlDir));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "16flow-api", db: config.dbDriver, version: "4.0" });
});

app.use("/api/auth", authRouter);

const api = express.Router();
api.use(authMiddleware);
api.use("/projeto", projetoRouter);
api.use("/backlog", backlogRouter);
api.use("/sprint", sprintRouter);
api.use("/usuarios", usuariosRouter);
api.use("/skills", skillsRouter);
api.use("/mapeamento", mapeamentoRouter);
api.use("/admin", adminRouter);
api.use("/kanban", kanbanRouter);
api.use("/demandas", demandasRouter);
api.use("/apontamentos", apontamentosRouter);
api.use("/timer", timerRouter);
api.use("/projetos", projetosRouter);
api.use("/perfis", perfisRouter);
api.use("/tipos-atividade", tiposAtividadeRouter);
api.use("/atividades", atividadesRouter);
api.use("/comentarios", comentariosRouter);
api.use("/tramitacoes", tramitacoesRouter);
api.use("/kanban-usuario", kanbanUsuarioRouter);
api.use("/consulta/tarefas", consultaTarefasRouter);
api.use("/consulta/apontamentos", consultaApontamentosRouter);
api.use("/migracoes", migracoesRouter);

app.use("/api", api);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
});

async function start() {
  await initDb();
  app.listen(config.port, () => {
    console.log(`16flow-api v4 ouvindo em http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error("[sge-pm-api] Falha na inicialização:", err.message);
  process.exit(1);
});
