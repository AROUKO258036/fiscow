'use client'

import { useActionState } from 'react'
import { saveTaxRateAction } from './actions'

export function NewTaxRateForm() {
  const [state, formAction, pending] = useActionState(saveTaxRateAction, null)

  return (
    <form action={formAction}>
      {state?.error && <div className="alert alert-danger py-2">{state.error}</div>}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Clé</label>
          <input type="text" name="key" className="form-control" placeholder="ex : patente" />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Nom</label>
          <input type="text" name="name" className="form-control" required placeholder="ex : Patente" />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Type</label>
          <select name="type" className="form-select">
            <option value="percentage">Pourcentage</option>
            <option value="progressive">Barème progressif</option>
            <option value="compound">Composé</option>
            <option value="fixed">Montant fixe</option>
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Référence légale</label>
          <input type="text" name="reference" className="form-control" placeholder="ex : Art. 401-415 CGI" />
        </div>
        <div className="col-12">
          <label className="form-label">Description</label>
          <textarea name="description" className="form-control" rows={3}></textarea>
        </div>
      </div>
      <div className="modal-footer px-0 pb-0">
        <button type="button" className="btn btn-light" data-bs-dismiss="modal">Annuler</button>
        <button type="submit" disabled={pending} className="btn btn-primary">Créer</button>
      </div>
    </form>
  )
}

export function EditTaxRateForm({
  rate,
}: {
  rate: { id: number; name: string; reference: string | null; description: string | null }
}) {
  const [state, formAction, pending] = useActionState(saveTaxRateAction, null)

  return (
    <form action={formAction}>
      {state?.error && <div className="alert alert-danger py-2">{state.error}</div>}
      <input type="hidden" name="id" value={rate.id} />
      <div className="mb-3">
        <label className="form-label">Nom</label>
        <input type="text" name="name" className="form-control" defaultValue={rate.name} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Référence légale</label>
        <input type="text" name="reference" className="form-control" defaultValue={rate.reference ?? ''} />
      </div>
      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea name="description" className="form-control" rows={3} defaultValue={rate.description ?? ''}></textarea>
      </div>
      <div className="modal-footer px-0 pb-0">
        <button type="button" className="btn btn-light" data-bs-dismiss="modal">Annuler</button>
        <button type="submit" disabled={pending} className="btn btn-primary">Enregistrer</button>
      </div>
    </form>
  )
}
