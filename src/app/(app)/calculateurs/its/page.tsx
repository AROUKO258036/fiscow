import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { calculerIts } from '@/lib/fiscalite'
import { PageHeader } from '@/components/app/page-header'
import { CalculatorShell } from '@/components/app/calculator-shell'
import { TermeExplicable } from '@/components/app/terme-explicable'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function fmt(n: number): string {
  return n.toLocaleString('fr-FR')
}

export default async function CalculateurItsPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const sp = await searchParams
  const get = (k: string) => {
    const v = sp[k]
    return Array.isArray(v) ? v[0] : v
  }
  const eventId = get('event_id')
  const salaireBrut = get('salaire_brut')

  const hasInput = salaireBrut !== undefined && salaireBrut !== ''
  const resultat = hasInput ? await calculerIts(Number(salaireBrut)) : null

  return (
    <>
      <PageHeader
        title={<TermeExplicable term="its" text="Calculateur ITS" />}
        crumbs={[{ label: 'Calculateurs', href: '/calculateurs' }, { label: 'ITS' }]}
      />

      <CalculatorShell
        titre="Impôt sur les Traitements et Salaires (ITS)"
        soustitre="Barème progressif — Tranches de 0% à 30% (Art. 125 CGI) — Redevance ORTB 4 000 FCFA/an"
        type="its"
        montant={resultat?.total_impots ?? null}
        eventId={eventId}
        form={
          <form method="GET" action="/calculateurs/its">
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
              <div style={{ fontSize: '0.75rem', color: 'var(--rg-text-tertiary)', marginTop: '0.25rem' }}>
                <i className="ti ti-info-circle"></i> <TermeExplicable term="its_bareme" text="Barème 2026" /> : 0%(≤60k), 10%(60-150k), 15%(150-250k), 19%(250-500k), 30%(&gt;500k) —{' '}
                <TermeExplicable term="its_redevance_ortb" text="Redevance ORTB" /> +4 000 FCFA/an
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Calculer l&apos;ITS
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
                      Taux effectif
                    </p>
                    <p className="fw-semibold mb-0">{resultat.taux_effectif}%</p>
                  </div>
                  <div className="col-6">
                    <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                      Salaire net
                    </p>
                    <p className="fw-semibold mb-0">{fmt(resultat.salaire_net)} FCFA</p>
                  </div>
                  <div className="col-12">
                    <div style={{ borderTop: '1px solid var(--rg-border)', paddingTop: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                        Total <TermeExplicable term="its" text="ITS" /> à payer (mensuel)
                      </p>
                      <h3 className="rg-montant" style={{ color: 'var(--rg-accent-brique)', marginBottom: 0 }}>
                        {fmt(resultat.total_impots)} FCFA
                      </h3>
                    </div>
                  </div>
                  {resultat.tranches.length > 0 && (
                    <div className="col-12">
                      <div style={{ borderTop: '1px solid var(--rg-border)', paddingTop: '1rem' }}>
                        <p
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--rg-text-secondary)',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Détail par tranche
                        </p>
                        <table style={{ width: '100%', fontSize: '0.8rem' }}>
                          <thead>
                            <tr style={{ color: 'var(--rg-text-secondary)' }}>
                              <th style={{ textAlign: 'left', paddingBottom: '0.25rem' }}>Tranche</th>
                              <th style={{ textAlign: 'right', paddingBottom: '0.25rem' }}>Taux</th>
                              <th style={{ textAlign: 'right', paddingBottom: '0.25rem' }}>Montant</th>
                              <th style={{ textAlign: 'right', paddingBottom: '0.25rem' }}>Impôt</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultat.tranches.map((t, i) => (
                              <tr key={i}>
                                <td style={{ textAlign: 'left' }}>
                                  {fmt(t.de)} - {t.a === '∞' ? t.a : fmt(t.a)}
                                </td>
                                <td style={{ textAlign: 'right' }}>{t.taux}%</td>
                                <td style={{ textAlign: 'right' }}>{fmt(t.montant)}</td>
                                <td style={{ textAlign: 'right', color: 'var(--rg-accent-brique)' }}>{fmt(t.impot)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
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
                pour calculer l&apos;ITS.
              </p>
            </div>
          )
        }
      />
    </>
  )
}
