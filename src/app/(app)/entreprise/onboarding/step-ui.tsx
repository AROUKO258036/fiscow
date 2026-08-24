import type { ReactNode } from 'react'

export function ErrorBox({
  errors,
}: {
  errors?: Record<string, string> | null
}) {
  const list = Object.values(errors ?? {})

  if (list.length === 0) return null

  return (
    <div
      className="fiscow-error-box"
      role="alert"
    >
      <i className="ti ti-alert-circle" />

      <span>
        Veuillez corriger les erreurs ci-dessous.
      </span>
    </div>
  )
}

export function FieldError({
  error,
}: {
  error?: string
}) {
  if (!error) return null

  return (
    <div className="fiscow-field-error">
      <i className="ti ti-alert-circle" />
      {error}
    </div>
  )
}

export function Hint({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="fiscow-field-hint">
      <i className="ti ti-info-circle" />
      <span>{children}</span>
    </div>
  )
}