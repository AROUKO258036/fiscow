import {
  forbidden,
  notFound,
  redirect,
} from 'next/navigation'

import Link from 'next/link'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

import {
  DeclarationActions,
} from '@/components/app/declaration/declaration-actions'

import {
  DeclarationExport,
} from '@/components/app/declaration/declaration-export'

import styles from './declaration-detail.module.css'

interface Props {
  params: Promise<{
    id: string
  }>
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

const TAXE_NAMES: Record<string, string> = {
  is: 'Impôt sur les Sociétés',
  iba: 'Impôt sur les Bénéfices d’Affaires',
  tva: 'Taxe sur la Valeur Ajoutée',
  its: 'Impôt sur les Traitements et Salaires',
  cnss: 'Caisse Nationale de Sécurité Sociale',
  tps: 'Taxe Professionnelle Synthétique',
  tfu: 'Taxe Foncière Unique',
  patente: 'Patente',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  filed: 'Déposée',
  paid: 'Payée',
  cancelled: 'Annulée',
}

function fmt(
  value: unknown,
): string {
  const number =
    Number(value ?? 0)

  return Number.isFinite(
    number,
  )
    ? number.toLocaleString(
        'fr-FR',
      )
    : '0'
}

function fmtDate(
  date:
    | Date
    | null
    | undefined,
): string {
  if (!date) {
    return '—'
  }

  return new Date(
    date,
  ).toLocaleDateString(
    'fr-FR',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  )
}

function shortDate(
  date: Date,
): string {
  return new Date(
    date,
  ).toLocaleDateString(
    'fr-FR',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  )
}

function statusClass(
  status: string,
): string {
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

function taxClass(
  type: string,
): string {
  switch (type) {
    case 'tva':
      return styles.taxTva

    case 'its':
      return styles.taxIts

    case 'cnss':
      return styles.taxCnss

    case 'is':
    case 'iba':
      return styles.taxIs

    default:
      return styles.taxDefault
  }
}

export default async function DeclarationShowPage({
  params,
}: Props) {
  const session =
    await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const { id } =
    await params

  const declarationId =
    Number(id)

  if (
    !Number.isFinite(
      declarationId,
    )
  ) {
    notFound()
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: Number(
          session.user.id,
        ),
      },

      include: {
        companies: {
          orderBy: {
            createdAt: 'asc',
          },

          take: 1,
        },
      },
    })

  const company =
    user?.companies[0]

  if (!company) {
    redirect(
      '/entreprise/onboarding',
    )
  }

  const declaration =
    await prisma.declaration.findUnique({
      where: {
        id: declarationId,
      },
    })

  if (!declaration) {
    notFound()
  }

  if (
    declaration.companyId !==
    company.id
  ) {
    forbidden()
  }

  const transactions =
    await prisma.transaction.findMany({
      where: {
        declarationId:
          declaration.id,
      },

      orderBy: {
        transactionDate:
          'desc',
      },
    })

  const amountDue =
    Number(
      declaration.amountDue,
    )

  const amountPaid =
    Number(
      declaration.amountPaid,
    )

  const remaining =
    Math.max(
      0,
      amountDue -
        amountPaid,
    )

  const typeLabel =
    TAXE_LABELS[
      declaration.type
    ] ??
    declaration.type.toUpperCase()

  const taxName =
    TAXE_NAMES[
      declaration.type
    ] ??
    typeLabel

  const exportData = {
    id: declaration.id,

    type:
      declaration.type,

    typeLabel,

    periode:
      declaration.periode,

    amountDue:
      fmt(
        declaration.amountDue,
      ),

    amountPaid:
      amountPaid > 0
        ? fmt(
            declaration.amountPaid,
          )
        : '0',

    status:
      STATUS_LABELS[
        declaration.status
      ] ??
      declaration.status,

    dueDate:
      fmtDate(
        declaration.dueDate,
      ),

    filedDate:
      declaration.filedDate
        ? fmtDate(
            declaration.filedDate,
          )
        : '—',

    paidDate:
      declaration.paidDate
        ? fmtDate(
            declaration.paidDate,
          )
        : '—',

    notes:
      declaration.notes ??
      '',

    companyName:
      company.raisonSociale,

    companyNif:
      company.nif,
  }

