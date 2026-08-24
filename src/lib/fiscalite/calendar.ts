import { calculerIts } from './its'
import { calculerCnss } from './cnss'

export interface CompanyForCalendar {
  id: number
  chiffre_affaires: number | null
  effectif: number | null
  regime_tva: string
  secteur: string | null
  has_employees: boolean
  activeEmployees?: { salaire_brut_mensuel: bigint | number }[]
}

export interface CalendarEventInput {
  title: string
  type: string
  taxe: string
  sigle: string
  description: string
  reference: string
  date: string
  montant_estime: number | null
}

export const REF_IS = 'Art. 21-32 CGI (IS)'
export const REF_TVA = 'Art. 223-263 CGI (TVA)'
export const REF_ITS = 'Art. 101-115 CGI (ITS)'
export const REF_CNSS = 'Loi 98-019 CNSS'
export const REF_PATENTE = 'Art. 401-415 CGI (Patente)'
export const REF_TFU = 'Art. 501-510 CGI (TFU)'

export function salairesPrecis(company: CompanyForCalendar): boolean {
  return (company.activeEmployees ?? []).some((e) => Number(e.salaire_brut_mensuel) > 0)
}

export async function estimateSalaires(
  company: CompanyForCalendar,
  type: string,
): Promise<number | null> {
  const employees = (company.activeEmployees ?? []).filter(
    (e) => Number(e.salaire_brut_mensuel) > 0,
  )

  if (employees.length === 0) {
    const ca = company.chiffre_affaires
    if (!ca) return null
    const effectif = Math.trunc(company.effectif ?? 1)
    const monthlyRevenue = ca / 12
    let avgSalary: number
    let effectifReel: number
    if (effectif >= 1) {
      avgSalary = Math.min(Math.max(Math.round((monthlyRevenue / effectif) * 0.4), 100000), 500000)
      effectifReel = effectif
    } else {
      effectifReel = 1
      avgSalary = 200000
    }

    if (type === 'its') {
      const r = await calculerIts(avgSalary)
      return Math.round((r.total_impots ?? 0) * effectifReel)
    }
    const r = await calculerCnss(avgSalary, 1)
    return Math.round((r.total_mensuel ?? 0) * effectifReel)
  }

  let total = 0
  for (const employee of employees) {
    const salaire = Math.max(0, Number(employee.salaire_brut_mensuel))
    if (salaire === 0) continue
    if (type === 'its') {
      const r = await calculerIts(salaire)
      total += r.total_impots ?? 0
    } else {
      const r = await calculerCnss(salaire, 1)
      total += r.total_mensuel ?? 0
    }
  }

  return Math.round(total)
}

export async function estimateMontant(
  company: CompanyForCalendar,
  type: string,
  title = '',
): Promise<number | null> {
  const ca = company.chiffre_affaires

  if (type === 'tfu') return null
  if (type === 'its' || type === 'cnss') return estimateSalaires(company, type)
  if (!ca) return null

  switch (type) {
    case 'tva': {
      const isTrimestriel = company.regime_tva === 'trimestriel'
      return Math.round((ca / (isTrimestriel ? 4 : 12)) * 0.18)
    }
    case 'is':
      return estimateIs(ca, title)
    case 'patente':
      return Math.round(Math.max(ca * 0.015, 250000))
    default:
      return null
  }
}

function estimateIs(ca: number, title: string): number {
  const chargesEstimees = ca * 0.7
  const benefice = ca - chargesEstimees
  const isEstime = Math.max(benefice * 0.3, ca * 0.015)

  if (title.includes('Acompte')) {
    return Math.round(isEstime / 4)
  }

  return Math.round(isEstime)
}

