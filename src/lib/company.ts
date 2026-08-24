export interface CompanyForTaxes {
  type_entite: string
  chiffre_affaires: number | null
  effectif: number
  has_property: boolean
  regime_tva: string
}

export interface ApplicableTax {
  key: string
  sigle: string
  nom: string
  route: string | null
  description: string
}

export function getApplicableTaxes(company: CompanyForTaxes): ApplicableTax[] {
  const taxes: ApplicableTax[] = []

  const isSociete = company.type_entite === 'societe'
  const isIndividuelle = company.type_entite === 'individuelle'
  const ca = company.chiffre_affaires ?? 0
  const caDepasse50M = ca > 50_000_000
  const hasEmployees = company.effectif > 0
  const hasProperty = company.has_property

  if (isSociete || (isIndividuelle && caDepasse50M)) {
    taxes.push({
      key: 'is',
      sigle: 'IS',
      nom: "Impôt sur les Sociétés",
      route: 'calculateurs.is',
      description: isSociete
        ? "Société soumise à l'IS"
        : "Entreprise individuelle avec CA > 50M, soumise à l'IS",
    })
  }

  if (isIndividuelle && !caDepasse50M) {
    taxes.push({
      key: 'iba',
      sigle: 'IBA',
      nom: "Impôt sur les Bénéfices d'Affaires",
      route: null,
      description: "Entreprise individuelle soumise à l'IBA",
    })
    taxes.push({
      key: 'tps',
      sigle: 'TPS',
      nom: 'Taxe Professionnelle Synthétique',
      route: 'calculateurs.patente',
      description: 'CA ≤ 50M, régime de la TPS',
    })
  }

  taxes.push({
    key: 'tva',
    sigle: 'TVA',
    nom: 'Taxe sur la Valeur Ajoutée',
    route: 'calculateurs.tva',
    description: `Régime ${company.regime_tva}`,
  })

  if (hasEmployees) {
    taxes.push({
      key: 'its',
      sigle: 'ITS',
      nom: 'Impôt sur les Traitements et Salaires',
      route: 'calculateurs.its',
      description: `${company.effectif} salarié(s) déclaré(s)`,
    })
    taxes.push({
      key: 'cnss',
      sigle: 'CNSS',
      nom: 'Caisse Nationale de Sécurité Sociale',
      route: 'calculateurs.cnss',
      description: `${company.effectif} salarié(s) déclaré(s)`,
    })
  }

  if (hasProperty) {
    taxes.push({
      key: 'tfu',
      sigle: 'TFU',
      nom: 'Taxe Foncière Unique',
      route: 'calculateurs.tfu',
      description: 'Propriété immobilière déclarée',
    })
  }

  return taxes
}

export function getApplicableKeys(company: CompanyForTaxes): string[] {
  return getApplicableTaxes(company).map((t) => t.key)
}

export function hasTax(company: CompanyForTaxes, key: string): boolean {
  return getApplicableKeys(company).includes(key)
}
