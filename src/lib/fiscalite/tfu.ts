import { getRate } from './tax-rates'

export interface ResultatTfu {
  valeur_locative: number
  type_bien: string
  taux: number
  tfu_annuelle: number
}

export async function calculerTfu(
  valeurLocative: number | null | undefined,
  typeBien: string = 'bati',
): Promise<ResultatTfu> {
  const valeur = valeurLocative ?? 0

  const tauxBati = ((await getRate('tfu', 'bati', 6)) as number) / 100
  const tauxNonBati = ((await getRate('tfu', 'non_bati', 5)) as number) / 100

  const taux = typeBien === 'non_bati' ? tauxNonBati : tauxBati
  const tfu = valeur * taux

  return {
    valeur_locative: valeur,
    type_bien: typeBien,
    taux: taux * 100,
    tfu_annuelle: Math.round(tfu),
  }
}
