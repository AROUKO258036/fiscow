import { FiabiliteBadge } from './fiabilite-badge'

interface DeadlineBannerProps {
  obligation: string
  date: string
  montant: string
  joursRestant: number
  estimation?: boolean
  salairesPrecis?: boolean | null
}

export function DeadlineBanner({
  obligation,
  date,
  montant,
  joursRestant,
  estimation = false,
  salairesPrecis = null,
}: DeadlineBannerProps) {
  const classe = joursRestant <= 1 ? 'rg-deadline-banner--urgent' : joursRestant <= 7 ? 'rg-deadline-banner--bientot' : ''
  const urgence =
    joursRestant <= 1 ? 'Urgent — à faire maintenant !' : joursRestant <= 7 ? "À venir dans moins d'une semaine" : 'Prochaine échéance'

  return (
    <div className={`rg-deadline-banner ${classe} d-flex align-items-center justify-content-between`}>
      <div>
        <p className="mb-0 fw-semibold">{urgence}</p>
        <h5 className="mb-0 mt-1">{obligation}</h5>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <small className="text-muted">
            {date} · {montant}
          </small>
          {estimation && <FiabiliteBadge precis={salairesPrecis} />}
        </div>
      </div>
    </div>
  )
}
