import { printMigrationStatus, runMigrations } from "../src/services/migrate.js";

const cmd = process.argv[2] || "up";

try {
  if (cmd === "status") {
    await printMigrationStatus();
    process.exit(0);
  }
  if (cmd === "up" || cmd === "migrate") {
    const result = await runMigrations();
    if (result.applied.length === 0) {
      console.log("Nenhuma migration pendente.");
    } else {
      console.log(`Aplicadas: ${result.applied.join(", ")}`);
    }
    process.exit(0);
  }
  console.error(`Comando desconhecido: ${cmd}`);
  process.exit(1);
} catch (err) {
  console.error("Migration falhou:", err.message);
  process.exit(1);
}
