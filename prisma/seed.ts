import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

const DEMO_PASSWORD = 'password123'

async function seedDemoAccounts() {
  const adminEmail = 'admin@regule.bj'
  const userEmail = 'onb.test@regule.bj'

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Administrateur Regule',
        email: adminEmail,
        password: await bcrypt.hash(DEMO_PASSWORD, 10),
        emailVerifiedAt: new Date(),
        role: 'ADMIN',
      },
    })
    console.log('Seeded admin:', adminEmail)
  }

  const existingUser = await prisma.user.findUnique({ where: { email: userEmail } })
  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        name: 'Onboarding Test',
        email: userEmail,
        password: await bcrypt.hash(DEMO_PASSWORD, 10),
        emailVerifiedAt: new Date(),
        role: 'USER',
      },
    })
    await prisma.company.create({
      data: {
        userId: user.id,
        raisonSociale: 'SAS LOGISTIQUE OUEST',
        nif: `NIF-DEMO-${user.id}`,
        rccm: 'RCCM-BJ-2026-0001',
        secteur: 'services',
        dateCreation: new Date('2020-01-15'),
        effectif: 1,
        chiffreAffaires: 120000000,
        regimeTva: 'réel',
        typeEntite: 'sas',
        hasProperty: false,
        hasEmployees: true,
        telephone: '+229 01 23 45 67',
      },
    })
    console.log('Seeded employer:', userEmail, '(SAS LOGISTIQUE OUEST)')
  }
}

async function main() {
  const years = ['2024', '2025', '2026', '2027']

  const rates = [
    {
      key: 'is',
      name: 'Impôt sur les Sociétés',
      type: 'percentage',
      metadata: {
        standard: 25,
        non_declarant: 30,
        impot_minimum: 1.5,
        plancher: 250000,
      },
      applicableYears: years,
      description:
        'IS standard 25% (industriel), 30% (commercial/non-déclarant). Impôt minimum 1.5% du CA, plancher 250 000 FCFA.',
      reference: 'Art. 21-32 CGI (IS)',
    },
    {
      key: 'tva',
      name: 'Taxe sur la Valeur Ajoutée',
      type: 'percentage',
      metadata: { taux: 18 },
      applicableYears: years,
      description:
        'TVA au taux unique de 18% (régime réel et simplifié).',
      reference: 'Art. 223-263 CGI (TVA)',
    },
    {
      key: 'its',
      name: 'Impôt sur les Traitements et Salaires',
      type: 'progressive',
      metadata: {
        bareme: [
          { limite: 60000, taux: 0 },
          { limite: 150000, taux: 10 },
          { limite: 250000, taux: 15 },
          { limite: 500000, taux: 19 },
          { limite: null, taux: 30 },
        ],
      },
      applicableYears: years,
      description:
        'ITS barème progressif : 0% (0-60k), 10% (60k-150k), 15% (150k-250k), 19% (250k-500k), 30% (500k+).',
      reference: 'Art. 101-115 CGI (ITS)',
    },
    {
      key: 'cnss',
      name: 'Caisse Nationale de Sécurité Sociale',
      type: 'compound',
      metadata: {
        salarial: 3.6,
        patronal: 15.4,
        total: 19,
        prestations_familiales: 6.4,
        risques_pro: 1.5,
        retraite_patronal: 7.5,
        plafond: 600000,
      },
      applicableYears: years,
      description:
        'CNSS : 3.6% salarial + 15.4% patronal = 19% total. Plafond mensuel 600 000 FCFA.',
      reference: 'Loi 98-019 CNSS',
    },
    {
      key: 'tps',
      name: 'Taxe Professionnelle Synthétique',
      type: 'percentage',
      metadata: {
        taux: 1.5,
        minimum: 250000,
        seuil_regime_reel: 50000000,
      },
      applicableYears: years,
      description:
        'TPS 1.5% du CA, minimum 250 000 FCFA. Régime TPS si CA ≤ 50M, sinon régime du réel.',
      reference: 'Art. 401-415 CGI (Patente)',
    },
    {
      key: 'tfu',
      name: 'Taxe Foncière Unique',
      type: 'percentage',
      metadata: {
        bati: 6,
        non_bati: 5,
      },
      applicableYears: years,
      description:
        'TFU : 6% sur la valeur locative des propriétés bâties, 5% sur les propriétés non bâties.',
      reference: 'Art. 501-510 CGI (TFU)',
    },
  ]

  for (const rate of rates) {
    await prisma.taxRate.upsert({
      where: { key: rate.key },
      update: {},
      create: {
        ...rate,
        applicableYears: rate.applicableYears,
      },
    })
  }

  const transversaux = [
    'Gérant(e) / Dirigeant(e)',
    'Comptable',
    'Secrétaire / Assistant(e)',
    "Agent d'entretien",
    'Gardien(ne)',
  ]

  const parSecteur: Record<string, string[]> = {
    commerce: [
      'Vendeur / Vendeuse',
      'Caissier / Caissière',
      'Magasinier / Magasinière',
      'Gérant(e) de boutique',
      'Acheteur / Approvisionneur',
      'Livreur',
      'Commercial(e)',
    ],
    services: [
      "Agent d'accueil",
      'Commercial(e)',
      'Chargé(e) de clientèle',
      'Technicien(ne)',
      'Consultant(e)',
      'Livreur',
    ],
    industrie: [
      'Opérateur / Opératrice de production',
      'Ouvrier / Ouvrière',
      "Chef d'équipe",
      'Contrôleur / Contrôleuse qualité',
      'Technicien(ne) de maintenance',
      'Magasinier / Magasinière',
    ],
    agriculture: [
      'Ouvrier / Ouvrière agricole',
      'Chef de culture',
      'Technicien(ne) agricole',
      "Conducteur / Conductrice d'engins",
      'Manœuvre',
    ],
    transport: [
      'Chauffeur',
      'Conducteur / Conductrice',
      'Mécanicien(ne)',
      'Chargeur / Manutentionnaire',
      'Agent de gare / de quai',
      'Dispatcher',
    ],
    btp: [
      'Chef de chantier',
      'Maçon',
      'Manœuvre',
      'Électricien(ne)',
      'Plombier',
      "Conducteur / Conductrice d'engins",
      'Soudeur',
      'Peintre',
    ],
    numerique: [
      'Développeur / Développeuse',
      'Designer',
      'Community manager',
      'Chef de projet',
      'Support technique',
      'Data analyst',
    ],
    autre: [
      'Employé(e) polyvalent(e)',
      'Superviseur / Superviseuse',
      'Commercial(e)',
      'Agent de terrain',
    ],
  }

  const existingJobTitles = await prisma.jobTitle.count()
  if (existingJobTitles === 0) {
    for (const libelle of transversaux) {
      await prisma.jobTitle.create({
        data: { secteur: 'transversal', libelle, transversal: true },
      })
    }
    for (const [secteur, postes] of Object.entries(parSecteur)) {
      for (const libelle of postes) {
        await prisma.jobTitle.create({
          data: { secteur, libelle, transversal: false },
        })
      }
    }
    console.log(`Seeded ${transversaux.length + Object.values(parSecteur).flat().length} postes`)
  }

  console.log(`Seeded ${rates.length} barèmes DGI`)

  await seedDemoAccounts()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
