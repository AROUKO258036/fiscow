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

  const company = await prisma.company.findFirst({
    where: {
      userId: Number(session.user.id),
    },
  })

  if (company) {
    redirect('/entreprise/configuration')
  }

  return (
    <div className="fiscow-onboarding-route">
      {children}
    </div>
  )
}