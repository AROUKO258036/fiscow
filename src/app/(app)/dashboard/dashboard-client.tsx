'use client'

import {
  useEffect,
  useRef,
} from 'react'

import type {
  CSSProperties,
} from 'react'

import Link from 'next/link'

import styles from './dashboard.module.css'

interface Deadline {
  obligation: string
  date: string
  montant: string
  joursRestant: number
  estimation: boolean
  salairesPrecis: boolean | null
}

interface RepartitionItem {
  label: string
  montant: string
  classe: string
}

interface DashboardProps {
  score: number

  deadline:
    | Deadline
    | null

  budgetFiscalRestant: string
  totalImpotsPayes: string

  declarationsEnAttente: number

  totalDeclarations: number
  declarationsPayees: number
  declarationsEnCours: number

  repartitionFiscale:
    RepartitionItem[]

  chart: {
    categories: string[]
    completed: number[]
    pending: number[]
  }

  transactions: {
    id: string
    contribuable: string
    categorie: string
    montant: string
    date: string
    statut: string
    classe_statut: string
  }[]
}

declare global {
  interface Window {
    ApexCharts?: {
      new (
        el: HTMLElement,
        options: unknown,
      ): {
        render: () => void
        destroy?: () => void
      }
    }
  }
}

function waitForApex(
  timeout = 8000,
): Promise<boolean> {
  return new Promise(
    (resolve) => {
      const start =
        Date.now()

      const tick = () => {
        if (
          window.ApexCharts
        ) {
          resolve(true)
          return
        }

        if (
          Date.now() -
            start >
          timeout
        ) {
          resolve(false)
          return
        }

        setTimeout(
          tick,
          100,
        )
      }

      tick()
    },
  )
}

function scoreLabel(
  score: number,
) {
  if (score >= 80) {
    return 'En règle'
  }

  if (score >= 50) {
    return 'À surveiller'
  }

  return 'Action requise'
}

function csvEscape(
  value: string | number,
) {
  const text =
    String(value ?? '')

  return `"${text.replaceAll(
    '"',
    '""',
  )}"`
}

