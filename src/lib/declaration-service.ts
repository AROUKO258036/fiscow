import { prisma } from '@/lib/prisma'

export type DeclarationActionResult = {
  success: boolean
  message: string
  declaration?: {
    id: number
    type: string
    periode: string
    amount: number
  }
}

const TRANSITIONS: Record<string, string[]> = {
  draft: ['filed', 'cancelled'],
  filed: ['paid', 'cancelled'],
}

export function canTransition(from: string, to: string): boolean {
  return (TRANSITIONS[from] ?? []).includes(to)
}

export function generateReference(type: string, id: number): string {
  return `RG-${type.toUpperCase()}-${String(id).padStart(6, '0')}`
}

export async function markDeclarationFiled(companyId: number, declarationId: number): Promise<DeclarationActionResult> {
  const declaration = await prisma.declaration.findUnique({ where: { id: declarationId } })
  if (!declaration || declaration.companyId !== companyId) {
    return { success: false, message: 'Déclaration introuvable.' }
  }
  if (!canTransition(declaration.status, 'filed')) {
    return { success: false, message: `Impossible de déposer une déclaration au statut « ${declaration.status} ».` }
  }

  await prisma.declaration.update({
    where: { id: declarationId },
    data: { status: 'filed', filedDate: new Date() },
  })

  return {
    success: true,
    message: 'Déclaration déposée avec succès.',
    declaration: {
      id: declaration.id,
      type: declaration.type,
      periode: declaration.periode,
      amount: Number(declaration.amountDue),
    },
  }
}

export async function markDeclarationPaid(
  companyId: number,
  declarationId: number,
  paymentMethod: string = 'manual',
  reference?: string,
): Promise<DeclarationActionResult> {
  const declaration = await prisma.declaration.findUnique({ where: { id: declarationId } })
  if (!declaration || declaration.companyId !== companyId) {
    return { success: false, message: 'Déclaration introuvable.' }
  }
  if (!canTransition(declaration.status, 'paid')) {
    return { success: false, message: `Impossible de payer une déclaration au statut « ${declaration.status} ».` }
  }

  const now = new Date()

  await prisma.$transaction(async (tx) => {
    await tx.declaration.update({
      where: { id: declarationId },
      data: {
        status: 'paid',
        amountPaid: declaration.amountDue,
        paidDate: now,
      },
    })

    await tx.transaction.create({
      data: {
        companyId,
        declarationId,
        type: 'payment',
        category: declaration.type,
        amount: declaration.amountDue,
        reference: reference ?? generateReference(declaration.type, declaration.id),
        paymentMethod,
        status: 'completed',
        transactionDate: now,
      },
    })
  })

  return {
    success: true,
    message: 'Paiement enregistré avec succès.',
    declaration: {
      id: declaration.id,
      type: declaration.type,
      periode: declaration.periode,
      amount: Number(declaration.amountDue),
    },
  }
}

export async function cancelDeclaration(companyId: number, declarationId: number, notes?: string): Promise<DeclarationActionResult> {
  const declaration = await prisma.declaration.findUnique({ where: { id: declarationId } })
  if (!declaration || declaration.companyId !== companyId) {
    return { success: false, message: 'Déclaration introuvable.' }
  }
  if (!canTransition(declaration.status, 'cancelled')) {
    return { success: false, message: `Impossible d'annuler une déclaration au statut « ${declaration.status} ».` }
  }

  await prisma.declaration.update({
    where: { id: declarationId },
    data: { status: 'cancelled', notes: notes || declaration.notes || 'Annulée' },
  })

  return {
    success: true,
    message: 'Déclaration annulée.',
    declaration: {
      id: declaration.id,
      type: declaration.type,
      periode: declaration.periode,
      amount: Number(declaration.amountDue),
    },
  }
}
