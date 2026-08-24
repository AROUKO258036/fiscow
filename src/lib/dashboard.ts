import { prisma } from '@/lib/prisma'
import { generateRaw, estimateMontant, type CompanyForCalendar } from '@/lib/fiscalite/calendar'
import { getApplicableKeys, type CompanyForTaxes } from '@/lib/company'

export interface CompanyForDashboard extends CompanyForCalendar, CompanyForTaxes {
  effectif: number
  chiffre_affaires: number | null
  activeEmployees?: { salaire_brut_mensuel: bigint | number }[]
}

export async function ensureEvents(
  company: { id: number } & CompanyForCalendar,
  applicableKeys: string[] | null = null,
): Promise<void> {
  const annee = new Date().getFullYear()

  const existing = await prisma.calendarEvent.count({
    where: {
      companyId: company.id,
      eventDate: { gte: new Date(annee, 0, 1), lt: new Date(annee + 1, 0, 1) },
    },
  })

  if (existing > 0) return

  const events = generateRaw(company, applicableKeys)

  for (const event of events) {
    const montant =
      event.montant_estime ?? (await estimateMontant(company, event.type, event.title))
    await prisma.calendarEvent.create({
      data: {
        companyId: company.id,
        title: event.title,
        type: event.type,
        eventDate: new Date(`${event.date}T00:00:00`),
        description: event.description,
        reference: event.reference,
        montantEstime: montant,
        status: 'pending',
      },
    })
  }
}

export async function getNextDeadline(companyId: number) {
  return prisma.calendarEvent.findFirst({
    where: {
      companyId,
      eventDate: { gte: new Date() },
      status: 'pending',
    },
    orderBy: { eventDate: 'asc' },
  })
}

export async function getPendingCount(companyId: number): Promise<number> {
  const annee = new Date().getFullYear()
  return prisma.calendarEvent.count({
    where: {
      companyId,
      eventDate: { gte: new Date(annee, 0, 1), lt: new Date(annee + 1, 0, 1) },
      status: 'pending',
    },
  })
}

export async function getCompletedCount(companyId: number): Promise<number> {
  const annee = new Date().getFullYear()
  return prisma.calendarEvent.count({
    where: {
      companyId,
      eventDate: { gte: new Date(annee, 0, 1), lt: new Date(annee + 1, 0, 1) },
      status: 'completed',
    },
  })
}

export async function getTotalCount(companyId: number): Promise<number> {
  const annee = new Date().getFullYear()
  return prisma.calendarEvent.count({
    where: {
      companyId,
      eventDate: { gte: new Date(annee, 0, 1), lt: new Date(annee + 1, 0, 1) },
    },
  })
}

export async function getComplianceScore(companyId: number): Promise<number> {
  const total = await getTotalCount(companyId)
  if (total === 0) return 0
  const done = await getCompletedCount(companyId)
  return Math.round((done / total) * 100)
}

export async function getChartData(companyId: number) {
  const annee = new Date().getFullYear()
  const events = await prisma.calendarEvent.findMany({
    where: {
      companyId,
      eventDate: { gte: new Date(annee, 0, 1), lt: new Date(annee + 1, 0, 1) },
    },
    select: { eventDate: true, status: true },
  })

  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  const completed: number[] = Array(12).fill(0)
  const pending: number[] = Array(12).fill(0)

  for (const ev of events) {
    const m = ev.eventDate.getMonth()
    if (ev.status === 'completed') completed[m]++
    else if (ev.status === 'pending') pending[m]++
  }

  return { categories: months, completed, pending }
}

export async function getCompanyForDashboard(companyId: number) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      employees: {
        where: { isActive: true },
        select: { salaireBrutMensuel: true },
      },
    },
  })
  return company
}

export async function buildDashboard(company: {
  id: number
  raisonSociale: string
  typeEntite: string
  chiffreAffaires: { toString(): string } | number | null
  effectif: number
  hasProperty: boolean
  regimeTva: string
  secteur: string | null
  employees: { salaireBrutMensuel: bigint | number }[]
}) {
  const ctx: CompanyForDashboard = {
    id: company.id,
    chiffre_affaires: company.chiffreAffaires != null ? Number(company.chiffreAffaires) : null,
    effectif: company.effectif,
    regime_tva: company.regimeTva,
    secteur: company.secteur,
    has_employees: company.effectif > 0,
    has_property: company.hasProperty,
    type_entite: company.typeEntite,
    activeEmployees: company.employees.map((e) => ({ salaire_brut_mensuel: e.salaireBrutMensuel })),
  }

  const applicableTaxes = getApplicableKeys(ctx)
  await ensureEvents(ctx, applicableTaxes)

  const [deadline, pendingCount, score, chart] = await Promise.all([
    getNextDeadline(company.id),
    getPendingCount(company.id),
    getComplianceScore(company.id),
    getChartData(company.id),
  ])

  return {
    ctx,
    applicableTaxes,
    deadline,
    pendingCount,
    score,
    chart,
  }
}
