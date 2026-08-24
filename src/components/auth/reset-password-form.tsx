'use client'

import { resetPasswordAction, type AuthState } from '@/app/(auth)/actions'
import { useActionState } from 'react'
import Link from 'next/link'
import { PasswordField } from '@/components/auth/password-field'

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(resetPasswordAction, null)
  const values = state?.values ?? {}

  return (
    <form action={formAction} className="fiscow-auth-form">
      {state?.error && <div className="fiscow-auth-error" role="alert">{state.error}</div>}

      <input type="hidden" name="token" value={token} />

      <div className="fiscow-auth-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          className="fiscow-auth-input"
          autoComplete="username"
          required
          autoFocus
          placeholder="vous@exemple.com"
          defaultValue={values.email ?? ''}
        />
      </div>

      <div className="fiscow-auth-field">
        <label htmlFor="password">Nouveau mot de passe</label>
        <PasswordField id="password" name="password" autoComplete="new-password" placeholder="••••••••" />
      </div>

      <div className="fiscow-auth-field">
        <label htmlFor="password_confirmation">Confirmer le mot de passe</label>
        <PasswordField id="password_confirmation" name="password_confirmation" autoComplete="new-password" placeholder="••••••••" />
      </div>

      <button type="submit" className="fiscow-auth-primary" disabled={pending}>
        {pending ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
      </button>

      <div className="fiscow-auth-footer">
        <Link href="/login">Retour à la connexion</Link>
      </div>
    </form>
  )
}
