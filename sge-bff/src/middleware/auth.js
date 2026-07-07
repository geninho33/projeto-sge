import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    if (config.mockMode && req.path.startsWith("/api/v1")) {
      req.user = { id: 1, nome: "Dev Mock", prefeitura: "8105" };
      return next();
    }
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Token ausente" } });
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: { code: "INVALID_TOKEN", message: "Token inválido" } });
  }
}

export function issueToken(user) {
  return jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}
