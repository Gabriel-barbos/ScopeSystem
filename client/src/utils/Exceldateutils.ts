/**
 * Converte qualquer valor de data vindo do Excel para uma string ISO (YYYY-MM-DD).
 *
 * O Excel armazena datas como serial numbers (número de dias desde 01/01/1900).
 * O XLSX.js devolve esse número bruto quando a célula não tem formatação explícita.
 * Ex: 42244 → 10/08/2015, mas sem conversão aparece como "12/12/1969" no JS.
 *
 * Formatos suportados:
 *   - number  → serial do Excel (ex: 42244)
 *   - string  → DD/MM/YYYY, YYYY-MM-DD, ou qualquer formato parseável pelo Date
 *   - Date    → passthrough
 *
 * Retorna string "YYYY-MM-DD" ou null se inválido.
 * O backend aceita ISO, então enviamos sempre nesse formato.
 */
export function parseExcelDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null

  // Já é um objeto Date
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : toISODate(value)
  }

  // Serial number do Excel
  // Fórmula: (serial - 25569) * 86400 * 1000
  // 25569 = dias entre 01/01/1900 (época do Excel) e 01/01/1970 (época Unix)
  if (typeof value === "number") {
    if (value <= 0) return null
    const date = new Date((value - 25569) * 86400 * 1000)
    return isNaN(date.getTime()) ? null : toISODate(date)
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return null

    // DD/MM/YYYY — formato brasileiro comum em planilhas
    const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (brMatch) {
      const [, day, month, year] = brMatch.map(Number)
      const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
      return isNaN(date.getTime()) ? null : toISODate(date)
    }

    // YYYY-MM-DD — ISO já no formato correto
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (isoMatch) return trimmed.slice(0, 10)

    // Fallback: tenta parse genérico
    const date = new Date(trimmed)
    return isNaN(date.getTime()) ? null : toISODate(date)
  }

  return null
}

/**
 * Formata uma data ISO ou Date para exibição no formato brasileiro DD/MM/YYYY.
 * Usado na preview da tabela de importação.
 */
export function formatDateBR(value: unknown): string {
  const iso = value instanceof Date ? toISODate(value) : parseExcelDate(value)
  if (!iso) return typeof value === "string" ? value : "—"

  const [year, month, day] = iso.split("-")
  return `${day}/${month}/${year}`
}

// Converte Date para "YYYY-MM-DD" sem risco de fuso horário
function toISODate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

// Fields do banco que representam datas — usado pelo ScheduleImportconfig
export const DATE_FIELDS = new Set(["scheduledDate", "orderDate", "removalDate"])