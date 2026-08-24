import { forbidden, notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DeclarationActions } from '@/components/app/declaration/declaration-actions'
import { DeclarationExport } from '@/components/app/declaration/declaration-export'

interface Props {
  params: Promise<{ id: string }>
}

const TAXE_LABELS: Record<string, string> = {
  is: 'IS',
  iba: 'IBA',
  tva: 'TVA',
  its: 'ITS',
  cnss: 'CNSS',
  tps: 'TPS',
  tfu: 'TFU',
  patente: 'Patente',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  filed: 'Déposée',
  paid: 'Payée',
  cancelled: 'Annulée',
}

function fmt(n: number | string | Prisma.Decimal): string {
  return Number(n).toLocaleString('fr-FR')
}

function fmtDate(d: Date | null): string {
  if (!d) return '—'
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function statutClass(status: string): string {
  switch (status) {
    case 'paid':
      return 'badge bg-success'
    case 'filed':
      return 'badge bg-info'
    case 'draft':
      return 'badge bg-warning text-dark'
    default:
      return 'badge bg-secondary'
  }
}

export default async function DeclarationShowPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params
  const declarationId = Number(id)
  if (!Number.isFinite(declarationId)) notFound()

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    include: { companies: { orderBy: { createdAt: 'asc' }, take: 1 } },
  })
  const company = user?.companies[0]
  if (!company) redirect('/entreprise/onboarding')

  const declaration = await prisma.declaration.findUnique({
    where: { id: declarationId },
  })
  if (!declaration) notFound()
  if (declaration.companyId !== company.id) forbidden()

  const transactions = await prisma.transaction.findMany({
    where: { declarationId: declaration.id },
    orderBy: { transactionDate: 'desc' },
  })

  const exportData = {
    id: declaration.id,
    type: declaration.type,
    typeLabel: TAXE_LABELS[declaration.type] ?? declaration.type.toUpperCase(),
    periode: declaration.periode,
    amountDue: fmt(declaration.amountDue),
    amountPaid: Number(declaration.amountPaid) > 0 ? fmt(declaration.amountPaid) : '0',
    status: STATUS_LABELS[declaration.status] ?? declaration.status,
    dueDate: fmtDate(declaration.dueDate),
    filedDate: declaration.filedDate ? fmtDate(declaration.filedDate) : '—',
    paidDate: declaration.paidDate ? fmtDate(declaration.paidDate) : '—',
    notes: declaration.notes ?? '',
    companyName: company.raisonSociale,
    companyNif: company.nif,
  }

  return (
    <>
      <div className="d-flex align-items-center justify-content-between flex-wrap mb-4">
        <div className="my-auto mb-2">
          <h2>Déclaration #{declaration.id}</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/dashboard">
                  <i className="ti ti-smart-home"></i>
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/declarations">Déclarations</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                #{declaration.id}
              </li>
            </ol>
          </nav>
        </div>
        <div className="d-flex gap-2">
          <DeclarationExport data={exportData} />
          <Link href="/declarations" className="btn btn-outline-secondary d-inline-flex align-items-center">
            <i className="ti ti-arrow-left me-1"></i>Retour
          </Link>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-xl-8">
          <div className="card mb-3">
            <div className="card-body">
              <DeclarationActions declarationId={declaration.id} status={declaration.status} />
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Détails de la déclaration</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-sm-6">
                  <p className="rg-kpi-label mb-1">Type d&apos;impôt</p>
                  <p className="fw-semibold">
                    <span className={`badge fc-event-${declaration.type}`} style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>
                      {TAXE_LABELS[declaration.type] ?? declaration.type.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="rg-kpi-label mb-1">Période</p>
                  <p className="fw-semibold">{declaration.periode}</p>
                </div>
                <div className="col-sm-6">
                  <p className="rg-kpi-label mb-1">Montant dû</p>
                  <p className="fw-semibold fs-5" style={{ color: 'var(--rg-accent-brique)' }}>
                    {fmt(declaration.amountDue)} FCFA
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="rg-kpi-label mb-1">Montant payé</p>
                  <p className="fw-semibold fs-5" style={{ color: 'var(--rg-accent-palme)' }}>
                    {Number(declaration.amountPaid) > 0 ? `${fmt(declaration.amountPaid)} FCFA` : '—'}
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="rg-kpi-label mb-1">Date d&apos;échéance</p>
                  <p className="fw-semibold">
                    <i className="ti ti-calendar-up me-1"></i>
                    {fmtDate(declaration.dueDate)}
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="rg-kpi-label mb-1">Statut</p>
                  <p>
                    <span className={statutClass(declaration.status)} style={{ fontSize: '0.8rem' }}>
                      {STATUS_LABELS[declaration.status] ?? declaration.status}
                    </span>
                  </p>
                </div>
                {declaration.filedDate && (
                  <div className="col-sm-6">
                    <p className="rg-kpi-label mb-1">Date de dépôt</p>
                    <p className="fw-semibold">{fmtDate(declaration.filedDate)}</p>
                  </div>
                )}
                {declaration.paidDate && (
                  <div className="col-sm-6">
                    <p className="rg-kpi-label mb-1">Date de paiement</p>
                    <p className="fw-semibold">{fmtDate(declaration.paidDate)}</p>
                  </div>
                )}
                {declaration.notes && (
                  <div className="col-12">
                    <p className="rg-kpi-label mb-1">Notes</p>
                    <p className="fw-semibold">{declaration.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Transactions liées</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-nowrap mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Montant</th>
                      <th>Méthode</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-3 text-muted">
                          Aucune transaction
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>TX-{String(tx.id).padStart(4, '0')}</td>
                          <td className="rg-montant">{fmt(tx.amount)} FCFA</td>
                          <td>{tx.paymentMethod === 'momo' ? 'MTN MoMo' : 'Virement / Espèces'}</td>
                          <td>{tx.transactionDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        </tr>
                      ))
                    )}
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
