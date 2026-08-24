'use client'

import { useEffect, useMemo, useRef } from 'react'
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
  deadline: Deadline | null
  budgetFiscalRestant: string
  totalImpotsPayes: string
  declarationsEnAttente: number
  repartitionFiscale: RepartitionItem[]
  chart: { categories: string[]; completed: number[]; pending: number[] }
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
      new (el: HTMLElement, options: unknown): {
        render: () => void
        destroy?: () => void
      }
    }
  }
}

function waitForApex(timeout = 8000): Promise<boolean> {
  return new Promise((resolve) => {
    const start = Date.now()
    const tick = () => {
      if (window.ApexCharts) return resolve(true)
      if (Date.now() - start > timeout) return resolve(false)
      setTimeout(tick, 100)
    }
    tick()
  })
}

function scoreLabel(score: number) {
  if (score >= 80) return 'En règle'
  if (score >= 50) return 'À surveiller'
  return 'Action requise'
}

function csvEscape(value: string | number) {
  const s = String(value ?? '')
  return `"${s.replaceAll('"', '""')}"`
}

export function DashboardClient({
  score,
  deadline,
  budgetFiscalRestant,
  totalImpotsPayes,
  declarationsEnAttente,
  repartitionFiscale,
  chart,
  transactions,
}: DashboardProps) {
  const chartRef = useRef<{ destroy?: () => void } | null>(null)

  const totalCompleted = useMemo(
    () => chart.completed.reduce((sum, value) => sum + value, 0),
    [chart.completed],
  )
  const totalPending = useMemo(
    () => chart.pending.reduce((sum, value) => sum + value, 0),
    [chart.pending],
  )
  const totalObligations = totalCompleted + totalPending

  useEffect(() => {
    const el = document.getElementById('fiscow-dashboard-chart')
    if (!el) return

    let cancelled = false

    waitForApex().then((ok) => {
      if (!ok || cancelled || !window.ApexCharts) return

      if (chartRef.current?.destroy) chartRef.current.destroy()

      const isDark =
        document.documentElement.getAttribute('data-theme') === 'dark'

      const instance = new window.ApexCharts(el, {
        series: [
          { name: 'Payé', data: chart.completed },
          { name: 'À payer', data: chart.pending },
        ],
        colors: ['#4AA66A', '#FF8A1F'],
        chart: {
          type: 'bar',
          height: 210,
          stacked: true,
          toolbar: { show: false },
          zoom: { enabled: false },
          background: 'transparent',
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '34%',
            borderRadius: 5,
            borderRadiusApplication: 'around',
            borderRadiusWhenStacked: 'last',
          },
        },
        dataLabels: { enabled: false },
        stroke: { width: 0 },
        grid: {
          borderColor: isDark ? '#4B4540' : '#EEE8E2',
          strokeDashArray: 3,
          padding: { left: 4, right: 4, top: 0, bottom: 0 },
        },
        xaxis: {
          categories: chart.categories,
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: {
            style: {
              colors: isDark ? '#AAA39B' : '#918981',
              fontSize: '10px',
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: isDark ? '#AAA39B' : '#918981',
              fontSize: '10px',
            },
          },
        },
        legend: { show: false },
        tooltip: {
          theme: isDark ? 'dark' : 'light',
        },
      })

      chartRef.current = instance
      instance.render()
    })

    return () => {
      cancelled = true
      chartRef.current?.destroy?.()
      chartRef.current = null
    }
  }, [chart])

  function exportCsv() {
    const headers = [
      'ID Transaction',
      'Contribuable',
      'Catégorie',
      'Montant',
      'Date',
      'Statut',
    ]

    const rows = transactions.map((tx) => [
      tx.id,
      tx.contribuable,
      tx.categorie,
      tx.montant,
      tx.date,
      tx.statut,
    ])

    const csv = [
      headers.map(csvEscape).join(';'),
      ...rows.map((row) => row.map(csvEscape).join(';')),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csv], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fiscow-dashboard-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.page}>
      {/* Trigger utilisé par le bouton Export CSV du header */}
      <button
        id="dashboard-export-csv"
        type="button"
        onClick={exportCsv}
        className={styles.hiddenExport}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className={styles.pageHead}>
        <div>
          <span className={styles.eyebrow}>Vue d’ensemble</span>
          <h1>Dashboard</h1>
          <p>
            Votre situation fiscale, les échéances prioritaires et les derniers
            mouvements en un coup d’œil.
          </p>
        </div>
      </div>

      <div className={styles.topGrid}>
        <section className={styles.scoreCard}>
          <div className={styles.cardTitleRow}>
            <div>
              <span className={styles.cardEyebrow}>Situation fiscale</span>
              <h2>Score de conformité</h2>
            </div>
            <i className="ti ti-shield-check" />
          </div>

          <div className={styles.scoreContent}>
            <div
              className={styles.scoreRing}
              style={
                {
                  '--score': `${Math.max(0, Math.min(100, score)) * 3.6}deg`,
                } as React.CSSProperties
              }
            >
              <div className={styles.scoreInner}>
                <strong>{score}%</strong>
                <span>{scoreLabel(score)}</span>
              </div>
            </div>

            <div className={styles.scoreLegend}>
              <div>
                <span className={styles.dotGreen} />
                <strong>{totalCompleted}</strong>
                <small>À jour</small>
              </div>
              <div>
                <span className={styles.dotOrange} />
                <strong>{totalPending}</strong>
                <small>À venir</small>
              </div>
              <div>
                <span className={styles.dotNeutral} />
                <strong>{totalObligations}</strong>
                <small>Total</small>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.deadlineCard}>
          <div className={styles.cardTitleRow}>
            <div>
              <span className={styles.cardEyebrow}>Priorité</span>
              <h2>Prochaine échéance</h2>
            </div>
            <Link href="/calendrier-fiscal" className={styles.textLink}>
              Voir tout <i className="ti ti-arrow-right" />
            </Link>
          </div>

          {deadline ? (
            <div className={styles.deadlineBody}>
              <div className={styles.deadlineIcon}>
                <i className="ti ti-calendar-event" />
              </div>

              <div className={styles.deadlineMain}>
                <span>Obligation</span>
                <strong>{deadline.obligation}</strong>
                <p>
                  <i className="ti ti-calendar" />
                  {deadline.date}
                </p>
              </div>

              <div className={styles.deadlineAmount}>
                <span>Montant estimé</span>
                <strong>{deadline.montant}</strong>
                <small>
                  {deadline.estimation
                    ? deadline.salairesPrecis
                      ? 'Basé sur les salaires réels'
                      : 'Estimation'
                    : 'Montant fiscal'}
                </small>
              </div>

              <div className={styles.daysBadge}>
                <strong>{deadline.joursRestant}</strong>
                <span>jour{deadline.joursRestant > 1 ? 's' : ''}</span>
              </div>
            </div>
          ) : (
            <div className={styles.emptyDeadline}>
              <i className="ti ti-circle-check" />
              <div>
                <strong>Aucune échéance à venir</strong>
                <span>Votre calendrier fiscal est à jour.</span>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className={styles.kpiGrid}>
        <article className={styles.kpiCard}>
          <span className={`${styles.kpiIcon} ${styles.orange}`}>
            <i className="ti ti-report-money" />
          </span>
          <div>
            <span>Budget fiscal restant</span>
            <strong>{budgetFiscalRestant}</strong>
            <small>Prévision disponible</small>
          </div>
        </article>

        <article className={styles.kpiCard}>
          <span className={`${styles.kpiIcon} ${styles.green}`}>
            <i className="ti ti-coin" />
          </span>
          <div>
            <span>Total impôts payés</span>
            <strong>{totalImpotsPayes}</strong>
            <small>Paiements enregistrés</small>
          </div>
        </article>

        <article className={styles.kpiCard}>
          <span className={`${styles.kpiIcon} ${styles.amber}`}>
            <i className="ti ti-file-alert" />
          </span>
          <div>
            <span>Déclarations en attente</span>
            <strong>{declarationsEnAttente}</strong>
            <small>Déclaration{declarationsEnAttente > 1 ? 's' : ''} à traiter</small>
          </div>
        </article>

        <article className={styles.kpiCard}>
          <span className={`${styles.kpiIcon} ${styles.red}`}>
            <i className="ti ti-calendar-stats" />
          </span>
          <div>
            <span>Prochaine échéance</span>
            <strong>
              {deadline ? `${deadline.joursRestant} j` : '—'}
            </strong>
            <small>{deadline?.obligation ?? 'Aucune échéance'}</small>
          </div>
        </article>
      </div>

      <div className={styles.analyticsGrid}>
        <section className={styles.chartCard}>
          <div className={styles.cardTitleRow}>
            <div>
              <span className={styles.cardEyebrow}>Évolution annuelle</span>
              <h2>Historique des obligations</h2>
            </div>

            <div className={styles.legend}>
              <span><i className={styles.legendGreen} />Payé</span>
              <span><i className={styles.legendOrange} />À payer</span>
            </div>
          </div>

          <div id="fiscow-dashboard-chart" className={styles.chart} />
        </section>

        <section className={styles.taxCard}>
          <div className={styles.cardTitleRow}>
            <div>
              <span className={styles.cardEyebrow}>Structure</span>
              <h2>Répartition fiscale</h2>
            </div>
            <i className="ti ti-chart-donut" />
          </div>

          <div className={styles.taxList}>
            {repartitionFiscale.map((item, index) => (
              <div className={styles.taxItem} key={item.label}>
                <div className={styles.taxIdentity}>
                  <span
                    className={styles.taxDot}
                    data-index={index % 6}
                  />
                  <strong>{item.label}</strong>
                </div>
                <span>{item.montant}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={styles.transactionsCard}>
        <div className={styles.cardTitleRow}>
          <div>
            <span className={styles.cardEyebrow}>Activité récente</span>
            <h2>Dernières transactions</h2>
          </div>

          <Link href="/declarations" className={styles.textLink}>
            Voir tout <i className="ti ti-arrow-right" />
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className={styles.emptyTransactions}>
            <span><i className="ti ti-receipt-off" /></span>
            <strong>Aucune transaction récente</strong>
            <p>Les paiements enregistrés apparaîtront ici.</p>
          </div>
        ) : (
          <>
            <div className={styles.desktopTable}>
              <table>
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Contribuable</th>
                    <th>Catégorie</th>
                    <th>Montant</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className={styles.txId}>{tx.id}</td>
                      <td>{tx.contribuable}</td>
                      <td>
                        <span className={styles.categoryBadge}>
                          {tx.categorie}
                        </span>
                      </td>
                      <td className={styles.txAmount}>{tx.montant}</td>
                      <td>
                        <span className={styles.date}>
                          <i className="ti ti-calendar-up" />
                          {tx.date}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            tx.statut === 'Payé'
                              ? styles.statusPaid
                              : styles.statusPending
                          }
                        >
                          {tx.statut}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className={styles.iconButton}
                          title="Imprimer"
                        >
                          <i className="ti ti-printer" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileTransactions}>
              {transactions.map((tx) => (
                <div className={styles.mobileTx} key={tx.id}>
                  <div className={styles.mobileTxTop}>
                    <strong>{tx.id}</strong>
                    <span
                      className={
                        tx.statut === 'Payé'
                          ? styles.statusPaid
                          : styles.statusPending
                      }
                    >
                      {tx.statut}
                    </span>
                  </div>
                  <div className={styles.mobileTxMain}>
                    <span>{tx.contribuable}</span>
                    <strong>{tx.montant}</strong>
                  </div>
                  <div className={styles.mobileTxFoot}>
                    <span>{tx.categorie}</span>
                    <span>{tx.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}