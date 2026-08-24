import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function requireAdmin(): Promise<{ id: number; name: string; email: string }> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { id: true, name: true, email: true, role: true },
  })
  if (!user) redirect('/login')
  if (user.role !== 'ADMIN') redirect('/dashboard')

  return user
}
