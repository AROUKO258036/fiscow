import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { VerifyEmailForm } from '@/components/auth/verify-email-form'

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (token) {
    const record = await prisma.verificationToken.findUnique({ where: { token } })

    if (record && record.expires >= new Date()) {
      await prisma.$transaction([
        prisma.user.update({
          where: { email: record.email },
          data: { emailVerifiedAt: new Date() },
        }),
        prisma.verificationToken.deleteMany({
          where: { email: record.email },
        }),
      ])

      const session = await auth()
      redirect(session?.user ? '/dashboard' : '/login?verified=1')
    }
  }

  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { emailVerifiedAt: true },
  })

  if (user?.emailVerifiedAt) redirect('/dashboard')

  return (
    <>
      <div className="fiscow-auth-heading">
        <h1>Vérifiez votre adresse email</h1>
        <p>Avant de commencer, confirmez votre adresse email avec le lien que nous vous avons envoyé.</p>
      </div>

      <VerifyEmailForm invalid={!!token} />
    </>
  )
}
