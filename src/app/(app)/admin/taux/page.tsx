import { requireAdmin } from '@/lib/require-admin'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/app/page-header'
import { TaxRateActions } from './tax-rate-actions'
import { NewTaxRateForm, EditTaxRateForm } from './save-tax-rate'

const TYPE_LABELS: Record<string, string> = {
  percentage: 'Pourcentage',
  progressive: 'Barème progressif',
  compound: 'Composé',
  fixed: 'Montant fixe',
}

export default async function AdminTauxPage() {
  await requireAdmin()

  const rates = await prisma.taxRate.findMany({ orderBy: { key: 'asc' } })

  return (
    <>
      <PageHeader
        title="Taux et barèmes"
        crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Taux' }]}
      />

      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h5 className="mb-0">{rates.length} taux / barèmes</h5>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            data-bs-toggle="modal"
            data-bs-target="#rateModal"
          >
            <i className="ti ti-plus me-1"></i>Nouveau taux
          </button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-nowrap mb-0">
              <thead>
                <tr>
                  <th>Clé</th>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Référence</th>
                  <th className="text-center">Statut</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => (
                  <tr key={rate.id}>
                    <td>
                      <span className="badge bg-light text-dark">{rate.key}</span>
                    </td>
                    <td className="fw-semibold">{rate.name}</td>
                    <td>{TYPE_LABELS[rate.type] ?? rate.type}</td>
                    <td className="text-muted fs-13">{rate.reference ?? '—'}</td>
                    <td className="text-center">
                      <span className={`badge ${rate.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {rate.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          data-bs-toggle="modal"
                          data-bs-target={`#rateEdit${rate.id}`}
                          title="Modifier"
                        >
                          <i className="ti ti-edit"></i>
                        </button>
                        <TaxRateActions rate={{ id: rate.id, isActive: rate.isActive }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="modal fade" id="rateModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Nouveau taux</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <NewTaxRateForm />
            </div>
          </div>
        </div>
      </div>

      {rates.map((rate) => (
        <div className="modal fade" id={`rateEdit${rate.id}`} key={rate.id} tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modifier — {rate.name}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                <EditTaxRateForm
                  rate={{ id: rate.id, name: rate.name, reference: rate.reference, description: rate.description }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
