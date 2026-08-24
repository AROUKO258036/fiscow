'use client'

import { useActionState } from 'react'
import {
  deleteUserAction,
  type ProfileState,
} from '@/app/(app)/profile/actions'

export function DeleteAccountForm() {
  const [state, formAction, pending] =
    useActionState<ProfileState, FormData>(
      deleteUserAction,
      null,
    )

  return (
    <>
      <button
        type="button"
        className="fiscow-settings-danger-btn"
        data-bs-toggle="modal"
        data-bs-target="#confirmUserDeletionModal"
      >
        <i className="ti ti-trash" />
        Supprimer mon compte
      </button>

      <div
        className="modal fade"
        id="confirmUserDeletionModal"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content fiscow-settings-delete-modal">
            <form action={formAction}>
              <div className="fiscow-settings-delete-head">
                <div className="fiscow-settings-delete-icon">
                  <i className="ti ti-trash" />
                </div>

                <div>
                  <h2>Supprimer votre compte ?</h2>

                  <p>
                    Cette action est définitive.
                  </p>
                </div>

                <button
                  type="button"
                  className="fiscow-settings-modal-close"
                  data-bs-dismiss="modal"
                  aria-label="Fermer"
                >
                  <i className="ti ti-x" />
                </button>
              </div>

              <div className="fiscow-settings-delete-body">
                <p>
                  Toutes vos données et ressources seront
                  définitivement supprimées. Saisissez votre
                  mot de passe pour confirmer.
                </p>

                {state?.error && (
                  <div className="fiscow-settings-feedback is-error">
                    <i className="ti ti-alert-circle" />
                    {state.error}
                  </div>
                )}

                <div className="fiscow-settings-field">
                  <label htmlFor="delete-password">
                    Mot de passe
                  </label>

                  <div className="fiscow-settings-input-wrap">
                    <i className="ti ti-lock" />

                    <input
                      id="delete-password"
                      name="password"
                      type="password"
                      placeholder="Votre mot de passe"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="fiscow-settings-delete-footer">
                <button
                  type="button"
                  className="fiscow-settings-secondary-btn"
                  data-bs-dismiss="modal"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="fiscow-settings-danger-btn"
                  disabled={pending}
                >
                  {pending
                    ? 'Suppression...'
                    : 'Supprimer définitivement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}