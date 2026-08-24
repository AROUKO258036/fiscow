import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getApplicableTaxes } from '@/lib/company'
import { TermeExplicable } from '@/components/app/terme-explicable'
import styles from './calculateurs.module.css'

const ALL_CALCULATEURS: Record<
  string,
  {
    href: string
    icon: string
    desc: string
    accent: string
    meta: string
  }
> = {
  is: {
    href: '/calculateurs/is',
    icon: 'ti ti-building-bank',
    desc: 'Estimez l’impôt sur les sociétés selon votre bénéfice imposable.',
    accent: 'orange',
    meta: '25 % à 30 %',
  },
  tva: {
    href: '/calculateurs/tva',
    icon: 'ti ti-arrows-exchange',
    desc: 'Calculez la TVA collectée, déductible et le montant net à reverser.',
    accent: 'blue',
    meta: 'Taux 18 %',
  },
  its: {
    href: '/calculateurs/its',
    icon: 'ti ti-users',
    desc: 'Estimez l’impôt mensuel sur les traitements et salaires.',
    accent: 'amber',
    meta: 'Barème progressif',
  },
  cnss: {
    href: '/calculateurs/cnss',
    icon: 'ti ti-shield-check',
    desc: 'Calculez les cotisations sociales patronales et salariales.',
    accent: 'green',
    meta: 'Cotisations sociales',
  },
  tps: {
    href: '/calculateurs/patente',
    icon: 'ti ti-certificate',
    desc: 'Estimez la Taxe Professionnelle Synthétique selon votre chiffre d’affaires.',
    accent: 'violet',
    meta: '1,5 % du CA',
  },
  tfu: {
    href: '/calculateurs/tfu',
    icon: 'ti ti-home',
    desc: 'Estimez votre taxe foncière à partir de la valeur locative du bien.',
    accent: 'rose',
    meta: '5 % à 6 %',
  },
}

function accentClass(accent: string) {
  if (accent === 'blue') return styles.blue
  if (accent === 'amber') return styles.amber
  if (accent === 'green') return styles.green
  if (accent === 'violet') return styles.violet
  if (accent === 'rose') return styles.rose
  return styles.orange
}

export default async function CalculateursIndexPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    include: { companies: { orderBy: { createdAt: 'asc' }, take: 1 } },
  })

  if (!user) redirect('/login')

  const company = user.companies[0]
  if (!company) redirect('/entreprise/onboarding')

  const applicableTaxes = getApplicableTaxes({
    type_entite: company.typeEntite,
    chiffre_affaires:
      company.chiffreAffaires != null ? Number(company.chiffreAffaires) : null,
    effectif: company.effectif,
    has_property: company.hasProperty,
    regime_tva: company.regimeTva,
  })

  const shown = applicableTaxes
    .map((tax) => ({
      tax,
      calc:
        ALL_CALCULATEURS[tax.key] ??
        (tax.key === 'tps' ? ALL_CALCULATEURS.tps : null),
    }))
    .filter(
      (
        x,
      ): x is {
        tax: (typeof applicableTaxes)[number]
        calc: (typeof ALL_CALCULATEURS)[string]
      } => !!x.calc,
    )

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Outils Fiscow</span>
          <h1>Calculateurs fiscaux</h1>
          <p>
            Estimez rapidement vos principaux impôts et cotisations à partir
            des informations de votre entreprise.
          </p>
        </div>

        <div className={styles.companyPill}>
          <i className="ti ti-building" />
          {company.raisonSociale}
        </div>
      </div>

      <div className={styles.infoBanner}>
        <span className={styles.infoIcon}>
          <i className="ti ti-sparkles" />
        </span>

        <div>
          <strong>Calculateurs adaptés à votre entreprise</strong>
          <p>
            Fiscow affiche uniquement les calculateurs correspondant à votre
            configuration fiscale actuelle.
          </p>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className={styles.empty}>
          <span>
            <i className="ti ti-calculator-off" />
          </span>
          <strong>Aucun calculateur disponible</strong>
          <p>
            Aucun calculateur ne correspond actuellement au profil fiscal de
            votre entreprise.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {shown.map(({ tax, calc }) => (
            <Link
              href={calc.href}
              key={tax.key}
              className={`${styles.calcCard} ${accentClass(calc.accent)}`}
            >
              <div className={styles.cardTop}>
                <span className={styles.calcIcon}>
                  <i className={calc.icon} />
                </span>

                <span className={styles.arrow}>
                  <i className="ti ti-arrow-up-right" />
                </span>
              </div>

              <div className={styles.calcContent}>
                <span className={styles.meta}>{calc.meta}</span>

                <h2>
                  <TermeExplicable term={tax.key} text={tax.sigle} />
                </h2>

                <p>{calc.desc}</p>
              </div>

              <div className={styles.cardFoot}>
                <span>Ouvrir le calculateur</span>
                <i className="ti ti-chevron-right" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}