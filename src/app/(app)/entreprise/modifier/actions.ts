'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { estimateSalaires, type CompanyForCalendar } from '@/lib/fiscalite'

export interface UpdateCompanyState {
  error?: string
  errors?: Record<string, string>
}

const SECTEURS = ['commerce', 'services', 'industrie', 'agriculture', 'transport', 'btp', 'numerique', 'autre']
const REGIMES = ['réel', 'simplifié', 'transparent']
const ENTITES = ['societe', 'individuelle']

function buildCompanyForCalendar(c: {
  id: number
  chiffreAffaires: unknown
  effectif: number
  regimeTva: string
  secteur: string
  hasEmployees: boolean
  hasProperty: boolean
  typeEntite: string
  employees: { salaireBrutMensuel: bigint | number }[]
}): CompanyForCalendar {
  return {
    id: c.id,
    chiffre_affaires: c.chiffreAffaires != null ? Number(c.chiffreAffaires) : null,
    effectif: c.effectif,
    regime_tva: c.regimeTva,
    secteur: c.secteur,
    has_employees: c.hasEmployees,
    activeEmployees: c.employees.map((e) => ({ salaire_brut_mensuel: e.salaireBrutMensuel })),
  }
}

export async function updateCompanyAction(
  _prevState: UpdateCompanyState,
  formData: FormData,
): Promise<UpdateCompanyState> {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const company = await prisma.company.findFirst({
    where: { userId: Number(session.user.id) },
  })
  if (!company) redirect('/entreprise/onboarding')

  const errors: Record<string, string> = {}

  const raison_sociale = String(formData.get('raison_sociale') ?? '').trim()
  const nif = String(formData.get('nif') ?? '').trim()
  const rccm = String(formData.get('rccm') ?? '').trim()
  const telephone = String(formData.get('telephone') ?? '').trim()
  const secteur = String(formData.get('secteur') ?? '')
  const type_entite = String(formData.get('type_entite') ?? '')
  const regime_tva = String(formData.get('regime_tva') ?? '')
  const date_creation = String(formData.get('date_creation') ?? '')
  const chiffreRaw = String(formData.get('chiffre_affaires') ?? '').trim()
  const chiffre_affaires = chiffreRaw === '' ? null : Number(chiffreRaw)
  const has_property = formData.get('has_property') === '1'

  if (!raison_sociale) errors.raison_sociale = 'Le champ raison sociale est obligatoire.'
  if (!nif) errors.nif = 'Le champ NIF est obligatoire.'
  else if (nif.length > 20) errors.nif = 'Le NIF ne peut pas dépasser 20 caractères.'
  else {
    const dup = await prisma.company.findFirst({ where: { nif, userId: { not: Number(session.user.id) } } })
    if (dup) errors.nif = 'Ce NIF est déjà utilisé par une autre entreprise.'
  }
  if (rccm.length > 30) errors.rccm = 'Le RCCM ne peut pas dépasser 30 caractères.'
  if (telephone.length > 20) errors.telephone = 'Le téléphone ne peut pas dépasser 20 caractères.'
  if (!secteur) errors.secteur = 'Le secteur est obligatoire.'
  else if (!SECTEURS.includes(secteur)) errors.secteur = 'Secteur invalide.'
  if (!type_entite) errors.type_entite = "Le type d'entité est obligatoire."
  else if (!ENTITES.includes(type_entite)) errors.type_entite = "Type d'entité invalide."
  if (!regime_tva) errors.regime_tva = 'Le régime TVA est obligatoire.'
  else if (!REGIMES.includes(regime_tva)) errors.regime_tva = 'Régime TVA invalide.'
  if (date_creation && isNaN(Date.parse(date_creation))) errors.date_creation = 'Date invalide.'
  if (chiffre_affaires != null && (isNaN(chiffre_affaires) || chiffre_affaires < 0)) {
    errors.chiffre_affaires = 'Le chiffre d\'affaires doit être un nombre positif.'
  }

  const employees: {
    id: number
    poste: string
    salaire: number
    isActive: boolean
    toDelete: boolean
  }[] = []
  const keys = new Set<string>()
  for (const key of Array.from(formData.keys())) {
    if (key.startsWith('employees[')) {
      const match = key.match(/employees\[(\d+)\]\[(id|poste|salaire_brut_mensuel|is_active|to_delete)\]/)
      if (match) keys.add(match[1])
    }
  }
  for (const i of Array.from(keys).sort((a, b) => Number(a) - Number(b))) {
    const id = Number(formData.get(`employees[${i}][id]`) ?? 0)
    const poste = String(formData.get(`employees[${i}][poste]`) ?? '').trim()
    const salaireRaw = String(formData.get(`employees[${i}][salaire_brut_mensuel]`) ?? '').trim()
    const toDelete = formData.get(`employees[${i}][to_delete]`) === '1'
    const isActive = formData.get(`employees[${i}][is_active]`) === '1'
    const salaire = salaireRaw === '' ? 0 : Number(salaireRaw)

    if (toDelete) {
      employees.push({ id, poste: '', salaire: 0, isActive: false, toDelete: true })
      continue
    }
    if (poste === '' && salaireRaw === '') {
      if (id) employees.push({ id, poste: '', salaire: 0, isActive: false, toDelete: true })
      continue
    }
    if (poste === '' && salaire > 0) {
      errors[`employees.${i}.poste`] = 'Le poste est requis si un salaire est saisi.'
      continue
    }
    if (poste !== '' && (isNaN(salaire) || salaire < 0)) {
      errors[`employees.${i}.salaire_brut_mensuel`] = 'Salaire invalide.'
      continue
    }
    employees.push({ id, poste, salaire, isActive, toDelete: false })
  }

  if (Object.keys(errors).length > 0) return { errors }

  await prisma.company.update({
    where: { id: company.id },
    data: {
      raisonSociale: raison_sociale,
      nif,
      rccm: rccm || null,
      telephone: telephone || null,
      secteur,
      typeEntite: type_entite,
      regimeTva: regime_tva,
      dateCreation: date_creation ? new Date(date_creation) : null,
      chiffreAffaires: chiffre_affaires,
      hasProperty: has_property,
    },
  })

  const current = await prisma.employee.findMany({ where: { companyId: company.id } })
  const currentById = new Map(current.map((e) => [e.id, e]))
  const keptIds = new Set<number>()

  for (const emp of employees) {
    if (emp.toDelete) {
      if (emp.id) await prisma.employee.deleteMany({ where: { id: emp.id, companyId: company.id } })
      continue
    }
    if (emp.id && currentById.has(emp.id)) {
      await prisma.employee.update({
        where: { id: emp.id },
        data: {
          poste: emp.poste,
          salaireBrutMensuel: BigInt(emp.salaire),
          isActive: emp.isActive,
        },
      })
      keptIds.add(emp.id)
    } else {
      const created = await prisma.employee.create({
        data: {
          companyId: company.id,
          nom: null,
          poste: emp.poste,
          salaireBrutMensuel: BigInt(emp.salaire),
          isActive: true,
        },
      })
      keptIds.add(created.id)
    }
  }

  const activeCount = await prisma.employee.count({
    where: { companyId: company.id, isActive: true },
  })

  await prisma.company.update({
    where: { id: company.id },
    data: { effectif: activeCount, hasEmployees: activeCount > 0 },
  })

  // Recalcule les estimations ITS/CNSS des échéances en attente de l'année en cours
  const updated = await prisma.company.findUnique({
    where: { id: company.id },
    include: { employees: { select: { salaireBrutMensuel: true, isActive: true } } },
  })
  if (updated) {
    const companyLike = buildCompanyForCalendar(updated)
    const year = new Date().getFullYear()
    const start = new Date(`${year}-01-01T00:00:00`)
    const end = new Date(`${year + 1}-01-01T00:00:00`)
    const pending = await prisma.calendarEvent.findMany({
      where: {
        companyId: company.id,
        status: 'pending',
        eventDate: { gte: start, lt: end },
        type: { in: ['its', 'cnss'] },
      },
    })
    for (const event of pending) {
      const estimate = await estimateSalaires(companyLike, event.type)
      if (estimate != null) {
        await prisma.calendarEvent.update({
          where: { id: event.id },
          data: { montantEstime: estimate },
        })
      }
    }
  }

  redirect('/entreprise/configuration?status=entreprise-mise-a-jour')
}
