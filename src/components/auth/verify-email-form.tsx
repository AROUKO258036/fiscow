'use client'

import { resendVerificationAction, logoutAction, type AuthState } from '@/app/(auth)/actions'
import { useActionState, useTransition } from 'react'

export function VerifyEmailForm({ invalid }: { invalid: boolean }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(resendVerificationAction, null)
  const [logoutPending, startLogout] = useTransition()

  return (
    <>
      {invalid && !state?.success && (
        <div className="fiscow-auth-error" role="alert">
          Ce lien de vérification est invalide ou a expiré. Demandez-en un nouveau ci-dessous.
        </div>
      )}

      {state?.success && <div className="fiscow-auth-success" role="status">{state.success}</div>}
      {state?.error && <div className="fiscow-auth-error" role="alert">{state.error}</div>}

      <form action={formAction} className="fiscow-auth-form">
        <button type="submit" className="fiscow-auth-primary" disabled={pending}>
          {pending ? 'Envoi…' : "Renvoyer l'email de vérification"}
        </button>
      </form>

      <div className="fiscow-auth-footer">
        <button
          type="button"
          disabled={logoutPending}
          onClick={() => startLogout(async () => { await logoutAction() })}
          className="fiscow-auth-link-button"
        >
          {logoutPending ? 'Déconnexion…' : 'Se déconnecter'}
        </button>
      </div>
    </>
  )
}
