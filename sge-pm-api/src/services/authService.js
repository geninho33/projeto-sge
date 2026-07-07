import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query, queryOne } from "../db.js";
import { config } from "../config.js";
import { logHistorico } from "./historico.js";
import { enrichUser } from "./profileService.js";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export function signToken(user, remember = false) {
  const expiresIn = remember ? "30d" : config.jwtExpiresIn;
  return jwt.sign(
    { id: user.id, email: user.email, perfil: user.perfil, nome: user.nome },
    config.jwtSecret,
    { expiresIn }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

export async function countFailedAttempts(email) {
  const rows = await query(
    `SELECT COUNT(*) AS c FROM sge_pm_auth_attempt
     WHERE email = ? AND sucesso = 0
       AND datetime(created_at) > datetime('now', '-${WINDOW_MINUTES} minutes')`,
    [email.toLowerCase()]
  );
  return rows[0]?.c ?? 0;
}

export async function recordAttempt(email, ip, sucesso) {
  await query(
    `INSERT INTO sge_pm_auth_attempt (email, ip, sucesso) VALUES (?, ?, ?)`,
    [email.toLowerCase(), ip ?? null, sucesso ? 1 : 0]
  );
}

export async function login(email, senha, remember, ip) {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !senha) {
    throw Object.assign(new Error("E-mail e senha são obrigatórios"), { code: "VALIDATION_ERROR" });
  }

  const failed = await countFailedAttempts(normalized);
  if (failed >= MAX_ATTEMPTS) {
    throw Object.assign(new Error("Muitas tentativas. Aguarde 15 minutos."), { code: "RATE_LIMIT" });
  }

  const user = await queryOne(
    `SELECT * FROM sge_pm_usuario WHERE lower(email) = ? AND deleted_at IS NULL`,
    [normalized]
  );

  if (!user || !user.ativo) {
    await recordAttempt(normalized, ip, false);
    throw Object.assign(new Error("E-mail ou senha inválidos"), { code: "INVALID_CREDENTIALS" });
  }

  const valid = await verifyPassword(senha, user.senha_hash);
  if (!valid) {
    await recordAttempt(normalized, ip, false);
    throw Object.assign(new Error("E-mail ou senha inválidos"), { code: "INVALID_CREDENTIALS" });
  }

  await recordAttempt(normalized, ip, true);
  await query(`UPDATE sge_pm_usuario SET ultimo_acesso = datetime('now') WHERE id = ?`, [user.id]);
  await logHistorico("usuario", user.id, user.id, "login", { ip });

  const token = signToken(user, remember);
  const { senha_hash, ...safe } = user;
  await enrichUser(safe);
  return { token, user: safe, expiresIn: remember ? "30d" : config.jwtExpiresIn };
}

export async function ensureDefaultPasswords() {
  const users = await query(`SELECT id, email, senha_hash FROM sge_pm_usuario WHERE deleted_at IS NULL`);
  const defaultHash = await hashPassword("Sge@2026");
  for (const u of users) {
    if (!u.senha_hash) {
      await query(`UPDATE sge_pm_usuario SET senha_hash = ? WHERE id = ?`, [defaultHash, u.id]);
    }
  }
}