  const progress =
    amountDue <= 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (
              amountPaid /
              amountDue
            ) *
              100,
          ),
        )

  return (
    <main
      className={
        styles.page
      }
    >

      {/* HEADER */}

      <section
        className={
          styles.pageHeader
        }
      >
        <div>
          <div
            className={
              styles.eyebrow
            }
          >
            SUIVI FISCAL
          </div>

          <h1>
            Déclaration{' '}
          </h1>

          <div
            className={
              styles.breadcrumb
            }
          >
          </div>
        </div>

        <div
          className={
            styles.headerActions
          }
        >
          <DeclarationExport
            data={
              exportData
            }
          />

          <Link
            href="/declarations"
            className={
              styles.backButton
            }
          >
            <i className="ti ti-arrow-left" />

            <span>
              Retour
            </span>
          </Link>
        </div>
      </section>

      {/* SUMMARY */}

      <section
        className={
          styles.summaryCard
        }
      >
        <div
          className={`${styles.taxIcon} ${taxClass(
            declaration.type,
          )}`}
        >
          <i className="ti ti-receipt-tax" />
        </div>

        <div
          className={
            styles.summaryIdentity
          }
        >
          <div
            className={
              styles.summaryTop
            }
          >
            <span
              className={`${styles.taxBadge} ${taxClass(
                declaration.type,
              )}`}
            >
              {typeLabel}
            </span>

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
          </div>

          <h2>
            {taxName}
          </h2>

          <p>
            Période fiscale :{' '}
            <strong>
              {
                declaration.periode
              }
            </strong>
          </p>
        </div>

        <div
          className={
            styles.summaryAmount
          }
        >
          <span>
            Montant dû
          </span>

          <strong>
            {fmt(
              declaration.amountDue,
            )}{' '}
            FCFA
          </strong>

          {remaining >
            0 && (
            <small>
              Reste à payer :{' '}
              {fmt(
                remaining,
              )}{' '}
              FCFA
            </small>
          )}
        </div>
      </section>

      {/* ACTIONS */}

      <div
        className={
          styles.actionsSection
        }
      >
        <DeclarationActions
          declarationId={
            declaration.id
          }
          status={
            declaration.status
          }
        />
      </div>

      {/* CONTENT */}

      <div
        className={
          styles.contentGrid
        }
      >

        {/* LEFT */}

        <div
          className={
            styles.mainColumn
          }
        >

          {/* DETAILS */}

          <section
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardHeader
              }
            >
              <div>
                <span
                  className={
                    styles.sectionIcon
                  }
                >
                  <i className="ti ti-file-description" />
                </span>

                <div>
                  <h2>
                    Détails de la déclaration
                  </h2>

                  <p>
                    Informations fiscales et état de la déclaration.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={
                styles.detailsGrid
              }
            >
              <DetailItem
                icon="ti ti-receipt-tax"
                label="Type d’impôt"
                value={`${typeLabel} — ${taxName}`}
              />

              <DetailItem
                icon="ti ti-calendar-month"
                label="Période"
                value={
                  declaration.periode
                }
              />

              <DetailItem
                icon="ti ti-wallet"
                label="Montant dû"
                value={`${fmt(
                  declaration.amountDue,
                )} FCFA`}
                emphasis="orange"
              />

              <DetailItem
                icon="ti ti-circle-check"
                label="Montant payé"
                value={
                  amountPaid > 0
                    ? `${fmt(
                        declaration.amountPaid,
                      )} FCFA`
                    : 'Aucun paiement'
                }
                emphasis={
                  amountPaid > 0
                    ? 'green'
                    : undefined
                }
              />

              <DetailItem
                icon="ti ti-calendar-due"
                label="Date d’échéance"
                value={fmtDate(
                  declaration.dueDate,
                )}
              />

              <DetailItem
                icon="ti ti-progress-check"
                label="Statut"
                customValue={
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
                }
              />

              <DetailItem
                icon="ti ti-file-check"
                label="Date de dépôt"
                value={fmtDate(
                  declaration.filedDate,
                )}
              />

              <DetailItem
                icon="ti ti-credit-card-pay"
                label="Date de paiement"
                value={fmtDate(
                  declaration.paidDate,
                )}
              />
            </div>

            {declaration.notes && (
              <div
                className={
                  styles.notes
                }
              >
                <div
                  className={
                    styles.notesTitle
                  }
                >
                  <i className="ti ti-note" />

                  <strong>
                    Données utilisées
                  </strong>
                </div>

                <p>
                  {
                    declaration.notes
                  }
                </p>
              </div>
            )}
          </section>

          {/* PAYMENT SUMMARY */}

          <section
            className={
              styles.paymentSummary
            }
          >
            <div
              className={
                styles.paymentHead
              }
            >
              <div
                className={
                  styles.paymentIcon
                }
              >
                <i className="ti ti-wallet" />
              </div>

              <div>
                <h3>
                  Situation du paiement
                </h3>

                <p>
                  Suivi financier de cette déclaration.
                </p>
              </div>
            </div>

            <div
              className={
                styles.paymentStats
              }
            >
              <div>
                <span>
                  Montant dû
                </span>

                <strong>
                  {fmt(
                    amountDue,
                  )}{' '}
                  FCFA
                </strong>
              </div>

              <div>
                <span>
                  Payé
                </span>

                <strong
                  className={
                    styles.greenAmount
                  }
                >
                  {fmt(
                    amountPaid,
                  )}{' '}
                  FCFA
                </strong>
              </div>

              <div>
                <span>
                  Reste
                </span>

                <strong
                  className={
                    remaining >
                    0
                      ? styles.orangeAmount
                      : styles.greenAmount
                  }
                >
                  {fmt(
                    remaining,
                  )}{' '}
                  FCFA
                </strong>
              </div>
            </div>

            <div
              className={
                styles.progress
              }
            >
              <div
                style={{
                  width:
                    `${progress}%`,
                }}
              />
            </div>
          </section>
        </div>

        {/* RIGHT */}

        <aside
          className={
            styles.sideColumn
          }
        >

          {/* TRANSACTIONS */}

          <section
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardHeader
              }
            >
              <div>
                <span
                  className={
                    styles.sectionIcon
                  }
                >
                  <i className="ti ti-arrows-exchange" />
                </span>

                <div>
                  <h2>
                    Transactions liées
                  </h2>

                  <p>
                    Historique des paiements.
                  </p>
                </div>
              </div>

              <span
                className={
                  styles.countBadge
                }
              >
                {
                  transactions.length
                }
              </span>
            </div>

            {transactions.length ===
            0 ? (
              <div
                className={
                  styles.emptyTransactions
                }
              >
                <span>
                  <i className="ti ti-receipt-off" />
                </span>

                <strong>
                  Aucune transaction
                </strong>

                <p>
                  Les paiements enregistrés apparaîtront ici.
                </p>
              </div>
            ) : (
              <div
                className={
                  styles.transactionList
                }
              >
                {transactions.map(
                  (
                    tx,
                  ) => (
                    <div
                      key={
                        tx.id
                      }
                      className={
                        styles.transaction
                      }
                    >
                      <div
                        className={
                          styles.transactionIcon
                        }
                      >
                        <i className="ti ti-check" />
                      </div>

                      <div
                        className={
                          styles.transactionMain
                        }
                      >
                        <div>
                          <strong>
                            Paiement
                          </strong>

                          <span>
                            TX-
                            {String(
                              tx.id,
                            ).padStart(
                              4,
                              '0',
                            )}
                          </span>
                        </div>

                        <p>
                          {tx.paymentMethod ===
                          'momo'
                            ? 'MTN MoMo'
                            : 'Virement / Espèces'}
                        </p>

                        <small>
                          {shortDate(
                            tx.transactionDate,
                          )}
                        </small>
                      </div>

                      <strong
                        className={
                          styles.transactionAmount
                        }
                      >
                        {fmt(
                          tx.amount,
                        )}{' '}
                        FCFA
                      </strong>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>

          {/* COMPANY */}

          <section
            className={
              styles.companyCard
            }
          >
            <span>
              Entreprise
            </span>

            <strong>
              {
                company.raisonSociale
              }
            </strong>

            <div>
              <span>
                NIF
              </span>

              <b>
                {
                  company.nif
                }
              </b>
            </div>
          </section>
        </aside>
      </div>
    </main>
  )
}

function DetailItem({
  icon,
  label,
  value,
  customValue,
  emphasis,
}: {
  icon: string
  label: string
  value?: string
  customValue?: React.ReactNode
  emphasis?:
    | 'orange'
    | 'green'
}) {
  return (
    <div
      className={
        styles.detailItem
      }
    >
      <span
        className={
          styles.detailIcon
        }
      >
        <i
          className={
            icon
          }
        />
      </span>

      <div>
        <span>
          {label}
        </span>

        {customValue ?? (
          <strong
            className={
              emphasis ===
              'orange'
                ? styles.orangeAmount
                : emphasis ===
                    'green'
                  ? styles.greenAmount
                  : undefined
            }
          >
            {value}
          </strong>
        )}
      </div>
    </div>
  )
}