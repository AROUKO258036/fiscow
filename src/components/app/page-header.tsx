import type { ReactNode } from 'react'

interface Crumb {
  label: ReactNode
  href?: string
}

export function PageHeader({ title,  }: { title: ReactNode; crumbs: Crumb[] }) {
  return (
    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
      <div className="my-auto mb-2">
        <h2>{title}</h2>
        
      </div>
    </div>
  )
}
