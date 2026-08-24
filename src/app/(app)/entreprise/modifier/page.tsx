import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ModifierForm } from './modifier-form'

export default async function ModifierPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const company = await prisma.company.findFirst({
    where: { userId: Number(session.user.id) },
    include: { employees: { orderBy: { id: 'asc' } } },
  })

  if (!company) redirect('/entreprise/onboarding')

  const postes = await prisma.jobTitle.findMany({
    where: {
      OR: [{ transversal: true }, { secteur: company.secteur }],
    },
    orderBy: { libelle: 'asc' },
    select: { libelle: true },
  })

  const posteLabels = Array.from(new Set(postes.map((p) => p.libelle)))

  const initial = {
    raison_sociale: company.raisonSociale,
    nif: company.nif,
    rccm: company.rccm ?? '',
    telephone: company.telephone ?? '',
    secteur: company.secteur,
    type_entite: company.typeEntite,
    date_creation: company.dateCreation
      ? `${company.dateCreation.getFullYear()}-${String(company.dateCreation.getMonth() + 1).padStart(2, '0')}-${String(company.dateCreation.getDate()).padStart(2, '0')}`
      : '',
    chiffre_affaires:
      company.chiffreAffaires != null
        ? Number(company.chiffreAffaires).toString()
        : '',
    regime_tva: company.regimeTva,
    has_property: company.hasProperty,
    effectif_actif: company.employees.filter((e) => e.isActive).length,
    employees: company.employees.map((e) => ({
      id: e.id,
      poste: e.poste,
      salaire: Number(e.salaireBrutMensuel).toString(),
      is_active: e.isActive,
    })),
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
      <ModifierForm initial={initial} postes={posteLabels} />
    </div>
  )
}