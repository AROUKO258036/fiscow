'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import styles from './calendrier-fiscal.module.css'

export type FiscalEventState = 'overdue' | 'due-soon' | 'upcoming' | 'paid'

export interface FiscalCalendarEvent {
  id: string
  type: string
  title: string
  period: string
  dueDate: string | null
  amountDue: number
  amountPaid: number
  remaining: number
  status: string
  state: FiscalEventState
}

interface Props {
  events: FiscalCalendarEvent[]
  companyName: string
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const formatNumber = new Intl.NumberFormat('fr-FR')

function money(value: number): string {
  return `${formatNumber.format(Math.round(value))} FCFA`
}

function eventStateLabel(state: FiscalEventState): string {
  switch (state) {
    case 'paid':
      return 'Payée'
    case 'overdue':
      return 'En retard'
    case 'due-soon':
      return 'À payer'
    default:
      return 'À venir'
  }
}

function eventClass(state: FiscalEventState, css: Record<string, string>): string {
  switch (state) {
    case 'paid':
      return css.eventPaid
    case 'overdue':
      return css.eventOverdue
    case 'due-soon':
      return css.eventDue
    default:
      return css.eventUpcoming
  }
}

function badgeClass(state: FiscalEventState, css: Record<string, string>): string {
  switch (state) {
    case 'paid':
      return css.badgePaid
    case 'overdue':
      return css.badgeOverdue
    case 'due-soon':
      return css.badgeDue
    default:
      return css.badgeUpcoming
  }
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function toGoogleCalendarUrl(event: FiscalCalendarEvent): string {
  if (!event.dueDate) return '#'

  const date = new Date(event.dueDate)
  const end = new Date(date)
  end.setDate(end.getDate() + 1)

  const compact = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
      d.getDate(),
    ).padStart(2, '0')}`

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Fiscow — ${event.title}`,
    dates: `${compact(date)}/${compact(end)}`,
    details: [
      `Échéance fiscale : ${event.title}`,
      `Période : ${event.period}`,
      `Montant restant : ${money(event.remaining)}`,
      `Statut : ${eventStateLabel(event.state)}`,
    ].join('\n'),
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function FiscalCalendarClient({ events, companyName }: Props) {
  const today = useMemo(() => new Date(), [])

  const firstEventDate = useMemo(() => {
    const found = events.find((e) => e.dueDate)
    return found?.dueDate ? new Date(found.dueDate) : today
  }, [events, today])

  const [viewDate, setViewDate] = useState<Date>(
    () => new Date(firstEventDate.getFullYear(), firstEventDate.getMonth(), 1)
  )

  const [selectedEvent, setSelectedEvent] = useState<FiscalCalendarEvent | null>(null)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  // Fermer le modal sur touche Échap
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setSelectedEvent(null)
  }, [])

  useEffect(() => {
    if (selectedEvent) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedEvent, handleKeyDown])

  const monthEvents = useMemo(
    () =>
      events.filter((event) => {
        if (!event.dueDate) return false
        const date = new Date(event.dueDate)
        return date.getFullYear() === year && date.getMonth() === month
      }),
    [events, year, month],
  )

  const stats = useMemo(() => {
    let unpaidCount = 0
    let overdueCount = 0
    let dueSoonCount = 0
    let paidCount = 0
    let unpaidAmount = 0

    for (const event of events) {
      if (event.state === 'paid') {
        paidCount++
      } else {
        unpaidCount++
        unpaidAmount += event.remaining
        if (event.state === 'overdue') overdueCount++
        if (event.state === 'due-soon') dueSoonCount++
      }
    }

    return { unpaidCount, overdueCount, dueSoonCount, paidCount, unpaidAmount }
  }, [events])

  const calendarDays = useMemo(() => {
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)

    const offset = (first.getDay() + 6) % 7
    const totalCells = Math.ceil((offset + last.getDate()) / 7) * 7

    return Array.from({ length: totalCells }, (_, index) => {
      const day = index - offset + 1
      const date = new Date(year, month, day)
      const currentMonth = date.getMonth() === month

      return {
        date,
        currentMonth,
        events: events.filter((e) => e.dueDate && sameDay(new Date(e.dueDate), date)),
      }
    })
  }, [events, year, month])

  const nextEvents = useMemo(() => {
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

    return events
      .filter(
        (e) => e.dueDate && e.state !== 'paid' && new Date(e.dueDate).getTime() >= todayStart
      )
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 4)
  }, [events, today])

  const goPrevious = () => setViewDate(new Date(year, month - 1, 1))
  const goNext = () => setViewDate(new Date(year, month + 1, 1))
  const goToday = () => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))

  return (
    <main className={styles.page}>
      {/* En-tête principal */}
      <header className={styles.heading}>
        <div>
          <h1>Calendrier fiscal</h1>
          <p>Toutes vos échéances fiscales et sociales au même endroit.</p>
        </div>

        <div className={styles.headingActions}>
          <button type="button" className={styles.todayButton} onClick={goToday}>
            <i className="ti ti-calendar-dot" />
            Aujourd’hui
          </button>
        </div>
      </header>

      {/* Cartes de synthèse */}
      <section className={styles.summaryGrid}>
        <article className={styles.orangeSummary}>
          <div className={styles.summaryIcon}>
            <i className="ti ti-calendar-event" />
          </div>
          <div>
            <span>À payer bientôt</span>
            <strong>{stats.dueSoonCount}</strong>
            <small>échéance{stats.dueSoonCount > 1 ? 's' : ''}</small>
          </div>
        </article>

        <article className={styles.redSummary}>
          <div className={styles.summaryIcon}>
            <i className="ti ti-clock-exclamation" />
          </div>
          <div>
            <span>En retard</span>
            <strong>{stats.overdueCount}</strong>
            <small>obligation{stats.overdueCount > 1 ? 's' : ''}</small>
          </div>
        </article>

        <article className={styles.greenSummary}>
          <div className={styles.summaryIcon}>
            <i className="ti ti-circle-check" />
          </div>
          <div>
            <span>Payées</span>
            <strong>{stats.paidCount}</strong>
            <small>obligation{stats.paidCount > 1 ? 's' : ''}</small>
          </div>
        </article>

        <article className={styles.neutralSummary}>
          <div className={styles.summaryIcon}>
            <i className="ti ti-wallet" />
          </div>
          <div>
            <span>Reste à payer</span>
            <strong className={styles.amountStrong}>{money(stats.unpaidAmount)}</strong>
            <small>{stats.unpaidCount} obligation{stats.unpaidCount > 1 ? 's' : ''}</small>
          </div>
        </article>
      </section>

      {/* Grille Principale + Barre Latérale */}
      <div className={styles.layout}>
        <section className={styles.calendarCard}>
          <div className={styles.calendarHeader}>
            <div className={styles.monthNavigation}>
              <button type="button" onClick={goPrevious} aria-label="Mois précédent">
                <i className="ti ti-chevron-left" />
              </button>
              <h2>{MONTHS[month]} {year}</h2>
              <button type="button" onClick={goNext} aria-label="Mois suivant">
                <i className="ti ti-chevron-right" />
              </button>
            </div>

            <div className={styles.legend}>
              <span><i className={styles.legendRed} /> En retard</span>
              <span><i className={styles.legendOrange} /> À payer</span>
              <span><i className={styles.legendPurple} /> À venir</span>
              <span><i className={styles.legendGreen} /> Payée</span>
            </div>
          </div>

          <div className={styles.weekHeader}>
            {WEEKDAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className={styles.calendarGrid}>
            {calendarDays.map((cell) => {
              const isToday = sameDay(cell.date, today)

              return (
                <div
                  key={cell.date.toISOString()}
                  className={`${styles.dayCell} ${!cell.currentMonth ? styles.outsideMonth : ''}`}
                >
                  <div className={`${styles.dayNumber} ${isToday ? styles.todayNumber : ''}`}>
                    {cell.date.getDate()}
                  </div>

                  <div className={styles.dayEvents}>
                    {cell.events.slice(0, 3).map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        className={`${styles.calendarEvent} ${eventClass(event.state, styles)}`}
                        onClick={() => setSelectedEvent(event)}
                        title={event.title}
                      >
                        <span>{event.type.toUpperCase()}</span>
                        <strong>
                          {event.remaining > 0 ? money(event.remaining) : eventStateLabel(event.state)}
                        </strong>
                      </button>
                    ))}

                    {cell.events.length > 3 && (
                      <button
                        type="button"
                        className={styles.moreEvents}
                        onClick={() => setSelectedEvent(cell.events[3])}
                      >
                        +{cell.events.length - 3} autre{cell.events.length - 3 > 1 ? 's' : ''}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {monthEvents.length === 0 && (
            <div className={styles.monthEmpty}>
              <i className="ti ti-calendar-check" />
              <div>
                <strong>Aucune échéance ce mois-ci</strong>
                <span>Naviguez vers un autre mois pour consulter vos échéances.</span>
              </div>
            </div>
          )}
        </section>

        {/* Colonne d'informations */}
        <aside className={styles.sideColumn}>
          <section className={styles.upcomingCard}>
            <div className={styles.sideHeading}>
              <div>
                <h2>Prochaines échéances</h2>
                <p>Les obligations les plus proches.</p>
              </div>
              <Link href="/declarations">
                Voir tout <i className="ti ti-arrow-right" />
              </Link>
            </div>

            <div className={styles.upcomingList}>
              {nextEvents.length ? (
                nextEvents.map((event) => {
                  const date = new Date(event.dueDate!)
                  const day = String(date.getDate()).padStart(2, '0')
                  const monthStr = date
                    .toLocaleDateString('fr-FR', { month: 'short' })
                    .replace('.', '')
                    .toUpperCase()

                  const daysDiff = Math.max(
                    0,
                    Math.ceil(
                      (new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
                        new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
                        86_400_000,
                    ),
                  )

                  return (
                    <button
                      key={event.id}
                      type="button"
                      className={styles.upcomingRow}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className={styles.dateBox}>
                        <strong>{day}</strong>
                        <span>{monthStr}</span>
                      </div>

                      <div className={styles.upcomingInfo}>
                        <strong>{event.title}</strong>
                        <span>Dans {daysDiff} jour{daysDiff > 1 ? 's' : ''}</span>
                      </div>

                      <strong className={styles.upcomingAmount}>{money(event.remaining)}</strong>
                    </button>
                  )
                })
              ) : (
                <div className={styles.emptySide}>
                  <i className="ti ti-circle-check" />
                  <span>Aucune échéance à venir.</span>
                </div>
              )}
            </div>
          </section>

          <section className={styles.googleCard}>
            <div className={styles.googleIcon}>
              <i className="ti ti-brand-google" />
            </div>
            <div>
              <h2>Google Calendar</h2>
              <p>Ajoutez une échéance Fiscow à votre Google Calendar directement depuis son détail.</p>
            </div>
            <div className={styles.googleStatus}>
              <span className={styles.statusDot} />
              Synchronisation complète à connecter plus tard
            </div>
          </section>

          <section className={styles.companyCard}>
            <span>Calendrier de</span>
            <strong>{companyName}</strong>
            <p>Les échéances affichées proviennent des déclarations disponibles dans Fiscow.</p>
          </section>
        </aside>
      </div>

      {/* Modal de détail */}
      {selectedEvent && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedEvent(null)
          }}
        >
          <div className={styles.eventModal} role="dialog" aria-modal="true">
            <div className={styles.modalHeader}>
              <div>
                <span className={`${styles.stateBadge} ${badgeClass(selectedEvent.state, styles)}`}>
                  {eventStateLabel(selectedEvent.state)}
                </span>
                <h2>{selectedEvent.title}</h2>
              </div>
              <button type="button" onClick={() => setSelectedEvent(null)} aria-label="Fermer">
                <i className="ti ti-x" />
              </button>
            </div>

            <div className={styles.modalDetails}>
              <div>
                <span>Période</span>
                <strong>{selectedEvent.period}</strong>
              </div>
              <div>
                <span>Échéance</span>
                <strong>
                  {selectedEvent.dueDate
                    ? formatDate(new Date(selectedEvent.dueDate))
                    : 'Non renseignée'}
                </strong>
              </div>
              <div>
                <span>Montant dû</span>
                <strong>{money(selectedEvent.amountDue)}</strong>
              </div>
              <div>
                <span>Reste à payer</span>
                <strong className={styles.modalAmount}>{money(selectedEvent.remaining)}</strong>
              </div>
            </div>

            <div className={styles.modalActions}>
              <Link href={`/declarations/${selectedEvent.id}`} className={styles.secondaryButton}>
                Voir la déclaration
              </Link>

              {selectedEvent.dueDate && (
                <a
                  href={toGoogleCalendarUrl(selectedEvent)}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.googleButton}
                >
                  <i className="ti ti-brand-google" />
                  Ajouter à Google Calendar
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}