export function DashboardClient({
  score,
  deadline,
  budgetFiscalRestant,
  totalImpotsPayes,
  declarationsEnAttente,

  totalDeclarations,
  declarationsPayees,
  declarationsEnCours,

  repartitionFiscale,
  chart,
  transactions,
}: DashboardProps) {
  const chartRef =
    useRef<{
      destroy?: () => void
    } | null>(null)

  /*
   * GRAPHIQUE
   */

  useEffect(() => {
    const el =
      document.getElementById(
        'fiscow-dashboard-chart',
      )

    if (!el) {
      return
    }

    let cancelled =
      false

    waitForApex().then(
      (ok) => {
        if (
          !ok ||
          cancelled ||
          !window.ApexCharts
        ) {
          return
        }

        chartRef.current
          ?.destroy?.()

        const isDark =
          document.documentElement.getAttribute(
            'data-theme',
          ) === 'dark'

        const instance =
          new window.ApexCharts(
            el,
            {
              series: [
                {
                  name: 'Payé',
                  data:
                    chart.completed,
                },

                {
                  name: 'À payer',
                  data:
                    chart.pending,
                },
              ],

              colors: [
                '#4AA66A',
                '#FF8A1F',
              ],

              chart: {
                type: 'bar',
                height: 210,
                stacked: true,

                toolbar: {
                  show: false,
                },

                zoom: {
                  enabled:
                    false,
                },

                background:
                  'transparent',
              },

              plotOptions: {
                bar: {
                  horizontal:
                    false,

                  columnWidth:
                    '34%',

                  borderRadius:
                    5,

                  borderRadiusApplication:
                    'around',

                  borderRadiusWhenStacked:
                    'last',
                },
              },

              dataLabels: {
                enabled:
                  false,
              },

              stroke: {
                width: 0,
              },

              grid: {
                borderColor:
                  isDark
                    ? '#4B4540'
                    : '#EEE8E2',

                strokeDashArray:
                  3,

                padding: {
                  left: 4,
                  right: 4,
                  top: 0,
                  bottom: 0,
                },
              },

              xaxis: {
                categories:
                  chart.categories,

                axisBorder: {
                  show: false,
                },

                axisTicks: {
                  show: false,
                },

                labels: {
                  style: {
                    colors:
                      isDark
                        ? '#AAA39B'
                        : '#918981',

                    fontSize:
                      '10px',
                  },
                },
              },

              yaxis: {
                labels: {
                  style: {
                    colors:
                      isDark
                        ? '#AAA39B'
                        : '#918981',

                    fontSize:
                      '10px',
                  },
                },
              },

              legend: {
                show: false,
              },

              tooltip: {
                theme:
                  isDark
                    ? 'dark'
                    : 'light',
              },
            },
          )

        chartRef.current =
          instance

        instance.render()
      },
    )

    return () => {
      cancelled =
        true

      chartRef.current
        ?.destroy?.()

      chartRef.current =
        null
    }
  }, [chart])

  /*
   * CSV
   */

  function exportCsv() {
    const headers = [
      'ID Transaction',
      'Contribuable',
      'Catégorie',
      'Montant',
      'Date',
      'Statut',
    ]

    const rows =
      transactions.map(
        (tx) => [
          tx.id,
          tx.contribuable,
          tx.categorie,
          tx.montant,
          tx.date,
          tx.statut,
        ],
      )

    const csv = [
      headers
        .map(csvEscape)
        .join(';'),

      ...rows.map(
        (row) =>
          row
            .map(csvEscape)
            .join(';'),
      ),
    ].join('\n')

    const blob =
      new Blob(
        [
          '\ufeff' +
            csv,
        ],
        {
          type:
            'text/csv;charset=utf-8;',
        },
      )

    const url =
      URL.createObjectURL(
        blob,
      )

    const link =
      document.createElement(
        'a',
      )

    link.href = url

    link.download =
      `fiscow-dashboard-${new Date()
        .toISOString()
        .slice(
          0,
          10,
        )}.csv`

    link.click()

    URL.revokeObjectURL(
      url,
    )
  }

  const safeScore =
    Math.max(
      0,
      Math.min(
        100,
        score,
      ),
    )

  return (
    <div
      className={
        styles.page
      }
    >

      {/* EXPORT */}

      <button
        id="dashboard-export-csv"
        type="button"
        onClick={
          exportCsv
        }
        className={
          styles.hiddenExport
        }
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* HEADER */}

      <div
        className={
          styles.pageHead
        }
      >
        <div>
          <span
            className={
              styles.eyebrow
            }
          >
            Vue d’ensemble
          </span>

          <h1>
            Dashboard
          </h1>

          <p>
            Votre situation fiscale,
            les échéances
            prioritaires et les
            derniers mouvements en
            un coup d’œil.
          </p>
        </div>
      </div>

      {/* HAUT */}

      <div
        className={
          styles.topGrid
        }
      >

        {/* SCORE */}

        <section
          className={
            styles.scoreCard
          }
        >
          <div
            className={
              styles.cardTitleRow
            }
          >
            <div>
              <span
                className={
                  styles.cardEyebrow
                }
              >
                Situation fiscale
              </span>

              <h2>
                Score de conformité
              </h2>
            </div>

            <i className="ti ti-shield-check" />
          </div>

          <div
            className={
              styles.scoreContent
            }
          >

            {/* DESKTOP */}

            <div
              className={
                styles.scoreRing
              }
              style={
                {
                  '--score':
                    `${safeScore * 3.6}deg`,
                } as CSSProperties
              }
            >
              <div
                className={
                  styles.scoreInner
                }
              >
                <strong>
                  {safeScore}%
                </strong>

                <span>
                  {scoreLabel(
                    safeScore,
                  )}
                </span>
              </div>
            </div>

            {/* MOBILE */}

            <div
              className={
                styles.mobileScoreBlock
              }
            >
              <div
                className={
                  styles.mobileScoreHead
                }
              >
                <div>
                  <span>
                    Progression
                  </span>

                  <strong>
                    {safeScore}%
                  </strong>
                </div>

                <span
                  className={
                    styles.mobileScoreStatus
                  }
                >
                  {scoreLabel(
                    safeScore,
                  )}
                </span>
              </div>

              <div
                className={
                  styles.mobileProgressTrack
                }
              >
                <div
                  className={
                    styles.mobileProgressBar
                  }
                  style={{
                    width:
                      `${safeScore}%`,
                  }}
                />
              </div>

              <div
                className={
                  styles.mobileScoreStats
                }
              >
                <ScoreStat
                  colorClass={
                    styles.dotGreen
                  }
                  value={
                    declarationsPayees
                  }
                  label="À jour"
                />

                <ScoreStat
                  colorClass={
                    styles.dotOrange
                  }
                  value={
                    declarationsEnCours
                  }
                  label="À venir"
                />

                <ScoreStat
                  colorClass={
                    styles.dotNeutral
                  }
                  value={
                    totalDeclarations
                  }
                  label="Total"
                />
              </div>
            </div>

            {/* DESKTOP LÉGENDE */}

            <div
              className={
                styles.scoreLegend
              }
            >
              <div>
                <span
                  className={
                    styles.dotGreen
                  }
                />

                <strong>
                  {declarationsPayees}
                </strong>

                <small>
                  À jour
                </small>
              </div>

              <div>
                <span
                  className={
                    styles.dotOrange
                  }
                />

                <strong>
                  {declarationsEnCours}
                </strong>

                <small>
                  À venir
                </small>
              </div>

              <div>
                <span
                  className={
                    styles.dotNeutral
                  }
                />

                <strong>
                  {totalDeclarations}
                </strong>

                <small>
                  Total
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* ÉCHÉANCE */}

        <section
          className={
            styles.deadlineCard
          }
        >
          <div
            className={
              styles.cardTitleRow
            }
          >
            <div>
              <span
                className={
                  styles.cardEyebrow
                }
              >
                Priorité
              </span>

              <h2>
                Prochaine échéance
              </h2>
            </div>

            <Link
              href="/calendrier-fiscal"
              className={
                styles.textLink
              }
            >
              Voir tout

              <i className="ti ti-arrow-right" />
            </Link>
          </div>

          {deadline ? (
            <div
              className={
                styles.deadlineBody
              }
            >
              <div
                className={
                  styles.deadlineIcon
                }
              >
                <i className="ti ti-calendar-event" />
              </div>

              <div
                className={
                  styles.deadlineMain
                }
              >
                <span>
                  Obligation
                </span>

                <strong>
                  {
                    deadline.obligation
                  }
                </strong>

                <p>
                  <i className="ti ti-calendar" />

                  {deadline.date}
                </p>
              </div>

              <div
                className={
                  styles.deadlineAmount
                }
              >
                <span>
                  Montant estimé
                </span>

                <strong>
                  {
                    deadline.montant
                  }
                </strong>

                <small>
                  {deadline.estimation
                    ? deadline.salairesPrecis
                      ? 'Basé sur les salaires réels'
                      : 'Estimation'
                    : 'Montant fiscal'}
                </small>
              </div>

              <div
                className={
                  styles.daysBadge
                }
              >
                <strong>
                  {
                    deadline.joursRestant
                  }
                </strong>

                <span>
                  jour
                  {deadline.joursRestant >
                  1
                    ? 's'
                    : ''}
                </span>
              </div>
            </div>
          ) : (
            <div
              className={
                styles.emptyDeadline
              }
            >
              <i className="ti ti-circle-check" />

              <div>
                <strong>
                  Aucune échéance à
                  venir
                </strong>

                <span>
                  Votre calendrier
                  fiscal est à jour.
                </span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* KPI */}

      <div
        className={
          styles.kpiGrid
        }
      >
        <Kpi
          icon="ti ti-report-money"
          colorClass={
            styles.orange
          }
          label="Budget fiscal restant"
          value={
            budgetFiscalRestant
          }
          description="Prévision disponible"
        />

        <Kpi
          icon="ti ti-coin"
          colorClass={
            styles.green
          }
          label="Total impôts payés"
          value={
            totalImpotsPayes
          }
          description="Paiements enregistrés"
        />

        <Kpi
          icon="ti ti-file-alert"
          colorClass={
            styles.amber
          }
          label="Déclarations en attente"
          value={String(
            declarationsEnAttente,
          )}
          description={`Déclaration${
            declarationsEnAttente >
            1
              ? 's'
              : ''
          } à traiter`}
        />

        <Kpi
          icon="ti ti-calendar-stats"
          colorClass={
            styles.red
          }
          label="Prochaine échéance"
          value={
            deadline
              ? `${deadline.joursRestant} j`
              : '—'
          }
          description={
            deadline?.obligation ??
            'Aucune échéance'
          }
        />
      </div>

      {/* ANALYTICS */}

      <div
        className={
          styles.analyticsGrid
        }
      >

        {/* GRAPHIQUE */}

        <section
          className={
            styles.chartCard
          }
        >
          <div
            className={
              styles.cardTitleRow
            }
          >
            <div>
              <span
                className={
                  styles.cardEyebrow
                }
              >
                Évolution annuelle
              </span>

              <h2>
                Historique des obligations
              </h2>
            </div>

            <div
              className={
                styles.legend
              }
            >
              <span>
                <i
                  className={
                    styles.legendGreen
                  }
                />
                Payé
              </span>

              <span>
                <i
                  className={
                    styles.legendOrange
                  }
                />
                À payer
              </span>
            </div>
          </div>

          <div
            id="fiscow-dashboard-chart"
            className={
              styles.chart
            }
          />
        </section>

        {/* RÉPARTITION */}

        <section
          className={
            styles.taxCard
          }
        >
          <div
            className={
              styles.cardTitleRow
            }
          >
            <div>
              <span
                className={
                  styles.cardEyebrow
                }
              >
                Structure
              </span>

              <h2>
                Répartition fiscale
              </h2>
            </div>

            <i className="ti ti-chart-donut" />
          </div>

          <div
            className={
              styles.taxList
            }
          >
            {repartitionFiscale.map(
              (
                item,
                index,
              ) => (
                <div
                  className={
                    styles.taxItem
                  }
                  key={
                    item.label
                  }
                >
                  <div
                    className={
                      styles.taxIdentity
                    }
                  >
                    <span
                      className={
                        styles.taxDot
                      }
                      data-index={
                        index % 6
                      }
                    />

                    <strong>
                      {
                        item.label
                      }
                    </strong>
                  </div>

                  <span>
                    {
                      item.montant
                    }
                  </span>
                </div>
              ),
            )}
          </div>
        </section>
      </div>

      {/* TRANSACTIONS */}

      <section
        className={
          styles.transactionsCard
        }
      >
        <div
          className={
            styles.cardTitleRow
          }
        >
          <div>
            <span
              className={
                styles.cardEyebrow
              }
            >
              Activité récente
            </span>

            <h2>
              Dernières transactions
            </h2>
          </div>

          <Link
            href="/declarations"
            className={
              styles.textLink
            }
          >
            Voir tout

            <i className="ti ti-arrow-right" />
          </Link>
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
              récente
            </strong>

            <p>
              Les paiements
              enregistrés
              apparaîtront ici.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP */}

            <div
              className={
                styles.desktopTable
              }
            >
              <table>
                <thead>
                  <tr>
                    <th>
                      Transaction
                    </th>

                    <th>
                      Contribuable
                    </th>

                    <th>
                      Catégorie
                    </th>

                    <th>
                      Montant
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Statut
                    </th>

                    <th />
                  </tr>
                </thead>

                <tbody>
                  {transactions.map(
                    (tx) => (
                      <tr
                        key={
                          tx.id
                        }
                      >
                        <td
                          className={
                            styles.txId
                          }
                        >
                          {tx.id}
                        </td>

                        <td>
                          {
                            tx.contribuable
                          }
                        </td>

                        <td>
                          <span
                            className={
                              styles.categoryBadge
                            }
                          >
                            {
                              tx.categorie
                            }
                          </span>
                        </td>

                        <td
                          className={
                            styles.txAmount
                          }
                        >
                          {
                            tx.montant
                          }
                        </td>

                        <td>
                          <span
                            className={
                              styles.date
                            }
                          >
                            <i className="ti ti-calendar-up" />

                            {tx.date}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              tx.statut ===
                              'Payé'
                                ? styles.statusPaid
                                : styles.statusPending
                            }
                          >
                            {
                              tx.statut
                            }
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              window.print()
                            }
                            className={
                              styles.iconButton
                            }
                            title="Imprimer"
                          >
                            <i className="ti ti-printer" />
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}

            <div
              className={
                styles.mobileTransactions
              }
            >
              {transactions.map(
                (tx) => (
                  <div
                    key={tx.id}
                    className={
                      styles.mobileTx
                    }
                  >
                    <div
                      className={
                        styles.mobileTxTop
                      }
                    >
                      <div>
                        <span>
                          {
                            tx.id
                          }
                        </span>

                        <strong>
                          {
                            tx.contribuable
                          }
                        </strong>
                      </div>

                      <span
                        className={
                          tx.statut ===
                          'Payé'
                            ? styles.statusPaid
                            : styles.statusPending
                        }
                      >
                        {
                          tx.statut
                        }
                      </span>
                    </div>

                    <div
                      className={
                        styles.mobileTxInfo
                      }
                    >
                      <div>
                        <small>
                          Catégorie
                        </small>

                        <strong>
                          {
                            tx.categorie
                          }
                        </strong>
                      </div>

                      <div>
                        <small>
                          Montant
                        </small>

                        <strong>
                          {
                            tx.montant
                          }
                        </strong>
                      </div>
                    </div>

                    <div
                      className={
                        styles.mobileTxFoot
                      }
                    >
                      <span>
                        <i className="ti ti-calendar" />
                        {tx.date}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          window.print()
                        }
                        className={
                          styles.iconButton
                        }
                      >
                        <i className="ti ti-printer" />
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function ScoreStat({
  colorClass,
  value,
  label,
}: {
  colorClass: string
  value: number
  label: string
}) {
  return (
    <div
      className={
        styles.mobileScoreStat
      }
    >
      <span
        className={
          colorClass
        }
      />

      <div>
        <strong>
          {value}
        </strong>

        <small>
          {label}
        </small>
      </div>
    </div>
  )
}

function Kpi({
  icon,
  colorClass,
  label,
  value,
  description,
}: {
  icon: string
  colorClass: string
  label: string
  value: string
  description: string
}) {
  return (
    <article
      className={
        styles.kpiCard
      }
    >
      <span
        className={`${styles.kpiIcon} ${colorClass}`}
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

        <strong>
          {value}
        </strong>

        <small>
          {description}
        </small>
      </div>
    </article>
  )
}