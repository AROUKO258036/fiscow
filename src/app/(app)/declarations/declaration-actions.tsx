'use client'

import {
  useActionState,
  useState,
} from 'react'

import {
  markFiledAction,
  markPaidAction,
  cancelDeclarationAction,
  type DeclarationState,
} from '@/app/(app)/declarations/actions'

import styles from './declaration-actions.module.css'

interface Props {
  declarationId: number
  status: string
}

const initialState: DeclarationState = null

export function DeclarationActions({
  declarationId,
  status,
}: Props) {
  const [showPayment, setShowPayment] =
    useState(false)

  const [showCancel, setShowCancel] =
    useState(false)

  const [
    filedState,
    filedAction,
    filedPending,
  ] = useActionState(
    markFiledAction,
    initialState,
  )

  const [
    paidState,
    paidAction,
    paidPending,
  ] = useActionState(
    markPaidAction,
    initialState,
  )

  const [
    cancelState,
    cancelAction,
    cancelPending,
  ] = useActionState(
    cancelDeclarationAction,
    initialState,
  )

  /* ================================================
     PAYÉE
     ================================================ */

  if (status === 'paid') {
    return (
      <div className={styles.successState}>
        <span className={styles.successIcon}>
          <i className="ti ti-circle-check" />
        </span>

        <div>
          <strong>
            Déclaration payée
          </strong>

          <p>
            Le paiement de cette déclaration
            a bien été enregistré.
          </p>
        </div>
      </div>
    )
  }

  /* ================================================
     ANNULÉE
     ================================================ */

  if (status === 'cancelled') {
    return (
      <div className={styles.cancelledState}>
        <span>
          <i className="ti ti-circle-x" />
        </span>

        <div>
          <strong>
            Déclaration annulée
          </strong>

          <p>
            Aucune autre action n’est
            disponible.
          </p>
        </div>
      </div>
    )
  }

  /* ================================================
     BROUILLON
     ================================================ */

  if (status === 'draft') {
    return (
      <div className={styles.wrapper}>

        <div className={styles.actionBar}>
          <div className={styles.actionText}>
            <span className={styles.actionIcon}>
              <i className="ti ti-file-check" />
            </span>

            <div>
              <strong>
                Déclaration prête à être déposée
              </strong>

              <p>
                Vérifiez les informations puis
                confirmez le dépôt.
              </p>
            </div>
          </div>

          <form action={filedAction}>
            <input
              type="hidden"
              name="id"
              value={declarationId}
            />

            <button
              type="submit"
              disabled={filedPending}
              className={styles.primaryButton}
            >
              <i className="ti ti-send" />

              {filedPending
                ? 'Dépôt...'
                : 'Déposer'}
            </button>
          </form>
        </div>

        {filedState?.error && (
          <ErrorMessage
            message={filedState.error}
          />
        )}

        <CancelZone
          declarationId={declarationId}
          showCancel={showCancel}
          setShowCancel={setShowCancel}
          action={cancelAction}
          pending={cancelPending}
          error={cancelState?.error}
        />

      </div>
    )
  }

  /* ================================================
     DÉPOSÉE
     ================================================ */

  if (status === 'filed') {
    return (
      <div className={styles.wrapper}>

        {!showPayment ? (
          <div className={styles.actionBar}>

            <div className={styles.actionText}>
              <span
                className={`${styles.actionIcon} ${styles.actionIconGreen}`}
              >
                <i className="ti ti-file-check" />
              </span>

              <div>
                <strong>
                  Déclaration déposée
                </strong>

                <p>
                  Enregistrez le règlement
                  lorsqu’il a été effectué.
                </p>
              </div>
            </div>

            <div className={styles.actionControls}>
              <button
                type="button"
                onClick={() =>
                  setShowPayment(true)
                }
                className={styles.payButton}
              >
                <i className="ti ti-wallet" />

                Enregistrer un paiement
              </button>

              <CancelZone
                declarationId={declarationId}
                showCancel={showCancel}
                setShowCancel={setShowCancel}
                action={cancelAction}
                pending={cancelPending}
                error={cancelState?.error}
              />
            </div>

          </div>
        ) : (
          <div className={styles.paymentPanel}>

            <div className={styles.paymentHeader}>
              <div className={styles.actionText}>
                <span
                  className={`${styles.actionIcon} ${styles.actionIconGreen}`}
                >
                  <i className="ti ti-wallet" />
                </span>

                <div>
                  <strong>
                    Enregistrer le paiement
                  </strong>

                  <p>
                    Renseignez les informations
                    du règlement.
                  </p>
                </div>
              </div>
            </div>

            <form
              action={paidAction}
              className={styles.paymentForm}
            >
              <input
                type="hidden"
                name="id"
                value={declarationId}
              />

              <div className={styles.field}>
                <label htmlFor="payment_method">
                  Mode de paiement
                </label>

                <select
                  id="payment_method"
                  name="payment_method"
                  defaultValue="manual"
                >
                  <option value="manual">
                    Virement / Espèces
                  </option>

                  <option value="momo">
                    MTN MoMo
                  </option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="reference">
                  Référence
                  <span>
                    {' '}optionnelle
                  </span>
                </label>

                <input
                  id="reference"
                  name="reference"
                  type="text"
                  placeholder="Référence du paiement"
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  disabled={paidPending}
                  className={styles.confirmButton}
                >
                  <i className="ti ti-circle-check" />

                  {paidPending
                    ? 'Enregistrement...'
                    : 'Confirmer'}
                </button>

                <button
                  type="button"
                  disabled={paidPending}
                  onClick={() =>
                    setShowPayment(false)
                  }
                  className={styles.secondaryButton}
                >
                  Annuler
                </button>
              </div>
            </form>

            {paidState?.error && (
              <ErrorMessage
                message={paidState.error}
              />
            )}

          </div>
        )}

        {showPayment && null}

      </div>
    )
  }

  return null
}


