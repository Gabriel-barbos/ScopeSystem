// Normaliza string: minúsculo, sem acento, sem espaços
export const normalize = (str: string): string =>
  str
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "") || ""

// Calcula similaridade entre 0 e 1 usando coeficiente de Dice por bigramas
// Bigramas: divide a string em pares de letras e mede o quanto se sobrepõem
// Ex: "abc" → ["ab","bc"], "abd" → ["ab","bd"] → score = 2*1 / (2+2) = 0.5
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
    if (idx !== -1) {
      matches++
      bSet.splice(idx, 1)
    }
  }

  return (2 * matches) / (aGrams.length + bGrams.length)
}

interface MatchOption {
  _id: string
  name: string
}

interface MatchResult {
  id: string
  name: string
  score: number
}

const THRESHOLD = 0.4 // score mínimo para considerar um match válido

/**
 * Encontra o melhor match de `input` na lista `options`.
 * Prioridade:
 *   1. Exato (normalizado)
 *   2. Um contém o outro completamente
 *   3. Maior score Dice acima do threshold
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

  // 2. Um contém o outro (mas exige que o menor tenha pelo menos 4 chars para evitar falsos positivos)
  const contained = options.find((opt) => {
    const hay = normalize(opt.name)
    return (
      (hay.includes(needle) && needle.length >= 4) ||
      (needle.includes(hay) && hay.length >= 4)
    )
  })
  if (contained) return { id: contained._id, name: contained.name, score: 0.9 }

  // 3. Melhor score Dice
  const scored: MatchResult[] = options
    .map((opt) => ({
      id: opt._id,
      name: opt.name,
      score: diceCoefficient(needle, normalize(opt.name)),
    }))
    .filter((r) => r.score >= THRESHOLD)
    .sort((a, b) => b.score - a.score)

  return scored[0] ?? null
}