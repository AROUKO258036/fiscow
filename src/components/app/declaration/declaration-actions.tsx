'use client'

import { useActionState, useState } from 'react'
import {
  markFiledAction,
  markPaidAction,
  cancelDeclarationAction,
  type DeclarationState,
} from '@/app/(app)/declarations/actions'

type Props = {
  declarationId: number
  status: string
}

export function DeclarationActions({ declarationId, status }: Props) {
  const [filedState, filedAction, filedPending] = useActionState<DeclarationState, FormData>(markFiledAction, null)
  const [paidState, paidAction, paidPending] = useActionState<DeclarationState, FormData>(markPaidAction, null)
  const [cancelState, cancelAction, cancelPending] = useActionState<DeclarationState, FormData>(cancelDeclarationAction, null)
  const [showPay, setShowPay] = useState(false)

  const error = filedState?.error ?? paidState?.error ?? cancelState?.error

  return (
    <>
      {error && <div className="alert alert-danger py-2 fs-13">{error}</div>}

      {status === 'draft' && (
        <div className="d-flex flex-wrap gap-2">
          <form action={filedAction}>
            <input type="hidden" name="id" value={declarationId} />
            <button type="submit" className="btn btn-primary" disabled={filedPending}>
              <i className="ti ti-file-check me-1"></i>Déposer la déclaration
            </button>
          </form>
          <form action={cancelAction} className="d-inline">
            <input type="hidden" name="id" value={declarationId} />
            <input type="hidden" name="notes" value="Annulée depuis le détail" />
            <button type="submit" className="btn btn-outline-danger" disabled={cancelPending}>
              <i className="ti ti-x me-1"></i>Annuler
            </button>
          </form>
        </div>
      )}

      {status === 'filed' && (
        <div className="d-flex flex-wrap gap-2">
          {!showPay ? (
            <button type="button" className="btn btn-success" onClick={() => setShowPay(true)}>
              <i className="ti ti-coin me-1"></i>Enregistrer le paiement
            </button>
          ) : (
            <form action={paidAction} className="d-flex flex-wrap align-items-end gap-2">
              <input type="hidden" name="id" value={declarationId} />
              <div>
                <label className="form-label mb-1" htmlFor={`pm-${declarationId}`}>
                  Mode de paiement
                </label>
                <select id={`pm-${declarationId}`} name="payment_method" className="form-select form-select-sm">
                  <option value="manual">Virement / Espèces</option>
                  <option value="momo" disabled>MTN MoMo (à venir)</option>
                </select>
              </div>
              <div>
                <label className="form-label mb-1" htmlFor={`ref-${declarationId}`}>
                  Référence (optionnel)
                </label>
                <input id={`ref-${declarationId}`} name="reference" type="text" className="form-control form-control-sm" placeholder="Réf. paiement" />
              </div>
              <button type="submit" className="btn btn-success btn-sm" disabled={paidPending}>
                {paidPending ? 'Enregistrement…' : 'Confirmer'}
              </button>
              <button type="button" className="btn btn-link btn-sm text-muted" onClick={() => setShowPay(false)}>
                Annuler
              </button>
            </form>
          )}
          <form action={cancelAction} className="d-inline">
            <input type="hidden" name="id" value={declarationId} />
            <input type="hidden" name="notes" value="Annulée depuis le détail" />
            <button type="submit" className="btn btn-outline-danger" disabled={cancelPending}>
              <i className="ti ti-x me-1"></i>Annuler
            </button>
          </form>
        </div>
      )}

      {status === 'paid' && (
        <div className="alert alert-success py-2 fs-13 mb-0">
          <i className="ti ti-circle-check me-1"></i>Déclaration payée et clôturée.
        </div>
      )}
      {status === 'cancelled' && (
        <div className="alert alert-secondary py-2 fs-13 mb-0">
          <i className="ti ti-circle-x me-1"></i>Déclaration annulée.
        </div>
      )}
    </>
  )
}
