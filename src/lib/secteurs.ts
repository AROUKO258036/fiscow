export const SECTEURS = [
  'transversal',
  'commerce',
  'services',
  'industrie',
  'agriculture',
  'transport',
  'btp',
  'numerique',
  'autre',
]

export const SECTEUR_LABELS: Record<string, string> = {
  transversal: 'Transversal',
  commerce: 'Commerce',
  services: 'Services',
  industrie: 'Industrie',
  agriculture: 'Agriculture',
  transport: 'Transport',
  btp: 'BTP',
  numerique: 'Numérique',
  autre: 'Autre',
}

export function secteurLabel(secteur: string): string {
  return SECTEUR_LABELS[secteur] ?? secteur
}
