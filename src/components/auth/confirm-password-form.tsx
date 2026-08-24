'use client'

import { confirmPasswordAction, type AuthState } from '@/app/(auth)/actions'
import { useActionState } from 'react'
import { PasswordField } from '@/components/auth/password-field'

export function ConfirmPasswordForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(confirmPasswordAction, null)

  return (
    <form action={formAction} className="fiscow-auth-form">
      {state?.error && <div className="fiscow-auth-error" role="alert">{state.error}</div>}
      {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}

      <div className="fiscow-auth-field">
        <label htmlFor="password">Mot de passe</label>
        <PasswordField id="password" name="password" autoComplete="current-password" placeholder="••••••••" required />
      </div>

      <button type="submit" className="fiscow-auth-primary" disabled={pending}>
        {pending ? 'Vérification…' : 'Confirmer'}
      </button>
    </form>
  )
}
