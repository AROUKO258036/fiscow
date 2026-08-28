import Link from 'next/link'

import { requireAdmin } from '@/lib/require-admin'
import { prisma } from '@/lib/prisma'

import styles from './admin.module.css'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  filed: 'Déposée',
  paid: 'Payée',
  cancelled: 'Annulée',
}

function fmtFCFA(value: number): string {
  return `${value.toLocaleString('fr-FR')} FCFA`
}

function statusClass(status: string): string {
  switch (status) {
    case 'paid':
      return styles.statusPaid

    case 'filed':
      return styles.statusFiled

    case 'draft':
      return styles.statusDraft

    case 'cancelled':
      return styles.statusCancelled

    default:
      return styles.statusNeutral
  }
}

export default async function AdminPage() {
  const admin = await requireAdmin()

  const [
    users,
    companies,
    declarations,
    transactions,
    taxRates,
    jobTitles,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.company.count(),

    prisma.declaration.count(),

    prisma.transaction.count({
      where: {
        status: 'completed',
      },
    }),

    prisma.taxRate.count(),

    prisma.jobTitle.count(),
  ])

  const [
    declarationsPerStatus,
    transactionsSum,
    recentUsers,
    recentDeclarations,
  ] = await Promise.all([
    prisma.declaration.groupBy({
      by: ['status'],

      _count: {
        _all: true,
      },
    }),

    prisma.transaction.aggregate({
      where: {
        status: 'completed',
      },

      _sum: {
        amount: true,
      },
    }),

    prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },

      take: 5,

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        emailVerifiedAt: true,
      },
    }),

    prisma.declaration.findMany({
      orderBy: {
        createdAt: 'desc',
      },

      take: 5,

      include: {
        company: {
          select: {
            raisonSociale: true,
          },
        },
      },
    }),
  ])

  const totalRevenue =
    Number(
      transactionsSum._sum.amount ??
        0,
    )

  return (
    <main className={styles.page}>

      {/* 01. EN-TÊTE */}

      <header className={styles.heading}>

        <div>
          <span className={styles.eyebrow}>
            ESPACE ADMINISTRATEUR
          </span>

          <h1>
            Administration
          </h1>

          <p>
            Vue globale de l’activité,
            des utilisateurs et des
            données fiscales de Fiscow.
          </p>
        </div>

        <div className={styles.adminIdentity}>
          <span className={styles.adminAvatar}>
            {admin.name
              ?.trim()
              .charAt(0)
              .toUpperCase() || 'A'}
          </span>

          <div>
            <span>Administrateur</span>
            <strong>
              {admin.name}
            </strong>
          </div>
        </div>

      </header>

      {/* 02. INDICATEURS */}

      <section className={styles.statsGrid}>

        <StatCard
          icon="ti ti-users"
          label="Utilisateurs"
          value={users.toLocaleString(
            'fr-FR',
          )}
          description="comptes enregistrés"
          tone="orange"
        />

        <StatCard
          icon="ti ti-building"
          label="Entreprises"
          value={companies.toLocaleString(
            'fr-FR',
          )}
          description="entreprises configurées"
          tone="blue"
        />

        <StatCard
          icon="ti ti-file-description"
          label="Déclarations"
          value={declarations.toLocaleString(
            'fr-FR',
          )}
          description="déclarations créées"
          tone="amber"
        />

        <StatCard
          icon="ti ti-wallet"
          label="Transactions"
          value={fmtFCFA(
            totalRevenue,
          )}
          description={`${transactions} paiement${
            transactions > 1 ? 's' : ''
          } enregistré${
            transactions > 1 ? 's' : ''
          }`}
          tone="green"
          smallValue
        />

      </section>

      {/* 03. ACCÈS RAPIDES */}

      <section className={styles.quickAccess}>

        <div className={styles.sectionHeading}>
          <div>
            <span>
              GESTION
            </span>

            <h2>
              Accès rapides
            </h2>
          </div>
        </div>

        <div className={styles.quickGrid}>

          <AdminLink
            href="/admin/declarations"
            icon="ti ti-files"
            title="Déclarations"
            description="Consulter et gérer toutes les déclarations."
          />

          <AdminLink
            href="/admin/taux"
            icon="ti ti-percentage"
            title="Taux fiscaux"
            description={`${taxRates} taux enregistrés dans Fiscow.`}
          />

          <AdminLink
            href="/admin/metiers"
            icon="ti ti-briefcase"
            title="Métiers"
            description={`${jobTitles} métiers configurés.`}
          />

        </div>

      </section>

      {/* 04. DONNÉES PRINCIPALES */}

      <div className={styles.mainGrid}>

        {/* STATUTS */}

        <section className={styles.card}>

          <div className={styles.cardHeader}>

            <div className={styles.cardHeaderMain}>

              <span className={styles.sectionIcon}>
                <i className="ti ti-chart-donut" />
              </span>

              <div>
                <h2>
                  Déclarations par statut
                </h2>

                <p>
                  Répartition des déclarations
                  enregistrées.
                </p>
              </div>

            </div>

          </div>

          <div className={styles.statusList}>

            {Object.entries(
              STATUS_LABELS,
            ).map(
              ([key, label]) => {
                const count =
                  declarationsPerStatus.find(
                    (item) =>
                      item.status ===
                      key,
                  )?._count._all ?? 0

                const percentage =
                  (
                    (count /
                      Math.max(
                        1,
                        declarations,
                      )) *
                    100
                  ).toFixed(0)

                return (
                  <div
                    key={key}
                    className={
                      styles.statusRow
                    }
                  >
                    <div
                      className={
                        styles.statusRowTop
                      }
                    >
                      <div>
                        <span
                          className={`${styles.statusBadge} ${statusClass(
                            key,
                          )}`}
                        >
                          {label}
                        </span>

                        <strong>
                          {count}
                        </strong>
                      </div>

                      <span>
                        {percentage} %
                      </span>
                    </div>

                    <div
                      className={
                        styles.statusProgress
                      }
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              },
            )}

          </div>

        </section>

        {/* DERNIÈRES DÉCLARATIONS */}

        <section
          className={`${styles.card} ${styles.declarationsCard}`}
        >

          <div className={styles.cardHeader}>

            <div className={styles.cardHeaderMain}>

              <span className={styles.sectionIcon}>
                <i className="ti ti-file-invoice" />
              </span>

              <div>
                <h2>
                  Dernières déclarations
                </h2>

                <p>
                  Activité fiscale récente
                  de la plateforme.
                </p>
              </div>

            </div>

            <Link
              href="/admin/declarations"
              className={
                styles.textButton
              }
            >
              Tout voir

              <i className="ti ti-arrow-right" />
            </Link>

          </div>

          <div className={styles.tableWrapper}>

            <table className={styles.table}>

              <thead>
                <tr>
                  <th>
                    Entreprise
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Période
                  </th>

                  <th>
                    Montant
                  </th>

                  <th>
                    Statut
                  </th>
                </tr>
              </thead>

              <tbody>

                {recentDeclarations.length ===
                0 ? (
                  <tr>
                    <td colSpan={5}>

                      <EmptyState
                        icon="ti ti-file-off"
                        title="Aucune déclaration"
                        description="Les nouvelles déclarations apparaîtront ici."
                      />

                    </td>
                  </tr>
                ) : (
                  recentDeclarations.map(
                    (declaration) => (
                      <tr
                        key={
                          declaration.id
                        }
                      >
                        <td>
                          <strong
                            className={
                              styles.companyName
                            }
                          >
                            {declaration
                              .company
                              ?.raisonSociale ??
                              '—'}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={
                              styles.taxBadge
                            }
                          >
                            {declaration.type.toUpperCase()}
                          </span>
                        </td>

                        <td>
                          {
                            declaration.periode
                          }
                        </td>

                        <td
                          className={
                            styles.money
                          }
                        >
                          {fmtFCFA(
                            Number(
                              declaration.amountDue,
                            ),
                          )}
                        </td>

                        <td>
                          <span
                            className={`${styles.statusBadge} ${statusClass(
                              declaration.status,
                            )}`}
                          >
                            {STATUS_LABELS[
                              declaration.status
                            ] ??
                              declaration.status}
                          </span>
                        </td>
                      </tr>
                    ),
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>

      {/* 05. UTILISATEURS */}

      <section className={styles.card}>

        <div className={styles.cardHeader}>

          <div className={styles.cardHeaderMain}>

            <span className={styles.sectionIcon}>
              <i className="ti ti-user-plus" />
            </span>

            <div>
              <h2>
                Derniers utilisateurs
              </h2>

              <p>
                Comptes récemment créés
                sur Fiscow.
              </p>
            </div>

          </div>

          <span className={styles.countBadge}>
            {users}
          </span>

        </div>

        <div className={styles.tableWrapper}>

          <table className={styles.table}>

            <thead>
              <tr>
                <th>
                  Utilisateur
                </th>

                <th>
                  Email
                </th>

                <th>
                  Rôle
                </th>

                <th>
                  Vérification
                </th>

                <th>
                  Inscription
                </th>
              </tr>
            </thead>

            <tbody>

              {recentUsers.map(
                (user) => {
                  const initial =
                    user.name
                      ?.trim()
                      .charAt(0)
                      .toUpperCase() ||
                    user.email
                      ?.trim()
                      .charAt(0)
                      .toUpperCase() ||
                    'U'

                  return (
                    <tr key={user.id}>

                      <td>
                        <div
                          className={
                            styles.userCell
                          }
                        >
                          <span
                            className={
                              styles.userAvatar
                            }
                          >
                            {initial}
                          </span>

                          <strong>
                            {user.name}
                          </strong>
                        </div>
                      </td>

                      <td
                        className={
                          styles.email
                        }
                      >
                        {user.email}
                      </td>

                      <td>
                        <span
                          className={
                            user.role ===
                            'ADMIN'
                              ? styles.adminRole
                              : styles.userRole
                          }
                        >
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            user.emailVerifiedAt
                              ? styles.verified
                              : styles.pending
                          }
                        >
                          <i
                            className={
                              user.emailVerifiedAt
                                ? 'ti ti-circle-check'
                                : 'ti ti-clock'
                            }
                          />

                          {user.emailVerifiedAt
                            ? 'Vérifié'
                            : 'En attente'}
                        </span>
                      </td>

                      <td>
                        {user.createdAt
                          ?.toLocaleDateString(
                            'fr-FR',
                          ) ??
                          '—'}
                      </td>

                    </tr>
                  )
                },
              )}

            </tbody>

          </table>

        </div>

      </section>

    </main>
  )
}

function StatCard({
  icon,
  label,
  value,
  description,
  tone,
  smallValue = false,
}: {
  icon: string
  label: string
  value: string
  description: string
  tone:
    | 'orange'
    | 'blue'
    | 'amber'
    | 'green'
  smallValue?: boolean
}) {
  return (
    <article
      className={styles.statCard}
    >
      <span
        className={`${styles.statIcon} ${
          styles[
            `tone${
              tone
                .charAt(0)
                .toUpperCase() +
              tone.slice(1)
            }`
          ]
        }`}
      >
        <i className={icon} />
      </span>

      <div>
        <span>
          {label}
        </span>

        <strong
          className={
            smallValue
              ? styles.smallStatValue
              : undefined
          }
        >
          {value}
        </strong>

        <small>
          {description}
        </small>
      </div>
    </article>
  )
}

function AdminLink({
  href,
  icon,
  title,
  description,
}: {
  href: string
  icon: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className={styles.quickCard}
    >
      <span
        className={
          styles.quickIcon
        }
      >
        <i className={icon} />
      </span>

      <div>
        <strong>
          {title}
        </strong>

        <p>
          {description}
        </p>
      </div>

      <i
        className={`ti ti-chevron-right ${styles.quickArrow}`}
      />
    </Link>
  )
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div
      className={styles.emptyState}
    >
      <span>
        <i className={icon} />
      </span>

      <strong>
        {title}
      </strong>

      <p>
        {description}
      </p>
    </div>
  )
}