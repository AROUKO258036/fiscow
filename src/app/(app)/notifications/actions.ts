'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { markRead, markAllRead } from '@/lib/notification-service'

async function requireUserId(): Promise<number> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return Number(session.user.id)
}

export async function markReadAction(notificationId: number): Promise<void> {
  const userId = await requireUserId()
  await markRead(userId, notificationId)
}

export async function markAllReadAction(): Promise<void> {
  const userId = await requireUserId()
  await markAllRead(userId)
}
