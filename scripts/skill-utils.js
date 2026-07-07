export function resolveSkillCodes(item) {
  const { score } = item;
  const nivelBack = score >= 350 ? "senior" : score >= 180 ? "pleno" : "junior";
  const nivelFront = score >= 350 ? "senior" : score >= 150 ? "pleno" : "junior";
  const nivelQa = score >= 350 ? "senior" : score >= 180 ? "pleno" : "junior";

  const backend = {
    senior: ["SK-GX-03", "SK-GX-04", "SK-GX-05"],
    pleno: ["SK-GX-01", "SK-GX-02"],
    junior: ["SK-GX-01", "SK-GX-02"],
  };
  const frontend = {
    senior: ["SK-FE-02", "SK-FE-05", "SK-FE-04"],
    pleno: ["SK-FE-01", "SK-FE-03", "SK-FE-04"],
    junior: ["SK-FE-01", "SK-FE-04"],
  };
  const qa = { senior: ["SK-QA-01"], pleno: ["SK-QA-01"], junior: ["SK-QA-01"] };

  return [...new Set([...backend[nivelBack], ...frontend[nivelFront], ...qa[nivelQa]])];
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
