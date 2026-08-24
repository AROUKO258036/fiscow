import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { buildDashboard } from '@/lib/dashboard'
import { getApplicableTaxes } from '@/lib/company'
import { DashboardClient } from './dashboard-client'

function fmtFCFA(n: number | null | undefined): string {
  return n == null ? '—' : `${Math.round(n).toLocaleString('fr-FR')} FCFA`
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    include: { companies: { orderBy: { createdAt: 'asc' }, take: 1 } },
  })
  if (!user) redirect('/login')

  if (!user.emailVerifiedAt) redirect('/verify-email')

  const company = user.companies[0]
  if (!company) redirect('/entreprise/onboarding')

  const companyWithEmployees = await prisma.company.findUnique({
    where: { id: company.id },
    include: {
      employees: { where: { isActive: true }, select: { salaireBrutMensuel: true } },
    },
  })
  if (!companyWithEmployees) redirect('/entreprise/onboarding')

  const data = await buildDashboard(companyWithEmployees as never)
  const deadline = data.deadline

  const estimation = deadline != null && (deadline.type === 'its' || deadline.type === 'cnss')
  const salairesPrecis = (companyWithEmployees.employees ?? []).some((e) => Number(e.salaireBrutMensuel) > 0)

  const deadlineData = deadline
    ? {
        obligation: `${deadline.type.toUpperCase()} — ${deadline.title}`,
        date: deadline.eventDate.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        montant: deadline.montantEstime != null ? fmtFCFA(Number(deadline.montantEstime)) : 'À calculer',
        // eslint-disable-next-line react-hooks/purity
        joursRestant: Math.max(0, Math.floor((deadline.eventDate.getTime() - Date.now()) / 86_400_000)),
        estimation,
        salairesPrecis: estimation ? salairesPrecis : null,
      }
    : null

  const recentTx = await prisma.transaction.findMany({
    where: { companyId: company.id, status: 'completed' },
    include: { declaration: true },
    orderBy: { transactionDate: 'desc' },
    take: 5,
  })

  const totalPaye = await prisma.transaction.aggregate({
    where: { companyId: company.id, status: 'completed' },
    _sum: { amount: true },
  })

  const sums = await prisma.transaction.groupBy({
    by: ['category'],
    where: { companyId: company.id, status: 'completed' },
    _sum: { amount: true },
  })
  const montantsParCategorie = new Map(sums.map((s) => [s.category, Number(s._sum.amount ?? 0)]))

  const taxeLabels: Record<string, string> = {
    is: 'IS',
    iba: 'IBA',
    tva: 'TVA',
    its: 'ITS',
    cnss: 'CNSS',
    tps: 'TPS',
    tfu: 'TFU',
  }
  const taxeClasses: Record<string, string> = {
    is: 'border-secondary',
    iba: 'border-secondary-800',
    tva: 'border-secondary-800',
    its: 'border-secondary-700',
    cnss: 'border-secondary-600',
    tps: 'border-secondary-500',
    tfu: 'border-secondary-400',
  }

  const applicableTaxes = getApplicableTaxes({
    type_entite: company.typeEntite,
    chiffre_affaires: company.chiffreAffaires != null ? Number(company.chiffreAffaires) : null,
    effectif: company.effectif,
    has_property: company.hasProperty,
    regime_tva: company.regimeTva,
  })

  const repartitionFiscale = applicableTaxes.map((tax) => {
    const montant = montantsParCategorie.get(tax.key)
    return {
      label: taxeLabels[tax.key] ?? tax.key.toUpperCase(),
      montant: montant != null && montant > 0 ? `${montant.toLocaleString('fr-FR')} FCFA` : '—',
      classe: taxeClasses[tax.key] ?? 'border-secondary',
    }
  })

  const transactions = recentTx.map((tx) => {
    const contribuable = tx.declaration
      ? `${tx.declaration.type.charAt(0).toUpperCase() + tx.declaration.type.slice(1).replace(/_/g, ' ')} — ${tx.declaration.periode}`
      : tx.category.toUpperCase()
    return {
      id: `TX-${String(tx.id).padStart(4, '0')}`,
      contribuable,
      categorie: tx.category.toUpperCase(),
      montant: fmtFCFA(Number(tx.amount)),
      date: tx.transactionDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
      statut: tx.status === 'completed' ? 'Payé' : 'En attente',
      classe_statut: tx.status === 'completed' ? 'badge bg-success' : 'badge bg-warning text-dark',
    }
  })

  const totalPayeValue = Number(totalPaye._sum.amount ?? 0)

  return (
    <DashboardClient
      score={data.score}
      deadline={deadlineData}
      budgetFiscalRestant="—"
      totalImpotsPayes={totalPayeValue > 0 ? fmtFCFA(totalPayeValue) : '—'}
      declarationsEnAttente={data.pendingCount}
      repartitionFiscale={repartitionFiscale}
      chart={{ categories: data.chart.categories, completed: data.chart.completed, pending: data.chart.pending }}
      transactions={transactions}
    />
  )
}
