import { Router } from "express";
import { query } from "../db.js";
import { FASES_DEMANDA } from "../services/schemaV4.js";
import { requireMenuPermission } from "../middleware/auth.js";
import { P } from "../services/menuPermissions.js";
import {
  deriveBacklogFaseFromAtividades,
  getAtividadesGroupedByBacklog,
} from "../services/backlogProgressao.js";

const router = Router();

const COLUMN_ORDER = [...FASES_DEMANDA];

router.get("/", requireMenuPermission("kanban", P.VIEW), async (_req, res, next) => {
  try {
    const columns = {};
    for (const fase of COLUMN_ORDER) columns[fase] = [];

    const [items, atividadesByBacklog] = await Promise.all([
      query(
        `SELECT b.*, u.nome AS responsavel_nome, p.nome AS projeto_nome, p.cor AS projeto_cor
         FROM sge_pm_backlog_item b
         LEFT JOIN sge_pm_usuario u ON u.id = b.responsavel_id
         LEFT JOIN sge_pm_projeto p ON p.id = COALESCE(b.projeto_id, 1)
         ORDER BY b.score DESC, b.codigo`
      ),
      getAtividadesGroupedByBacklog(),
    ]);

    for (const item of items) {
      const atividades = atividadesByBacklog.get(item.id) || [];
      const fase = deriveBacklogFaseFromAtividades(atividades);
      const col = COLUMN_ORDER.includes(fase) ? fase : "criacao";

      item.total_atividades = atividades.length;
      item.fase_progressao = fase;

      columns[col].push(item);
    }

    res.json({
      data: {
        columns,
        columnOrder: COLUMN_ORDER,
        readOnly: true,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/move", (_req, res) => {
  res.status(403).json({
    error: {
      code: "READ_ONLY",
      message: "O Kanban de Progressão é somente leitura. A posição dos backlogs é definida automaticamente pelas atividades vinculadas.",
    },
  });
});

export default router;
