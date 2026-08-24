import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOnboardingData } from '@/lib/onboarding'
import { OnboardingShell } from '../onboarding-shell'
import { Step3Form } from '../step3-form'

export default async function Step3Page() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const company = await prisma.company.findFirst({ where: { userId: Number(session.user.id) } })
  if (company) redirect('/entreprise/configuration')

  const data = await getOnboardingData()

  const jobTitles = await prisma.jobTitle.findMany({
    where: {
      OR: [{ transversal: true }, ...(data.secteur ? [{ secteur: data.secteur }] : [])],
    },
    orderBy: { libelle: 'asc' },
    select: { id: true, libelle: true },
  })

  const seen = new Set<string>()
  const jobTitleOptions = jobTitles
    .filter((j) => {
      if (seen.has(j.libelle)) return false
      seen.add(j.libelle)
      return true
    })
    .map((j) => ({ id: String(j.id), libelle: j.libelle }))

  return (
    <OnboardingShell step={3} title="Informations financières">
      <Step3Form initial={data} jobTitles={jobTitleOptions} />
    </OnboardingShell>
  )
}
