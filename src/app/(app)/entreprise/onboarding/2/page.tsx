import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOnboardingData } from '@/lib/onboarding'
import { OnboardingShell } from '../onboarding-shell'
import { Step2Form } from '../step2-form'

export default async function Step2Page() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const company = await prisma.company.findFirst({ where: { userId: Number(session.user.id) } })
  if (company) redirect('/entreprise/configuration')

  const data = await getOnboardingData()

  return (
    <OnboardingShell step={2} title="Régimes fiscaux">
      <Step2Form initial={data} />
    </OnboardingShell>
  )
}
