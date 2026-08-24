interface KpiCardProps {
  label: string
  valeur: string | number
  icone?: string
  couleur?: string
  sousTexte?: string
}

export function KpiCard({
  label,
  valeur,
  icone = 'ti ti-report-money',
  couleur = 'var(--rg-accent-brique)',
  sousTexte = '',
}: KpiCardProps) {
  return (
    <div className="card stat-card-hover">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <p className="rg-kpi-label">{label}</p>
            <h4 className="rg-kpi-value text-truncate">{valeur}</h4>
            {sousTexte && <small className="rg-kpi-sub">{sousTexte}</small>}
          </div>
          <div
            className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 rg-kpi-icon"
            style={{ ['--rg-icon-color' as string]: couleur }}
          >
            <i className={icone}></i>
          </div>
        </div>
      </div>
    </div>
  )
}
