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

//  verificar permissões
export const canAccess = (userRole: string | undefined, allowedRoles?: Role[] | undefined) => {
  if (!allowedRoles || allowedRoles.length === 0) return true; // sem restrição
  return !!userRole && (allowedRoles as string[]).includes(userRole);
};

// <RoleIf roles={[Roles.ADMIN]}>
//   <button className="btn">Criar Usuário</button>
// </RoleIf>