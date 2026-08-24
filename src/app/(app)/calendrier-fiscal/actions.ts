'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCalendarEvents, markEventDone } from '@/lib/calendar-service'

export async function getEventsAction(annee: number) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    include: { companies: { orderBy: { createdAt: 'asc' }, take: 1 } },
  })
  const company = user?.companies[0]
  if (!company) return []
  return getCalendarEvents(company.id, annee)
}

export async function markDoneAction(eventId: number) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    include: { companies: { orderBy: { createdAt: 'asc' }, take: 1 } },
  })
  const company = user?.companies[0]
  if (!company) return { success: false, message: 'Entreprise introuvable' }

  const result = await markEventDone(company.id, eventId)
  revalidatePath('/calendrier-fiscal')
  revalidatePath('/dashboard')
  revalidatePath('/declarations')
  return result
}
