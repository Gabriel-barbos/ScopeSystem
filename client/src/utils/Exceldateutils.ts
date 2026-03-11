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

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : toISODate(value)
  }

  // Serial number do Excel → constrói via Date.UTC com noon para evitar drift de fuso
  if (typeof value === "number") {
    if (value <= 0) return null
    const days = Math.round(value) - 25569 // Math.round previne frações de dia
    const date = new Date(Date.UTC(1970, 0, 1 + days, 12, 0, 0))
    return isNaN(date.getTime()) ? null : toISODate(date)
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return null

    const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (brMatch) {
      const [, day, month, year] = brMatch.map(Number)
      const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
      return isNaN(date.getTime()) ? null : toISODate(date)
    }

    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (isoMatch) return trimmed.slice(0, 10)

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