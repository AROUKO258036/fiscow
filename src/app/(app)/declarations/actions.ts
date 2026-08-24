'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { setFlash } from '@/lib/flash'
import { notifyUser } from '@/lib/notification-service'
import {
  markDeclarationFiled,
  markDeclarationPaid,
  cancelDeclaration,
} from '@/lib/declaration-service'

export type DeclarationState = { error?: string } | null

async function getCompany() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    include: { companies: { orderBy: { createdAt: 'asc' }, take: 1 } },
  })
  if (!user?.companies[0]) redirect('/entreprise/onboarding')
  return { company: user.companies[0], userId: Number(session.user.id) }
}

const TYPE_LABELS: Record<string, string> = {
  is: 'IS',
  iba: 'IBA',
  tva: 'TVA',
  its: 'ITS',
  cnss: 'CNSS',
  tps: 'TPS',
  tfu: 'TFU',
}

function declarationLabel(type: string, periode: string): string {
  return `${(TYPE_LABELS[type] ?? type).toUpperCase()} — ${periode}`
}

export async function markFiledAction(
  _prev: DeclarationState,
  formData: FormData,
): Promise<DeclarationState> {
  const { company, userId } = await getCompany()
  const id = Number(formData.get('id'))

  const result = await markDeclarationFiled(company.id, id)
  if (!result.success) return { error: result.message }
  if (result.declaration) {
    await notifyUser({
      userId,
      type: 'declaration',
      title: 'Déclaration déposée',
      message: `${declarationLabel(result.declaration.type, result.declaration.periode)} a été déposée auprès des impôts.`,
      link: `/declarations/${id}`,
      key: `declaration:filed:${id}`,
    })
  }

  revalidatePath('/declarations')
  revalidatePath(`/declarations/${id}`)
  revalidatePath('/dashboard')
  await setFlash('success', result.message)
  return null
}

export async function markPaidAction(
  _prev: DeclarationState,
  formData: FormData,
): Promise<DeclarationState> {
  const { company, userId } = await getCompany()
  const id = Number(formData.get('id'))
  const paymentMethod = String(formData.get('payment_method') ?? 'manual') || 'manual'
  const reference = String(formData.get('reference') ?? '') || undefined

  const result = await markDeclarationPaid(company.id, id, paymentMethod, reference)
  if (!result.success) return { error: result.message }
  if (result.declaration) {
    await notifyUser({
      userId,
      type: 'payment',
      title: 'Paiement enregistré',
      message: `${declarationLabel(result.declaration.type, result.declaration.periode)} a été réglée (${Number(result.declaration.amount).toLocaleString('fr-FR')} FCFA).`,
      link: `/declarations/${id}`,
      key: `declaration:paid:${id}`,
    })
  }

  revalidatePath('/declarations')
  revalidatePath(`/declarations/${id}`)
  revalidatePath('/dashboard')
  await setFlash('success', result.message)
  return null
}

export async function cancelDeclarationAction(
  _prev: DeclarationState,
  formData: FormData,
): Promise<DeclarationState> {
  const { company, userId } = await getCompany()
  const id = Number(formData.get('id'))
  const notes = String(formData.get('notes') ?? '') || undefined

  const result = await cancelDeclaration(company.id, id, notes)
  if (!result.success) return { error: result.message }
  if (result.declaration) {
    await notifyUser({
      userId,
      type: 'system',
      title: 'Déclaration annulée',
      message: `${declarationLabel(result.declaration.type, result.declaration.periode)} a été annulée.`,
      link: `/declarations/${id}`,
      key: `declaration:cancelled:${id}`,
    })
  }

  revalidatePath('/declarations')
  revalidatePath(`/declarations/${id}`)
  revalidatePath('/dashboard')
  await setFlash('success', result.message)
  return null
}
