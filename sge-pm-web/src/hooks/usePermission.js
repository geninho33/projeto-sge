import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { can, getEffectivePermissions, P } from "../utils/permissions";

export function usePermission(menuKey, minLevel = P.VIEW) {
  const { user } = useAuth();
  const permissoes = useMemo(() => getEffectivePermissions(user), [user]);
  const allowed = useMemo(() => can(user, menuKey, minLevel), [user, menuKey, minLevel, permissoes]);
  const nivel = permissoes?.[menuKey] ?? 0;
  return { allowed, nivel, permissoes };
}

export { P };
