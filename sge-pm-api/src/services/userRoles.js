export function isAdminUser(user) {
  const perfis = user?.perfisArr || [];
  const all = [...perfis, user?.perfil].filter(Boolean);
  return all.includes("gestor") || all.includes("tech_lead");
}
