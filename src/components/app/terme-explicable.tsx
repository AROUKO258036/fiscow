'use client'

import { useId } from 'react'
import { getTermeFiscal } from '@/lib/fiscalite-lexique'

interface TermeExplicableProps {
  term: string
  text?: string
}

export function TermeExplicable({ term, text }: TermeExplicableProps) {
  const reactId = useId()
  const data = getTermeFiscal(term)
  const sigle = data?.sigle ?? ''
  const nom = data?.nom ?? term
  const def = data?.def ?? ''
  const exemple = data?.exemple ?? ''
  const label = text ?? (sigle ? sigle : nom)
  const id = `te-${term.replace(/_/g, '-')}-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <span
      id={id}
      className="terme-explicable"
      tabIndex={0}
      role="button"
      aria-label={`En savoir plus sur ${nom}`}
      data-term={term}
      data-sigle={sigle}
      data-nom={nom}
      data-def={def}
      {...(exemple ? { 'data-exemple': exemple } : {})}
    >
      <span className="te-label">{label}</span>
      <i className="ti ti-help-circle te-icon"></i>
    </span>
  )
}
