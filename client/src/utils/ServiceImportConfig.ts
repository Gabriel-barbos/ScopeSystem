import { parseExcelDate, DATE_FIELDS } from "@/utils/Exceldateutils"
import type { ColumnConfig } from "@/utils/ScheduleImportconfig"

export type { ColumnConfig }

export const SERVICE_IMPORT_COLUMNS: ColumnConfig[] = [
  { header: "Chassi",               field: "vin",                 required: true  },
  { header: "Cliente",              field: "client",              required: true  },
  { header: "Equipamento",          field: "product",             required: false, aliases: ["Dispositivo"] },
  { header: "TipoServico",          field: "serviceType",         required: false, aliases: ["Tipo Serviço", "Tipo"] },
  { header: "Placa",                field: "plate",               required: false },
  { header: "Modelo",               field: "model",               required: false },
  { header: "IDDispositivo",        field: "deviceId",            required: false, aliases: ["ID Dispositivo", "Device ID"] },
  { header: "Tecnico",              field: "technician",          required: false, aliases: ["Técnico"] },
  { header: "Prestador",            field: "provider",            required: false },
  { header: "LocalInstalacao",      field: "installationLocation",required: false, aliases: ["Local Instalação", "Local"] },
  { header: "Endereco",             field: "serviceAddress",      required: false, aliases: ["Endereço"] },
  { header: "Odometro",             field: "odometer",            required: false, aliases: ["Odômetro"] },
  { header: "Bloqueio",             field: "blockingEnabled",     required: false },
  { header: "NumeroProtocolo",      field: "protocolNumber",      required: false, aliases: ["Nº Protocolo", "Protocolo"] },
  { header: "DispositivoSecundario",field: "secondaryDevice",     required: false, aliases: ["Dispositivo Secundário"] },
  { header: "ValidadoPor",          field: "validatedBy",         required: false, aliases: ["Validado Por"] },
  { header: "Observacoes",          field: "validationNotes",     required: false, aliases: ["Observações"] },
  { header: "DataValidacao",        field: "validatedAt",         required: false, aliases: ["Data Validação", "Data Validacao"] },
  { header: "Status",               field: "status",              required: false },
]

export const SERVICE_COLUMN_MAPPING = Object.fromEntries(
  SERVICE_IMPORT_COLUMNS.flatMap(({ header, aliases = [] }) =>
    [header, ...aliases].map((key) => [key, header])
  )
)

export const SERVICE_REQUIRED_HEADERS = SERVICE_IMPORT_COLUMNS
  .filter((c) => c.required)
  .map((c) => c.header)

export function mapServiceRowToPayload(row: Record<string, any>): Record<string, any> {
  const payload: Record<string, any> = {}

  for (const { header, field } of SERVICE_IMPORT_COLUMNS) {
    const raw = field === "client"  ? row["ClienteId"]
              : field === "product" ? row["EquipamentoId"]
              : row[header]

    if (raw === undefined || raw === null || raw === "") continue

    if (field === "vin") {
      payload[field] = String(raw).trim()
    } else if (DATE_FIELDS.has(field)) {
      const iso = parseExcelDate(raw)
      if (iso) payload[field] = iso
    } else if (field === "odometer") {
      payload[field] = Number(raw)
    } else if (field === "blockingEnabled") {
      payload[field] = typeof raw === "string"
        ? raw.toLowerCase() === "sim"
        : Boolean(raw)
    } else {
      payload[field] = raw
    }
  }

  return payload
}
