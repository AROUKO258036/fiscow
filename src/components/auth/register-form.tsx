'use client'

import { registerAction, type AuthState } from '@/app/(auth)/actions'
import { useActionState } from 'react'
import Link from 'next/link'
import { PasswordField } from '@/components/auth/password-field'

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(registerAction, null)
  const values = state?.values ?? {}

  return (
    <>
      {state?.error && (
        <div className="fiscow-auth-error" role="alert">
          {state.error}
        </div>
      )}

      <form action={formAction} className="fiscow-auth-form">
        <div className="fiscow-auth-field">
          <label htmlFor="name">Nom complet</label>
          <input
            id="name"
            name="name"
            type="text"
            className="fiscow-auth-input"
            autoComplete="name"
            required
            placeholder="Votre nom"
            defaultValue={values.name ?? ''}
          />
        </div>

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

        <div className="fiscow-auth-field">
          <label htmlFor="password">Mot de passe</label>
          <PasswordField id="password" name="password" autoComplete="new-password" placeholder="••••••••" />
        </div>

        <div className="fiscow-auth-field">
          <label htmlFor="password_confirmation">Confirmer le mot de passe</label>
          <PasswordField
            id="password_confirmation"
            name="password_confirmation"
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="fiscow-auth-primary" disabled={pending}>
          {pending ? 'Création…' : 'Créer mon compte'}
        </button>

        <div className="fiscow-auth-footer">
          Déjà inscrit ?{' '}
          <Link href="/login">Se connecter</Link>
        </div>
      </form>
    </>
  )
}
