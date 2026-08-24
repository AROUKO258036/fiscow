import { requireAdmin } from '@/lib/require-admin'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/app/page-header'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  filed: 'Déposée',
  paid: 'Payée',
  cancelled: 'Annulée',
}
const STATUS_CLASSES: Record<string, string> = {
  draft: 'bg-secondary',
  filed: 'bg-info',
  paid: 'bg-success',
  cancelled: 'bg-danger',
}

export default async function AdminDeclarationsPage() {
  await requireAdmin()

  const declarations = await prisma.declaration.findMany({
    orderBy: { createdAt: 'desc' },
    include: { company: { select: { raisonSociale: true } } },
  })

  const total = declarations.reduce((s, d) => s + Number(d.amountDue), 0)

  return (
    <>
      <PageHeader
        title="Toutes les déclarations"
        crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Déclarations' }]}
      />

      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h5 className="mb-0">{declarations.length} déclarations — {total.toLocaleString('fr-FR')} FCFA</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-nowrap mb-0">
              <thead>
                <tr>
                  <th>Entreprise</th>
                  <th>Type</th>
                  <th>Période</th>
                  <th>Montant dû</th>
                  <th>Montant payé</th>
                  <th>Statut</th>
                  <th>Créée le</th>
                </tr>
              </thead>
              <tbody>
                {declarations.map((d) => (
                  <tr key={d.id}>
                    <td>{d.company?.raisonSociale ?? '—'}</td>
                    <td>
                      <span className="badge bg-light text-dark">{d.type.toUpperCase()}</span>
                    </td>
                    <td>{d.periode}</td>
                    <td>{Number(d.amountDue).toLocaleString('fr-FR')} FCFA</td>
                    <td>
                      {d.amountPaid != null ? `${Number(d.amountPaid).toLocaleString('fr-FR')} FCFA` : '—'}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_CLASSES[d.status]}`}>{STATUS_LABELS[d.status]}</span>
                    </td>
                    <td>{d.createdAt?.toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
