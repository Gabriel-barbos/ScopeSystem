import { parseExcelDate, DATE_FIELDS } from "@/utils/Exceldateutils"
import { cleanRow, normalizeVin, normalizePlate, normalizeServiceType, normalizeStatus, normalizeReason } from "@/utils/importHelpers"
import type { SchedulePayload } from "@/services/ScheduleService"

export function buildSchedulePayload(
  rows: Record<string, any>[],
  mapping: Record<string, string>,
  meta: { createdBy?: string } = {}
): SchedulePayload[] {
  const fieldToCol = Object.fromEntries(
    Object.entries(mapping).map(([col, field]) => [field, col])
  )

  const get = (row: Record<string, any>, field: string): any => {
    const col = fieldToCol[field]
    return col ? row[col] : undefined
  }

  return rows.map((rawRow) => {
    const row = cleanRow(rawRow)
    const payload: Record<string, any> = {}

    for (const [field, col] of Object.entries(fieldToCol)) {
      const value = row[col]

      if (value === undefined || value === null || value === "") continue

      if (DATE_FIELDS.has(field)) {
        const parsed = parseExcelDate(value)
        if (parsed) payload[field] = parsed
        continue
      }

      if (field === "vin") {
        payload[field] = normalizeVin(value)
        continue
      }

      if (field === "plate") {
        payload[field] = normalizePlate(value)
        continue
      }

      if (field === "serviceType") {
        const normalized = normalizeServiceType(value)
        if (normalized) payload[field] = normalized
        continue
      }

      if (field === "status") {
        const normalized = normalizeStatus(value)
        if (normalized) payload[field] = normalized
        continue
      }

      if (field === "reason") {
        const normalized = normalizeReason(value)
        if (normalized) payload[field] = normalized
        // valor não reconhecido é descartado (campo opcional)
        continue
      }

      if (field === "client") {
        payload[field] = row["ClienteId"] ?? value
        continue
      }

      if (field === "product") {
        payload[field] = row["EquipamentoId"] ?? value
        continue
      }

      payload[field] = value
    }

    // Status: usa o da planilha (já normalizado acima) ou deriva do scheduledDate
    if (!payload.status) {
      payload.status = payload.scheduledDate ? "agendado" : "criado"
    }

    payload.createdBy = meta.createdBy || "Sistema"

    if (!payload.responsible) {
      payload.responsible = meta.createdBy || "Sistema"
    }

    return payload as SchedulePayload
  })
}