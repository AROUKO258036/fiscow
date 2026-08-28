import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { getOnboardingData } from '@/lib/onboarding'

import { OnboardingShell } from '../onboarding-shell'
import { Step5Form } from '../step5-form'

export default async function Step5Page() {
  const session =
    await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const data =
    await getOnboardingData()

  return (
    <OnboardingShell
      step={5}
      title="Vos chiffres du mois"
    >
      <Step5Form
        initial={data}
      />
    </OnboardingShell>
  )
}