/* =====================================================
   ANNULATION
   ===================================================== */

function CancelZone({
  declarationId,
  showCancel,
  setShowCancel,
  action,
  pending,
  error,
}: {
  declarationId: number
  showCancel: boolean
  setShowCancel:
    React.Dispatch<
      React.SetStateAction<boolean>
    >
  action:
    (
      payload: FormData,
    ) => void
  pending: boolean
  error?: string
}) {
  if (!showCancel) {
    return (
      <div className={styles.cancelShortcut}>
        <button
          type="button"
          onClick={() =>
            setShowCancel(true)
          }
          className={styles.cancelLink}
        >
          <i className="ti ti-x" />
          Annuler la déclaration
        </button>
      </div>
    )
  }

  return (
    <div className={styles.cancelPanel}>

      <div className={styles.cancelPanelHead}>
        <div>
          <strong>
            Annuler cette déclaration ?
          </strong>

          <p>
            Cette action modifiera son statut.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowCancel(false)
          }
          className={styles.closeButton}
        >
          <i className="ti ti-x" />
        </button>
      </div>

      <form
        action={action}
        className={styles.cancelForm}
      >
        <input
          type="hidden"
          name="id"
          value={declarationId}
        />

        <div className={styles.field}>
          <label htmlFor="notes">
            Motif
            <span>
              {' '}optionnel
            </span>
          </label>

          <input
            id="notes"
            name="notes"
            type="text"
            placeholder="Motif de l’annulation"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className={styles.dangerButton}
        >
          <i className="ti ti-trash" />

          {pending
            ? 'Annulation...'
            : 'Confirmer l’annulation'}
        </button>
      </form>

      {error && (
        <ErrorMessage message={error} />
      )}
    </div>
  )
}


/* =====================================================
   ERREUR
   ===================================================== */

function ErrorMessage({
  message,
}: {
  message: string
}) {
  return (
    <div className={styles.error}>
      <i className="ti ti-alert-circle" />
      {message}
    </div>
  )
}