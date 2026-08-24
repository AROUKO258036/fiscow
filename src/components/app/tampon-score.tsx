export function TamponScore({ score }: { score: number }) {
  const r = 45
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference
  const cls = score >= 70 ? 'rg-tampon--vert' : score >= 40 ? 'rg-tampon--orange' : 'rg-tampon--rouge'

  return (
    <div className={`rg-tampon ${cls}`}>
      <svg viewBox="0 0 120 120">
        <circle className="rg-tampon-bg" cx="60" cy="60" r={r} />
        <circle
          className="rg-tampon-fill"
          cx="60"
          cy="60"
          r={r}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="rg-tampon-content">
        <span className="rg-tampon-score">{score}%</span>
        <span className="rg-tampon-label">
          {score >= 70 ? 'Conforme' : score >= 40 ? 'En alerte' : 'Non conforme'}
        </span>
      </div>
    </div>
  )
}
