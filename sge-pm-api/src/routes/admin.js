import { Router } from "express";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { query, useSqlite } from "../db.js";
import { resolveSkillCodes, storyPoints, branchSlug } from "../services/skillResolver.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = Router();

function ignoreInsert(table, cols, placeholders) {
  const prefix = useSqlite() ? "INSERT OR IGNORE" : "INSERT IGNORE";
  return `${prefix} INTO ${table} (${cols}) VALUES (${placeholders})`;
}

router.post("/import-backlog", async (req, res, next) => {
  try {
    const { force = false } = req.body || {};
    const crawlPath = join(__dirname, "../../../crawl/crawl-report.json");
    const report = JSON.parse(readFileSync(crawlPath, "utf8"));
    const skillRows = await query("SELECT id, codigo FROM sge_pm_skill");
    const skillMap = Object.fromEntries(skillRows.map((s) => [s.codigo, s.id]));

    if (force) {
      await query("DELETE FROM sge_pm_sprint_backlog_item");
      await query("DELETE FROM sge_pm_mapeamento_mudanca");
      await query("DELETE FROM sge_pm_backlog_item_skill");
      await query("DELETE FROM sge_pm_backlog_item");
    }

    let imported = 0;
    for (const item of report.items) {
      const pts = item.storyPoints ?? storyPoints(item.score);
      const tipo =
        item.tipo === "grid_form" ? "grid_form" : item.tipo === "navegacao_densa" ? "navegacao_densa" : "grid_intensivo";

      const vals = [
        item.codigo,
        item.titulo,
        item.modulo,
        item.aspx,
        item.url,
        item.prioridade,
        tipo,
        item.score,
        item.controles,
        pts,
        item.screenshot,
        item.justificativa ?? null,
      ];

      if (useSqlite()) {
        await query(
          `INSERT INTO sge_pm_backlog_item
             (codigo, titulo, modulo, aspx_origem, url_origem, prioridade, tipo_tela, score, controles, story_points, screenshot_path, justificativa)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(codigo) DO UPDATE SET titulo=excluded.titulo, score=excluded.score, story_points=excluded.story_points`,
          vals
        );
      } else {
        await query(
          `INSERT INTO sge_pm_backlog_item
             (codigo, titulo, modulo, aspx_origem, url_origem, prioridade, tipo_tela, score, controles, story_points, screenshot_path, justificativa)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE titulo=VALUES(titulo), score=VALUES(score), story_points=VALUES(story_points)`,
          vals
        );
      }

      const row = await query("SELECT id FROM sge_pm_backlog_item WHERE codigo = ?", [item.codigo]);
      const backlogId = row[0]?.id ?? row.id;

      for (const code of resolveSkillCodes(item)) {
        const skillId = skillMap[code];
        if (!skillId) continue;
        await query(
          ignoreInsert("sge_pm_backlog_item_skill", "backlog_item_id, skill_id", "?, ?"),
          [backlogId, skillId]
        );
      }

      const slug = branchSlug(item.codigo, item.titulo);
      await query(
        ignoreInsert(
          "sge_pm_mapeamento_mudanca",
          "backlog_item_id, branch_front, branch_back, api_contract_path",
          "?, ?, ?, ?"
        ),
        [backlogId, `feature/frontend/${slug}`, `feature/backend/${slug}`, `docs/api-contracts/${item.codigo}.yaml`]
      );
      imported++;
    }

    await seedSprintItems();
    res.json({ data: { imported, total: report.items.length } });
  } catch (err) {
    next(err);
  }
});

async function seedSprintItems() {
  const sprintMap = {
    1: ["SGE-108", "SGE-110", "SGE-031", "SGE-033", "SGE-106", "SGE-007"],
    2: ["SGE-008", "SGE-010", "SGE-012", "SGE-011", "SGE-004", "SGE-019"],
    3: ["SGE-017", "SGE-022", "SGE-023", "SGE-021", "SGE-014", "SGE-018"],
  };
  for (const [num, codigos] of Object.entries(sprintMap)) {
    const sprintRows = await query("SELECT id FROM sge_pm_sprint WHERE projeto_id = 1 AND numero = ?", [num]);
    const sprint = sprintRows[0];
    if (!sprint) continue;
    for (const codigo of codigos) {
      const itemRows = await query("SELECT id, story_points FROM sge_pm_backlog_item WHERE codigo = ?", [codigo]);
      const item = itemRows[0];
      if (!item) continue;
      await query(
        ignoreInsert("sge_pm_sprint_backlog_item", "sprint_id, backlog_item_id, story_points", "?, ?, ?"),
        [sprint.id, item.id, item.story_points]
      );
    }
  }
  const spikeRows = await query("SELECT id FROM sge_pm_sprint WHERE projeto_id = 1 AND numero = 3");
  const spike = spikeRows[0];
  if (spike) {
    for (const codigo of ["SGE-001", "SGE-002", "SGE-003"]) {
      const itemRows = await query("SELECT id FROM sge_pm_backlog_item WHERE codigo = ?", [codigo]);
      const item = itemRows[0];
      if (item) {
        await query(
          ignoreInsert("sge_pm_sprint_backlog_item", "sprint_id, backlog_item_id, story_points", "?, ?, 8"),
          [spike.id, item.id]
        );
      }
    }
  }
}

export default router;
