import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import {
  canTransition,
  generateReference,
  markDeclarationFiled,
  markDeclarationPaid,
  cancelDeclaration,
} from '@/lib/declaration-service'
import { createNotificationIfAbsent, markRead, markAllRead, countUnread } from '@/lib/notification-service'
import { rateLimit } from '@/lib/rate-limit'
import { generateToken } from '@/lib/auth-tokens'

let testUserId: number
let testCompanyId: number
let testDeclarationId: number

beforeAll(async () => {
  const user = await prisma.user.create({
    data: {
      name: 'Test P6',
      email: `p6-${Date.now()}@regule.test`,
      password: 'x',
      emailVerifiedAt: new Date(),
    },
  })
  testUserId = user.id
  const company = await prisma.company.create({
    data: {
      userId: testUserId,
      raisonSociale: 'SAS TEST P6',
      nif: `NIF${Date.now()}`,
      secteur: 'services',
      effectif: 1,
      regimeTva: 'simplifié',
      typeEntite: 'sas',
    },
  })
  testCompanyId = company.id
  const declaration = await prisma.declaration.create({
    data: {
      companyId: testCompanyId,
      type: 'its',
      periode: '2026-07',
      amountDue: 16500,
      dueDate: new Date('2026-08-15'),
    },
  })
  testDeclarationId = declaration.id
})

afterAll(async () => {
  await prisma.notification.deleteMany({ where: { userId: testUserId } })
  await prisma.declaration.deleteMany({ where: { companyId: testCompanyId } })
  await prisma.transaction.deleteMany({ where: { companyId: testCompanyId } })
  await prisma.company.deleteMany({ where: { id: testCompanyId } })
  await prisma.user.deleteMany({ where: { id: testUserId } })
  await prisma.$disconnect()
})

describe('declaration-service — transitions de cycle de vie', () => {
  it('canTransition: draft → filed ok, draft → paid non, paid → draft non', () => {
    expect(canTransition('draft', 'filed')).toBe(true)
    expect(canTransition('draft', 'cancelled')).toBe(true)
    expect(canTransition('draft', 'paid')).toBe(false)
    expect(canTransition('paid', 'draft')).toBe(false)
    expect(canTransition('filed', 'paid')).toBe(true)
    expect(canTransition('filed', 'cancelled')).toBe(true)
    expect(canTransition('paid', 'cancelled')).toBe(false)
  })

  it('generateReference produit RG-TYPE-000001', () => {
    expect(generateReference('tva', 1)).toBe('RG-TVA-000001')
    expect(generateReference('its', 42)).toBe('RG-ITS-000042')
  })

  it('marque une déclaration comme déposée et renvoie ses données', async () => {
    const r = await markDeclarationFiled(testCompanyId, testDeclarationId)
    expect(r.success).toBe(true)
    expect(r.declaration?.type).toBe('its')
    expect(r.declaration?.amount).toBe(16500)
    const d = await prisma.declaration.findUnique({ where: { id: testDeclarationId } })
    expect(d?.status).toBe('filed')
    expect(d?.filedDate).not.toBeNull()
  })

  it('refuse de déposer une déclaration déjà déposée', async () => {
    const r = await markDeclarationFiled(testCompanyId, testDeclarationId)
    expect(r.success).toBe(false)
    expect(r.message).toContain('Impossible')
  })

  it('enregistre le paiement et crée une transaction vivante', async () => {
    const r = await markDeclarationPaid(testCompanyId, testDeclarationId, 'manual', 'REF-TEST')
    expect(r.success).toBe(true)
    const d = await prisma.declaration.findUnique({ where: { id: testDeclarationId } })
    expect(d?.status).toBe('paid')
    expect(Number(d?.amountPaid)).toBe(16500)
    const tx = await prisma.transaction.findFirst({ where: { companyId: testCompanyId, declarationId: testDeclarationId } })
    expect(tx?.status).toBe('completed')
    expect(tx?.reference).toBe('REF-TEST')
    expect(tx?.category).toBe('its')
  })

  it("refuse d'annuler une déclaration payée (terminal)", async () => {
    const r = await cancelDeclaration(testCompanyId, testDeclarationId)
    expect(r.success).toBe(false)
  })

  it('garde le multi-tenant : une autre company ne peut pas y toucher', async () => {
    const r = await cancelDeclaration(testCompanyId + 9999, testDeclarationId)
    expect(r.success).toBe(false)
    expect(r.message).toBe('Déclaration introuvable.')
  })
})

describe('notification-service — dédoublonnage et lecture', () => {
  it('crée une notification avec clé unique (idempotent)', async () => {
    const a = await createNotificationIfAbsent({
      userId: testUserId,
      type: 'declaration',
      title: 'Test',
      message: 'Message',
      key: 'p6:unique',
    })
    const b = await createNotificationIfAbsent({
      userId: testUserId,
      type: 'declaration',
      title: 'Test',
      message: 'Message',
      key: 'p6:unique',
    })
    expect(a).toBe(true)
    expect(b).toBe(false)
  })

  it('crée sans clé à chaque appel', async () => {
    const a = await createNotificationIfAbsent({
      userId: testUserId,
      type: 'system',
      title: 'Sans clé',
      message: 'x',
    })
    const b = await createNotificationIfAbsent({
      userId: testUserId,
      type: 'system',
      title: 'Sans clé',
      message: 'x',
    })
    expect(a).toBe(true)
    expect(b).toBe(true)
  })

  it('countUnread compte les non-lues', async () => {
    expect(await countUnread(testUserId)).toBeGreaterThanOrEqual(2)
  })

  it('markRead puis markAllRead passent read à true', async () => {
    const n = await prisma.notification.findFirst({ where: { userId: testUserId, read: false } })
    expect(n).not.toBeNull()
    await markRead(testUserId, n!.id)
    const after = await prisma.notification.findUnique({ where: { id: n!.id } })
    expect(after?.read).toBe(true)

    await markAllRead(testUserId)
    expect(await countUnread(testUserId)).toBe(0)
  })
})

describe('rate-limit — fenêtres in-memory', () => {
  it('autorise dans la limite puis bloque au-delà', () => {
    const key = `login:test@rate.limit:${Date.now()}`
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, 5, 60_000)).toBe(true)
    }
    expect(rateLimit(key, 5, 60_000)).toBe(false)
  })
})

describe('auth-tokens — génération et TTL', () => {
  it('génère un token hex de 32 octets et des TTL cohérents', () => {
    const t = generateToken()
    expect(t).toMatch(/^[a-f0-9]{64}$/)
  })
})
