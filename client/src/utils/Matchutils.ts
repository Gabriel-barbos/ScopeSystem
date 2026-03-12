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

function bigrams(s: string): string[] {
  const set: string[] = []
  for (let i = 0; i < s.length - 1; i++) set.push(s.slice(i, i + 2))
  return set
}


interface PrecomputedOption {
  _id: string
  name: string
  normalized: string
  tokens: string[]
  bigramList: string[]
}

function precompute(options: MatchOption[]): PrecomputedOption[] {
  return options.map((opt) => {
    const normalized = normalize(opt.name)
    return {
      _id: opt._id,
      name: opt.name,
      normalized,
      tokens: tokenize(opt.name),
      bigramList: bigrams(normalized),
    }
  })
}

const cache = new WeakMap<MatchOption[], PrecomputedOption[]>()

function getPrecomputed(options: MatchOption[]): PrecomputedOption[] {
  if (!cache.has(options)) cache.set(options, precompute(options))
  return cache.get(options)!
}


function diceFromBigrams(aGrams: string[], bGrams: string[]): number {
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


function rankPrecomputed(
  needle: string,
  inputTokens: string[],
  needleBigrams: string[],
  precomputed: PrecomputedOption[]
): MatchResult[] {
  return precomputed
    .map((opt) => {
      const dice = diceFromBigrams(needleBigrams, opt.bigramList)
      const jaccard = tokenJaccard(inputTokens, opt.tokens)
      const penalty =
        opt.tokens.length < inputTokens.length
          ? opt.tokens.length / inputTokens.length
          : 1
      return { id: opt._id, name: opt.name, score: (dice * 0.6 + jaccard * 0.4) * penalty }
    })
    .filter((r) => r.score >= THRESHOLD)
    .sort((a, b) => b.score - a.score)
}

// Internamente usa pré-cômputo via WeakMap cache.

export function findBestMatch(
  input: string,
  options: MatchOption[] = []
): MatchResult | null {
  if (!input || !options.length) return null

  const needle = normalize(input)
  const precomputed = getPrecomputed(options)

  const exact = precomputed.find((opt) => opt.normalized === needle)
  if (exact) return { id: exact._id, name: exact.name, score: 1 }

  const contained = precomputed.filter((opt) => {
    const hay = opt.normalized
    return (
      (hay.includes(needle) && needle.length >= 4) ||
      (needle.includes(hay) && hay.length >= 4)
    )
  })

  if (contained.length === 1) {
    return { id: contained[0]._id, name: contained[0].name, score: 0.9 }
  }

  const inputTokens = tokenize(input)
  const needleBigrams = bigrams(needle)

  if (contained.length > 1) {
    const ranked = rankPrecomputed(input, inputTokens, needleBigrams, contained)
    if (ranked.length) return ranked[0]
    const longest = [...contained].sort((a, b) => b.name.length - a.name.length)[0]
    return { id: longest._id, name: longest.name, score: 0.9 }
  }

  // 3. Dice puro
  const scored = rankPrecomputed(input, inputTokens, needleBigrams, precomputed)
  return scored[0] ?? null
}