export const roleLabels: Record<string, string> = {
  administrator: "Administrador",
  validation: "Validação",
  support: "Suporte",
  scheduling: "Agendamento",
  billing: "Financeiro",
};

export function getRoleLabel(role: string = ""): string {
  return roleLabels[role] || "Cargo desconhecido";
}

