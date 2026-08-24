'use client'

import styles from './declarations.module.css'

type Option = {
  value: string
  label: string
}

type DeclarationFiltersProps = {
  typeOptions: Option[]
  statusOptions: Option[]
  type: string
  status: string
  periode: string
}

export function DeclarationFilters({
  typeOptions,
  statusOptions,
  type,
  status,
  periode,
}: DeclarationFiltersProps) {
  const submit = () => {
    const form = document.getElementById(
      'declaration-filter-form',
    ) as HTMLFormElement | null

    form?.requestSubmit()
  }

  return (
    <form
      id="declaration-filter-form"
      method="GET"
      action="/declarations"
      className={styles.filters}
    >
      <select name="type" defaultValue={type} onChange={submit}>
        <option value="">Tous les types</option>
        {typeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select name="status" defaultValue={status} onChange={submit}>
        <option value="">Tous les statuts</option>
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className={styles.periodInput}>
        <i className="ti ti-calendar-month" />
        <input
          type="text"
          name="periode"
          placeholder="Période : 2026-03"
          defaultValue={periode}
        />
      </div>

      <button type="submit" className={styles.filterButton}>
        <i className="ti ti-filter" />
        Filtrer
      </button>
    </form>
  )
}