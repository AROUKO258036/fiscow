'use client'

import { useActionState } from 'react'
import {
  updatePasswordAction,
  type ProfileState,
} from '@/app/(app)/profile/actions'

export function PasswordForm() {
  const [state, formAction, pending] =
    useActionState<ProfileState, FormData>(
      updatePasswordAction,
      null,
    )

  return (
    <form
      action={formAction}
      className="fiscow-settings-form"
    >
      <div className="fiscow-settings-security-note">
        <i className="ti ti-shield-check" />

        <p>
          Utilisez au minimum 8 caractères et évitez de
          réutiliser un mot de passe utilisé ailleurs.
        </p>
      </div>

      <div className="fiscow-settings-field">
        <label htmlFor="update_password_current_password">
          Mot de passe actuel
        </label>

        <div className="fiscow-settings-input-wrap">
          <i className="ti ti-lock" />

          <input
            id="update_password_current_password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            placeholder="Votre mot de passe actuel"
          />
        </div>
      </div>

      <div className="fiscow-settings-field">
        <label htmlFor="update_password_password">
          Nouveau mot de passe
        </label>

        <div className="fiscow-settings-input-wrap">
          <i className="ti ti-key" />

          <input
            id="update_password_password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Nouveau mot de passe"
          />
        </div>
      </div>

      <div className="fiscow-settings-field">
        <label htmlFor="update_password_password_confirmation">
          Confirmer le nouveau mot de passe
        </label>

        <div className="fiscow-settings-input-wrap">
          <i className="ti ti-key" />

          <input
            id="update_password_password_confirmation"
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            placeholder="Confirmez le mot de passe"
          />
        </div>
      </div>

      {state?.error && (
        <div className="fiscow-settings-feedback is-error">
          <i className="ti ti-alert-circle" />
          {state.error}
        </div>
      )}

      <div className="fiscow-settings-form-footer">
        {!pending && state?.success && (
          <span className="fiscow-settings-feedback is-success">
            <i className="ti ti-circle-check" />
            Mot de passe mis à jour
          </span>
        )}

        <button
          type="submit"
          className="fiscow-settings-primary-btn"
          disabled={pending}
        >
          {pending ? (
            <>
              <span className="spinner-border spinner-border-sm" />
              Mise à jour...
            </>
          ) : (
            <>
              Mettre à jour
              <i className="ti ti-arrow-right" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}