'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/require-admin'
import { prisma } from '@/lib/prisma'
import { setFlash } from '@/lib/flash'

export type TaxRateState = { error?: string } | null

export async function toggleTaxRateAction(_prev: TaxRateState, formData: FormData): Promise<TaxRateState> {
  await requireAdmin()
  const id = Number(formData.get('id'))

  const rate = await prisma.taxRate.findUnique({ where: { id } })
  if (!rate) return { error: 'Taux introuvable.' }

  await prisma.taxRate.update({
    where: { id },
    data: { isActive: !rate.isActive },
  })

  revalidatePath('/admin/taux')
  await setFlash('success', rate.isActive ? 'Taux désactivé.' : 'Taux activé.')
  return null
}

export async function saveTaxRateAction(_prev: TaxRateState, formData: FormData): Promise<TaxRateState> {
  await requireAdmin()
  const id = formData.get('id')
  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const reference = String(formData.get('reference') ?? '').trim()

  if (!name) return { error: 'Le nom est requis.' }

  if (id && id !== '') {
    await prisma.taxRate.update({
      where: { id: Number(id) },
      data: { name, description, reference },
    })
    await setFlash('success', 'Taux mis à jour.')
  } else {
    await prisma.taxRate.create({
      data: {
        key: String(formData.get('key') ?? '').trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name,
        description,
        reference,
        type: String(formData.get('type') ?? 'percentage') || 'percentage',
        metadata: {},
        applicableYears: { set: [new Date().getFullYear()] },
      },
    })
    await setFlash('success', 'Taux créé.')
  }

  revalidatePath('/admin/taux')
  return null
}
