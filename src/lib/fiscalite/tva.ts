import { getRate } from './tax-rates'

export interface ResultatTva {
  ventes: number
  achats: number
  tva_collectee: number
  tva_deductible: number
  tva_a_payer: number
  tva_credit: number
  taux_tva: number
}

export async function calculerTva(
  ventes: number | null | undefined,
  achats: number | null | undefined,
): Promise<ResultatTva> {
  const v = ventes ?? 0
  const a = achats ?? 0

  const taux = ((await getRate('tva', 'taux', 18)) as number) / 100

  const tvaCollectee = v * taux
  const tvaDeductible = a * taux
  const tvaAPayer = tvaCollectee - tvaDeductible

  return {
    ventes: v,
    achats: a,
    tva_collectee: Math.round(tvaCollectee),
    tva_deductible: Math.round(tvaDeductible),
    tva_a_payer: Math.round(Math.max(0, tvaAPayer)),
    tva_credit: tvaAPayer < 0 ? Math.round(Math.abs(tvaAPayer)) : 0,
    taux_tva: taux * 100,
  }
}
