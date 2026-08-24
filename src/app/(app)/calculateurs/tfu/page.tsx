import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { calculerTfu } from '@/lib/fiscalite'
import { PageHeader } from '@/components/app/page-header'
import { CalculatorShell } from '@/components/app/calculator-shell'
import { TermeExplicable } from '@/components/app/terme-explicable'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function fmt(n: number): string {
  return n.toLocaleString('fr-FR')
}

export default async function CalculateurTfuPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const sp = await searchParams
  const get = (k: string) => {
    const v = sp[k]
    return Array.isArray(v) ? v[0] : v
  }
  const eventId = get('event_id')
  const valeurLocative = get('valeur_locative')
  const typeBien = get('type_bien') ?? 'bati'

  const hasInput = valeurLocative !== undefined && valeurLocative !== ''
  const resultat = hasInput ? await calculerTfu(Number(valeurLocative), typeBien) : null

  return (
    <>
      <PageHeader
        title={<TermeExplicable term="tfu" text="Calculateur TFU" />}
        crumbs={[{ label: 'Calculateurs', href: '/calculateurs' }, { label: 'TFU' }]}
      />

      <CalculatorShell
        titre="Taxe Foncière Unique (TFU)"
        soustitre="Taux : 6% (bâti) / 5% (non bâti) de la valeur locative (Art. 160 CGI)"
        type="tfu"
        montant={resultat?.tfu_annuelle ?? null}
        eventId={eventId}
        form={
          <form method="GET" action="/calculateurs/tfu">
            {eventId && <input type="hidden" name="event_id" value={eventId} />}
            {get('from') && <input type="hidden" name="from" value={get('from')!} />}
            {get('type') && <input type="hidden" name="type" value={get('type')!} />}
            <div className="mb-3">
              <label className="form-label" htmlFor="type_bien">
                Type de bien
              </label>
              <select id="type_bien" name="type_bien" className="form-control" defaultValue={typeBien}>
                <option value="bati">Propriété bâtie (maison, immeuble, local commercial)</option>
                <option value="non_bati">Propriété non bâtie (terrain)</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="valeur_locative">
                Valeur locative cadastrale annuelle (FCFA)
              </label>
              <input
                id="valeur_locative"
                name="valeur_locative"
                type="number"
                step="1"
                min="0"
                className="form-control"
                defaultValue={valeurLocative}
                required
                placeholder="Ex: 1200000"
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--rg-text-tertiary)', marginTop: '0.25rem' }}>
                <i className="ti ti-info-circle"></i> La valeur locative correspond au loyer annuel théorique. Vous la
                trouverez sur votre avis de <TermeExplicable term="tfu" />.
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Calculer la TFU
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
                      Type de bien
                    </p>
                    <p className="fw-semibold mb-0">{resultat.type_bien === 'bati' ? 'Bâti' : 'Non bâti'}</p>
                  </div>
                  <div className="col-6">
                    <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                      Taux applicable
                    </p>
                    <p className="fw-semibold mb-0">{resultat.taux}%</p>
                  </div>
                  <div className="col-6">
                    <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                      Valeur locative
                    </p>
                    <p className="fw-semibold mb-0">{fmt(resultat.valeur_locative)} FCFA</p>
                  </div>
                  <div className="col-12">
                    <div style={{ borderTop: '1px solid var(--rg-border)', paddingTop: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                        <TermeExplicable term="tfu" text="TFU" /> annuelle estimée
                      </p>
                      <h3 className="rg-montant" style={{ color: 'var(--rg-accent-brique)', marginBottom: 0 }}>
                        {fmt(resultat.tfu_annuelle)} FCFA
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
                Saisissez la valeur locative
                <br />
                pour calculer la TFU.
              </p>
            </div>
          )
        }
      />
    </>
  )
}
