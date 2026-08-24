import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getRate } from '@/lib/fiscalite'
import { PageHeader } from '@/components/app/page-header'
import { CalculatorShell } from '@/components/app/calculator-shell'
import { TermeExplicable } from '@/components/app/terme-explicable'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function fmt(n: number): string {
  return n.toLocaleString('fr-FR')
}

export default async function CalculateurTvaPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const sp = await searchParams
  const get = (k: string) => {
    const v = sp[k]
    return Array.isArray(v) ? v[0] : v
  }
  const eventId = get('event_id')
  const montantHt = get('montant_ht')

  const taux = ((await getRate('tva', 'taux', 18)) as number) / 100
  const hasInput = montantHt !== undefined && montantHt !== ''
  const resultat = hasInput
    ? (() => {
        const ht = Number(montantHt)
        const tva = ht * taux
        return { montant_ht: ht, tva: Math.round(tva), montant_ttc: Math.round(ht + tva), taux_tva: taux * 100 }
      })()
    : null

  return (
    <>
      <PageHeader
        title={<TermeExplicable term="tva" text="Calculateur TVA" />}
        crumbs={[{ label: 'Calculateurs', href: '/calculateurs' }, { label: 'TVA' }]}
      />

      <CalculatorShell
        titre="Taxe sur la Valeur Ajoutée (TVA)"
        soustitre="Taux : 18% — Calcul à partir du montant TTC ou HT"
        type="tva"
        montant={resultat?.tva ?? null}
        eventId={eventId}
        form={
          <form method="GET" action="/calculateurs/tva">
            {eventId && <input type="hidden" name="event_id" value={eventId} />}
            {get('from') && <input type="hidden" name="from" value={get('from')!} />}
            {get('type') && <input type="hidden" name="type" value={get('type')!} />}
            <div className="mb-3">
              <label className="form-label" htmlFor="montant_ht">
                Montant <TermeExplicable term="assiette" text="HT" /> (FCFA)
              </label>
              <input
                id="montant_ht"
                name="montant_ht"
                type="number"
                step="1"
                min="0"
                className="form-control"
                defaultValue={montantHt}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Calculer la TVA
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
                      Montant HT
                    </p>
                    <p className="fw-semibold rg-montant mb-0">{fmt(resultat.montant_ht)} FCFA</p>
                  </div>
                  <div className="col-6">
                    <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                      <TermeExplicable term="tva" text="TVA" /> ({resultat.taux_tva}%)
                    </p>
                    <p className="fw-semibold rg-montant mb-0">{fmt(resultat.tva)} FCFA</p>
                  </div>
                  <div className="col-12">
                    <div style={{ borderTop: '1px solid var(--rg-border)', paddingTop: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--rg-text-secondary)', marginBottom: 0 }}>
                        Montant TTC
                      </p>
                      <h3 className="rg-montant" style={{ color: 'var(--rg-accent-brique)', marginBottom: 0 }}>
                        {fmt(resultat.montant_ttc)} FCFA
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
                Saisissez le montant HT
                <br />
                pour calculer la TVA.
              </p>
            </div>
          )
        }
      />
    </>
  )
}
