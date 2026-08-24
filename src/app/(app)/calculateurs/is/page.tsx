import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { calculerIs } from '@/lib/fiscalite'
import { PageHeader } from '@/components/app/page-header'
import { CalculatorShell } from '@/components/app/calculator-shell'
import { TermeExplicable } from '@/components/app/terme-explicable'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function fmt(n: number): string {
  return n.toLocaleString('fr-FR')
}

export default async function CalculateurIsPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const sp = await searchParams
  const get = (k: string) => {
    const v = sp[k]
    return Array.isArray(v) ? v[0] : v
  }
  const eventId = get('event_id')
  const ca = get('ca')
  const charges = get('charges')
  const secteur = get('secteur') ?? 'commercial'

  const hasInput = ca !== undefined && charges !== undefined
  const resultat =
    hasInput && ca !== '' && charges !== ''
      ? await calculerIs(Number(ca), Number(charges), secteur)
      : null

  const selected = (v: string) => (secteur === v ? 'selected' : '')

  return (
    <>
      <PageHeader
        title={<TermeExplicable term="is" text="Calculateur IS" />}
        crumbs={[{ label: 'Calculateurs', href: '/calculateurs' }, { label: 'IS' }]}
      />

      <CalculatorShell
        titre="Impôt sur les Sociétés (IS)"
        soustitre="Taux : 25% (industriel) / 30% (commercial & services) — Impôt minimum : 1,5% du CA (min. 250 000 FCFA)"
        type="is"
        montant={resultat?.is_du ?? null}
        eventId={eventId}
        form={
          <form method="GET" action="/calculateurs/is">
            {eventId && <input type="hidden" name="event_id" value={eventId} />}
            {get('from') && <input type="hidden" name="from" value={get('from')!} />}
            {get('type') && <input type="hidden" name="type" value={get('type')!} />}
            <div className="mb-3">
              <label className="form-label" htmlFor="secteur">
                Secteur d&apos;activité
              </label>
              <select id="secteur" name="secteur" className="form-control" defaultValue={secteur}>
                <option value="commercial">Commercial, services & autres</option>
                <option value="industriel">Industriel (hors extractives)</option>
              </select>
              <div style={{ fontSize: '0.75rem', color: 'var(--rg-text-tertiary)', marginTop: '0.25rem' }}>
                <i className="ti ti-info-circle"></i>{' '}
                <TermeExplicable term="is_taux" text="Art. 46 CGI" /> : 25% pour l&apos;industrie, 30% pour les autres
                secteurs
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="ca">
                <TermeExplicable term="chiffre_affaires" /> (FCFA)
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
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="charges">
                Charges déductibles (FCFA)
              </label>
              <input
                id="charges"
                name="charges"
                type="number"
                step="1"
                min="0"
                className="form-control"
                defaultValue={charges}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Calculer l&apos;IS
            </button>
          </form>
        }
        resultats={
          resultat ? (
            <div className="card" style={{ background: 'var(--rg-bg-raised)', borderColor: 'var(--rg-border)' }}>
              <div className="card-body">
                <h5 className="mb-3">
                  Résultat du calcul{' '}
                  <span style={{ fontSize: '0.75rem', color: 'var(--rg-text-tertiary)' }}>
                    ({resultat.secteur === 'industriel' ? 'Taux 25%' : 'Taux 30%'})
                  </span>
                </h5>
                <div className="row g-3">
                  <div className="col-6">
                    <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                      <TermeExplicable term="chiffre_affaires" />
                    </p>
                    <p className="fw-semibold rg-montant mb-0">{fmt(resultat.chiffre_affaires)} FCFA</p>
                  </div>
                  <div className="col-6">
                    <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                      Charges
                    </p>
                    <p className="fw-semibold rg-montant mb-0">{fmt(resultat.charges)} FCFA</p>
                  </div>
                  <div className="col-6">
                    <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                      <TermeExplicable term="benefice" text="Bénéfice imposable" />
                    </p>
                    <p className="fw-semibold mb-0">{fmt(resultat.benefice_imposable)} FCFA</p>
                  </div>
                  <div className="col-6">
                    <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                      <TermeExplicable term="is" /> calculé ({resultat.taux_is}%)
                    </p>
                    <p className="fw-semibold mb-0">{fmt(resultat.is_calcule)} FCFA</p>
                  </div>
                  <div className="col-6">
                    <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                      <TermeExplicable term="is_minimum_perception" text="Impôt minimum" /> (
                      {resultat.taux_impot_minimum}%)
                    </p>
                    <p className="fw-semibold mb-0">{fmt(resultat.impot_minimum)} FCFA</p>
                  </div>
                  <div className="col-12">
                    <div style={{ borderTop: '1px solid var(--rg-border)', paddingTop: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                        <TermeExplicable term="is" /> à payer (le plus élevé)
                      </p>
                      <h3 className="rg-montant" style={{ color: 'var(--rg-accent-brique)', marginBottom: 0 }}>
                        {fmt(resultat.is_du)} FCFA
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
                Saisissez les chiffres d&apos;affaires et les charges
                <br />
                pour calculer l&apos;IS dû.
              </p>
            </div>
          )
        }
      />
    </>
  )
}
