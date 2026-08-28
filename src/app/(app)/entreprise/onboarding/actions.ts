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

function toPositiveNumber(
  value: FormDataEntryValue | null,
): number {
  const raw = String(value ?? '').trim()

  if (raw === '') {
    return 0
  }

  const parsed = Number(raw)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return -1
  }

  return parsed
}

export async function postStepAction(
  step: number,
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userId = Number(session.user.id)

  const data = await getOnboardingData()

  const errors: Record<string, string> = {}

  /* =========================================================
     ÉTAPE 1 — IDENTITÉ
     ========================================================= */

  if (step === 1) {
    const raison_sociale =
      String(formData.get('raison_sociale') ?? '').trim()

    const nif =
      String(formData.get('nif') ?? '').trim()

    const rccm =
      String(formData.get('rccm') ?? '').trim()

    const secteur =
      String(formData.get('secteur') ?? '')

    const date_creation =
      String(formData.get('date_creation') ?? '')

    if (!raison_sociale) {
      errors.raison_sociale =
        'Le champ raison sociale est obligatoire.'
    }

    if (!nif) {
      errors.nif =
        'Le champ NIF est obligatoire.'
    } else if (nif.length > 20) {
      errors.nif =
        'Le NIF ne peut pas dépasser 20 caractères.'
    } else {
      const duplicate =
        await prisma.company.findUnique({
          where: { nif },
        })

      if (duplicate) {
        errors.nif =
          'Ce NIF est déjà utilisé par une autre entreprise.'
      }
    }

    if (rccm.length > 30) {
      errors.rccm =
        'Le RCCM ne peut pas dépasser 30 caractères.'
    }

    const secteurs = [
      'commerce',
      'services',
      'industrie',
      'agriculture',
      'transport',
      'btp',
      'numerique',
      'autre',
    ]

    if (!secteur) {
      errors.secteur =
        'Le secteur est obligatoire.'
    } else if (!secteurs.includes(secteur)) {
      errors.secteur =
        'Secteur invalide.'
    }

    if (Object.keys(errors).length > 0) {
      return { errors }
    }

    await setOnboardingData({
      ...data,
      raison_sociale,
      nif,
      rccm,
      secteur,
      date_creation,
    })

    await setOnboardingStep(2)

    redirect('/entreprise/onboarding/2')
  }

  /* =========================================================
     ÉTAPE 2 — RÉGIME FISCAL
     ========================================================= */

  if (step === 2) {
    const regime_tva =
      String(formData.get('regime_tva') ?? '')

    const type_entite =
      String(formData.get('type_entite') ?? '')

    if (
      ![
        'réel',
        'simplifié',
        'transparent',
      ].includes(regime_tva)
    ) {
      errors.regime_tva =
        'Régime TVA invalide.'
    }

    if (
      ![
        'societe',
        'individuelle',
      ].includes(type_entite)
    ) {
      errors.type_entite =
        "Type d'entité invalide."
    }

    if (Object.keys(errors).length > 0) {
      return { errors }
    }

    await setOnboardingData({
      ...data,
      regime_tva,
      type_entite,
    })

    await setOnboardingStep(3)

    redirect('/entreprise/onboarding/3')
  }

  /* =========================================================
     ÉTAPE 3 — ACTIVITÉ / SALARIÉS
     ========================================================= */

  if (step === 3) {
    const chiffreRaw =
      String(
        formData.get('chiffre_affaires') ?? '',
      ).trim()

    const chiffre_affaires =
      chiffreRaw === ''
        ? null
        : Number(chiffreRaw)

    const has_property =
      formData.get('has_property') === '1'

    const sans_salaries =
      formData.get('sans_salaries') === '1'

    if (
      chiffre_affaires != null &&
      (
        Number.isNaN(chiffre_affaires) ||
        chiffre_affaires < 0
      )
    ) {
      errors.chiffre_affaires =
        "Le chiffre d'affaires doit être un nombre positif."
    }

    if (formData.get('has_property') === null) {
      errors.has_property =
        'Veuillez répondre.'
    }

    const employees: {
      poste: string
      salaire_brut_mensuel: number
    }[] = []

    if (!sans_salaries) {
      const keys = new Set<string>()

      for (const key of Array.from(formData.keys())) {
        if (key.startsWith('employees[')) {
          const match =
            key.match(
              /employees\[(\d+)\]\[(poste|salaire_brut_mensuel)\]/,
            )

          if (match) {
            keys.add(match[1])
          }
        }
      }

      for (
        const i of
        Array.from(keys).sort(
          (a, b) => Number(a) - Number(b),
        )
      ) {
        const poste =
          String(
            formData.get(
              `employees[${i}][poste]`,
            ) ?? '',
          ).trim()

        const salaireRaw =
          String(
            formData.get(
              `employees[${i}][salaire_brut_mensuel]`,
            ) ?? '',
          ).trim()

        const salaire =
          salaireRaw === ''
            ? 0
            : Number(salaireRaw)

        if (
          poste === '' &&
          salaire === 0
        ) {
          continue
        }

        if (
          poste === '' &&
          salaire > 0
        ) {
          errors[
            `employees.${i}.poste`
          ] =
            'Le poste est requis si un salaire est saisi.'

          continue
        }

        if (
          poste !== '' &&
          (
            Number.isNaN(salaire) ||
            salaire < 0
          )
        ) {
          errors[
            `employees.${i}.salaire_brut_mensuel`
          ] =
            'Salaire invalide.'

          continue
        }

        employees.push({
          poste,
          salaire_brut_mensuel: salaire,
        })
      }
    }

    if (Object.keys(errors).length > 0) {
      return { errors }
    }

    await setOnboardingData({
      ...data,

      chiffre_affaires:
        chiffre_affaires ?? undefined,

      has_property,

      sans_salaries,

      effectif:
        sans_salaries
          ? 0
          : employees.length,

      employees,
    })

    await setOnboardingStep(4)

    redirect('/entreprise/onboarding/4')
  }

  /* =========================================================
     ÉTAPE 4 — RÉCAPITULATIF
     ========================================================= */

  if (step === 4) {
    await setOnboardingStep(5)

    redirect('/entreprise/onboarding/5')
  }

  /* =========================================================
     ÉTAPE 5 — DONNÉES FINANCIÈRES
     ========================================================= */

  if (step === 5) {
    const periode =
      String(
        formData.get('periode') ?? '',
      ).trim()

    const ventesHT =
      toPositiveNumber(
        formData.get('ventes_ht'),
      )

    const achatsHT =
      toPositiveNumber(
        formData.get('achats_ht'),
      )

    const masseSalariale =
      toPositiveNumber(
        formData.get('masse_salariale'),
      )

    const chargesDeductibles =
      toPositiveNumber(
        formData.get('charges_deductibles'),
      )

    const tvaCollectee =
      toPositiveNumber(
        formData.get('tva_collectee'),
      )

    const tvaDeductible =
      toPositiveNumber(
        formData.get('tva_deductible'),
      )

    if (!periode) {
      return {
        error:
          'Veuillez sélectionner le mois concerné.',
      }
    }

    const amounts = [
      ventesHT,
      achatsHT,
      masseSalariale,
      chargesDeductibles,
      tvaCollectee,
      tvaDeductible,
    ]

    if (
      amounts.some(
        (value) => value < 0,
      )
    ) {
      return {
        error:
          'Les montants doivent être des nombres positifs.',
      }
    }

    /*
     * CAS 1 :
     * entreprise déjà existante.
     *
     * C'est TON cas actuellement.
     * On ne recrée pas l'entreprise.
     * On ajoute seulement les déclarations.
     */

    let company =
      await prisma.company.findFirst({
        where: {
          userId,
        },
      })

    /*
     * CAS 2 :
     * nouveau compte.
     *
     * On crée l'entreprise depuis les données onboarding.
     */

    if (!company) {
      const full = {
        ...data,

        has_employees:
          (data.effectif ?? 0) > 0,

        has_property:
          data.has_property ?? false,
      }

      company =
        await prisma.company.create({
          data: {
            userId,

            raisonSociale:
              full.raison_sociale ?? '',

            nif:
              full.nif ?? '',

            rccm:
              full.rccm || null,

            secteur:
              full.secteur ?? '',

            dateCreation:
              full.date_creation
                ? new Date(
                    full.date_creation,
                  )
                : null,

            effectif:
              full.effectif ?? 0,

            chiffreAffaires:
              full.chiffre_affaires ?? null,

            regimeTva:
              full.regime_tva ?? 'simplifié',

            typeEntite:
              full.type_entite ?? 'individuelle',

            hasProperty:
              full.has_property,

            hasEmployees:
              full.has_employees,
          },
        })

      if (
        full.employees &&
        full.employees.length > 0
      ) {
        for (
          const employee of
          full.employees
        ) {
          await prisma.employee.create({
            data: {
              companyId:
                company.id,

              nom:
                null,

              poste:
                employee.poste,

              salaireBrutMensuel:
                BigInt(
                  employee.salaire_brut_mensuel ??
                    0,
                ),

              isActive:
                true,
            },
          })
        }
      }
    }

    /*
     * On supprime les anciennes déclarations
     * brouillon de cette période pour éviter
     * les doublons lors des tests.
     */

    await prisma.declaration.deleteMany({
      where: {
        companyId: company.id,
        periode,
        status: 'draft',
      },
    })

    const dueDate = new Date()

    dueDate.setDate(
      dueDate.getDate() + 30,
    )

    /*
     * TVA
     */

    if (
      company.regimeTva !==
      'transparent'
    ) {
      const tvaDue =
        Math.max(
          0,
          tvaCollectee -
            tvaDeductible,
        )

      await prisma.declaration.create({
        data: {
          companyId:
            company.id,

          type:
            'tva',

          periode,

          amountDue:
            tvaDue,

          amountPaid:
            0,

          status:
            'draft',

          dueDate,

          notes:
            `Ventes HT: ${ventesHT}; Achats HT: ${achatsHT}; TVA collectée: ${tvaCollectee}; TVA déductible: ${tvaDeductible}`,
        },
      })
    }

    /*
     * ITS + CNSS
     */

    if (
      company.hasEmployees ||
      masseSalariale > 0
    ) {
      await prisma.declaration.create({
        data: {
          companyId:
            company.id,

          type:
            'its',

          periode,

          amountDue:
            0,

          amountPaid:
            0,

          status:
            'draft',

          dueDate,

          notes:
            `Masse salariale brute: ${masseSalariale}`,
        },
      })

      await prisma.declaration.create({
        data: {
          companyId:
            company.id,

          type:
            'cnss',

          periode,

          amountDue:
            0,

          amountPaid:
            0,

          status:
            'draft',

          dueDate,

          notes:
            `Masse salariale brute: ${masseSalariale}`,
        },
      })
    }

    /*
     * IS / IBA
     */

    const annualType =
      company.typeEntite === 'societe'
        ? 'is'
        : 'iba'

    const year =
      periode.slice(0, 4)

    const existingAnnual =
      await prisma.declaration.findFirst({
        where: {
          companyId:
            company.id,

          type:
            annualType,

          periode:
            year,

          status: {
            not:
              'cancelled',
          },
        },
      })

    if (!existingAnnual) {
      await prisma.declaration.create({
        data: {
          companyId:
            company.id,

          type:
            annualType,

          periode:
            year,

          amountDue:
            0,

          amountPaid:
            0,

          status:
            'draft',

          dueDate,

          notes:
            `Ventes HT: ${ventesHT}; Achats HT: ${achatsHT}; Charges déductibles: ${chargesDeductibles}`,
        },
      })
    }

    await clearOnboarding()

    redirect('/dashboard')
  }

  return {
    error:
      'Étape onboarding invalide.',
  }
}