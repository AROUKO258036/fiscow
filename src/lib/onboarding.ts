import { cookies } from 'next/headers'

export interface OnboardingData {
  raison_sociale?: string
  nif?: string
  rccm?: string
  secteur?: string
  date_creation?: string

  regime_tva?: string
  type_entite?: string

  chiffre_affaires?: number
  has_property?: boolean
  sans_salaries?: boolean
  effectif?: number

  employees?: {
    poste: string
    salaire_brut_mensuel: number
  }[]

  has_employees?: boolean
}

const DATA_KEY = 'onboarding_data'
const STEP_KEY = 'onboarding_step'

export async function getOnboardingData(): Promise<OnboardingData> {
  const store = await cookies()

  const raw = store.get(DATA_KEY)?.value

  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw) as OnboardingData
  } catch {
    return {}
  }
}

export async function setOnboardingData(
  data: OnboardingData,
): Promise<void> {
  const store = await cookies()

  store.set(
    DATA_KEY,
    JSON.stringify(data),
    {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    },
  )
}

export async function getOnboardingStep(): Promise<number> {
  const store = await cookies()

  const raw = store.get(STEP_KEY)?.value

  const n = parseInt(raw ?? '1', 10)

  return n >= 1 && n <= 5
    ? n
    : 1
}

export async function setOnboardingStep(
  step: number,
): Promise<void> {
  const store = await cookies()

  store.set(
    STEP_KEY,
    String(step),
    {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    },
  )
}

export async function clearOnboarding(): Promise<void> {
  const store = await cookies()

  store.delete(DATA_KEY)
  store.delete(STEP_KEY)
}