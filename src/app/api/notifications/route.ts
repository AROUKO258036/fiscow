import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getNotifications, countUnread } from '@/lib/notification-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = Number(session.user.id)
  const [notifications, unread] = await Promise.all([
    getNotifications(userId, 8).catch(() => []),
    countUnread(userId).catch(() => 0),
  ])
  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt?.toISOString() ?? null,
    })),
    unread,
  })
}
