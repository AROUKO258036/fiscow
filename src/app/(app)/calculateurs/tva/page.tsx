import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { getRate } from '@/lib/fiscalite'

import { PageHeader } from '@/components/app/page-header'
import { CalculatorShell } from '@/components/app/calculator-shell'
import { TermeExplicable } from '@/components/app/terme-explicable'

interface Props {
  searchParams: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >
}

function fmt(value: number): string {
  return value.toLocaleString('fr-FR')
}

export default async function CalculateurTvaPage({
  searchParams,
}: Props) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const sp = await searchParams

  const get = (key: string) => {
    const value = sp[key]

    return Array.isArray(value)
      ? value[0]
      : value
  }

  const eventId =
    get('event_id')

  const montantHt =
    get('montant_ht')

  const taux =
    (
      (await getRate(
        'tva',
        'taux',
        18,
      )) as number
    ) / 100

  const hasInput =
    montantHt !== undefined &&
    montantHt !== ''

  const resultat =
    hasInput
      ? (() => {
          const ht =
            Number(montantHt)

          const tva =
            ht * taux

          return {
            montant_ht:
              ht,

            tva:
              Math.round(tva),

            montant_ttc:
              Math.round(
                ht + tva,
              ),

            taux_tva:
              taux * 100,
          }
        })()
      : null

  return (
    <>
      <PageHeader
        title={
          <TermeExplicable
            term="tva"
            text="Calculateur TVA"
          />
        }
        crumbs={[
          {
            label:
              'Calculateurs',
            href:
              '/calculateurs',
          },
          {
            label:
              'TVA',
          },
        ]}
      />

      <CalculatorShell
        titre="Taxe sur la Valeur Ajoutée (TVA)"
        soustitre={`Taux actuel : ${
          taux * 100
        } % — estimation à partir du montant hors taxes`}
        type="tva"
        montant={
          resultat?.tva ??
          null
        }
        eventId={
          eventId
        }

        form={
          <form
            method="GET"
            action="/calculateurs/tva"
            style={{
              display: 'grid',
              gap: '18px',
            }}
          >
            {eventId && (
              <input
                type="hidden"
                name="event_id"
                value={eventId}
              />
            )}

            {get('from') && (
              <input
                type="hidden"
                name="from"
                value={
                  get('from')!
                }
              />
            )}

            {get('type') && (
              <input
                type="hidden"
                name="type"
                value={
                  get('type')!
                }
              />
            )}

            <div>
              <label
                htmlFor="montant_ht"
                style={{
                  display:
                    'block',
                  marginBottom:
                    '7px',
                  fontSize:
                    '11px',
                  fontWeight:
                    700,
                }}
              >
                Montant{' '}
                <TermeExplicable
                  term="assiette"
                  text="HT"
                />{' '}
                (FCFA)
              </label>

              <input
                id="montant_ht"
                name="montant_ht"
                type="number"
                step="1"
                min="0"
                defaultValue={
                  montantHt
                }
                required
                style={{
                  width: '100%',
                  height:
                    '46px',
                  padding:
                    '0 13px',
                  border:
                    '1px solid var(--rg-border, #e4ddd6)',
                  borderRadius:
                    '11px',
                  background:
                    'var(--rg-bg-raised, #fff)',
                  color:
                    'var(--rg-text-primary, #171717)',
                  outline:
                    'none',
                }}
              />
            </div>

            <div
              style={{
                padding:
                  '13px 14px',
                border:
                  '1px solid var(--rg-border, #ede7e1)',
                borderRadius:
                  '11px',
                background:
                  'var(--rg-bg-soft, #fffaf6)',
              }}
            >
              <div
                style={{
                  display:
                    'flex',
                  alignItems:
                    'center',
                  gap:
                    '8px',
                  marginBottom:
                    '4px',
                  fontSize:
                    '11px',
                  fontWeight:
                    700,
                }}
              >
                <i
                  className="ti ti-info-circle"
                  style={{
                    color:
                      '#ff8a1f',
                  }}
                />

                Taux TVA utilisé
              </div>

              <strong
                style={{
                  fontSize:
                    '16px',
                  color:
                    '#ff8a1f',
                }}
              >
                {taux * 100} %
              </strong>
            </div>

            <button
              type="submit"
              style={{
                minHeight:
                  '45px',
                display:
                  'inline-flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
                gap:
                  '8px',
                padding:
                  '0 16px',
                border:
                  '1px solid #ff8a1f',
                borderRadius:
                  '11px',
                background:
                  '#ff8a1f',
                color:
                  '#fff',
                fontSize:
                  '12px',
                fontWeight:
                  800,
                cursor:
                  'pointer',
              }}
            >
              <i className="ti ti-calculator" />

              Calculer la TVA
            </button>
          </form>
        }

        resultats={
          resultat ? (
            <div
              style={{
                display:
                  'grid',
                gap:
                  '14px',
              }}
            >
              <div
                style={{
                  padding:
                    '17px',
                  border:
                    '1px solid var(--rg-border, #ede7e1)',
                  borderRadius:
                    '14px',
                  background:
                    'var(--rg-bg-raised, #fff)',
                }}
              >
                <div
                  style={{
                    display:
                      'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'space-between',
                    gap:
                      '12px',
                    marginBottom:
                      '17px',
                  }}
                >
                  <div>
                    <span
                      style={{
                        display:
                          'block',
                        marginBottom:
                          '3px',
                        color:
                          'var(--rg-text-secondary, #8b837c)',
                        fontSize:
                          '10px',
                      }}
                    >
                      Résultat
                    </span>

                    <strong
                      style={{
                        fontSize:
                          '14px',
                      }}
                    >
                      Estimation TVA
                    </strong>
                  </div>

                  <span
                    style={{
                      width:
                        '38px',
                      height:
                        '38px',
                      display:
                        'inline-flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      borderRadius:
                        '11px',
                      background:
                        '#e8f5ff',
                      color:
                        '#1675aa',
                    }}
                  >
                    <i className="ti ti-arrows-exchange" />
                  </span>
                </div>

                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      'repeat(2, minmax(0, 1fr))',
                    gap:
                      '10px',
                  }}
                >
                  <ResultCard
                    label="Montant HT"
                    value={`${fmt(
                      resultat.montant_ht,
                    )} FCFA`}
                  />

                  <ResultCard
                    label={`TVA (${resultat.taux_tva} %)`}
                    value={`${fmt(
                      resultat.tva,
                    )} FCFA`}
                    accent
                  />
                </div>

                <div
                  style={{
                    marginTop:
                      '12px',
                    paddingTop:
                      '15px',
                    borderTop:
                      '1px solid var(--rg-border, #ede7e1)',
                  }}
                >
                  <span
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '5px',
                      color:
                        'var(--rg-text-secondary, #8b837c)',
                      fontSize:
                        '10px',
                    }}
                  >
                    Montant TTC
                  </span>

                  <strong
                    style={{
                      color:
                        '#ff8a1f',
                      fontSize:
                        '24px',
                      fontWeight:
                        850,
                    }}
                  >
                    {fmt(
                      resultat.montant_ttc,
                    )}{' '}
                    FCFA
                  </strong>
                </div>
              </div>

              <div
                style={{
                  display:
                    'flex',
                  alignItems:
                    'flex-start',
                  gap:
                    '9px',
                  padding:
                    '12px 13px',
                  border:
                    '1px solid #f0ddca',
                  borderRadius:
                    '11px',
                  background:
                    'var(--rg-bg-soft, #fffaf5)',
                  fontSize:
                    '10px',
                  lineHeight:
                    1.55,
                }}
              >
                <i
                  className="ti ti-bulb"
                  style={{
                    marginTop:
                      '2px',
                    color:
                      '#ff8a1f',
                  }}
                />

                <span>
                  Cette estimation
                  peut être utilisée
                  pour créer votre
                  déclaration TVA.
                </span>
              </div>
            </div>
          ) : (
            <div
              style={{
                minHeight:
                  '270px',
                display:
                  'flex',
                flexDirection:
                  'column',
                alignItems:
                  'center',
                justifyContent:
                  'center',
                padding:
                  '30px',
                border:
                  '1px dashed var(--rg-border, #ddd5ce)',
                borderRadius:
                  '14px',
                background:
                  'var(--rg-bg-raised, #fffdfc)',
                textAlign:
                  'center',
              }}
            >
              <span
                style={{
                  width:
                    '50px',
                  height:
                    '50px',
                  display:
                    'inline-flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                  marginBottom:
                    '12px',
                  borderRadius:
                    '14px',
                  background:
                    '#fff3e6',
                  color:
                    '#ff8a1f',
                  fontSize:
                    '23px',
                }}
              >
                <i className="ti ti-calculator" />
              </span>

              <strong
                style={{
                  marginBottom:
                    '5px',
                  fontSize:
                    '13px',
                }}
              >
                Prêt à calculer
              </strong>

              <p
                style={{
                  maxWidth:
                    '280px',
                  margin:
                    0,
                  color:
                    'var(--rg-text-secondary, #8b837c)',
                  fontSize:
                    '10.5px',
                  lineHeight:
                    1.6,
                }}
              >
                Saisissez le
                montant hors taxes
                pour obtenir
                automatiquement la
                TVA et le montant
                TTC.
              </p>
            </div>
          )
        }
      />
    </>
  )
}

function ResultCard({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div
      style={{
        padding:
          '13px',
        border:
          '1px solid var(--rg-border, #ede7e1)',
        borderRadius:
          '11px',
        background:
          'var(--rg-bg-soft, #fcfaf8)',
      }}
    >
      <span
        style={{
          display:
            'block',
          marginBottom:
            '5px',
          color:
            'var(--rg-text-secondary, #8b837c)',
          fontSize:
            '9.5px',
        }}
      >
        {label}
      </span>

      <strong
        style={{
          color:
            accent
              ? '#ff8a1f'
              : 'var(--rg-text-primary, #171717)',
          fontSize:
            '14px',
          fontWeight:
            800,
        }}
      >
        {value}
      </strong>
    </div>
  )
}