export function generateRaw(
  company: CompanyForCalendar,
  applicableKeys: string[] | null = null,
): CalendarEventInput[] {
  const annee = new Date().getFullYear()
  const regimeTva = company.regime_tva
  const secteur = company.secteur

  let all: CalendarEventInput[] = []

  if (applicableKeys === null || applicableKeys.includes('tva')) {
    all = all.concat(echeancesTva(annee, regimeTva))
  }
  if (applicableKeys === null || applicableKeys.includes('its')) {
    all = all.concat(echeancesIts(annee))
  }
  if (applicableKeys === null || applicableKeys.includes('cnss')) {
    all = all.concat(echeancesCnss(annee))
  }
  if (applicableKeys === null || applicableKeys.includes('is')) {
    all = all.concat(echeancesIs(annee, secteur))
  }
  if (applicableKeys === null || applicableKeys.includes('tps')) {
    all = all.concat(echeancesPatente(annee))
  }
  if (applicableKeys === null || applicableKeys.includes('tfu')) {
    all = all.concat(echeancesTfu(annee))
  }

  return all
}

function iso(m: number, d: number, annee: number): string {
  return `${annee}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function echeancesTva(annee: number, regimeTva: string): CalendarEventInput[] {
  const months = regimeTva === 'trimestriel' ? [3, 6, 9, 12] : Array.from({ length: 12 }, (_, i) => i + 1)

  return months.map((m) => ({
    title: 'TVA' + (regimeTva === 'trimestriel' ? ` (T${m / 3})` : ''),
    type: 'tva',
    taxe: 'tva',
    sigle: 'TVA',
    description:
      regimeTva === 'trimestriel'
        ? `Déclaration TVA du trimestre ${m / 3} ${annee}`
        : 'Déclaration TVA du mois précédent',
    reference: REF_TVA,
    date: iso(m, 15, annee),
    montant_estime: null,
  }))
}

function echeancesIts(annee: number): CalendarEventInput[] {
  return Array.from({ length: 12 }, (_, i) => i + 1).map((m) => ({
    title: 'ITS',
    type: 'its',
    taxe: 'its',
    sigle: 'ITS',
    description: 'Déclaration et paiement ITS des salaires du mois précédent',
    reference: REF_ITS,
    date: iso(m, 10, annee),
    montant_estime: null,
  }))
}

function echeancesCnss(annee: number): CalendarEventInput[] {
  return Array.from({ length: 12 }, (_, i) => i + 1).map((m) => ({
    title: 'CNSS',
    type: 'cnss',
    taxe: 'cnss',
    sigle: 'CNSS',
    description: 'Déclaration et paiement CNSS des salaires du mois précédent',
    reference: REF_CNSS,
    date: iso(m, 15, annee),
    montant_estime: null,
  }))
}

function echeancesIs(annee: number, _secteur: string | null): CalendarEventInput[] {
  const events: CalendarEventInput[] = [
    {
      title: `IS — Clôture ${annee}`,
      type: 'is',
      taxe: 'is',
      sigle: 'IS',
      description: `Déclaration annuelle IS exercice ${annee} — Dépôt avant le 31 mars ${annee + 1}`,
      reference: REF_IS,
      date: iso(3, 31, annee + 1),
      montant_estime: null,
    },
  ]

  ;[3, 6, 9, 12].forEach((m, i) => {
    events.push({
      title: `IS — Acompte T${i + 1}`,
      type: 'is',
      taxe: 'is',
      sigle: 'IS',
      description: `Acompte IS n°${i + 1} exercice ${annee} (30% du reliquat ou 1/4 estimation)`,
      reference: REF_IS,
      date: iso(m, 15, annee),
      montant_estime: null,
    })
  })

  return events
}

function echeancesPatente(annee: number): CalendarEventInput[] {
  return [
    {
      title: 'Patente / TPS',
      type: 'patente',
      taxe: 'tps',
      sigle: 'TPS',
      description: 'Paiement de la Taxe Professionnelle Synthétique (avant le 31 janvier)',
      reference: REF_PATENTE,
      date: iso(1, 31, annee + 1),
      montant_estime: null,
    },
  ]
}

function echeancesTfu(annee: number): CalendarEventInput[] {
  return [
    {
      title: 'TFU',
      type: 'tfu',
      taxe: 'tfu',
      sigle: 'TFU',
      description: 'Taxe Foncière sur les Propriétés Bâties et Non Bâties (avant le 30 juin)',
      reference: REF_TFU,
      date: iso(6, 30, annee),
      montant_estime: null,
    },
  ]
}
