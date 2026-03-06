
export interface ColumnConfig {
  header: string
  aliases?: string[]
  field: string
  required: boolean
}

export const SCHEDULE_IMPORT_COLUMNS: ColumnConfig[] = [
  { header: "Chassi",              field: "vin",              required: true  },
  { header: "Cliente",             field: "client",           required: true  },
  { header: "Status",              field: "status",           required: false },
  { header: "TipoServico",         field: "serviceType",      required: true,  aliases: ["Serviço", "Tipo"] },
  { header: "Placa",               field: "plate",            required: false },
  { header: "Modelo",              field: "model",            required: true, aliases: ["Modelo do Carro"] },
  { header: "Data",                field: "scheduledDate",    required: false, aliases: ["data", "DATA", "Data Agendamento"] },
  { header: "Prestador",           field: "provider",         required: false, aliases: ["Técnico"] },
  { header: "NumeroPedido",        field: "orderNumber",      required: false, aliases: ["Lista nº", "Pedido"] },
  { header: "Endereco",            field: "serviceAddress",   required: false, aliases: ["Endereço"] },
  { header: "LocalServico",        field: "serviceLocation",  required: false },
  { header: "GrupoVeiculo",        field: "vehicleGroup",     required: false, aliases: ["Programa", "Concessionária/Grupo de veiculos"] },
  { header: "Responsavel",         field: "responsible",      required: false },
  { header: "TelefoneResponsavel", field: "responsiblePhone", required: false },
  { header: "Condutor",            field: "condutor",         required: false },
  { header: "Situacao",            field: "situation",        required: false },
  { header: "Observacoes",         field: "notes",            required: false },
  { header: "Equipamento",         field: "product",          required: false, aliases: ["Fabricante", "Dispositivo"] },
  { header: "Data do pedido",      field: "orderDate",        required: true, aliases: ["Data Pedido"] },
]


export const SCHEDULE_COLUMN_MAPPING = Object.fromEntries(
  SCHEDULE_IMPORT_COLUMNS.flatMap(({ header, aliases = [] }) =>
    [header, ...aliases].map((key) => [key, header]) 
  )
)

export const REQUIRED_HEADERS = SCHEDULE_IMPORT_COLUMNS
  .filter((c) => c.required)
  .map((c) => c.header)


export function mapRowToPayload(row: Record<string, any>): Record<string, any> {
  const payload: Record<string, any> = {}

  for (const { header, field } of SCHEDULE_IMPORT_COLUMNS) {
    const value = field === "client"  ? row["ClienteId"]
                : field === "product" ? row["EquipamentoId"]
                : row[header]

    if (value !== undefined && value !== null && value !== "") {
      payload[field] = field === "vin" ? String(value).trim() : value
    }
  }

  return payload
}