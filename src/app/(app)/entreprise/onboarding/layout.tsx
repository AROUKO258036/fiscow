import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const isDevelopment =
    process.env.NODE_ENV === 'development'

  const company = await prisma.company.findFirst({
    where: {
      userId: Number(session.user.id),
    },
  })

  /*
   * En production :
   * un utilisateur qui a déjà terminé son onboarding
   * est redirigé normalement.
   *
   * En développement :
   * on autorise toujours l'accès à l'onboarding
   * pour travailler sur l'interface.
   */
  if (company && !isDevelopment) {
    redirect('/entreprise/configuration')
  }

  return (
    <div className="fiscow-onboarding-route">
      {children}
    </div>
  )
}