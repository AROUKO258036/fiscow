import { prisma } from '@/lib/prisma'

export type NotificationInput = {
  userId: number
  type: string
  title: string
  message: string
  link?: string
  key?: string
}

export async function notifyUser(input: NotificationInput): Promise<void> {
  await prisma.notification.create({ data: input })
}

export async function createNotificationIfAbsent(input: NotificationInput): Promise<boolean> {
  if (input.key) {
    const existing = await prisma.notification.findUnique({
      where: { userId_key: { userId: input.userId, key: input.key } },
    })
    if (existing) return false
  }
  await prisma.notification.create({ data: input })
  return true
}

export async function getNotifications(userId: number, limit = 8) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function countUnread(userId: number): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } })
}

export async function markAllRead(userId: number): Promise<void> {
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } })
}

export async function markRead(userId: number, notificationId: number): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  })
}

export async function purgeNotifications(userId: number): Promise<void> {
  await prisma.notification.deleteMany({ where: { userId } })
}
