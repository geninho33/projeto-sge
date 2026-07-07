import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 3010,
  dbDriver: process.env.DB_DRIVER || "sqlite",
  sqlitePath: process.env.SQLITE_PATH || "data/sge_pm.sqlite",
  jwtSecret: process.env.JWT_SECRET || "sge-pm-dev-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  /** URL opcional (Discord, Slack, Teams etc.) para alertar atualizações de demandas/apontamentos */
  notifyWebhookUrl: process.env.NOTIFY_WEBHOOK_URL || "",
  mysql: {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT) || 3307,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "sge_pm_dev",
    database: process.env.MYSQL_DATABASE || "sge_pm",
  },
};
