export const roleLabels: Record<string, string> = {
  administrator: "Administrador",
  validation: "Validação",
  support: "Suporte",
  scheduling: "Agendamento",
  billing: "Financeiro",
  commercial: "Comercial",
  CX: "CX",
  lab: "Laboratório",
};

export function getRoleLabel(role: string = ""): string {
  return roleLabels[role] || "Cargo desconhecido";
}

/** Retorna os labels de um array de roles separados por vírgula. */
export function getRoleLabels(roles: string[] = []): string {
  if (roles.length === 0) return "Cargo desconhecido";
  return roles.map((r) => roleLabels[r] || r).join(", ");
}

