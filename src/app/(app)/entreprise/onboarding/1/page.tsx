import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOnboardingData } from '@/lib/onboarding'
import { OnboardingShell } from '../onboarding-shell'
import { Step1Form } from '../step1-form'

export default async function Step1Page() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const company = await prisma.company.findFirst({ where: { userId: Number(session.user.id) } })
  if (company) redirect('/entreprise/configuration')

  const data = await getOnboardingData()

  return (
    <OnboardingShell step={1} title="Identité de l'entreprise">
      <Step1Form initial={data} />
    </OnboardingShell>
  )
}