import { getBareme } from './tax-rates'

export interface TrancheIts {
  de: number
  a: number | '∞'
  taux: number
  montant: number
  impot: number
}

export interface ResultatIts {
  salaire_brut: number
  salaire_net: number
  total_impots: number
  taux_effectif: number
  tranches: TrancheIts[]
}

const DEFAULT_BAREME = [
  { limite: 60000, taux: 0 },
  { limite: 150000, taux: 10 },
  { limite: 250000, taux: 15 },
  { limite: 500000, taux: 19 },
  { limite: null, taux: 30 },
]

export async function calculerIts(salaireBrut: number | null | undefined): Promise<ResultatIts> {
  const brut = salaireBrut ?? 0
  const bareme = ((await getBareme('its')) as { limite: number | null; taux: number }[] | null) ?? DEFAULT_BAREME

  let reste = brut
  const tranches: TrancheIts[] = []
  let precedent = 0
  let totalImpots = 0

  for (const tranche of bareme) {
    const limite = tranche.limite ?? Infinity
    const taux = (tranche.taux ?? 0) / 100
    const limiteReelle = tranche.limite === null ? Infinity : tranche.limite

    const montantTranche =
      limiteReelle === Infinity
        ? Math.max(0, brut - precedent)
        : Math.min(Math.max(0, brut - precedent), limiteReelle - precedent)

    const impotTranche = montantTranche * taux
    tranches.push({
      de: precedent,
      a: limiteReelle === Infinity ? '∞' : limiteReelle,
      taux: taux * 100,
      montant: montantTranche,
      impot: Math.round(impotTranche),
    })
    totalImpots += impotTranche
    precedent = limiteReelle
    if (brut <= limiteReelle) break
  }

  const salaireNet = brut - Math.round(totalImpots)
  const tauxEffectif = brut > 0 ? (totalImpots / brut) * 100 : 0

  return {
    salaire_brut: brut,
    salaire_net: salaireNet,
    total_impots: Math.round(totalImpots),
    taux_effectif: Math.round(tauxEffectif * 100) / 100,
    tranches,
  }
}
