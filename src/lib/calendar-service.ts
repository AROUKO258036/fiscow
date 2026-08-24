import { prisma } from '@/lib/prisma'
import { getApplicableKeys } from '@/lib/company'
import { generateRaw, estimateMontant } from '@/lib/fiscalite'
import type { CompanyForCalendar } from '@/lib/fiscalite'

function localDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

type CompanyWithEmployees = {
  id: number
  chiffreAffaires: unknown
  effectif: number
  regimeTva: string
  secteur: string
  hasEmployees: boolean
  hasProperty: boolean
  typeEntite: string
  employees: { salaireBrutMensuel: bigint | number }[]
}

function toCalendarCompany(c: CompanyWithEmployees): CompanyForCalendar {
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

export async function ensureCalendarEvents(companyId: number) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { employees: { where: { isActive: true }, select: { salaireBrutMensuel: true } } },
  })
  if (!company) return

  const year = new Date().getFullYear()
  const start = new Date(`${year}-01-01T00:00:00`)
  const end = new Date(`${year + 1}-01-01T00:00:00`)
  const existing = await prisma.calendarEvent.count({ where: { companyId, eventDate: { gte: start, lt: end } } })
  if (existing > 0) return

  const companyLike = toCalendarCompany(company)
  const keys = getApplicableKeys({
    type_entite: company.typeEntite,
    chiffre_affaires: companyLike.chiffre_affaires,
    effectif: company.effectif,
    has_property: company.hasProperty,
    regime_tva: company.regimeTva,
  })
  const raw = generateRaw(companyLike, keys)

  for (const event of raw) {
    const montant = await estimateMontant(companyLike, event.type, event.title)
    await prisma.calendarEvent.create({
      data: {
        companyId,
        title: event.title,
        type: event.type,
        eventDate: new Date(event.date + 'T12:00:00'),
        description: event.description,
        reference: event.reference,
        montantEstime: montant,
        status: 'pending',
      },
    })
  }
}

export async function getCalendarEvents(companyId: number, year: number) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { employees: { where: { isActive: true }, select: { salaireBrutMensuel: true } } },
  })
  if (!company) return []

  const start = new Date(`${year}-01-01T00:00:00`)
  const end = new Date(`${year + 1}-01-01T00:00:00`)

  const events = await prisma.calendarEvent.findMany({
    where: { companyId, eventDate: { gte: start, lt: end } },
    orderBy: { eventDate: 'asc' },
  })

  const companyLike = toCalendarCompany(company)
  const precis = (companyLike.activeEmployees ?? []).some((e) => Number(e.salaire_brut_mensuel) > 0)

  // Backfill : recalcule et sauvegarde les montants manquants (comme Laravel CalendarService::getEvents)
  const backfilled = new Map<number, number | null>()
  const toBackfill = events.filter((e) => e.montantEstime == null)
  for (const e of toBackfill) {
    const montant = await estimateMontant(companyLike, e.type, e.title)
    await prisma.calendarEvent.update({
      where: { id: e.id },
      data: { montantEstime: montant },
    })
    backfilled.set(e.id, montant)
  }

  const classNameMap: Record<string, string> = {
    is: 'fc-event-is',
    tva: 'fc-event-tva',
    its: 'fc-event-its',
    cnss: 'fc-event-cnss',
    patente: 'fc-event-patente',
    tfu: 'fc-event-tfu',
  }

  const result: Array<{
    id: string
    title: string
    start: string
    type: string
    description: string | null
    reference: string | null
    montant_estime: string | null
    statut: string
    precise: boolean | null
    className: string
  }> = []

  for (const e of events) {
    const eff = backfilled.has(e.id) ? backfilled.get(e.id) : e.montantEstime != null ? Number(e.montantEstime) : null
    let montant: string | null = null
    if (eff != null) {
      montant = `${eff.toLocaleString('fr-FR')} FCFA`
    }
    result.push({
      id: String(e.id),
      title: e.title,
      start: localDateString(e.eventDate),
      type: e.type,
      description: e.description,
      reference: e.reference,
      montant_estime: montant,
      statut: e.status,
      precise: e.type === 'its' || e.type === 'cnss' ? precis : null,
      className: classNameMap[e.type] ?? 'fc-event-default',
    })
  }

  return result
}

export async function markEventDone(companyId: number, eventId: number) {
  const event = await prisma.calendarEvent.findUnique({ where: { id: eventId } })
  if (!event || event.companyId !== companyId) return { success: false, message: 'Non autorisé' }

  await prisma.$transaction(async (tx) => {
    await tx.calendarEvent.update({
      where: { id: eventId },
      data: { status: 'completed', completedAt: new Date() },
    })
    const existing = await tx.declaration.findFirst({ where: { calendarEventId: eventId } })
    if (!existing) {
      const periode = derivePeriode(event)
      await tx.declaration.create({
        data: {
          companyId,
          calendarEventId: eventId,
          type: event.type,
          periode,
          amountDue: event.montantEstime ?? 0,
          amountPaid: 0,
          status: 'draft',
          dueDate: event.eventDate,
          filedDate: new Date(),
        },
      })
    }
  })

  return { success: true, message: 'Échéance marquée comme faite' }
}

export async function getNextDeadline(companyId: number) {
  const now = new Date()
  return prisma.calendarEvent.findFirst({
    where: { companyId, eventDate: { gte: now }, status: 'pending' },
    orderBy: { eventDate: 'asc' },
  })
}

export async function getPendingCount(companyId: number) {
  const year = new Date().getFullYear()
  return prisma.calendarEvent.count({
    where: {
      companyId,
      status: 'pending',
      eventDate: { gte: new Date(`${year}-01-01T00:00:00`), lt: new Date(`${year + 1}-01-01T00:00:00`) },
    },
  })
}

export async function getComplianceScore(companyId: number) {
  const year = new Date().getFullYear()
  const [total, done] = await Promise.all([
    prisma.calendarEvent.count({
      where: {
        companyId,
        eventDate: { gte: new Date(`${year}-01-01T00:00:00`), lt: new Date(`${year + 1}-01-01T00:00:00`) },
      },
    }),
    prisma.calendarEvent.count({
      where: {
        companyId,
        status: 'completed',
        eventDate: { gte: new Date(`${year}-01-01T00:00:00`), lt: new Date(`${year + 1}-01-01T00:00:00`) },
      },
    }),
  ])
  if (total === 0) return 0
  return Math.round((done / total) * 100)
}

function derivePeriode(event: { type: string; eventDate: Date; title: string }): string {
  const d = event.eventDate
  const mois = d.getMonth() + 1
  const annee = d.getFullYear()

  switch (event.type) {
    case 'tva':
    case 'its':
    case 'cnss':
      return `${annee}-${String(mois > 1 ? mois - 1 : 12).padStart(2, '0')}`
    case 'is':
      return event.title.includes('Clôture') ? String(annee - 1) : `${annee}-T${String(mois / 3)}`
    case 'patente':
      return String(annee - 1)
    case 'tfu':
      return String(annee)
    default:
      return `${annee}-${String(mois).padStart(2, '0')}`
  }
}
