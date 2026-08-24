import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { calculerPatente } from '@/lib/fiscalite'
import { PageHeader } from '@/components/app/page-header'
import { CalculatorShell } from '@/components/app/calculator-shell'
import { TermeExplicable } from '@/components/app/terme-explicable'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function fmt(n: number): string {
  return n.toLocaleString('fr-FR')
}

export default async function CalculateurPatentePage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const sp = await searchParams
  const get = (k: string) => {
    const v = sp[k]
    return Array.isArray(v) ? v[0] : v
  }
  const eventId = get('event_id')
  const ca = get('ca')

  const hasInput = ca !== undefined && ca !== ''
  const resultat = hasInput ? await calculerPatente(Number(ca)) : null

  return (
    <>
      <PageHeader
        title={<TermeExplicable term="tps" text="Calculateur Patente / TPS" />}
        crumbs={[{ label: 'Calculateurs', href: '/calculateurs' }, { label: 'Patente / TPS' }]}
      />

      <CalculatorShell
        titre="Taxe Professionnelle Synthétique (TPS)"
        soustitre="TPS à 1,5% du CA pour CA ≤ 50M FCFA — Régime du réel au-delà"
        type="patente"
        montant={resultat?.montant ?? null}
        eventId={eventId}
        form={
          <form method="GET" action="/calculateurs/patente">
            {eventId && <input type="hidden" name="event_id" value={eventId} />}
            {get('from') && <input type="hidden" name="from" value={get('from')!} />}
            {get('type') && <input type="hidden" name="type" value={get('type')!} />}
            <div className="mb-3">
              <label className="form-label" htmlFor="ca">
                <TermeExplicable term="chiffre_affaires" text="Chiffre d'affaires" /> annuel (FCFA)
              </label>
              <input
                id="ca"
                name="ca"
                type="number"
                step="1"
                min="0"
                className="form-control"
                defaultValue={ca}
                required
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--rg-text-tertiary)', marginTop: '0.25rem' }}>
                <i className="ti ti-info-circle"></i> La{' '}
                <TermeExplicable term="tva_regime_transparent" text="TPS" /> s&apos;applique aux personnes physiques dont
                le CA ne dépasse pas 50 000 000 FCFA.
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Calculer la TPS
            </button>
          </form>
        }
        resultats={
          resultat ? (
            <div className="card" style={{ background: 'var(--rg-bg-raised)', borderColor: 'var(--rg-border)' }}>
              <div className="card-body">
                <h5 className="mb-3">Résultat</h5>
                <div className="row g-3">
                  <div className="col-6">
                    <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                      <TermeExplicable term="chiffre_affaires" text="Chiffre d'affaires" />
                    </p>
                    <p className="fw-semibold mb-0">{fmt(resultat.chiffre_affaires)} FCFA</p>
                  </div>
                  <div className="col-6">
                    <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                      Régime applicable
                    </p>
                    <p className="fw-semibold mb-0">{resultat.regime}</p>
                  </div>
                  {resultat.sous_tps ? (
                    <div className="col-12">
                      <div style={{ borderTop: '1px solid var(--rg-border)', paddingTop: '1rem' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                          <TermeExplicable term="tps" text="TPS" /> à payer (estimation)
                        </p>
                        <h3 className="rg-montant" style={{ color: 'var(--rg-accent-brique)', marginBottom: 0 }}>
                          {fmt(resultat.montant ?? 0)} FCFA
                        </h3>
                        <p
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--rg-text-tertiary)',
                            marginTop: '0.25rem',
                            marginBottom: 0,
                          }}
                        >
                          <i className="ti ti-info-circle"></i> Estimation basée sur{' '}
                          <TermeExplicable term="tps" text="1,5%" /> du CA. Le montant exact peut varier selon la
                          commune.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="col-12">
                      <div style={{ borderTop: '1px solid var(--rg-border)', paddingTop: '1rem' }}>
                        <div className="alert alert-info mb-0">
                          <i className="ti ti-info-circle"></i> Votre CA dépasse 50 000 000 FCFA, vous relevez du{' '}
                          <strong>régime du réel</strong>. Consultez les calculateurs{' '}
                          <Link href="/calculateurs/is">IS</Link> ou <Link href="/calculateurs/its">ITS</Link> selon
                          votre structure.
                        </div>
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
                Saisissez votre chiffre d&apos;affaires
                <br />
                pour estimer la TPS.
              </p>
            </div>
          )
        }
      />
    </>
  )
}
