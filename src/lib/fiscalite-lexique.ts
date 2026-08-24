export interface TermeFiscal {
  sigle?: string
  nom: string
  def: string
  exemple?: string
}

export const FISCALITE_LEXIQUE: Record<string, TermeFiscal> = {
  // ─── Impôt sur les Sociétés (IS) ─────────────────────────────────────

  is: {
    sigle: 'IS',
    nom: "Impôt sur les Sociétés",
    def: "L'IS est l'impôt que paie une société sur ses bénéfices. Il concerne les entreprises constituées en sociétés (SARL, SA, SAS, etc.), pas les entrepreneurs individuels.",
    exemple:
      'Votre SARL de transport a réalisé 20 millions FCFA de bénéfice. Vous paierez 25 % (5 millions FCFA) si vous êtes dans le secteur industriel, ou 30 % (6 millions FCFA) si vous êtes dans le commerce.',
  },

  is_taux: {
    sigle: 'IS',
    nom: "Taux de l'Impôt sur les Sociétés",
    def: "Le taux normal de l'IS est de 25 % pour les activités industrielles et les écoles privées, et de 30 % pour toutes les autres activités (commerce, services, etc.).",
    exemple:
      "Une entreprise de fabrication (industrielle) paie 25 % de son bénéfice, tandis qu'un magasin de vêtements (commerce) paie 30 %.",
  },

  is_minimum_perception: {
    sigle: 'Minimum de perception IS',
    nom: 'Impôt minimum sur les Sociétés',
    def: "Même si votre bénéfice est faible, vous devez payer au moins 1 % de votre chiffre d'affaires encaissé, avec un plancher de 250 000 FCFA par an.",
    exemple:
      "Votre société déclare un bénéfice de 100 000 FCFA. L'IS calculé serait 25 000 FCFA, mais vous paierez au minimum 250 000 FCFA (le plancher légal).",
  },

  is_produits_encaissables: {
    nom: 'Produits encaissables',
    def: "Ce sont toutes les sommes que votre entreprise a réellement reçues ou va recevoir : ventes, prestations, revenus financiers. Sont exclus les montants inscrits en comptabilité mais pas encore encaissés (créances clients, production stockée).",
    exemple:
      "Vous avez vendu pour 15 millions FCFA, mais seuls 12 millions ont été payés par les clients. Les produits encaissables sont de 12 millions.",
  },

  is_acomptes: {
    nom: 'Acomptes IS',
    def: "L'IS se paie en 4 acomptes chaque année (mars, juin, septembre, décembre), chacun égal au quart de l'impôt de l'année précédente. Le solde est versé avec la déclaration annuelle (avant le 30 avril).",
    exemple:
      "Si vous avez payé 1 million FCFA d'IS l'an dernier, vous verserez 250 000 FCFA le 10 mars, 250 000 FCFA le 10 juin, etc.",
  },

  // ─── Impôt sur les Bénéfices d'Affaires (IBA) ────────────────────────

  iba: {
    sigle: 'IBA',
    nom: "Impôt sur les Bénéfices d'Affaires",
    def: "L'IBA est l'impôt que paient les entrepreneurs individuels (personnes physiques) sur les bénéfices de leur activité commerciale, industrielle, artisanale ou libérale.",
    exemple:
      "Vous êtes coiffeur, menuisier, ou consultant en freelance : votre activité est soumise à l'IBA sur les bénéfices que vous déclarez.",
  },

  iba_taux: {
    sigle: 'IBA',
    nom: "Taux de l'Impôt sur les Bénéfices d'Affaires",
    def: "Le taux normal de l'IBA est de 30 %. Il est réduit à 25 % pour les établissements privés d'enseignement.",
  },

  iba_minimum_perception: {
    nom: 'Minimum de perception IBA',
    def: "Même si votre bénéfice est faible ou nul, vous devez payer au moins 1,5 % de votre chiffre d'affaires encaissé, avec un plancher de 500 000 FCFA par an.",
    exemple:
      "Pour un chiffre d'affaires de 10 millions mais un bénéfice de seulement 200 000 FCFA, l'IBA minimum sera 500 000 FCFA (plancher), pas 150 000 (1,5 % du CA).",
  },

  // ─── Impôt sur les Traitements et Salaires (ITS) ─────────────────────

  its: {
    sigle: 'ITS',
    nom: 'Impôt sur les Traitements et Salaires',
    def: "L'ITS est l'impôt prélevé chaque mois sur le salaire brut de vos employés. L'employeur le retient à la source et le reverse au Trésor Public pour le compte du salarié.",
    exemple:
      "Un employé payé 300 000 FCFA brut par mois verra une retenue ITS sur son bulletin de salaire. L'entreprise reverse cette somme aux impôts avant le 10 du mois suivant.",
  },

  its_bareme: {
    nom: 'Barème ITS',
    def: "L'ITS est calculé par tranches : 0 % jusqu'à 60 000 FCFA, puis 10 %, 15 %, 19 %, et 30 % au-delà de 500 000 FCFA. S'y ajoutent deux redevances ORTB (1 000 F en mars, 3 000 F en juin).",
    exemple:
      "Sur un salaire brut de 400 000 FCFA : les premières 60 000 F sont exonérées, la tranche 60 001–150 000 paie 10 %, etc.",
  },

  its_redevance_ortb: {
    nom: 'Redevance ORTB',
    def: "Une contribution supplémentaire prélevée avec l'ITS, au profit de l'Office de Radiodiffusion et Télévision du Bénin : 1 000 F sur le salaire de mars et 3 000 F sur celui de juin.",
    exemple:
      "En mars, un employé verra 1 000 F supplémentaires retenus sur son salaire pour financer l'ORTB.",
  },

  its_avantages_nature: {
    nom: 'Avantages en nature',
    def: "Tout bien ou service que l'employeur met gratuitement à disposition du salarié : logement, véhicule, électricité, eau, téléphone, nourriture. L'ITS s'applique aussi sur la valeur de ces avantages.",
    exemple:
      "Votre entreprise fournit un logement de fonction à un cadre : 15 % de son salaire de base est ajouté à sa base imposable ITS chaque mois.",
  },

  // ─── Taxe sur la Valeur Ajoutée (TVA) ────────────────────────────────

  tva: {
    sigle: 'TVA',
    nom: 'Taxe sur la Valeur Ajoutée',
    def: "La TVA est une taxe de 18 % que vous facturez à vos clients et que vous reversez à l'État, après avoir déduit celle que vous avez payée sur vos achats professionnels.",
    exemple:
      "Vous facturez un client 118 000 F TTC : vous devez 18 000 F de TVA à l'État. Mais si vous avez acheté pour 59 000 F TTC (dont 9 000 F de TVA), vous ne reversez que 18 000 – 9 000 = 9 000 F.",
  },

  tva_taux: {
    nom: 'Taux de TVA',
    def: "Le taux normal de la TVA au Bénin est de 18 % sur la plupart des biens et services.",
  },

  tva_collectee: {
    nom: 'TVA collectée',
    def: "C'est la TVA que vous facturez à vos clients sur vos ventes ou prestations. Vous la collectez pour le compte de l'État.",
    exemple: 'Vous vendez 1 000 000 F HT + 180 000 F de TVA : la TVA collectée est de 180 000 F.',
  },

  tva_deductible: {
    nom: 'TVA déductible',
    def: "C'est la TVA que vous avez payée sur vos achats professionnels (marchandises, fournitures, équipements, services). Vous pouvez la déduire de la TVA que vous devez reverser.",
    exemple: 'Vous achetez des marchandises pour 500 000 F HT + 90 000 F de TVA : cette TVA de 90 000 F est déductible.',
  },

  tva_credit: {
    nom: 'Crédit de TVA',
    def: "Quand la TVA que vous avez payée sur vos achats dépasse celle que vous avez collectée sur vos ventes, vous avez un crédit de TVA. Vous pouvez le reporter sur les mois suivants ou demander son remboursement.",
    exemple:
      "Vous avez collecté 100 000 F de TVA mais payé 130 000 F sur vos achats : vous avez un crédit de 30 000 F.",
  },

  tva_regime: {
    nom: 'Régime de TVA',
    def: "Le régime de TVA détermine la fréquence de vos déclarations. Le régime simplifié (CA < 50 millions) : déclaration annuelle + 2 acomptes. Le régime réel normal (CA > 50 millions) : déclaration mensuelle.",
    exemple: "Un petit commerce avec un CA de 30 millions relève du régime simplifié de TVA.",
  },

  tva_regime_transparent: {
    nom: 'Régime transparent (TPS)',
    def: "Le régime transparent s'applique aux très petites entreprises (CA ≤ 50 millions) qui optent pour la Taxe Professionnelle Synthétique (TPS). La TPS remplace la TVA et l'IBA : vous ne collectez pas la TVA sur vos factures.",
    exemple:
      "Un artisan coiffeur avec un CA de 8 millions est en TPS : il ne facture pas de TVA à ses clients et paie 1,5 % de son CA une fois par an.",
  },

  // ─── Taxe Professionnelle Synthétique (TPS) ─────────────────────────

  tps: {
    sigle: 'TPS',
    nom: 'Taxe Professionnelle Synthétique',
    def: "La TPS est un impôt unique qui remplace l'IBA et la TVA pour les très petites entreprises (CA ≤ 50 millions). Le taux est de 1,5 % du chiffre d'affaires annuel, avec un minimum de 250 000 FCFA.",
    exemple:
      "Votre boutique de quartier réalise 20 millions de CA : vous paierez 300 000 F de TPS (1,5 %), sans avoir à déclarer la TVA ni l'IBA.",
  },

  tps_plafond: {
    nom: 'Plafond TPS',
    def: "La TPS est réservée aux entreprises individuelles dont le chiffre d'affaires annuel ne dépasse pas 50 millions FCFA.",
  },

  // ─── CNSS ───────────────────────────────────────────────────────────

  cnss: {
    sigle: 'CNSS',
    nom: 'Caisse Nationale de Sécurité Sociale',
    def: "La CNSS est l'organisme qui gère les cotisations sociales des salariés au Bénin. Chaque mois, l'employeur paie une part patronale (15,4 % du salaire brut dans la limite de 600 000 F) et retient une part salariale (3,6 %) sur le salaire du salarié.",
    exemple:
      "Pour un salarié payé 300 000 F brut : l'employeur verse 46 200 F (part patronale) et retient 10 800 F sur le salaire (part salariale), soit un total de 57 000 F à reverser à la CNSS.",
  },

  cnss_part_patronale: {
    nom: 'Part patronale CNSS',
    def: "C'est la part des cotisations sociales payée par l'employeur : 15,4 % du salaire brut du salarié (dans la limite de 600 000 F par mois). Elle comprend les prestations familiales (6,4 %), les accidents du travail (1,5 %), et la retraite (7,5 %).",
  },

  cnss_part_salariale: {
    nom: 'Part salariale CNSS',
    def: "C'est la part des cotisations sociales retenue sur le salaire brut du salarié : 3,6 %, exclusivement pour la retraite.",
  },

  cnss_plafond: {
    nom: 'Plafond CNSS',
    def: "Le salaire pris en compte pour le calcul des cotisations CNSS est limité à 600 000 FCFA par mois. Les cotisations sur la partie du salaire qui dépasse 600 000 F ne sont pas dues.",
    exemple:
      "Un cadre payé 1 000 000 F brut : les cotisations CNSS ne sont calculées que sur 600 000 F (le plafond), pas sur la totalité.",
  },

  // ─── Taxe Foncière Unifiée (TFU) ────────────────────────────────────

  tfu: {
    sigle: 'TFU',
    nom: 'Taxe Foncière Unifiée',
    def: "La TFU est l'impôt annuel sur les propriétés foncières bâties (maisons, bureaux, usines) et non bâties (terrains). Elle est calculée sur la valeur locative du bien.",
    exemple:
      "Si votre local professionnel a une valeur locative de 2 millions FCFA par an, vous paierez 120 000 F de TFU (6 %) si c'est un bâtiment.",
  },

  tfu_taux_bati: {
    nom: 'Taux TFU bâti',
    def: 'Pour les propriétés bâties (magasin, bureau, entrepôt, maison), le taux de la TFU est de 6 % de la valeur locative annuelle.',
  },

  tfu_taux_non_bati: {
    nom: 'Taux TFU non bâti',
    def: 'Pour les terrains non construits, le taux de la TFU est de 5 % de la valeur locative annuelle.',
  },

  // ─── Concepts transversaux ──────────────────────────────────────────

  benefice: {
    nom: 'Bénéfice imposable',
    def: "Le bénéfice imposable est la différence entre vos recettes (ventes, prestations) et vos charges déductibles (achats, loyers, salaires, fournitures). C'est sur ce montant que l'IS ou l'IBA est calculé.",
    exemple:
      "Pour un CA de 30 millions et des charges de 22 millions, le bénéfice imposable est de 8 millions.",
  },

  chiffre_affaires: {
    nom: "Chiffre d'affaires",
    def: "Le chiffre d'affaires (CA) est le total des ventes et prestations facturées à vos clients sur une période donnée (mois, trimestre, année), hors TVA.",
    exemple: "Si vous avez vendu 50 articles à 10 000 F pièce, votre CA est de 500 000 F.",
  },

  resultat: {
    nom: 'Résultat',
    def: "Le résultat est ce qui reste après avoir soustrait toutes les charges du chiffre d'affaires. S'il est positif, c'est un bénéfice. S'il est négatif, c'est un déficit.",
  },

  declaration: {
    nom: 'Déclaration fiscale',
    def: "C'est le document que vous envoyez à l'administration fiscale pour indiquer vos revenus, vos charges, et calculer le montant de l'impôt que vous devez.",
    exemple:
      "Chaque année avant le 30 avril, vous déposez votre déclaration IS avec vos états financiers (bilan, compte de résultat).",
  },

  acompte: {
    nom: 'Acompte',
    def: "Versement partiel et provisoire de l'impôt, effectué avant la déclaration annuelle. Les acomptes sont calculés sur la base de l'impôt de l'année précédente.",
    exemple: "L'IS se paie en 4 acomptes (mars, juin, septembre, décembre), puis un solde en avril.",
  },

  assiette: {
    nom: 'Assiette imposable',
    def: "L'assiette est le montant sur lequel on applique le taux d'imposition. Pour l'IS, c'est le bénéfice imposable. Pour la TVA, c'est le montant hors taxe des ventes.",
  },

  taux: {
    nom: "Taux d'imposition",
    def: "Pourcentage appliqué à l'assiette pour calculer le montant de l'impôt dû.",
  },

  secteur_industriel: {
    nom: 'Secteur industriel',
    def: "Activité de fabrication, transformation ou production de biens (usine, atelier de production, agroalimentaire). Les entreprises industrielles bénéficient d'un taux d'IS réduit à 25 %.",
    exemple: 'Une unité de transformation de noix de cajou, une boulangerie industrielle, une usine de textile.',
  },

  secteur_commercial: {
    nom: 'Secteur commercial',
    def: "Activité d'achat et de revente de biens ou de prestation de services (magasin, import-export, restaurant, conseil). Le taux d'IS est de 30 %.",
    exemple: 'Un magasin de vêtements, un restaurant, un cabinet de conseil.',
  },

  regime_tva_reel: {
    nom: 'Régime réel normal (TVA)',
    def: "Régime de TVA pour les entreprises dont le CA dépasse 50 millions FCFA. Obligation de déclarer et payer la TVA chaque mois.",
  },

  regime_tva_simplifie: {
    nom: 'Régime simplifié (TVA)',
    def: 'Régime de TVA pour les petites entreprises (CA < 50 millions). Une seule déclaration annuelle de TVA, avec 2 acomptes provisionnels.',
  },

  type_entite_societe: {
    nom: 'Société (personne morale)',
    def: "Une entreprise constituée sous forme de SARL, SA, SAS ou autre forme juridique. La société est une personne morale distincte de ses associés. Elle paie l'IS sur ses bénéfices.",
  },

  type_entite_individuelle: {
    nom: 'Entreprise individuelle',
    def: "Une entreprise exploitée directement par une personne physique (commerçant, artisan, profession libérale). L'entrepreneur est fiscalement confondu avec son entreprise. Il paie l'IBA sur ses bénéfices.",
    exemple:
      "Un menuisier inscrit au registre du commerce, un consultant freelance, un coiffeur.",
  },

  exoneration: {
    nom: 'Exonération',
    def: "Une exonération est une dispense légale de payer un impôt. Elle peut être totale ou partielle, temporaire ou permanente.",
    exemple:
      "Les indemnités de licenciement calculées sur la base légale sont exonérées d'ITS. Les bénéfices des entreprises nouvelles peuvent être exonérés d'IS pendant les premières années.",
  },

  abatttement: {
    nom: 'Abattement',
    def: "Un abattement est une réduction forfaitaire appliquée avant le calcul de l'impôt. Il diminue la base imposable, donc l'impôt à payer.",
    exemple:
      "Les indemnités de fin de carrière bénéficient d'un abattement de 25 % avant calcul de l'ITS.",
  },

  credit_impot: {
    nom: "Crédit d'impôt",
    def: "Un crédit d'impôt est une somme que vous pouvez déduire du montant de l'impôt que vous devez. Contrairement à une déduction qui réduit la base imposable, le crédit d'impôt réduit directement l'impôt à payer.",
    exemple:
      "Le crédit d'impôt pour acquisition de machines électroniques de facturation certifiées peut être imputé sur l'IS ou l'IBA.",
  },

  deficit_reportable: {
    nom: 'Report déficitaire',
    def: "Quand votre entreprise est en déficit (charges > recettes), vous pouvez déduire ce déficit des bénéfices des années suivantes. Pour l'IS, le report est possible sur 5 ans. Pour l'IBA, sur 3 ans.",
    exemple:
      "En 2025, votre société perd 2 millions. En 2026, elle fait 3 millions de bénéfice : elle ne paiera l'IS que sur 3-2 = 1 million.",
  },

  amortissement: {
    nom: 'Amortissement',
    def: "L'amortissement est la constatation comptable de la perte de valeur d'un équipement ou d'un bien durable (véhicule, machine, ordinateur) sur sa durée d'utilisation. C'est une charge déductible.",
    exemple:
      "Vous achetez un camion de livraison à 20 millions. Vous pouvez déduire chaque année une fraction de ce prix (par exemple 4 millions par an pendant 5 ans) en tant qu'amortissement.",
  },

  provision: {
    nom: 'Provision',
    def: "Une provision est une somme mise de côté dans votre comptabilité pour faire face à une perte ou une dépense future probable (créance douteuse, litige). Une provision correctement constituée est déductible du bénéfice.",
    exemple:
      "Un client vous doit 500 000 F mais ne paie plus : vous pouvez constituer une provision pour créance douteuse et la déduire de votre bénéfice.",
  },

  penalite_retard: {
    nom: 'Pénalité de retard',
    def: "Si vous déposez une déclaration ou payez un impôt après la date limite, une pénalité de 20 % du montant dû s'applique, portée à 40 % après mise en demeure.",
  },

  penalite_insuffisance: {
    nom: "Pénalité d'insuffisance",
    def: "Si vous déclarez un montant inférieur à ce que vous deviez (erreur ou omission), vous paierez 20 % du montant non déclaré en pénalité, 40 % en cas de mauvaise foi, et 80 % en cas de fraude.",
  },

  interet_retard: {
    nom: 'Intérêt de retard',
    def: "En plus des pénalités, tout retard de paiement entraîne un intérêt de 0,25 % par mois ou fraction de mois, calculé sur le montant des droits simples, plafonné au montant des droits.",
    exemple:
      "Si vous payez l'IS 4 mois après la date : 0,25 % × 4 = 1 % d'intérêt supplémentaire sur l'impôt dû.",
  },

  redevance_ortb: {
    nom: 'Redevance ORTB',
    def: "Contribution annuelle au profit de l'Office de Radiodiffusion et Télévision du Bénin. Elle est perçue en deux fois sur l'ITS : 1 000 F en mars, 3 000 F en juin. Elle majore aussi l'IS et l'IBA de 4 000 F payables avec l'acompte du 10 mars.",
  },
}

export function getTermeFiscal(term: string): TermeFiscal | undefined {
  return FISCALITE_LEXIQUE[term]
}
