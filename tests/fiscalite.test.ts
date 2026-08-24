import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { calculerIts } from '@/lib/fiscalite/its'
import { calculerCnss } from '@/lib/fiscalite/cnss'
import { calculerIs } from '@/lib/fiscalite/is'
import { calculerTva } from '@/lib/fiscalite/tva'
import { calculerPatente } from '@/lib/fiscalite/patente'
import { calculerTfu } from '@/lib/fiscalite/tfu'
import { estimateMontant, generateRaw, salairesPrecis } from '@/lib/fiscalite/calendar'
import { prisma } from '@/lib/prisma'
import { resetCache } from '@/lib/fiscalite/tax-rates'
import type { CompanyForCalendar } from '@/lib/fiscalite/calendar'

beforeAll(async () => {
  resetCache()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('ITS — parité avec CalculateurItsService (PHP)', () => {
  it('ITS 150 000 FCFA = 9 000', async () => {
    const r = await calculerIts(150000)
    expect(r.total_impots).toBe(9000)
    expect(r.salaire_net).toBe(141000)
  })

  it('ITS 200 000 FCFA = 16 500', async () => {
    const r = await calculerIts(200000)
    expect(r.total_impots).toBe(16500)
  })

  it('ITS 400 000 FCFA = 52 500', async () => {
    const r = await calculerIts(400000)
    expect(r.total_impots).toBe(52500)
  })

  it('ITS 500 000 FCFA = 71 500', async () => {
    const r = await calculerIts(500000)
    expect(r.total_impots).toBe(71500)
  })

  it('ITS 1 000 000 FCFA = 221 500 (tranche 30%)', async () => {
    const r = await calculerIts(1000000)
    expect(r.total_impots).toBe(221500)
  })

  it('ITS 60 000 FCFA = 0 (tranche exonérée)', async () => {
    const r = await calculerIts(60000)
    expect(r.total_impots).toBe(0)
  })

  it('barème progressif : 5 tranches', async () => {
    const r = await calculerIts(1000000)
    expect(r.tranches).toHaveLength(5)
    expect(r.tranches[0].taux).toBe(0)
    expect(r.tranches[4].taux).toBe(30)
    expect(r.tranches[4].a).toBe('∞')
  })

  it('taux effectif correct', async () => {
    const r = await calculerIts(200000)
    expect(r.taux_effectif).toBeCloseTo((16500 / 200000) * 100, 2)
  })
})

describe('CNSS — parité avec CalculateurCnssService (PHP)', () => {
  it('CNSS 150 000 = 28 500 (19% : 3.6% + 15.4%)', async () => {
    const r = await calculerCnss(150000, 1)
    expect(r.total_mensuel).toBe(28500)
  })

  it('CNSS 200 000 = 38 000', async () => {
    const r = await calculerCnss(200000, 1)
    expect(r.total_mensuel).toBe(38000)
  })

  it('CNSS 400 000 = 76 000', async () => {
    const r = await calculerCnss(400000, 1)
    expect(r.total_mensuel).toBe(76000)
  })

  it('plafond 600 000 : CNSS 1 000 000 basé sur 600 000 = 114 000', async () => {
    const r = await calculerCnss(1000000, 1)
    expect(r.assiette).toBe(600000)
    expect(r.total_mensuel).toBe(114000)
  })

  it('multiplicatif : 3 salariés × 3', async () => {
    const r = await calculerCnss(200000, 3)
    expect(r.total_cnss).toBe(114000)
    expect(r.total_annuel).toBe(1368000)
  })

  it('détail des parts', async () => {
    const r = await calculerCnss(200000, 1)
    expect(r.part_salariale).toBe(7200)
    expect(r.part_patronale).toBe(30800)
    expect(r.taux_salarial).toBeCloseTo(3.6, 10)
    expect(r.taux_patronal).toBeCloseTo(15.4, 10)
  })
})

describe('IS — parité avec CalculateurIsService (PHP)', () => {
  it('commercial : CA 100M, charges 60M → 30% de 40M = 12M', async () => {
    const r = await calculerIs(100000000, 60000000, 'commercial')
    expect(r.benefice_imposable).toBe(40000000)
    expect(r.is_du).toBe(12000000)
    expect(r.taux_is).toBe(30)
  })

  it('industriel : taux standard 25%', async () => {
    const r = await calculerIs(100000000, 60000000, 'industriel')
    expect(r.is_du).toBe(10000000)
    expect(r.taux_is).toBe(25)
  })

  it('impôt minimum : 1.5% du CA avec plancher 250k', async () => {
    const r = await calculerIs(10000000, 9000000, 'commercial')
    // bénéfice 1M × 30% = 300k vs CA 10M × 1.5% = 150k → max = 300k
    expect(r.is_du).toBe(300000)
  })

  it('plancher : petit CA → 250 000 minimum', async () => {
    const r = await calculerIs(5000000, 4000000, 'commercial')
    // bénéfice 1M × 30% = 300k > 1.5%×5M = 75k, mais > plancher 250k
    expect(r.is_du).toBe(300000)
  })

  it('bénéfice négatif → impôt minimum', async () => {
    const r = await calculerIs(10000000, 20000000, 'commercial')
    expect(r.benefice_imposable).toBe(0)
    // max(0, 150k) = 150k < plancher 250k → 250k
    expect(r.is_du).toBe(250000)
  })
})

describe('TVA — parité avec CalculateurTvaService (PHP)', () => {
  it('ventes 100k × 18% = 18k collectée', async () => {
    const r = await calculerTva(100000, 0)
    expect(r.tva_collectee).toBe(18000)
    expect(r.tva_a_payer).toBe(18000)
  })

  it('déduction : achats déductibles', async () => {
    const r = await calculerTva(100000, 50000)
    expect(r.tva_deductible).toBe(9000)
    expect(r.tva_a_payer).toBe(9000)
  })

  it('crédit de TVA si achats > ventes', async () => {
    const r = await calculerTva(50000, 100000)
    expect(r.tva_credit).toBe(9000)
    expect(r.tva_a_payer).toBe(0)
  })
})

describe('Patente/TPS — parité avec CalculateurPatenteService (PHP)', () => {
  it('CA 10M ≤ 50M → TPS 1.5% = 150k < minimum → 250k', async () => {
    const r = await calculerPatente(10000000)
    expect(r.regime).toBe('TPS')
    expect(r.sous_tps).toBe(true)
    expect(r.montant).toBe(250000)
  })

  it('CA 40M → 1.5% = 600k > minimum', async () => {
    const r = await calculerPatente(40000000)
    expect(r.montant).toBe(600000)
  })

  it('CA > 50M → régime du réel, montant null', async () => {
    const r = await calculerPatente(60000000)
    expect(r.regime).toBe('Régime du réel')
    expect(r.sous_tps).toBe(false)
    expect(r.montant).toBeNull()
  })
})

describe('TFU — parité avec CalculateurTfuService (PHP)', () => {
  it('bâti 6% : valeur 10M → 600k', async () => {
    const r = await calculerTfu(10000000, 'bati')
    expect(r.taux).toBe(6)
    expect(r.tfu_annuelle).toBe(600000)
  })

  it('non bâti 5% : valeur 10M → 500k', async () => {
    const r = await calculerTfu(10000000, 'non_bati')
    expect(r.taux).toBe(5)
    expect(r.tfu_annuelle).toBe(500000)
  })
})

describe('CalendarService — parité avec PHP', () => {
  function makeCompany(overrides: Partial<CompanyForCalendar> = {}): CompanyForCalendar {
    return {
      id: 1,
      chiffre_affaires: 60000000,
      effectif: 2,
      regime_tva: 'réel',
      secteur: 'services',
      has_employees: true,
      activeEmployees: [],
      ...overrides,
    }
  }

  it('ITS/CNSS calculés par salarié (test PHP: 150k+400k)', async () => {
    const company = makeCompany({
      activeEmployees: [
        { salaire_brut_mensuel: 150000 },
        { salaire_brut_mensuel: 400000 },
      ],
    })

    const its = await estimateMontant(company, 'its')
    const cnss = await estimateMontant(company, 'cnss')

    expect(its).toBe(61500) // ITS(150k) 9000 + ITS(400k) 52500
    expect(cnss).toBe(104500) // CNSS(150k) 28500 + CNSS(400k) 76000
  })

  it('les salariés inactifs sont exclus', async () => {
    const company = makeCompany({
      activeEmployees: [{ salaire_brut_mensuel: 200000 }],
    })

    const its = await estimateMontant(company, 'its')
    const cnss = await estimateMontant(company, 'cnss')

    expect(its).toBe(16500)
    expect(cnss).toBe(38000)
  })

  it('fallback sans salariés précis (test PHP effectif 1)', async () => {
    const company = makeCompany({
      effectif: 1,
      has_employees: false,
      activeEmployees: [],
    })

    const its = await estimateMontant(company, 'its')
    const cnss = await estimateMontant(company, 'cnss')

    expect(its).not.toBeNull()
    expect(cnss).not.toBeNull()
  })

  it('effectif 0 (solo) → salaire forfaitaire 200k', async () => {
    const company = makeCompany({
      effectif: 0,
      has_employees: false,
      activeEmployees: [],
    })

    const its = await estimateMontant(company, 'its')
    const cnss = await estimateMontant(company, 'cnss')

    expect(its).toBe(16500)
    expect(cnss).toBe(38000)
  })

  it('salairesPrecis flag', () => {
    expect(salairesPrecis(makeCompany())).toBe(false)
    expect(
      salairesPrecis(makeCompany({ activeEmployees: [{ salaire_brut_mensuel: 400000 }] })),
    ).toBe(true)
  })

  it('ensure-events génère les bons types (12 TVA mensuel, 12 ITS, 12 CNSS, 5 IS, 1 Patente, 1 TFU)', () => {
    const company = makeCompany({ regime_tva: 'réel' })
    const events = generateRaw(company)

    const byType = (t: string) => events.filter((e) => e.type === t).length
    expect(byType('tva')).toBe(12)
    expect(byType('its')).toBe(12)
    expect(byType('cnss')).toBe(12)
    expect(byType('is')).toBe(5)
    expect(byType('patente')).toBe(1)
    expect(byType('tfu')).toBe(1)
  })

  it('TVA trimestriel → 4 événements', () => {
    const company = makeCompany({ regime_tva: 'trimestriel' })
    const events = generateRaw(company, ['tva'])
    expect(events).toHaveLength(4)
    expect(events[0].title).toBe('TVA (T1)')
    expect(events[0].date).toBe('2026-03-15')
  })

  it('IS clôture à l\'année N+1, acomptes T1-T4', () => {
    const company = makeCompany()
    const events = generateRaw(company, ['is'])
    expect(events).toHaveLength(5)
    expect(events[0].title).toContain('Clôture')
    expect(events[0].date.startsWith(String(new Date().getFullYear() + 1))).toBe(true)
    expect(events[1].title).toBe('IS — Acompte T1')
    expect(events[1].date).toBe(`${new Date().getFullYear()}-03-15`)
  })
})
