import { requireAdmin } from '@/lib/require-admin'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/app/page-header'
import { secteurLabel } from '@/lib/secteurs'
import { JobTitleForm } from './job-title-form'
import { DeleteJobTitleButton } from './delete-job-title'

export default async function AdminMetiersPage() {
  await requireAdmin()

  const jobTitles = await prisma.jobTitle.findMany({
    orderBy: [{ transversal: 'desc' }, { secteur: 'asc' }, { libelle: 'asc' }],
  })

  return (
    <>
      <PageHeader
        title="Métiers et postes"
        crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Métiers' }]}
      />

      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">Ajouter un métier</h5>
        </div>
        <div className="card-body">
          <JobTitleForm />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">{jobTitles.length} métiers</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-nowrap mb-0">
              <thead>
                <tr>
                  <th>Libellé</th>
                  <th>Secteur</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobTitles.map((job) => (
                  <tr key={job.id}>
                    <td className="fw-semibold">{job.libelle}</td>
                    <td>
                      {job.transversal ? (
                        <span className="badge bg-primary-subtle text-primary">Transversal</span>
                      ) : (
                        <span className="badge bg-light text-dark">{secteurLabel(job.secteur)}</span>
                      )}
                    </td>
                    <td className="text-end">
                      <DeleteJobTitleButton id={job.id} />
                    </td>
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
