/**
 * buildSchedulePayload.ts
 * Transforma as linhas brutas do Excel + mapeamento de colunas
 * em SchedulePayload[] prontos para enviar ao backend.
 *
 * Aplica:
 *  - limpeza de strings (cleanRow)
 *  - conversão de datas Excel (parseExcelDate)
 *  - normalização de VIN e placa
 *  - normalização de serviceType
 *  - resolução de client/product pelos IDs já matchados (ClienteId / EquipamentoId)
 */

import { parseExcelDate, DATE_FIELDS } from "@/utils/Exceldateutils"
import { cleanRow, normalizeVin, normalizePlate, normalizeServiceType } from "@/utils/importHelpers"
import type { SchedulePayload } from "@/services/ScheduleService"

/**
 * Converte rawRows (colunas do Excel) para SchedulePayload[]
 * usando o mapeamento coluna → field definido pelo usuário no Step 2.
 *
 * @param rows    - linhas brutas do Excel
 * @param mapping - { "Nome Coluna Excel": "fieldDoSchema" }
 * @param meta    - dados extras como createdBy (usuário logado)
 */
export function buildSchedulePayload(
  rows: Record<string, any>[],
  mapping: Record<string, string>,
  meta: { createdBy?: string } = {}
): SchedulePayload[] {
  // Inverte o mapping para field → coluna Excel (facilita o lookup por field)
  const fieldToCol = Object.fromEntries(
    Object.entries(mapping).map(([col, field]) => [field, col])
  )

  const get = (row: Record<string, any>, field: string): any => {
    const col = fieldToCol[field]
    return col ? row[col] : undefined
  }

  return rows.map((rawRow) => {
    // 1. Limpa todos os campos string
    const row = cleanRow(rawRow)

    // 2. Monta o payload campo a campo
    const payload: Record<string, any> = {}

    for (const [field, col] of Object.entries(fieldToCol)) {
      const value = row[col]

      if (value === undefined || value === null || value === "") continue

      if (DATE_FIELDS.has(field)) {
        // Converte serial Excel ou string de data → "YYYY-MM-DD"
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
        payload[field] = normalizeServiceType(value)
        continue
      }

      if (field === "client") {
        // Prefere o ID resolvido pelo matching (ClienteId), cai no valor bruto
        payload[field] = row["ClienteId"] ?? value
        continue
      }

      if (field === "product") {
        // Prefere o ID resolvido pelo matching (EquipamentoId)
        payload[field] = row["EquipamentoId"] ?? value
        continue
      }

      payload[field] = value
    }

    // 3. Campos derivados / defaults
    payload.status = payload.scheduledDate ? "agendado" : "criado"
    payload.createdBy = meta.createdBy || "Sistema"

    if (!payload.responsible) {
      payload.responsible = meta.createdBy || "Sistema"
    }

    return payload as SchedulePayload
  })
}