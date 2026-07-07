/**
 * Importa backlog para SQLite via API admin ou diretamente.
 * Uso: node scripts/import-backlog.js
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { resolveSkillCodes, storyPoints, branchSlug } from "./skill-utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

async function importViaApi() {
  const res = await fetch("http://localhost:3010/api/admin/import-backlog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ force: true }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message || res.statusText);
  console.log(`Importados ${body.data.imported} itens via API.`);
}

async function main() {
  const crawlPath = join(root, "crawl", "crawl-report.json");
  try {
    readFileSync(crawlPath);
  } catch {
    const { execSync } = await import("child_process");
    execSync("node scripts/generate-crawl-report.mjs", { cwd: root, stdio: "inherit" });
  }

  try {
    await importViaApi();
  } catch (err) {
    console.error("Import via API falhou (API rodando?):", err.message);
    console.log("Inicie sge-pm-api e execute novamente: npm run import:backlog");
    process.exit(1);
  }
}

main();
