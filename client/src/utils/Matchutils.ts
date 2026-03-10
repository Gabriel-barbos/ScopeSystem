export const normalize = (str: string): string =>
  str
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "") || ""

function tokenize(str: string): string[] {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[\s\-\/]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
}

function diceCoefficient(a: string, b: string): number {
  if (!a || !b) return 0
  if (a === b) return 1

  const bigrams = (s: string) => {
    const set: string[] = []
    for (let i = 0; i < s.length - 1; i++) set.push(s.slice(i, i + 2))
    return set
  }

  const aGrams = bigrams(a)
  const bGrams = bigrams(b)
  if (!aGrams.length || !bGrams.length) return 0

  const bSet = [...bGrams]
  let matches = 0
  for (const gram of aGrams) {
    const idx = bSet.indexOf(gram)
    if (idx !== -1) { matches++; bSet.splice(idx, 1) }
  }

  return (2 * matches) / (aGrams.length + bGrams.length)
}

function tokenJaccard(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0
  const setB = new Set(b)
  const intersect = a.filter((t) => setB.has(t)).length
  const union = new Set([...a, ...b]).size
  return intersect / union
}

interface MatchOption {
  _id: string
  name: string
}

export interface MatchResult {
  id: string
  name: string
  score: number
}

const THRESHOLD = 0.4

/**
 * Ranking de candidatos para cliente usando score composto.
 * Resolve o problema de "Unidas" ganhar de "Unidas - RAC":
 * o Jaccard de tokens penaliza candidatos com menos tokens que o input.
 */
function rankClients(needle: string, options: MatchOption[]): MatchResult[] {
  const inputTokens = tokenize(needle)
  const nNeedle = normalize(needle)

  return options
    .map((opt) => {
      const nOpt = normalize(opt.name)
      const dice = diceCoefficient(nNeedle, nOpt)
      const jaccard = tokenJaccard(inputTokens, tokenize(opt.name))
      // Penaliza candidato com menos tokens que o input
      const penalty = tokenize(opt.name).length < inputTokens.length
        ? tokenize(opt.name).length / inputTokens.length
        : 1
      return { id: opt._id, name: opt.name, score: (dice * 0.6 + jaccard * 0.4) * penalty }
    })
    .filter((r) => r.score >= THRESHOLD)
    .sort((a, b) => b.score - a.score)
}

/**
 * findBestMatch — lógica original preservada integralmente para produtos.
 * Para clientes (quando chamado com a lista de clientes), usa rankClients
 * apenas no fallback após exato e contains, para não regredir casos simples.
 *
 * Na prática, como o Step3 chama findBestMatch sem distinguir cliente/produto,
 * a separação é feita internamente: o contains resolve produtos curtos como
 * "gv50cg" → "Queclink GV50CG", e o rankClients entra só quando contains falha.
 */
export function findBestMatch(
  input: string,
  options: MatchOption[] = []
): MatchResult | null {
  if (!input || !options.length) return null

  const needle = normalize(input)

  // 1. Match exato
  const exact = options.find((opt) => normalize(opt.name) === needle)
  if (exact) return { id: exact._id, name: exact.name, score: 1 }

  // 2. Contains — resolve produtos (ex: "gv50cg" contido em "Queclink GV50CG")
  //    Retorna TODOS os matches e ranqueia pelo score composto,
  //    evitando que o primeiro da lista vença sem critério.
  const contained = options.filter((opt) => {
    const hay = normalize(opt.name)
    return (
      (hay.includes(needle) && needle.length >= 4) ||
      (needle.includes(hay) && hay.length >= 4)
    )
  })

  if (contained.length === 1) {
    return { id: contained[0]._id, name: contained[0].name, score: 0.9 }
  }

  if (contained.length > 1) {
    // Múltiplos matches por contains → usa rankClients para desempatar
    const ranked = rankClients(input, contained)
    if (ranked.length) return ranked[0]
    // Se rankClients não desempatar, retorna o de nome mais longo (mais específico)
    const longest = contained.sort((a, b) => b.name.length - a.name.length)[0]
    return { id: longest._id, name: longest.name, score: 0.9 }
  }

  // 3. Dice puro — fallback para casos sem contains
  const scored = rankClients(input, options)
  return scored[0] ?? null
}