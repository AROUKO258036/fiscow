'use client'

import { useActionState } from 'react'
import { deleteJobTitleAction } from './actions'

export function DeleteJobTitleButton({ id }: { id: number }) {
  const [, formAction, pending] = useActionState(deleteJobTitleAction, null)

  return (
    <form action={formAction} className="d-inline">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="btn btn-sm btn-outline-danger"
        title="Supprimer"
        onClick={(e) => {
          if (!window.confirm('Supprimer ce métier ?')) e.preventDefault()
        }}
      >
        <i className="ti ti-trash"></i>
      </button>
    </form>
  )
}
