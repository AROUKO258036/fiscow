import { prisma } from '../prisma'

type Metadata = Record<string, unknown>

let cache: Record<string, Metadata> | null = null

export async function loadTaxRates(): Promise<Record<string, Metadata>> {
  if (cache) return cache
  const rates = await prisma.taxRate.findMany({
    where: { isActive: true },
  })
  const year = String(new Date().getFullYear())
  cache = {}
  for (const rate of rates) {
    const years = rate.applicableYears as unknown as string[]
    if (years.includes(year)) {
      cache[rate.key] = rate.metadata as unknown as Metadata
    }
  }
  return cache
}

export function resetCache(): void {
  cache = null
}

export async function getRate(
  key: string,
  field: string,
  fallback: unknown = null,
): Promise<unknown> {
  const rates = await loadTaxRates()
  const metadata = rates[key]
  return metadata?.[field] ?? fallback
}

export async function getBareme(key: string): Promise<unknown> {
  return getRate(key, 'bareme')
}
