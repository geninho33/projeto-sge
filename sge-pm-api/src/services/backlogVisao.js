import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { queryOne } from "../db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CRAWL_ROOT = process.env.CRAWL_ROOT || join(__dirname, "../../../crawl");
const SCREENSHOTS_DIR = join(CRAWL_ROOT, "screenshots");
const TREES_DIR = join(CRAWL_ROOT, "dependencias-trees");

let crawlCache = null;

function loadCrawlReport() {
  if (crawlCache) return crawlCache;
  const path = join(CRAWL_ROOT, "crawl-report.json");
  if (!existsSync(path)) return null;
  crawlCache = JSON.parse(readFileSync(path, "utf8"));
  return crawlCache;
}

function findDependencyTree(codigo) {
  if (!existsSync(TREES_DIR)) return null;
  const files = readdirSync(TREES_DIR);
  const match = files.find((f) => f.startsWith(`${codigo}-`) && f.endsWith(".md"));
  if (!match) return null;
  const fullPath = join(TREES_DIR, match);
  return { filename: match, content: readFileSync(fullPath, "utf8") };
}

function resolveScreenshot(backlog) {
  if (backlog.screenshot_path) {
    const rel = backlog.screenshot_path.replace(/^screenshots\//, "");
    const full = join(SCREENSHOTS_DIR, rel);
    if (existsSync(full)) return `/crawl/screenshots/${rel}`;
    if (backlog.screenshot_path.startsWith("screenshots/")) {
      return `/crawl/${backlog.screenshot_path}`;
    }
  }

  const report = loadCrawlReport();
  const item = report?.items?.find((i) => i.codigo === backlog.codigo);
  if (item?.screenshot) {
    const rel = item.screenshot.replace(/^screenshots\//, "");
    const full = join(SCREENSHOTS_DIR, rel);
    if (existsSync(full)) return `/crawl/screenshots/${rel}`;
  }
  return null;
}

export async function getBacklogVisao(codigo) {
  const backlog = await queryOne(
    `SELECT b.*, p.nome AS projeto_nome, u.nome AS responsavel_nome
     FROM sge_pm_backlog_item b
     LEFT JOIN sge_pm_projeto p ON p.id = COALESCE(b.projeto_id, 1)
     LEFT JOIN sge_pm_usuario u ON u.id = b.responsavel_id
     WHERE b.codigo = ?`,
    [codigo]
  );
  if (!backlog) return null;

  const demandasRow = await queryOne(
    `SELECT COUNT(DISTINCT d.id) AS c
     FROM sge_pm_demanda d
     JOIN sge_pm_atividade a ON a.demanda_id = d.id
     LEFT JOIN sge_pm_atividade_backlog ab ON ab.atividade_id = a.id
     LEFT JOIN sge_pm_atividade_tarefa t ON t.atividade_id = a.id
     LEFT JOIN sge_pm_tarefa_backlog tb ON tb.tarefa_id = t.id
     WHERE d.deleted_at IS NULL
       AND (ab.backlog_item_id = ? OR tb.backlog_item_id = ?)`,
    [backlog.id, backlog.id]
  );

  const tree = findDependencyTree(backlog.codigo);
  const screenshotUrl = resolveScreenshot(backlog);

  return {
    backlog: {
      id: backlog.id,
      codigo: backlog.codigo,
      titulo: backlog.titulo,
      descricao: backlog.descricao,
      modulo: backlog.modulo,
      status_geral: backlog.status_geral,
      kanban_status: backlog.kanban_status,
      prioridade: backlog.prioridade,
      projeto_nome: backlog.projeto_nome,
      responsavel_nome: backlog.responsavel_nome,
      aspx_origem: backlog.aspx_origem,
      url_origem: backlog.url_origem,
      total_demandas: demandasRow?.c || 0,
    },
    screenshot: screenshotUrl ? { url: screenshotUrl } : null,
    dependencyTree: tree ? { filename: tree.filename, content: tree.content } : null,
  };
}
