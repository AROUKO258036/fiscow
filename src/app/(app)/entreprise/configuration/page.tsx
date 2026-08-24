import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getApplicableTaxes } from '@/lib/company'
import { PageHeader } from '@/components/app/page-header'

const SECTEUR_LABELS: Record<string, string> = {
  commerce: 'Commerce',
  services: 'Services',
  industrie: 'Industrie',
  agriculture: 'Agriculture',
  transport: 'Transport',
  btp: 'BTP / Construction',
  numerique: 'Numérique / Tech',
  autre: 'Autre',
}

const TAX_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  is: { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-800 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-500/25', dot: 'bg-orange-500' },
  tva: { bg: 'bg-sky-50 dark:bg-sky-500/10', text: 'text-sky-800 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-500/25', dot: 'bg-sky-500' },
  its: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-500/25', dot: 'bg-amber-500' },
  cnss: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-500/25', dot: 'bg-emerald-500' },
  patente: { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-800 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-500/25', dot: 'bg-rose-500' },
  tps: { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-800 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-500/25', dot: 'bg-violet-500' },
  tfu: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-800 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-500/25', dot: 'bg-indigo-500' },
  iba: { bg: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-800 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-500/25', dot: 'bg-slate-500' },
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#EDE7E1] bg-white px-4 py-4 shadow-[0_8px_24px_rgba(23,23,23,0.025)] dark:border-[#5B554E] dark:bg-[#211F1C]">
      <div className="text-[11px] font-medium text-[#8B837C] dark:text-[#AAA39B]">{label}</div>
      <div className="mt-1.5 text-sm font-semibold text-[#171717] dark:text-[#F7F5F2]">{value}</div>
    </div>
  )
}

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#EDE7E1] bg-white shadow-[0_14px_36px_rgba(23,23,23,0.035)] dark:border-[#6B645D] dark:bg-[linear-gradient(145deg,#494742_0%,#302D29_100%)]">
      <div className="flex items-center gap-3 border-b border-[#EFE9E4] bg-[#FFF9F4] px-5 py-4 dark:border-[#625D56] dark:bg-[rgba(33,31,28,0.34)]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF3E6] text-[#FF8A1F]">
          <i className={`${icon} text-lg`} />
        </div>
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#171717] dark:text-white">{title}</h2>
          {description ? <p className="mt-0.5 text-[11px] text-[#7D746D] dark:text-[#BEB6AE]">{description}</p> : null}
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  )
}

