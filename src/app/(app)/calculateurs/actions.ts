'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { setFlash } from '@/lib/flash'

const VALID_TYPES = ['is', 'tva', 'its', 'cnss', 'patente', 'tfu']

function derivePeriode(type: string): string {
  const now = new Date()
  const mois = now.getMonth() + 1
  const annee = now.getFullYear()

  switch (type) {
    case 'tva':
    case 'its':
    case 'cnss':
      return `${annee}-${String(mois > 1 ? mois - 1 : 12).padStart(2, '0')}`
    case 'is':
    case 'patente':
      return String(annee - 1)
    case 'tfu':
      return String(annee)
    default:
      return `${annee}-${String(mois).padStart(2, '0')}`
  }
}

export async function submitDeclaration(type: string, montant: string, eventId?: string) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  if (!VALID_TYPES.includes(type)) redirect('/calendrier-fiscal')

  const company = await prisma.company.findFirst({
    where: { userId: Number(session.user.id) },
  })
  if (!company) redirect('/entreprise/onboarding')

  const amount = Number(montant)
  if (!Number.isFinite(amount) || amount < 0) {
    await setFlash('error', 'Montant invalide.')
    redirect('/calendrier-fiscal')
  }

  let event: { id: number; companyId: number } | null = null
  if (eventId) {
    const eventIdNum = Number(eventId)
    if (Number.isFinite(eventIdNum) && Number.isInteger(eventIdNum)) {
      event = await prisma.calendarEvent.findUnique({
        where: { id: eventIdNum },
      })
      if (event && event.companyId !== company.id) {
        event = null
      }
    }
  }

  const now = new Date()
  await prisma.$transaction(async (tx) => {
    const created = await tx.declaration.create({
      data: {
        companyId: company.id,
        type,
        periode: derivePeriode(type),
        amountDue: amount,
        amountPaid: 0,
        status: 'draft',
        dueDate: new Date(Date.now() + 30 * 86400_000),
        filedDate: now,
        ...(event ? { calendarEventId: event.id } : {}),
      },
    })

    if (event) {
      await tx.calendarEvent.update({
        where: { id: event.id },
        data: { status: 'completed', completedAt: new Date() },
      })
    }

    return created
  })

  revalidatePath('/calendrier-fiscal')
  revalidatePath('/declarations')

  const typeLabel = type === 'patente' ? 'TPS' : type.toUpperCase()
  await setFlash('success', `Déclaration ${typeLabel} enregistrée avec succès.`)
  redirect('/calendrier-fiscal')
}
