

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

  if (v.includes("reinstal"))  return undefined 
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

/**
 * Normaliza o campo "Motivo" da manutenção.
 *
 * Estratégia em 3 etapas:
 *  1. Match exato com o value canônico (case-insensitive)
 *  2. Match por tabela de keywords — cada motivo tem vários sinônimos e variações,
 *     testados contra o texto compactado (sem espaços) E contra palavras individuais.
 *  3. Retorna undefined se nenhum match for encontrado.
 */
export function normalizeReason(value: unknown): string | undefined {
  const raw = cleanString(value)
  if (!raw) return undefined

  // ── helpers de normalização ──────────────────────────────────────────────
  /** Strip acentos + minúsculas + remove espaços/traços/underscores */
  const compact = (s: string) =>
    s.toLowerCase()
     .normalize("NFD")
     .replace(/[\u0300-\u036f]/g, "")
     .replace(/[\s_\-]+/g, "")

  /** Mesma normalização, mas mantém espaços (para match de palavras individuais) */
  const spaced = (s: string) =>
    s.toLowerCase()
     .normalize("NFD")
     .replace(/[\u0300-\u036f]/g, "")
     .replace(/[\s_\-]+/g, " ")
     .trim()

  const c = compact(raw)   // ex: "dispositivosemreportar"
  const s = spaced(raw)    // ex: "dispositivo sem reportar"
  const words = s.split(" ") // ex: ["dispositivo", "sem", "reportar"]

  // ── 1. Match exato com value canônico ────────────────────────────────────
  const CANON_VALUES = [
    "dispositivo_sem_comunicacao",
    "dispositivo_sem_registro_de_viagem",
    "dispositivo_sem_dados_CAN",
    "instalacao_sem_pos_chave",
    "instalacao_inadequada",
    "leitor_travado",
    "problema_acessorio",
    "problema_bateria",
    "substituicao_tecnologia",
    "upgrade_produto",
    "recall_dispositivo",
    "recall_chicote",
    "veiculo_bloqueado",
    "Outros",
  ]
  const exact = CANON_VALUES.find((v) => compact(v) === c)
  if (exact) return exact

  // ── 2. Tabela de keywords ────────────────────────────────────────────────
  // Cada linha: [value canônico, keywords que disparam o match]
  // Keywords são testadas via includes() tanto no compact quanto no spaced.
  // Adicione sinônimos, typos comuns e abreviações aqui.
  const RULES: [string, string[]][] = [
    // --- Sem Registro de Viagem ---
    ["dispositivo_sem_registro_de_viagem", [
      "viagem", "registro", "semregistro", "naoregistra",
      "naoviaja", "semviagem", "registroviagem",
    ]],

    // --- Sem Comunicação (cobrindo "reportar", "offline", "resposta", etc.) ---
    ["dispositivo_sem_comunicacao", [
      "comunicacao", "comunic",
      "reportar", "semreportar", "naoreporta",
      "offline", "semresposta", "naoresponde",
      "naocomunica", "semcomunic", "semsinais", "semsinal",
      "naorespond", "naocomun",
    ]],

    // --- Sem Dados CAN ---
    ["dispositivo_sem_dados_CAN", [
      "dadoscan", "semcan", "barramento", "semdadoscan",
      // "can" sozinho só vira match se não há "cancel" no texto
    ]],

    // --- Sem Pós-Chave ---
    ["instalacao_sem_pos_chave", [
      "poschave", "chave", "posicaochave", "semposchave",
      "posichave", "poschav",
    ]],

    // --- Instalação Inadequada ---
    ["instalacao_inadequada", [
      "inadequad", "instalacaoinad", "malinstalad",
      "instalacaoinco", "pessimainst", "erradainst",
    ]],

    // --- Leitor Travado ---
    ["leitor_travado", [
      "leitor", "travado", "leitortrav",
    ]],

    // --- Problema Acessório ---
    ["problema_acessorio", [
      "acessorio", "acessor", "acess",
    ]],

    // --- Problema Bateria ---
    ["problema_bateria", [
      "bateria", "bat",
    ]],

    // --- Substituição de Tecnologia ---
    ["substituicao_tecnologia", [
      "substituic", "substituir", "tecnologia", "tecno",
      "trocatecnolog", "novatecn",
    ]],

    // --- Upgrade de Produto ---
    ["upgrade_produto", [
      "upgrade", "upgradeprod",
    ]],

    // --- Recall Chicote (deve vir antes de recall genérico) ---
    ["recall_chicote", [
      "recallchicote", "recalchicote", "chicote",
    ]],

    // --- Recall Dispositivo ---
    ["recall_dispositivo", [
      "recall", "recal", "recaul", "recalle",
      "recalldispositivo", "recaldispositivo",
    ]],

    // --- Outros ---
    ["Outros", [
      "outro", "outros", "other", "nenhum", "naose", "nda",
    ]],

    // --- Veículo Bloqueado ---
    ["veiculo_bloqueado", [
      "bloqueado", "veiculobloq", "bloq",
    ]],
  ]

  // Testa: keyword contida no compact  OU  keyword igual a alguma palavra individual
  const wordSet = new Set(words)
  for (const [returnValue, keywords] of RULES) {
    for (const kw of keywords) {
      if (c.includes(kw) || s.includes(kw) || wordSet.has(kw)) {
        // Guarda especial: "can" sozinho só casa com dados_CAN se não houver "cancel"
        if (kw === "can" && (c.includes("cancel") || c.includes("cancelado"))) continue
        return returnValue
      }
    }
  }

  return undefined
}