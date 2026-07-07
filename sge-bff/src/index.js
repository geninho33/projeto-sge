import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { authMiddleware } from "./middleware/auth.js";
import { contextMiddleware } from "./middleware/context.js";
import authRouter from "./routes/auth.js";
import homeRouter from "./routes/home.js";
import {
  bairrosRouter,
  ruasRouter,
  estadosRouter,
  paisesRouter,
  municipiosRouter,
  disciplinasRouter,
  cursosRouter,
  entidadesRouter,
  unidadesEscolaresRouter,
  motivosDesistenciaRouter,
  listaEsperaInfantilRouter,
  grupoTurmaLERouter,
  listaEsperaProjetosRouter,
  motivosAusenciaRouter,
  tiposAvaliacaoRouter,
  frequenciaRouter,
} from "./routes/cadastros.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "sge-bff", mockMode: config.mockMode });
});

app.use("/api/auth", authRouter);

const api = express.Router();
api.use(authMiddleware);
api.use(contextMiddleware);

api.use("/home", homeRouter);
api.use("/bairros", bairrosRouter);
api.use("/ruas", ruasRouter);
api.use("/estados", estadosRouter);
api.use("/paises", paisesRouter);
api.use("/municipios", municipiosRouter);
api.use("/disciplinas", disciplinasRouter);
api.use("/cursos", cursosRouter);
api.use("/entidades", entidadesRouter);
api.use("/unidades-escolares", unidadesEscolaresRouter);
api.use("/motivos-desistencia-le", motivosDesistenciaRouter);
api.use("/lista-espera-infantil", listaEsperaInfantilRouter);
api.use("/grupo-turma-le", grupoTurmaLERouter);
api.use("/lista-espera-projetos", listaEsperaProjetosRouter);
api.use("/motivos-ausencia", motivosAusenciaRouter);
api.use("/tipos-avaliacao", tiposAvaliacaoRouter);
api.use("/frequencia", frequenciaRouter);

app.use("/api/v1", api);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: err.message } });
});

app.listen(config.port, () => {
  console.log(`sge-bff ouvindo em http://localhost:${config.port} (mock=${config.mockMode})`);
});
