'use client'

import { useActionState } from 'react'
import {
  updateProfileAction,
  sendVerificationAction,
  type ProfileState,
} from '@/app/(app)/profile/actions'

export function ProfileInfoForm({
  name,
  email,
  emailVerifiedAt,
}: {
  name: string
  email: string
  emailVerifiedAt: Date | null
}) {
  const [state, formAction, pending] =
    useActionState<ProfileState, FormData>(
      updateProfileAction,
      null,
    )

  return (
    <>
      <form
        id="send-verification"
        action={sendVerificationAction}
      />

      <form
        action={formAction}
        className="fiscow-settings-form"
      >
        <div className="fiscow-settings-field">
          <label htmlFor="name">
            Nom complet
          </label>

          <div className="fiscow-settings-input-wrap">
            <i className="ti ti-user" />

            <input
              id="name"
              name="name"
              type="text"
              defaultValue={name}
              required
              autoComplete="name"
            />
          </div>
        </div>

        <div className="fiscow-settings-field">
          <div className="fiscow-settings-label-row">
            <label htmlFor="email">
              Adresse email
            </label>

            {emailVerifiedAt ? (
              <span className="fiscow-settings-verified">
                <i className="ti ti-circle-check" />
                Vérifiée
              </span>
            ) : (
              <span className="fiscow-settings-unverified">
                Non vérifiée
              </span>
            )}
          </div>

          <div className="fiscow-settings-input-wrap">
            <i className="ti ti-mail" />

            <input
              id="email"
              name="email"
              type="email"
              defaultValue={email}
              required
              autoComplete="username"
            />
          </div>

          {emailVerifiedAt === null && (
            <div className="fiscow-settings-verification">
              <i className="ti ti-info-circle" />

              <span>
                Votre adresse email n&apos;est pas encore
                vérifiée.
              </span>

              <button
                type="submit"
                form="send-verification"
              >
                Renvoyer l&apos;email
              </button>
            </div>
          )}
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
              Modifications enregistrées
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
                Enregistrement...
              </>
            ) : (
              <>
                Enregistrer
                <i className="ti ti-check" />
              </>
            )}
          </button>
        </div>
      </form>
    </>
  )
}