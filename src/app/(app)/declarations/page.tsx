import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DeclarationFilters } from './declaration-filters'
import styles from './declarations.module.css'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const TAXE_LABELS: Record<string, string> = {
  is: 'IS',
  iba: 'IBA',
  tva: 'TVA',
  its: 'ITS',
  cnss: 'CNSS',
  tps: 'TPS',
  tfu: 'TFU',
  patente: 'Patente',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  filed: 'Déposée',
  paid: 'Payée',
  cancelled: 'Annulée',
}

function fmt(n: number | string | Prisma.Decimal | null): string {
  if (n == null) return '0'
  return Number(n).toLocaleString('fr-FR')
}

function fmtDate(d: Date | null): string {
  if (!d) return '—'
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function statusClass(status: string) {
  if (status === 'paid') return styles.statusPaid
  if (status === 'filed') return styles.statusFiled
  if (status === 'draft') return styles.statusDraft
  return styles.statusCancelled
}

function typeClass(type: string) {
  if (type === 'tva') return styles.typeBlue
  if (type === 'its' || type === 'cnss') return styles.typeGreen
  if (type === 'is' || type === 'iba') return styles.typeOrange
  return styles.typeNeutral
}

export default async function DeclarationsIndexPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    include: { companies: { orderBy: { createdAt: 'asc' }, take: 1 } },
  })

  const company = user?.companies[0]
  if (!company) redirect('/entreprise/onboarding')

  const sp = await searchParams

  const get = (key: string) => {
    const value = sp[key]
    return Array.isArray(value) ? value[0] : value
  }

  const type = get('type')
  const status = get('status')
  const periode = get('periode')
  const page = Math.max(1, Number(get('page')) || 1)
  const perPage = 15

  const where: Record<string, unknown> = { companyId: company.id }

  if (type) where.type = type
  if (status) where.status = status
  if (periode) where.periode = { startsWith: periode }

  const [declarations, totalFiltered] = await Promise.all([
    prisma.declaration.findMany({
      where,
      orderBy: { dueDate: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.declaration.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage))

  const [total, enAttente, payees, montantPaye] = await Promise.all([
    prisma.declaration.count({ where: { companyId: company.id } }),
    prisma.declaration.count({
      where: {
        companyId: company.id,
        status: { in: ['draft', 'filed'] },
      },
    }),
    prisma.declaration.count({
      where: { companyId: company.id, status: 'paid' },
    }),
    prisma.declaration.aggregate({
      where: { companyId: company.id, status: 'paid' },
      _sum: { amountPaid: true },
    }),
  ])

  const hasFilter = Boolean(type || status || periode)

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Suivi fiscal</span>
          <h1>Déclarations</h1>
          <p>
            Consultez vos déclarations, leurs échéances, leurs statuts et les
            paiements enregistrés.
          </p>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.iconOrange}`}>
            <i className="ti ti-files" />
          </span>
          <div>
            <span>Total</span>
            <strong>{total}</strong>
            <small>déclarations enregistrées</small>
          </div>
        </div>

        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.iconAmber}`}>
            <i className="ti ti-clock-hour-4" />
          </span>
          <div>
            <span>En attente</span>
            <strong>{enAttente}</strong>
            <small>à déposer ou à payer</small>
          </div>
        </div>

        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.iconGreen}`}>
            <i className="ti ti-circle-check" />
          </span>
          <div>
            <span>Payées</span>
            <strong>{payees}</strong>
            <small>déclarations clôturées</small>
          </div>
        </div>

        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.iconRed}`}>
            <i className="ti ti-coins" />
          </span>
          <div>
            <span>Total payé</span>
            <strong className={styles.money}>
              {fmt(montantPaye._sum.amountPaid)} FCFA
            </strong>
            <small>montant cumulé</small>
          </div>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2>Toutes les déclarations</h2>
            <p>{totalFiltered} résultat{totalFiltered > 1 ? 's' : ''}</p>
          </div>

          <div className={styles.filterArea}>
            <DeclarationFilters
              typeOptions={Object.entries(TAXE_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
              statusOptions={Object.entries(STATUS_LABELS).map(
                ([value, label]) => ({
                  value,
                  label,
                }),
              )}
              type={type ?? ''}
              status={status ?? ''}
              periode={periode ?? ''}
            />

            {hasFilter && (
              <Link href="/declarations" className={styles.resetButton}>
                <i className="ti ti-refresh" />
                Réinitialiser
              </Link>
            )}
          </div>
        </div>

        <div className={styles.desktopTable}>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Période</th>
                <th>Montant dû</th>
                <th>Montant payé</th>
                <th>Échéance</th>
                <th>Statut</th>
                <th aria-label="Action" />
              </tr>
            </thead>

            <tbody>
              {declarations.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className={styles.emptyState}>
                      <span>
                        <i className="ti ti-file-off" />
                      </span>
                      <strong>Aucune déclaration trouvée</strong>
                      <p>Modifiez les filtres pour afficher d’autres résultats.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                declarations.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <span className={`${styles.typeBadge} ${typeClass(d.type)}`}>
                        {TAXE_LABELS[d.type] ?? d.type.toUpperCase()}
                      </span>
                    </td>
                    <td className={styles.period}>{d.periode}</td>
                    <td className={styles.amount}>{fmt(d.amountDue)} FCFA</td>
                    <td className={styles.amountPaid}>
                      {Number(d.amountPaid) > 0
                        ? `${fmt(d.amountPaid)} FCFA`
                        : '—'}
                    </td>
                    <td>
                      <span className={styles.date}>
                        <i className="ti ti-calendar-event" />
                        {fmtDate(d.dueDate)}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass(d.status)}`}>
                        {STATUS_LABELS[d.status] ?? d.status}
                      </span>
                    </td>
                    <td className={styles.actionCell}>
                      <Link
                        href={`/declarations/${d.id}`}
                        className={styles.viewButton}
                        title="Voir la déclaration"
                      >
                        <i className="ti ti-eye" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.mobileList}>
          {declarations.length === 0 ? (
            <div className={styles.emptyState}>
              <span>
                <i className="ti ti-file-off" />
              </span>
              <strong>Aucune déclaration trouvée</strong>
            </div>
          ) : (
            declarations.map((d) => (
              <Link
                href={`/declarations/${d.id}`}
                key={d.id}
                className={styles.mobileItem}
              >
                <div className={styles.mobileItemTop}>
                  <span className={`${styles.typeBadge} ${typeClass(d.type)}`}>
                    {TAXE_LABELS[d.type] ?? d.type.toUpperCase()}
                  </span>
                  <span className={`${styles.statusBadge} ${statusClass(d.status)}`}>
                    {STATUS_LABELS[d.status] ?? d.status}
                  </span>
                </div>

                <div className={styles.mobileItemMain}>
                  <div>
                    <small>Période</small>
                    <strong>{d.periode}</strong>
                  </div>
                  <div>
                    <small>Montant dû</small>
                    <strong>{fmt(d.amountDue)} FCFA</strong>
                  </div>
                </div>

                <div className={styles.mobileItemFoot}>
                  <span>
                    <i className="ti ti-calendar-event" />
                    {fmtDate(d.dueDate)}
                  </span>
                  <i className="ti ti-chevron-right" />
                </div>
              </Link>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const params = new URLSearchParams()
              if (type) params.set('type', type)
              if (status) params.set('status', status)
              if (periode) params.set('periode', periode)
              if (p > 1) params.set('page', String(p))

              const href = `/declarations${
                params.toString() ? `?${params.toString()}` : ''
              }`

              return (
                <Link
                  href={href}
                  key={p}
                  className={p === page ? styles.pageActive : styles.pageLink}
                >
                  {p}
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}