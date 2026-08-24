import { getRate } from './tax-rates'

export interface ResultatPatente {
  chiffre_affaires: number
  regime: string
  montant: number | null
  sous_tps: boolean
}

export async function calculerPatente(
  chiffreAffaires: number | null | undefined,
): Promise<ResultatPatente> {
  const ca = chiffreAffaires ?? 0

  const taux = ((await getRate('tps', 'taux', 1.5)) as number) / 100
  const minimum = (await getRate('tps', 'minimum', 250000)) as number
  const seuilReel = (await getRate('tps', 'seuil_regime_reel', 50000000)) as number

  let regime: string
  let montant: number | null

  if (ca <= seuilReel) {
    regime = 'TPS'
    montant = Math.max(ca * taux, minimum)
  } else {
    regime = 'Régime du réel'
    montant = null
  }

  return {
    chiffre_affaires: ca,
    regime,
    montant: montant ? Math.round(montant) : null,
    sous_tps: ca <= seuilReel,
  }
}
