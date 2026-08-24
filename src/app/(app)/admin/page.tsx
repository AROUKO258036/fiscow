import { requireAdmin } from '@/lib/require-admin'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/app/page-header'
import Link from 'next/link'

function fmtFCFA(n: number): string {
  return `${n.toLocaleString('fr-FR')} FCFA`
}

export default async function AdminPage() {
  const admin = await requireAdmin()

  const [users, companies, declarations, transactions, taxRates, jobTitles] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.declaration.count(),
    prisma.transaction.count({ where: { status: 'completed' } }),
    prisma.taxRate.count(),
    prisma.jobTitle.count(),
  ])

  const [declarationsPerStatus, transactionsSum, recentUsers, recentDeclarations] = await Promise.all([
    prisma.declaration.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.transaction.aggregate({ where: { status: 'completed' }, _sum: { amount: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true, emailVerifiedAt: true },
    }),
    prisma.declaration.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { company: { select: { raisonSociale: true } } },
    }),
  ])

  const statusLabels: Record<string, string> = {
    draft: 'Brouillon',
    filed: 'Déposée',
    paid: 'Payée',
    cancelled: 'Annulée',
  }
  const statusClasses: Record<string, string> = {
    draft: 'bg-secondary',
    filed: 'bg-info',
    paid: 'bg-success',
    cancelled: 'bg-danger',
  }

  const totalRevenue = Number(transactionsSum._sum.amount ?? 0)

  return (
    <>
      <PageHeader title={`Administration — ${admin.name}`} crumbs={[{ label: 'Admin' }]} />

      <div className="row">
        <div className="col-xl-3 col-md-6">
          <div className="card">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h4 className="mb-1">{users}</h4>
                <p className="mb-0 text-muted fs-13">Utilisateurs</p>
              </div>
              <span className="avatar avatar-lg bg-primary-subtle text-primary">
                <i className="ti ti-users fs-20"></i>
              </span>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h4 className="mb-1">{companies}</h4>
                <p className="mb-0 text-muted fs-13">Entreprises</p>
              </div>
              <span className="avatar avatar-lg bg-secondary-subtle text-secondary">
                <i className="ti ti-building fs-20"></i>
              </span>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h4 className="mb-1">{declarations}</h4>
                <p className="mb-0 text-muted fs-13">Déclarations</p>
              </div>
              <span className="avatar avatar-lg bg-warning-subtle text-warning">
                <i className="ti ti-file-invoice fs-20"></i>
              </span>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h4 className="mb-1">{fmtFCFA(totalRevenue)}</h4>
                <p className="mb-0 text-muted fs-13">Transactions ({transactions})</p>
              </div>
              <span className="avatar avatar-lg bg-success-subtle text-success">
                <i className="ti ti-wallet fs-20"></i>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-2">
        <div className="col-xl-4 col-lg-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Déclarations par statut</h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                {Object.entries(statusLabels).map(([key, label]) => {
                  const count = declarationsPerStatus.find((d) => d.status === key)?._count._all ?? 0
                  return (
                    <li key={key} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                      <span>
                        <span className={`badge ${statusClasses[key]} me-2`}>{label}</span>
                        {count}
                      </span>
                      <span className="text-muted fs-13">{((count / Math.max(1, declarations)) * 100).toFixed(0)}%</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-xl-8 col-lg-6">
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Dernières déclarations</h5>
              <Link href="/admin/declarations" className="btn btn-sm btn-primary">
                Tout voir
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-nowrap mb-0">
                  <thead>
                    <tr>
                      <th>Entreprise</th>
                      <th>Type</th>
                      <th>Période</th>
                      <th>Montant</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDeclarations.map((d) => (
                      <tr key={d.id}>
                        <td>{d.company?.raisonSociale ?? '—'}</td>
                        <td>{d.type.toUpperCase()}</td>
                        <td>{d.periode}</td>
                        <td>{fmtFCFA(Number(d.amountDue))}</td>
                        <td>
                          <span className={`badge ${statusClasses[d.status]}`}>{statusLabels[d.status]}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-2">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Référentiels</h5>
              <div className="d-flex gap-2">
                <Link href="/admin/taux" className="btn btn-sm btn-outline-primary">
                  Taux ({taxRates})
                </Link>
                <Link href="/admin/metiers" className="btn btn-sm btn-outline-primary">
                  Métiers ({jobTitles})
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-2">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Derniers utilisateurs</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-nowrap mb-0">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Email vérifié</th>
                      <th>Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'ADMIN' ? 'bg-primary' : 'bg-secondary'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          {u.emailVerifiedAt ? (
                            <span className="badge bg-success">Vérifié</span>
                          ) : (
                            <span className="badge bg-warning text-dark">En attente</span>
                          )}
                        </td>
                        <td>{u.createdAt?.toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
