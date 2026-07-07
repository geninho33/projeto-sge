import { Router } from "express";
import { parsePagination, paginatedResponse, sortRows, filterRows } from "../lib/pagination.js";
import { getCollection } from "../services/mockStore.js";

function createListRouter(collectionName, searchFields, defaultSort) {
  const router = Router();
  router.get("/", (req, res) => {
    const pg = parsePagination(req.query);
    let rows = getCollection(collectionName);
    rows = filterRows(rows, req.query, searchFields);
    const total = rows.length;
    rows = sortRows(rows, pg.orderBy in (rows[0] || {}) ? pg.orderBy : defaultSort, pg.orderDir);
    const page = rows.slice(pg.offset, pg.offset + pg.limit);
    res.json(paginatedResponse(page, total, pg, { q: req.query.q }));
  });
  router.get("/:id", (req, res) => {
    const rows = getCollection(collectionName);
    const row = rows.find((r) => String(r.id) === req.params.id);
    if (!row) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Registro não encontrado" } });
    res.json({ data: row });
  });
  return router;
}

export const bairrosRouter = createListRouter("bairros", ["baiNome", "baiCodigo"], "baiNome");
export const ruasRouter = createListRouter("ruas", ["ruaNome", "baiNome"], "ruaNome");
export const estadosRouter = createListRouter("estados", ["estNome", "estCodigo"], "estNome");
export const paisesRouter = createListRouter("paises", ["paiNome"], "paiNome");
export const municipiosRouter = createListRouter("municipios", ["munNome", "estNome"], "munNome");
export const disciplinasRouter = createListRouter("disciplinas", ["disNome"], "disNome");
export const cursosRouter = createListRouter("cursos", ["curNome"], "curNome");
export const entidadesRouter = createListRouter("entidades", ["entNome"], "entNome");
export const unidadesEscolaresRouter = createListRouter("unidadesEscolares", ["ueNome", "munNome"], "ueNome");
export const motivosDesistenciaRouter = createListRouter("motivosDesistencia", ["motDescricao"], "motDescricao");
export const listaEsperaInfantilRouter = createListRouter("listaEsperaInfantil", ["aluNome"], "aluNome");
export const grupoTurmaLERouter = createListRouter("grupoTurmaLE", ["gruDescricao"], "gruDescricao");
export const listaEsperaProjetosRouter = createListRouter("listaEsperaProjetos", ["aluNome", "projetoNome"], "aluNome");
export const motivosAusenciaRouter = createListRouter("motivosAusencia", ["motDescricao"], "motDescricao");
export const tiposAvaliacaoRouter = createListRouter("tiposAvaliacao", ["tipDescricao"], "tipDescricao");
export const frequenciaRouter = createListRouter("frequencia", ["turNome"], "turNome");
