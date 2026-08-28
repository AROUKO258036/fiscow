import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOnboardingData } from '@/lib/onboarding'

import { OnboardingShell } from '../onboarding-shell'
import { Step4Form } from '../step4-form'

export default async function Step4Page() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const isDevelopment =
    process.env.NODE_ENV === 'development'

  const company =
    await prisma.company.findFirst({
      where: {
        userId:
          Number(session.user.id),
      },
    })

  /*
   * Production :
   * un utilisateur déjà configuré
   * ne recommence pas l'onboarding.
   *
   * Développement :
   * on peut revoir l'écran.
   */

  if (
    company &&
    !isDevelopment
  ) {
    redirect('/entreprise/configuration')
  }

  const data =
    await getOnboardingData()

  const fmt =
    new Intl.NumberFormat('fr-FR')

  const chiffreAffairesLabel =
    data.chiffre_affaires != null
      ? `${fmt.format(
          data.chiffre_affaires,
        )} FCFA`
      : 'Non renseigné'

  return (
    <OnboardingShell
      step={4}
      title="Récapitulatif"
    >
      <Step4Form
        data={data}
        typeEntiteLabel={
          data.type_entite === 'societe'
            ? 'Société (IS)'
            : 'Entreprise individuelle (IBA)'
        }
        chiffreAffairesLabel={
          chiffreAffairesLabel
        }
      />
    </OnboardingShell>
  )
}