export default async function ConfigurationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const company = await prisma.company.findFirst({
    where: { userId: Number(session.user.id) },
    include: { employees: { orderBy: { createdAt: 'asc' } } },
  })

  if (!company) redirect('/entreprise/onboarding')

  const { status } = await searchParams

  const taxes = getApplicableTaxes({
    type_entite: company.typeEntite,
    chiffre_affaires: company.chiffreAffaires != null ? Number(company.chiffreAffaires) : null,
    effectif: company.effectif,
    has_property: company.hasProperty,
    regime_tva: company.regimeTva,
  })

  const fmt = new Intl.NumberFormat('fr-FR')
  const actifs = company.employees.filter((e) => e.isActive)

  const typeEntiteLabel =
    company.typeEntite === 'societe' ? 'Société (IS)' : 'Entreprise individuelle (IBA)'

  const chiffreAffairesLabel =
    company.chiffreAffaires != null
      ? `${fmt.format(Number(company.chiffreAffaires))} FCFA`
      : 'Non renseigné'

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="space-y-5">
        <PageHeader title="Configuration" crumbs={[{ label: 'Configuration entreprise' }]} />

        <div className="flex flex-col gap-4 rounded-[22px] border border-[#EDE7E1] bg-[linear-gradient(135deg,#FFFFFF_0%,#FFF8F2_100%)] px-5 py-5 shadow-[0_12px_36px_rgba(23,23,23,0.035)] sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-[#6B645D] dark:bg-[linear-gradient(145deg,#54524E_0%,#282521_100%)]">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3E6] text-[#FF8A1F]">
              <i className="ti ti-building-estate text-xl" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#FF8A1F]">Entreprise</div>
              <h1 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-[#171717] sm:text-2xl dark:text-white">
                {company.raisonSociale}
              </h1>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-[#756D66] dark:text-[#C6BFB7]">
                Retrouvez ici les informations qui pilotent vos calculs, déclarations et obligations fiscales.
              </p>
            </div>
          </div>

          <Link
            href="/entreprise/modifier"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#FF8A1F] bg-[#FF8A1F] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(255,138,31,0.16)] transition hover:border-[#E9740B] hover:bg-[#E9740B]"
          >
            <i className="ti ti-edit text-base" />
            Modifier les informations
          </Link>
        </div>

        {status === 'entreprise-mise-a-jour' && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
            <i className="ti ti-circle-check text-lg" />
            Entreprise mise à jour avec succès.
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <SectionCard
            icon="ti ti-building"
            title="Identité de l’entreprise"
            description="Informations administratives renseignées lors de l’onboarding."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoCard label="Raison sociale" value={company.raisonSociale} />
              <InfoCard label="NIF" value={company.nif} />
              <InfoCard label="RCCM" value={company.rccm ?? 'Non renseigné'} />
              <InfoCard label="Secteur d’activité" value={SECTEUR_LABELS[company.secteur] ?? company.secteur} />
              <InfoCard
                label="Date de création"
                value={company.dateCreation ? company.dateCreation.toLocaleDateString('fr-FR') : 'Non renseignée'}
              />
              <InfoCard
                label="Bien immobilier"
                value={<span className={company.hasProperty ? 'text-emerald-700 dark:text-emerald-300' : 'text-[#8B837C] dark:text-[#BEB6AE]'}>{company.hasProperty ? 'Oui' : 'Non'}</span>}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon="ti ti-receipt-tax"
            title="Régime fiscal"
            description="Paramètres qui déterminent les obligations et calculs applicables."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoCard label="Type d’entité" value={typeEntiteLabel} />
              <InfoCard label="Régime TVA" value={company.regimeTva} />
              <InfoCard label="Chiffre d’affaires annuel" value={chiffreAffairesLabel} />
              <InfoCard label="Effectif" value={`${actifs.length} salarié${actifs.length > 1 ? 's' : ''}`} />
            </div>
          </SectionCard>
        </div>

        <SectionCard
          icon="ti ti-shield-check"
          title="Obligations fiscales détectées"
          description="Fiscow détermine automatiquement les obligations applicables à votre entreprise."
        >
          <div className="flex flex-wrap gap-2.5">
            {taxes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#DDD5CE] px-4 py-3 text-xs text-[#8B837C] dark:border-[#625D56] dark:text-[#BEB6AE]">
                Aucune obligation détectée avec la configuration actuelle.
              </div>
            ) : (
              taxes.map((t) => {
                const style =
                  TAX_STYLES[t.key] ?? {
                    bg: 'bg-slate-100 dark:bg-slate-500/10',
                    text: 'text-slate-800 dark:text-slate-300',
                    border: 'border-slate-200 dark:border-slate-500/25',
                    dot: 'bg-slate-500',
                  }

                return (
                  <span
                    key={t.key}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${style.bg} ${style.text} ${style.border}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    <strong className="font-bold">{t.sigle}</strong>
                    <span className="opacity-80">— {t.nom}</span>
                  </span>
                )
              })
            )}
          </div>
        </SectionCard>

        <SectionCard
          icon="ti ti-users"
          title="Employés"
          description="L’ITS et la CNSS sont calculés à partir des salaires réels enregistrés."
        >
          {actifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#DDD5CE] bg-[#FFFDFC] px-6 py-9 text-center dark:border-[#625D56] dark:bg-[#211F1C]">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF3E6] text-[#FF8A1F]">
                <i className="ti ti-user-off text-lg" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-[#171717] dark:text-white">Aucun salarié enregistré</h3>
              <p className="mt-1 max-w-sm text-xs leading-5 text-[#807870] dark:text-[#BEB6AE]">
                Votre entreprise est actuellement configurée sans salarié actif.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#7B736C] dark:text-[#BEB6AE]">Salariés actifs</span>
                <span className="inline-flex min-w-8 items-center justify-center rounded-full border border-[#FFD3AE] bg-[#FFF3E6] px-2.5 py-1 text-xs font-bold text-[#E9740B] dark:border-[#6D4A2B] dark:bg-[rgba(255,138,31,0.12)] dark:text-[#FF9D45]">
                  {actifs.length}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {actifs.map((e, index) => (
                  <div key={e.id} className="rounded-2xl border border-[#EDE7E1] bg-[#FFFDFC] p-4 dark:border-[#625D56] dark:bg-[#211F1C]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF3E6] text-xs font-bold text-[#E9740B]">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-[#171717] dark:text-white">{e.poste}</div>
                          <div className="mt-0.5 text-[10px] text-[#8B837C] dark:text-[#AAA39B]">Salaire brut mensuel</div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right text-sm font-bold text-[#171717] dark:text-white">
                        {fmt.format(Number(e.salaireBrutMensuel))} FCFA
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        <div className="flex justify-end">
          <Link
            href="/dashboard"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#EDE7E1] bg-white px-4 text-sm font-medium text-[#625B55] transition hover:bg-[#FFF7F0] hover:text-[#171717] dark:border-[#5B554E] dark:bg-[#292622] dark:text-[#C8C1B9] dark:hover:bg-[#302C27] dark:hover:text-white"
          >
            <i className="ti ti-arrow-left text-base" />
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  )
}
