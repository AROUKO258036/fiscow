'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/require-admin'
import { prisma } from '@/lib/prisma'
import { setFlash } from '@/lib/flash'

export type JobTitleState = { error?: string } | null

export async function createJobTitleAction(_prev: JobTitleState, formData: FormData): Promise<JobTitleState> {
  await requireAdmin()
  const libelle = String(formData.get('libelle') ?? '').trim()
  const secteur = String(formData.get('secteur') ?? 'autre').trim()
  const transversal = formData.get('transversal') === '1'

  if (!libelle) return { error: 'Le libellé est requis.' }

  const existing = await prisma.jobTitle.findFirst({ where: { libelle, secteur } })
  if (existing) return { error: 'Ce métier existe déjà pour ce secteur.' }

  await prisma.jobTitle.create({ data: { libelle, secteur, transversal } })
  await setFlash('success', `Métier « ${libelle} » créé.`)
  revalidatePath('/admin/metiers')
  return null
}

export async function deleteJobTitleAction(_prev: JobTitleState, formData: FormData): Promise<JobTitleState> {
  await requireAdmin()
  const id = Number(formData.get('id'))
  await prisma.jobTitle.delete({ where: { id } })
  await setFlash('success', 'Métier supprimé.')
  revalidatePath('/admin/metiers')
  return null
}
