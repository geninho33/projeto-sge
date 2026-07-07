export function contextMiddleware(req, res, next) {
  req.sgeContext = {
    ano: req.headers["x-sge-ano"] || "2026",
    ue: req.headers["x-sge-ue"] || "8105",
    prefeitura: req.headers["x-sge-prefeitura"] || req.user?.prefeitura || "8105",
    requestId: req.headers["x-request-id"] || crypto.randomUUID(),
  };
  next();
}
