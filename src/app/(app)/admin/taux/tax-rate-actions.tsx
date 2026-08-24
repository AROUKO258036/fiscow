'use client'

import { useActionState } from 'react'
import { toggleTaxRateAction } from './actions'

export function TaxRateActions({ rate }: { rate: { id: number; isActive: boolean } }) {
  const [, formAction, pending] = useActionState(toggleTaxRateAction, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={rate.id} />
      <button
        type="submit"
        disabled={pending}
        className={`btn btn-sm ${rate.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
        title={rate.isActive ? 'Désactiver' : 'Activer'}
      >
        <i className={rate.isActive ? 'ti ti-ban' : 'ti ti-check'}></i>
      </button>
    </form>
  )
}
