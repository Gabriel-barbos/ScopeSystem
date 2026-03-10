/**
 * importHelpers.ts
 * Utilitários para limpar e transformar dados brutos de planilha
 * antes de enviar ao backend.
 */

// ── Limpeza de strings ──────────────────────────────────────────────────────

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

const SERVICE_TYPE_MAP: Record<string, string> = {
  instalacao:   "installation",
  instalação:   "installation",
  installation: "installation",
  manutencao:   "maintenance",
  manutenção:   "maintenance",
  maintenance:  "maintenance",
  remocao:      "removal",
  remoção:      "removal",
  removal:      "removal",
}

/**
 * Normaliza o valor de serviceType para o enum aceito pelo backend.
 * Retorna undefined se não reconhecido.
 */
export function normalizeServiceType(value: unknown): string | undefined {
  const key = cleanString(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  return SERVICE_TYPE_MAP[key]
}