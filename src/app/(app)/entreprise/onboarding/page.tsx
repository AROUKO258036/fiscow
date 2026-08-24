import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOnboardingStep } from '@/lib/onboarding'

export default async function OnboardingRedirect() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const company = await prisma.company.findFirst({
    where: { userId: Number(session.user.id) },
  })

  if (company) {
    redirect('/entreprise/configuration')
  }

  const step = await getOnboardingStep()
  redirect(`/entreprise/onboarding/${step}`)
}
