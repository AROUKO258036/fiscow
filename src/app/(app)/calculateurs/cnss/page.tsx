import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { calculerCnss } from '@/lib/fiscalite'
import { PageHeader } from '@/components/app/page-header'
import { CalculatorShell } from '@/components/app/calculator-shell'
import { TermeExplicable } from '@/components/app/terme-explicable'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function fmt(n: number): string {
  return n.toLocaleString('fr-FR')
}

export default async function CalculateurCnssPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const sp = await searchParams
  const get = (k: string) => {
    const v = sp[k]
    return Array.isArray(v) ? v[0] : v
  }
  const eventId = get('event_id')
  const salaireBrut = get('salaire_brut')
  const nombreSalaries = get('nombre_salaries')

  const hasInput =
    salaireBrut !== undefined &&
    salaireBrut !== '' &&
    nombreSalaries !== undefined &&
    nombreSalaries !== ''
  const resultat = hasInput
    ? await calculerCnss(Number(salaireBrut), Number(nombreSalaries ?? 1))
    : null

  return (
    <>
      <PageHeader
        title={<TermeExplicable term="cnss" text="Calculateur CNSS" />}
        crumbs={[{ label: 'Calculateurs', href: '/calculateurs' }, { label: 'CNSS' }]}
      />

      <CalculatorShell
        titre="Caisse de Sécurité Sociale (CNSS)"
        soustitre="Taux : 9% part patronale + 3,6% part salariale"
        type="cnss"
        montant={resultat?.total_cnss ?? null}
        eventId={eventId}
        form={
          <form method="GET" action="/calculateurs/cnss">
            {eventId && <input type="hidden" name="event_id" value={eventId} />}
            {get('from') && <input type="hidden" name="from" value={get('from')!} />}
            {get('type') && <input type="hidden" name="type" value={get('type')!} />}
            <div className="mb-3">
              <label className="form-label" htmlFor="salaire_brut">
                Salaire brut mensuel (FCFA)
              </label>
              <input
                id="salaire_brut"
                name="salaire_brut"
                type="number"
                step="1"
                min="0"
                className="form-control"
                defaultValue={salaireBrut}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="nombre_salaries">
                Nombre de salariés
              </label>
              <input
                id="nombre_salaries"
                name="nombre_salaries"
                type="number"
                step="1"
                min="1"
                className="form-control"
                defaultValue={nombreSalaries ?? '1'}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Calculer la CNSS
            </button>
          </form>
        }
        resultats={
          resultat ? (
            <div className="card" style={{ background: 'var(--rg-bg-raised)', borderColor: 'var(--rg-border)' }}>
              <div className="card-body">
                <h5 className="mb-3">Résultat du calcul</h5>
                <div className="row g-3">
                  <div className="col-6">
                    <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                      Salaire brut
                    </p>
                    <p className="fw-semibold rg-montant mb-0">{fmt(resultat.salaire_brut)} FCFA</p>
                  </div>
                  <div className="col-6">
                    <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                      Nombre de salariés
                    </p>
                    <p className="fw-semibold mb-0">{resultat.nombre_salaries}</p>
                  </div>
                  <div className="col-6">
                    <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                      <TermeExplicable term="cnss_part_patronale" text="Part patronale" /> ({resultat.taux_patronal}%)
                    </p>
                    <p className="fw-semibold rg-montant mb-0">{fmt(resultat.part_patronale)} FCFA</p>
                  </div>
                  <div className="col-6">
                    <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                      <TermeExplicable term="cnss_part_salariale" text="Part salariale" /> ({resultat.taux_salarial}%)
                    </p>
                    <p className="fw-semibold rg-montant mb-0">{fmt(resultat.part_salariale)} FCFA</p>
                  </div>
                  <div className="col-12">
                    <div style={{ borderTop: '1px solid var(--rg-border)', paddingTop: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                        Total <TermeExplicable term="cnss" text="CNSS" /> à déclarer
                      </p>
                      <h3 className="rg-montant" style={{ color: 'var(--rg-accent-brique)', marginBottom: 0 }}>
                        {fmt(resultat.total_cnss)} FCFA
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="d-flex flex-column align-items-center justify-content-center h-100"
              style={{ color: 'var(--rg-text-tertiary)' }}
            >
              <i className="ti ti-calculator fs-48 mb-3"></i>
              <p>
                Saisissez le salaire brut
                <br />
                pour calculer la CNSS.
              </p>
            </div>
          )
        }
      />
    </>
  )
}
