export const Roles = {
  ADMIN: "administrator",
  VALIDATION: "validation",
  SUPPORT: "support",
  SCHEDULING: "scheduling",
  BILLING: "billing",
  COMMERCIAL: "commercial",
  CX: "CX",
  LAB: "lab",
} as const;

export type Role = typeof Roles[keyof typeof Roles];

/**
 * Retorna a lista efetiva de roles do usuário.
 * Prioriza `roles` (array) se existir e não estiver vazio,
 * caso contrário usa `role` (string) — retrocompatível.
 */
export function getEffectiveRoles(user: { role?: string; roles?: string[] }): string[] {
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return user.roles;
  }
  if (user.role) {
    return [user.role];
  }
  return [];
}

/**
 * Verifica se o usuário possui pelo menos um dos roles listados.
 */
export function hasAnyRole(
  user: { role?: string; roles?: string[] },
  roles: string[]
): boolean {
  if (!roles || roles.length === 0) return true;
  const effective = getEffectiveRoles(user);
  return roles.some((r) => effective.includes(r));
}

/**
 * canAccess — aceita o objeto user completo (retrocompatível com role string ou roles array).
 * Usado na Sidebar e em outros pontos que verificam acesso a rotas/itens de menu.
 */
export const canAccess = (
  user: { role?: string; roles?: string[] } | undefined,
  allowedRoles?: Role[]
): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!user) return false;
  return hasAnyRole(user, allowedRoles as string[]);
};

// <RoleIf roles={[Roles.ADMIN]}>
//   <button className="btn">Criar Usuário</button>
// </RoleIf>