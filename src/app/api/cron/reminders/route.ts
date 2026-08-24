import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReminderEmail } from '@/lib/email'
import { createNotificationIfAbsent } from '@/lib/notification-service'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const REMINDER_DAYS = [7, 3, 1]

function localMidnight(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = localMidnight()
  const reminders: {
    user: { id: number; name: string; email: string }
    company: { raisonSociale: string }
    days: number
    events: { title: string; date: string; montant: string }[]
  }[] = []

  const users = await prisma.user.findMany({
    where: { companies: { some: {} } },
    include: {
      companies: { orderBy: { createdAt: 'asc' }, take: 1 },
    },
  })

  for (const user of users) {
    const company = user.companies[0]
    if (!company) continue

    for (const days of REMINDER_DAYS) {
      const target = new Date(today)
      target.setDate(target.getDate() + days)

      const events = await prisma.calendarEvent.findMany({
        where: {
          companyId: company.id,
          status: 'pending',
          eventDate: {
            gte: target,
            lt: new Date(target.getFullYear(), target.getMonth(), target.getDate() + 1),
          },
        },
        orderBy: { eventDate: 'asc' },
      })

      if (events.length === 0) continue

      const dayLabel = days === 1 ? 'demain' : `dans ${days} jours`
      const reminderEvents = events.map((e) => ({
        title: e.title,
        date: e.eventDate.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        montant: e.montantEstime != null ? `${Number(e.montantEstime).toLocaleString('fr-FR')} FCFA` : 'À calculer',
      }))

      const typeLabel: Record<string, string> = {
        is: 'IS',
        iba: 'IBA',
        tva: 'TVA',
        its: 'ITS',
        cnss: 'CNSS',
        tps: 'TPS',
        tfu: 'TFU',
      }
      const first = events[0]
      const firstLabel = typeLabel[first.type] ?? first.type.toUpperCase()
      const plural = events.length > 1

      const created = await createNotificationIfAbsent({
        userId: user.id,
        type: `reminder:${days}d`,
        title: `Échéance ${dayLabel}`,
        message: `${plural ? `${events.length} échéances` : `${firstLabel} — ${first.title}`} ${
          plural ? '' : 'fiscale'
        } à venir ${dayLabel} (${firstLabel}${plural ? '…' : ''}).`,
        link: '/calendrier-fiscal',
        key: `reminder:${days}d:${events.map((e) => e.id).sort((a, b) => a - b).join(',')}`,
      })

      if (created) {
        reminders.push({
          user: { id: user.id, name: user.name, email: user.email },
          company: { raisonSociale: company.raisonSociale },
          days,
          events: reminderEvents,
        })
      }
    }
  }

  let emailsSent = 0
  for (const r of reminders) {
    await sendReminderEmail(r.user.email, r.company.raisonSociale, r.events).catch(() => {})
    emailsSent += 1
  }

  return NextResponse.json({ ok: true, notifications: reminders.length, emails: emailsSent })
}
