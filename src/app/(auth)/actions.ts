'use server'

import { AuthError } from 'next-auth'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { signIn, signOut } from '@/lib/auth'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { generateToken, tokenExpiry, VERIFY_TOKEN_TTL_MS, RESET_TOKEN_TTL_MS } from '@/lib/auth-tokens'
import { sendPasswordResetEmail, sendVerificationEmail } from '@/lib/email'

export type AuthState = { error?: string; success?: string; values?: Record<string, string> } | null

const SESSION_COOKIE_NAME = 'authjs.session-token'
const SECURE_SESSION_COOKIE_NAME = '__Secure-authjs.session-token'
const PW_CONFIRMED_COOKIE = 'rg_pw_confirmed_at'

function sessionCookieName(): string {
  return process.env.NODE_ENV === 'production' ? SECURE_SESSION_COOKIE_NAME : SESSION_COOKIE_NAME
}

async function applyRememberMe(remember: boolean) {
  const store = await cookies()
  const name = sessionCookieName()
  const existing = store.get(name)
  if (!existing) return

  store.set(name, existing.value, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    ...(remember ? { maxAge: 30 * 24 * 60 * 60 } : {}),
  })
}

export async function loginAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const remember = formData.get('remember') === 'on'
  const rawCallback = String(formData.get('callbackUrl') ?? '')
  const callbackUrl =
    rawCallback.startsWith('/') && !rawCallback.startsWith('//') ? rawCallback : '/dashboard'

  if (!rateLimit(`login:${email}`, RATE_LIMITS.login.max, RATE_LIMITS.login.windowMs)) {
    return { error: 'Trop de tentatives. Réessayez dans une minute.' }
  }

  let result: unknown
  try {
    result = await signIn('credentials', { email, password, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Ces identifiants ne correspondent pas à nos enregistrements.', values: { email } }
    }
    throw error
  }

  if (result && typeof result === 'object' && 'error' in result) {
    return { error: 'Ces identifiants ne correspondent pas à nos enregistrements.', values: { email } }
  }

  await applyRememberMe(remember)
  redirect(callbackUrl)
}

export async function registerAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const passwordConfirmation = String(formData.get('password_confirmation') ?? '')

  if (!name || !email || !password) {
    return { error: 'Tous les champs sont obligatoires.', values: { name, email } }
  }

  if (password !== passwordConfirmation) {
    return { error: 'Les mots de passe ne correspondent pas.', values: { name, email } }
  }

  if (password.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères.', values: { name, email } }
  }

  if (!rateLimit(`register:${email}`, RATE_LIMITS.register.max, RATE_LIMITS.register.windowMs)) {
    return { error: 'Trop de tentatives. Réessayez dans une heure.' }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: 'Cette adresse email est déjà utilisée.', values: { name, email } }
  }

  const hashed = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: { name, email, password: hashed },
  })

  const token = generateToken()
  await prisma.verificationToken.create({
    data: {
      email,
      token,
      expires: tokenExpiry(VERIFY_TOKEN_TTL_MS),
    },
  })

  try {
    await sendVerificationEmail(email, token)
  } catch (error) {
    console.error('[auth:register] email de vérification non envoyé', error)
  }

  let result: unknown
  try {
    result = await signIn('credentials', { email, password, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Compte créé. Veuillez vous connecter.' }
    }
    throw error
  }

  if (result && typeof result === 'object' && 'error' in result) {
    return { error: 'Compte créé. Veuillez vous connecter.' }
  }

  await applyRememberMe(true)
  redirect('/verify-email')
}

