import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  FiscalCalendarClient,
  type FiscalCalendarEvent,
} from './calendar-client'

const TYPE_LABELS: Record<string, string> = {
  is: 'IS — Impôt sur les sociétés',
  iba: 'IBA — Impôt sur les bénéfices d’affaires',
  tva: 'TVA — Déclaration mensuelle',
  its: 'ITS — Impôt sur les traitements',
  cnss: 'CNSS — Déclaration mensuelle',
  tps: 'TPS — Taxe Professionnelle Synthétique',
  tfu: 'TFU — Taxe Foncière Unique',
  patente: 'Patente',
}

function number(value: unknown) {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n : 0
}

export default async function CalendrierFiscalPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    include: {
      companies: {
        orderBy: { createdAt: 'asc' },
        take: 1,
      },
    },
  })

  if (!user) redirect('/login')

  const company = user.companies[0]
  if (!company) redirect('/entreprise/onboarding')

  /*
   * Frontend-first :
   * on utilise uniquement les champs de Declaration déjà utilisés
   * dans le projet. Aucun nouveau modèle Prisma n'est nécessaire.
   */
  const declarations = await prisma.declaration.findMany({
    where: {
      companyId: company.id,
      status: { not: 'cancelled' },
    },
    orderBy: [{ dueDate: 'asc' }, { id: 'asc' }],
  })

  const today = new Date()
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )

  const events: FiscalCalendarEvent[] = declarations.map((declaration) => {
    const amountDue = number(declaration.amountDue)
    const amountPaid = number(declaration.amountPaid)
    const remaining = Math.max(0, amountDue - amountPaid)

    const dueDate = declaration.dueDate
      ? new Date(declaration.dueDate)
      : null

    let state: FiscalCalendarEvent['state'] = 'upcoming'

    if (declaration.status === 'paid' || remaining <= 0) {
      state = 'paid'
    } else if (dueDate && dueDate < todayStart) {
      state = 'overdue'
    } else if (
      dueDate &&
      dueDate.getTime() - todayStart.getTime() <= 30 * 86400000
    ) {
      state = 'due-soon'
    }

    return {
      id: String(declaration.id),
      type: declaration.type,
      title:
        TYPE_LABELS[declaration.type] ??
        declaration.type.toUpperCase(),
      period: declaration.periode,
      dueDate: dueDate ? dueDate.toISOString() : null,
      amountDue,
      amountPaid,
      remaining,
      status: declaration.status,
      state,
    }
  })

  return (
    <FiscalCalendarClient
      events={events}
      companyName={company.raisonSociale}
    />
  )
}