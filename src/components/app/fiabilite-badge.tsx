export function FiabiliteBadge({ precis }: { precis: boolean | null | undefined }) {
  if (precis === true) {
    return (
      <span
        className="rg-fiabilite rg-fiabilite--precis"
        title="Montant calculé à partir des salaires réels saisis dans votre configuration"
      >
        <i className="ti ti-circle-check"></i> Salaires réels
      </span>
    )
  }
  return (
    <span
      className="rg-fiabilite rg-fiabilite--estime"
      title="Estimation à partir de votre chiffre d'affaires — ajoutez vos salariés pour un calcul précis"
    >
      <i className="ti ti-alert-triangle"></i> Estimation
    </span>
  )
}
