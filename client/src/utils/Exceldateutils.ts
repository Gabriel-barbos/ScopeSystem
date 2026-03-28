
export function parseExcelDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : toISODate(value)
  }

  if (typeof value === "number") {
    if (value <= 0) return null
    const days = Math.round(value) - 25569 
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

export function formatDateBR(value: unknown): string {
  const iso = value instanceof Date ? toISODate(value) : parseExcelDate(value)
  if (!iso) return typeof value === "string" ? value : "—"

  const [year, month, day] = iso.split("-")
  return `${day}/${month}/${year}`
}

function toISODate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export const DATE_FIELDS = new Set(["scheduledDate", "orderDate", "removalDate", "validatedAt"])