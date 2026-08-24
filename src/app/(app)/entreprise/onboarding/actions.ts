'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getOnboardingData,
  setOnboardingData,
  setOnboardingStep,
  clearOnboarding,
} from '@/lib/onboarding'

export interface OnboardingState {
  error?: string
  errors?: Record<string, string>
}

export async function postStepAction(
  step: number,
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const existing = await prisma.company.findFirst({
    where: { userId: Number(session.user.id) },
  })
  if (existing) {
    redirect('/entreprise/configuration')
  }

  const data = await getOnboardingData()
  const errors: Record<string, string> = {}

  if (step === 1) {
    const raison_sociale = String(formData.get('raison_sociale') ?? '').trim()
    const nif = String(formData.get('nif') ?? '').trim()
    const rccm = String(formData.get('rccm') ?? '').trim()
    const secteur = String(formData.get('secteur') ?? '')
    const date_creation = String(formData.get('date_creation') ?? '')

    if (!raison_sociale) errors.raison_sociale = 'Le champ raison sociale est obligatoire.'
    if (!nif) errors.nif = 'Le champ NIF est obligatoire.'
    else if (nif.length > 20) errors.nif = 'Le NIF ne peut pas dépasser 20 caractères.'
    else {
      const dup = await prisma.company.findUnique({ where: { nif } })
      if (dup) errors.nif = 'Ce NIF est déjà utilisé par une autre entreprise.'
    }
    if (rccm.length > 30) errors.rccm = 'Le RCCM ne peut pas dépasser 30 caractères.'
    const secteurs = ['commerce', 'services', 'industrie', 'agriculture', 'transport', 'btp', 'numerique', 'autre']
    if (!secteur) errors.secteur = 'Le secteur est obligatoire.'
    else if (!secteurs.includes(secteur)) errors.secteur = 'Secteur invalide.'

    if (Object.keys(errors).length > 0) return { errors }

    await setOnboardingData({ ...data, raison_sociale, nif, rccm, secteur, date_creation })
  }

  if (step === 2) {
    const regime_tva = String(formData.get('regime_tva') ?? '')
    const type_entite = String(formData.get('type_entite') ?? '')

    if (!['réel', 'simplifié', 'transparent'].includes(regime_tva)) {
      errors.regime_tva = 'Régime TVA invalide.'
    }
    if (!['societe', 'individuelle'].includes(type_entite)) {
      errors.type_entite = 'Type d\'entité invalide.'
    }

    if (Object.keys(errors).length > 0) return { errors }

    await setOnboardingData({ ...data, regime_tva, type_entite })
  }

  if (step === 3) {
    const chiffreRaw = String(formData.get('chiffre_affaires') ?? '').trim()
    const chiffre_affaires = chiffreRaw === '' ? null : Number(chiffreRaw)
    const has_property = formData.get('has_property') === '1'
    const sans_salaries = formData.get('sans_salaries') === '1'

    if (chiffre_affaires != null && (isNaN(chiffre_affaires) || chiffre_affaires < 0)) {
      errors.chiffre_affaires = 'Le chiffre d\'affaires doit être un nombre positif.'
    }
    if (formData.get('has_property') === null) {
      errors.has_property = 'Veuillez répondre.'
    }

    const employees: { poste: string; salaire_brut_mensuel: number }[] = []
    if (!sans_salaries) {
      const keys = new Set<string>()
      for (const key of Array.from(formData.keys())) {
        if (key.startsWith('employees[')) {
          const match = key.match(/employees\[(\d+)\]\[(poste|salaire_brut_mensuel)\]/)
          if (match) keys.add(match[1])
        }
      }
      for (const i of Array.from(keys).sort((a, b) => Number(a) - Number(b))) {
        const poste = String(formData.get(`employees[${i}][poste]`) ?? '').trim()
        const salaireRaw = String(formData.get(`employees[${i}][salaire_brut_mensuel]`) ?? '').trim()
        const salaire = salaireRaw === '' ? 0 : Number(salaireRaw)
        if (poste === '' && salaire === 0) continue
        if (poste === '' && salaire > 0) {
          errors[`employees.${i}.poste`] = 'Le poste est requis si un salaire est saisi.'
          continue
        }
        if (poste !== '' && (isNaN(salaire) || salaire < 0)) {
          errors[`employees.${i}.salaire_brut_mensuel`] = 'Salaire invalide.'
          continue
        }
        employees.push({ poste, salaire_brut_mensuel: salaire })
      }
    }

    if (Object.keys(errors).length > 0) return { errors }

    await setOnboardingData({
      ...data,
      chiffre_affaires: chiffre_affaires ?? undefined,
      has_property,
      sans_salaries,
      effectif: sans_salaries ? 0 : employees.length,
      employees,
    })
  }

  if (step === 4) {
    const full = {
      ...data,
      has_employees: (data.effectif ?? 0) > 0,
      has_property: (data.has_property ?? false),
    }

    const company = await prisma.company.create({
      data: {
        userId: Number(session.user.id),
        raisonSociale: full.raison_sociale ?? '',
        nif: full.nif ?? '',
        rccm: full.rccm ?? null,
        secteur: full.secteur ?? '',
        dateCreation: full.date_creation ? new Date(full.date_creation) : null,
        effectif: full.effectif ?? 0,
        chiffreAffaires: full.chiffre_affaires ?? null,
        regimeTva: full.regime_tva ?? 'simplifié',
        typeEntite: full.type_entite ?? 'individuelle',
        hasProperty: full.has_property,
        hasEmployees: full.has_employees,
      },
    })

    if (full.employees && full.employees.length > 0) {
      for (const emp of full.employees) {
        await prisma.employee.create({
          data: {
            companyId: company.id,
            nom: null,
            poste: emp.poste,
            salaireBrutMensuel: BigInt(emp.salaire_brut_mensuel ?? 0),
            isActive: true,
          },
        })
      }
    }

    await clearOnboarding()
    redirect('/entreprise/configuration?status=entreprise-mise-a-jour')
  }

  await setOnboardingStep(step + 1)
  redirect(`/entreprise/onboarding/${step + 1}`)
}
