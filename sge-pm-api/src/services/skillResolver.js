/** Resolve skills obrigatórias por score/tipo/prioridade */

const SKILL_CODES = {
  backend: {
    senior: ["SK-GX-03", "SK-GX-04", "SK-GX-05"],
    pleno: ["SK-GX-01", "SK-GX-02"],
    junior: ["SK-GX-01", "SK-GX-02"],
  },
  frontend: {
    senior: ["SK-FE-02", "SK-FE-05", "SK-FE-04"],
    pleno: ["SK-FE-01", "SK-FE-03", "SK-FE-04"],
    junior: ["SK-FE-01", "SK-FE-04"],
  },
  qa: {
    senior: ["SK-QA-01"],
    pleno: ["SK-QA-01"],
    junior: ["SK-QA-01"],
  },
};

function nivelBackend(score) {
  if (score >= 350) return "senior";
  if (score >= 180) return "pleno";
  return "junior";
}

function nivelFrontend(score) {
  if (score >= 350) return "senior";
  if (score >= 150) return "pleno";
  return "junior";
}

function nivelQa(score) {
  if (score >= 350) return "senior";
  if (score >= 180) return "pleno";
  return "junior";
}

export function resolveSkillCodes(item) {
  const { score } = item;
  const back = SKILL_CODES.backend[nivelBackend(score)];
  const front = SKILL_CODES.frontend[nivelFrontend(score)];
  const qa = SKILL_CODES.qa[nivelQa(score)];
  return [...new Set([...back, ...front, ...qa])];
}

export function storyPoints(score) {
  return Math.ceil(score / 50);
}

export function branchSlug(codigo, titulo) {
  const slug = titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${codigo.toLowerCase()}-${slug}`;
}
