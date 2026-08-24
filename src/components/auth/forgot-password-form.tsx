'use client'

import { forgotPasswordAction, type AuthState } from '@/app/(auth)/actions'
import { useActionState } from 'react'
import Link from 'next/link'

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(forgotPasswordAction, null)
  const values = state?.values ?? {}

  return (
    <form action={formAction} className="fiscow-auth-form">
      {state?.error && <div className="fiscow-auth-error" role="alert">{state.error}</div>}
      {state?.success && <div className="fiscow-auth-success" role="status">{state.success}</div>}

      <div className="fiscow-auth-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          className="fiscow-auth-input"
          autoComplete="username"
          required
          placeholder="vous@exemple.com"
          defaultValue={values.email ?? ''}
        />
      </div>

      <button type="submit" className="fiscow-auth-primary" disabled={pending}>
        {pending ? 'Envoi…' : 'Envoyer le lien de réinitialisation'}
      </button>

      <div className="fiscow-auth-footer">
        <Link href="/login" className="fiscow-auth-inline-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Retour à la connexion
        </Link>
      </div>
    </form>
  )
}
