import { usePermission } from "../../hooks/usePermission";

/** Renderiza filhos somente se o usuário tiver permissão no menu. */
export function Can({ menuKey, level, children, fallback = null }) {
  const { allowed } = usePermission(menuKey, level);
  if (!allowed) return fallback;
  return children;
}
