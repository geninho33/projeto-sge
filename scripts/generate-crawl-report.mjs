import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { BACKLOG_ITEMS } from "./backlog-data.js";
import { BACKLOG_ITEMS_P2 } from "./backlog-data-p2.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const items = [...BACKLOG_ITEMS, ...BACKLOG_ITEMS_P2].map((item) => ({
  ...item,
  storyPoints: Math.ceil(item.score / 50),
  justificativa: `${item.prioridade}: score ${item.score}, ${item.controles} controles`,
}));

const summary = {
  total: items.length,
  P1: items.filter((i) => i.prioridade === "P1").length,
  P2: items.filter((i) => i.prioridade === "P2").length,
  P3: items.filter((i) => i.prioridade === "P3").length,
};

const report = {
  generatedAt: new Date().toISOString(),
  source: "crawl-report (gerado a partir do backlog priorizado SGE)",
  summary,
  items,
};

const outDir = join(root, "crawl");
mkdirSync(outDir, { recursive: true });
mkdirSync(join(outDir, "screenshots"), { recursive: true });
writeFileSync(join(outDir, "crawl-report.json"), JSON.stringify(report, null, 2), "utf8");
console.log(`crawl-report.json gerado: ${summary.total} itens (P1=${summary.P1}, P2=${summary.P2}, P3=${summary.P3})`);
