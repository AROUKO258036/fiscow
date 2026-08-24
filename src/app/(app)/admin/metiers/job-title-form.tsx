'use client'

import { useActionState } from 'react'
import { createJobTitleAction } from './actions'
import { SECTEURS, secteurLabel } from '@/lib/secteurs'

export function JobTitleForm() {
  const [state, formAction, pending] = useActionState(createJobTitleAction, null)

  return (
    <form action={formAction}>
      {state?.error && <div className="alert alert-danger py-2">{state.error}</div>}
      <div className="row g-2">
        <div className="col-md-5">
          <input type="text" name="libelle" className="form-control" placeholder="Libellé du poste" required />
        </div>
        <div className="col-md-4">
          <select name="secteur" className="form-select">
            {SECTEURS.map((value) => (
              <option key={value} value={value}>
                {secteurLabel(value)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3 d-flex align-items-center gap-2">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" name="transversal" value="1" id="transversalCheck" />
            <label className="form-check-label" htmlFor="transversalCheck">
              Transversal
            </label>
          </div>
          <button type="submit" disabled={pending} className="btn btn-primary ms-auto">
            <i className="ti ti-plus me-1"></i>Ajouter
          </button>
        </div>
      </div>
    </form>
  )
}
