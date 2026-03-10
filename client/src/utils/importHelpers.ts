

/** Remove espaços extras no início, fim e múltiplos espaços internos */
export function trimAll(value: unknown): string {
  if (value === null || value === undefined) return ""
  return String(value).replace(/\s+/g, " ").trim()
}

/** Remove caracteres especiais comuns em copias de planilha (ex: \r, \t, NBSP) */
export function cleanString(value: unknown): string {
  return trimAll(value)
    .replace(/[\r\t\u00A0\u200B]/g, " ") // CR, tab, NBSP, zero-width space
    .replace(/\s+/g, " ")
    .trim()
}

/** Normaliza VIN: uppercase, remove traços e espaços */
export function normalizeVin(value: unknown): string {
  return cleanString(value).toUpperCase().replace(/[-\s]/g, "")
}

/** Normaliza placa: uppercase, remove traços e espaços */
export function normalizePlate(value: unknown): string {
  return cleanString(value).toUpperCase().replace(/[-\s]/g, "")
}

// ── Detecção de duplicatas ──────────────────────────────────────────────────

/**
 * Retorna os índices das linhas duplicadas baseado em um campo chave.
 * A primeira ocorrência é considerada original, as demais são duplicatas.
 *
 * @example
 * findDuplicateIndexes(rows, "vin")
 * // retorna Set<number> com os índices duplicados
 */
export function findDuplicateIndexes(
  rows: Record<string, any>[],
  keyField: string
): Set<number> {
  const seen = new Map<string, number[]>() // valor → lista de índices

  rows.forEach((row, i) => {
    const val = cleanString(row[keyField]).toLowerCase()
    if (!val) return
    seen.set(val, [...(seen.get(val) ?? []), i])
  })

  const duplicates = new Set<number>()
  seen.forEach((indexes) => {
    if (indexes.length > 1) indexes.forEach((i) => duplicates.add(i))
  })
  return duplicates
}

// ── Transformação de linha ──────────────────────────────────────────────────

/**
 * Aplica limpeza em todos os campos string de uma linha.
 * Não altera campos que já são número ou objeto.
 */
export function cleanRow(row: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => {
      if (typeof value === "string") return [key, cleanString(value)]
      return [key, value]
    })
  )
}

// ── Normalização de serviceType ─────────────────────────────────────────────

export function normalizeServiceType(value: unknown): string | undefined {
  const v = cleanString(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]+/g, "")

  if (v.includes("reinstal"))  return "reinstallation"
  if (v.includes("instal"))    return "installation"
  if (v.includes("manut"))     return "maintenance"
  if (v.includes("remo"))      return "removal"
  if (v.includes("diagn"))     return "diagnostic"
  if (v.includes("visita"))    return "diagnostic"

  return undefined
}

export function normalizeStatus(value: unknown): StatusType | undefined {
  const v = cleanString(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]+/g, "")

  if (v.includes("reinstal"))  return undefined // serviceType, não status
  if (v.includes("aguard"))    return "aguardando_cliente"
  if (v.includes("waitaddr"))  return "waiting_address"
  if (v.includes("waitresp"))  return "waiting_responsible"
  if (v.includes("agenda"))    return "agendado"
  if (v.includes("conclu"))    return "concluido"
  if (v.includes("cancel"))    return "cancelado"
  if (v.includes("frustr"))    return "frustrado"
  if (v.includes("observ"))    return "observacao"
  if (v.includes("cri"))       return "criado"

  return undefined
}