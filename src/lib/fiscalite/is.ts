import { getRate } from './tax-rates'

export interface ResultatIs {
  chiffre_affaires: number
  charges: number
  secteur: string
  benefice_imposable: number
  is_calcule: number
  impot_minimum: number
  is_du: number
  taux_is: number
  taux_impot_minimum: number
}

export async function calculerIs(
  chiffreAffaires: number | null | undefined,
  charges: number | null | undefined,
  secteur: string = 'commercial',
): Promise<ResultatIs> {
  const ca = chiffreAffaires ?? 0
  const ch = charges ?? 0

  const tauxStandard = ((await getRate('is', 'standard', 25)) as number) / 100
  const tauxNonDeclarant = ((await getRate('is', 'non_declarant', 30)) as number) / 100
  const tauxImpotMinimum = ((await getRate('is', 'impot_minimum', 1.5)) as number) / 100
  const plancher = (await getRate('is', 'plancher', 250000)) as number

  const taux = secteur === 'industriel' ? tauxStandard : tauxNonDeclarant
  const beneficeImposable = Math.max(0, ca - ch)
  const isCalcule = beneficeImposable * taux
  const impotMinimum = Math.max(ca * tauxImpotMinimum, plancher)
  const isDu = Math.round(Math.max(isCalcule, impotMinimum))

  return {
    chiffre_affaires: ca,
    charges: ch,
    secteur,
    benefice_imposable: beneficeImposable,
    is_calcule: Math.round(isCalcule),
    impot_minimum: Math.round(impotMinimum),
    is_du: isDu,
    taux_is: taux * 100,
    taux_impot_minimum: tauxImpotMinimum * 100,
  }
}