export async function resendVerificationAction(): Promise<AuthState> {
  const session = await import('@/lib/auth').then((m) => m.auth())
  if (!session?.user) redirect('/login')

  if (!rateLimit(`resend:${session.user.email}`, RATE_LIMITS.resendVerification.max, RATE_LIMITS.resendVerification.windowMs)) {
    return { error: 'Trop de demandes. Réessayez dans 15 minutes.' }
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email ?? '' } })
  if (!user || user.emailVerifiedAt) return null

  await prisma.verificationToken.deleteMany({ where: { email: user.email } })

  const token = generateToken()
  await prisma.verificationToken.create({
    data: {
      email: user.email,
      token,
      expires: tokenExpiry(VERIFY_TOKEN_TTL_MS),
    },
  })

  try {
    await sendVerificationEmail(user.email, token)
  } catch (error) {
    console.error('[auth:verify] email de vérification non envoyé', error)
    return { error: 'Impossible d’envoyer l’email pour le moment. Vérifiez la configuration Brevo puis réessayez.' }
  }

  return { success: 'Un nouveau lien de vérification a été envoyé.' }
}

export async function verifyEmailAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const token = String(formData.get('token') ?? '').trim()
  if (!token) return { error: 'Lien de vérification invalide.' }

  const record = await prisma.verificationToken.findUnique({ where: { token } })
  if (!record) return { error: 'Ce lien de vérification est invalide ou a déjà été utilisé.' }
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { id: record.id } })
    return { error: 'Ce lien de vérification a expiré. Demandez-en un nouveau.' }
  }

  await prisma.user.update({
    where: { email: record.email },
    data: { emailVerifiedAt: new Date() },
  })
  await prisma.verificationToken.delete({ where: { id: record.id } })

  redirect('/dashboard')
}

export async function forgotPasswordAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()

  if (!rateLimit(`forgot:${email}`, RATE_LIMITS.forgotPassword.max, RATE_LIMITS.forgotPassword.windowMs)) {
    return { error: 'Trop de demandes. Réessayez dans une heure.' }
  }

  if (email) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      await prisma.passwordResetToken.deleteMany({ where: { email } })
      const token = generateToken()
      await prisma.passwordResetToken.create({
        data: {
          email,
          token,
          expires: tokenExpiry(RESET_TOKEN_TTL_MS),
        },
      })
      try {
        await sendPasswordResetEmail(email, token)
      } catch (error) {
        console.error('[auth:forgot] email de réinitialisation non envoyé', error)
      }
    }
  }

  return {
    success: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
  }
}

export async function resetPasswordAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const token = String(formData.get('token') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const passwordConfirmation = String(formData.get('password_confirmation') ?? '')

  if (!rateLimit(`reset:${token}`, RATE_LIMITS.resetPassword.max, RATE_LIMITS.resetPassword.windowMs)) {
    return { error: 'Trop de tentatives. Réessayez dans une minute.' }
  }

  if (password !== passwordConfirmation) {
    return { error: 'Les mots de passe ne correspondent pas.', values: { email } }
  }
  if (password.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères.', values: { email } }
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!record) return { error: 'Ce lien de réinitialisation est invalide ou a déjà été utilisé.' }
  if (record.expires < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: record.id } })
    return { error: 'Ce lien a expiré. Demandez-en un nouveau.' }
  }

  await prisma.user.update({
    where: { email: record.email },
    data: { password: await bcrypt.hash(password, 12) },
  })
  await prisma.passwordResetToken.delete({ where: { id: record.id } })

  redirect('/login?reset=1')
}

export async function confirmPasswordAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get('password') ?? '')
  const callbackUrl = String(formData.get('callbackUrl') ?? '')

  if (!rateLimit(`confirm:global`, RATE_LIMITS.confirmPassword.max, RATE_LIMITS.confirmPassword.windowMs)) {
    return { error: 'Trop de tentatives. Réessayez dans une minute.' }
  }

  const session = await import('@/lib/auth').then((m) => m.auth())
  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } })
  if (!user) redirect('/login')

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return { error: 'Le mot de passe est incorrect.' }

  const store = await cookies()
  store.set(PW_CONFIRMED_COOKIE, String(Date.now()), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 5 * 60,
  })

  const target = callbackUrl.startsWith('/') && !callbackUrl.startsWith('//') ? callbackUrl : '/profile'
  redirect(target)
}

export async function logoutAction() {
  await signOut({ redirectTo: '/' })
}
