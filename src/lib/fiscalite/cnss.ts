import { getRate } from './tax-rates'

export interface ResultatCnss {
  salaire_brut: number
  assiette: number
  plafond: number
  part_salariale: number
  part_patronale: number
  prestations_familiales: number
  risques_pro: number
  retraite_patronale: number
  total_mensuel: number
  total_cnss: number
  total_annuel: number
  nombre_salaries: number
  taux_salarial: number
  taux_patronal: number
}

export async function calculerCnss(
  salaireBrut: number | null | undefined,
  nombreSalaries: number | null | undefined = 1,
): Promise<ResultatCnss> {
  const brut = salaireBrut ?? 0
  const nombre = Math.max(1, nombreSalaries ?? 1)

  const tauxSalarial = ((await getRate('cnss', 'salarial', 3.6)) as number) / 100
  const tauxPatronal = ((await getRate('cnss', 'patronal', 15.4)) as number) / 100
  const tauxPrestations = ((await getRate('cnss', 'prestations_familiales', 6.4)) as number) / 100
  const tauxRisquesPro = ((await getRate('cnss', 'risques_pro', 1.5)) as number) / 100
  const tauxRetraite = ((await getRate('cnss', 'retraite_patronal', 7.5)) as number) / 100
  const plafond = (await getRate('cnss', 'plafond', 600000)) as number

  const assiette = Math.min(brut, plafond)
  const partSalariale = assiette * tauxSalarial
  const partPatronale = assiette * tauxPatronal
  const prestationsFamiliales = assiette * tauxPrestations
  const risquesPro = assiette * tauxRisquesPro
  const retraitePatronale = assiette * tauxRetraite
  const totalMensuel = partSalariale + partPatronale
  const totalCnss = totalMensuel * nombre
  const totalAnnuel = totalMensuel * 12 * nombre

  return {
    salaire_brut: brut,
    assiette,
    plafond,
    part_salariale: Math.round(partSalariale),
    part_patronale: Math.round(partPatronale),
    prestations_familiales: Math.round(prestationsFamiliales),
    risques_pro: Math.round(risquesPro),
    retraite_patronale: Math.round(retraitePatronale),
    total_mensuel: Math.round(totalMensuel),
    total_cnss: Math.round(totalCnss),
    total_annuel: Math.round(totalAnnuel),
    nombre_salaries: nombre,
    taux_salarial: tauxSalarial * 100,
    taux_patronal: tauxPatronal * 100,
  }
}
