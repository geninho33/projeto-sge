/**
 * Importa backlog via API admin (autenticada).
 * Uso:
 *   npm run import:backlog
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... API_URL=http://localhost:3010/api npm run import:backlog
 *   FORCE=false npm run import:backlog
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const API_URL = (process.env.API_URL || "http://localhost:3010/api").replace(/\/$/, "");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "gestor@sge.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Sge@2026";
const FORCE = String(process.env.FORCE ?? "true").toLowerCase() !== "false";

async function login() {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, senha: ADMIN_PASSWORD }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error?.message || `Login falhou (${res.status})`);
  }
  const token = body?.data?.token;
  if (!token) throw new Error("Resposta de login sem token");
  return token;
}

async function importViaApi(token) {
  const res = await fetch(`${API_URL}/admin/import-backlog`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ force: FORCE }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error?.message || res.statusText);
  console.log(`Importados ${body.data.imported} de ${body.data.total} itens via API.`);
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
    const token = await login();
    await importViaApi(token);
  } catch (err) {
    console.error("Import via API falhou (API rodando?):", err.message);
    console.log("Inicie sge-pm-api e execute novamente: npm run import:backlog");
    process.exit(1);
  }
}

main();
