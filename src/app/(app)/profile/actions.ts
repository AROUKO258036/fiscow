'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { compare, hash } from 'bcryptjs'
import { auth, signOut } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { setFlash } from '@/lib/flash'
import { generateToken, tokenExpiry, VERIFY_TOKEN_TTL_MS } from '@/lib/auth-tokens'
import { sendVerificationEmail } from '@/lib/email'

export type ProfileState = { error?: string; success?: boolean } | null

export async function sendVerificationAction(): Promise<void> {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } })
  if (!user || user.emailVerifiedAt) return

  const token = generateToken()
  await prisma.verificationToken.create({
    data: {
      email: user.email,
      token,
      expires: tokenExpiry(VERIFY_TOKEN_TTL_MS),
    },
  })

  await sendVerificationEmail(user.email, token)
  await setFlash('success', 'Un nouveau lien de vérification a été envoyé.')
  revalidatePath('/profile')
}

export async function updateProfileAction(prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()

  if (!name) return { error: 'Le nom est requis.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Adresse email invalide.' }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing && existing.id !== Number(session.user.id)) {
    return { error: 'Cette adresse email est déjà utilisée.' }
  }

  const prevUser = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { email: true, emailVerifiedAt: true },
  })

  await prisma.user.update({
    where: { id: Number(session.user.id) },
    data: {
      name,
      email,
      ...(prevUser && prevUser.email !== email ? { emailVerifiedAt: null } : {}),
    },
  })

  if (prevUser && prevUser.email !== email) {
    const token = generateToken()
    await prisma.verificationToken.create({
      data: {
        email,
        token,
        expires: tokenExpiry(VERIFY_TOKEN_TTL_MS),
      },
    })
    await sendVerificationEmail(email, token)
    await setFlash('success', 'Profil mis à jour. Un email de vérification a été envoyé à votre nouvelle adresse.')
    revalidatePath('/profile')
    return { success: true }
  }

  await setFlash('success', 'Profil mis à jour avec succès.')
  revalidatePath('/profile')
  return { success: true }
}

export async function updatePasswordAction(prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const current = String(formData.get('current_password') ?? '')
  const password = String(formData.get('password') ?? '')
  const confirmation = String(formData.get('password_confirmation') ?? '')

  if (!current) return { error: 'Le mot de passe actuel est requis.' }
  if (password.length < 8) return { error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' }
  if (password !== confirmation) return { error: 'La confirmation ne correspond pas.' }

  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } })
  if (!user) redirect('/login')

  const valid = await compare(current, user.password)
  if (!valid) return { error: 'Le mot de passe actuel est incorrect.' }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await hash(password, 12) },
  })

  await setFlash('success', 'Mot de passe mis à jour.')
  return { success: true }
}

export async function deleteUserAction(prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const password = String(formData.get('password') ?? '')
  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } })
  if (!user) redirect('/login')

  const valid = await compare(password, user.password)
  if (!valid) return { error: 'Mot de passe incorrect.' }

  await prisma.user.delete({ where: { id: user.id } })
  await signOut({ redirectTo: '/' })
  redirect('/')
}
