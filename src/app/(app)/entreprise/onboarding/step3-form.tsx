'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'

import {
  postStepAction,
  type OnboardingState,
} from './actions'

import type { OnboardingData } from '@/lib/onboarding'

import {
  ErrorBox,
  FieldError,
  Hint,
} from './step-ui'

interface JobTitleOption {
  id: string
  libelle: string
}

export function Step3Form({
  initial,
  jobTitles,
}: {
  initial: OnboardingData
  jobTitles: JobTitleOption[]
}) {
  const [state, formAction] =
    useActionState<OnboardingState, FormData>(
      (_prev, fd) =>
        postStepAction(3, _prev, fd),
      {},
    )

  const errors = state.errors ?? {}

  const [sansSalaries, setSansSalaries] =
    useState(initial.sans_salaries ?? false)

  const [rows, setRows] = useState(
    initial.employees?.length
      ? initial.employees.map((employee, index) => ({
          key: index,
          poste: employee.poste,
          salaire:
            employee.salaire_brut_mensuel?.toString() ?? '',
        }))
      : [
          {
            key: 0,
            poste: '',
            salaire: '',
          },
        ],
  )

  const addRow = () =>
    setRows((current) => [
      ...current,
      {
        key: Date.now(),
        poste: '',
        salaire: '',
      },
    ])

  const removeRow = (key: number) =>
    setRows((current) =>
      current.length > 1
        ? current.filter((row) => row.key !== key)
        : current,
    )

  const updateRow = (
    key: number,
    field: 'poste' | 'salaire',
    value: string,
  ) =>
    setRows((current) =>
      current.map((row) =>
        row.key === key
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    )

  const effectif = sansSalaries
    ? 0
    : rows.filter(
        (row) =>
          row.poste.trim() !== '' ||
          row.salaire.trim() !== '',
      ).length

  return (
    <form
      action={formAction}
      noValidate
      className="fiscow-step-form"
    >
      <ErrorBox errors={state.errors} />

      {/* CHIFFRE D'AFFAIRES */}

      <div className="fiscow-field-group">
        <label
          className="fiscow-field-label"
          htmlFor="chiffre_affaires"
        >
          Chiffre d’affaires annuel estimé (FCFA)
        </label>

        <input
          id="chiffre_affaires"
          name="chiffre_affaires"
          type="number"
          step="1"
          min={0}
          defaultValue={
            initial.chiffre_affaires?.toString() ?? ''
          }
          placeholder="Ex: 50000000"
          className={`fiscow-field ${
            errors.chiffre_affaires
              ? 'is-invalid'
              : ''
          }`}
        />

        <FieldError error={errors.chiffre_affaires} />

        <Hint>
          Montant total des ventes ou prestations réalisées
          sur un exercice (HT). Ce montant détermine votre
          régime d’imposition (TPS si ≤ 50M FCFA, réel si
          &gt; 50M FCFA).
        </Hint>
      </div>

      {/* EMPLOYÉS */}

      <section className="fiscow-step3-section">
        <div className="fiscow-section-heading">
          <div>
            <h3>
              Employés
              <span className="fiscow-required"> *</span>
            </h3>

            <p>
              Indiquez si l’entreprise emploie actuellement
              des salariés.
            </p>
          </div>

          <div className="fiscow-effectif-pill">
            {effectif} salarié{effectif > 1 ? 's' : ''}
          </div>
        </div>

        {/* SANS SALARIÉ */}

        <label className="fiscow-toggle-row">
          <div className="fiscow-toggle-row-copy">
            <span className="fiscow-toggle-row-icon">
              <i className="ti ti-user" />
            </span>

            <div>
              <strong>
                Je suis seul(e), sans salarié
              </strong>

              <span>
                Activez cette option si vous n’avez aucun
                employé actuellement.
              </span>
            </div>
          </div>

          <div className="fiscow-switch">
            <input
              type="checkbox"
              id="sans_salaries"
              name="sans_salaries"
              value="1"
              checked={sansSalaries}
              onChange={(e) =>
                setSansSalaries(e.target.checked)
              }
            />

            <span className="fiscow-switch-track">
              <span className="fiscow-switch-thumb" />
            </span>
          </div>
        </label>

        {/* SALARIÉS */}

        {!sansSalaries && (
          <div className="fiscow-employees-area">

            <div className="fiscow-employees-area-head">
              <div>
                <strong>
                  Salariés de l’entreprise
                </strong>

                <span>
                  Renseignez le poste et le salaire brut
                  mensuel de chaque salarié.
                </span>
              </div>

              <button
                type="button"
                className="fiscow-add-employee-primary"
                onClick={addRow}
              >
                <i className="ti ti-plus" />
                Ajouter un employé
              </button>
            </div>

            <div className="fiscow-employee-cards">
              {rows.map((row, idx) => (
                <article
                  key={row.key}
                  className="fiscow-employee-card"
                >
                  <div className="fiscow-employee-card-head">
                    <div>
                      <span className="fiscow-employee-number">
                        {idx + 1}
                      </span>

                      <strong>
                        Salarié {idx + 1}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="fiscow-employee-close"
                      title="Supprimer ce salarié"
                      aria-label={`Supprimer le salarié ${idx + 1}`}
                      onClick={() =>
                        removeRow(row.key)
                      }
                      disabled={rows.length <= 1}
                    >
                      <i className="ti ti-x" />
                    </button>
                  </div>

                  <div className="fiscow-employee-card-fields">
                    <div className="fiscow-field-group">
                      <label className="fiscow-field-label">
                        Poste
                      </label>

                      <input
                        type="text"
                        name={`employees[${idx}][poste]`}
                        value={row.poste}
                        onChange={(e) =>
                          updateRow(
                            row.key,
                            'poste',
                            e.target.value,
                          )
                        }
                        list="postes-suggestions"
                        placeholder="Ex : Gérant"
                        className={`fiscow-field ${
                          errors[`employees.${idx}.poste`]
                            ? 'is-invalid'
                            : ''
                        }`}
                      />

                      <FieldError
                        error={
                          errors[`employees.${idx}.poste`]
                        }
                      />
                    </div>

                    <div className="fiscow-field-group">
                      <label className="fiscow-field-label">
                        Salaire brut mensuel (FCFA)
                      </label>

                      <input
                        type="number"
                        name={`employees[${idx}][salaire_brut_mensuel]`}
                        value={row.salaire}
                        onChange={(e) =>
                          updateRow(
                            row.key,
                            'salaire',
                            e.target.value,
                          )
                        }
                        placeholder="Ex : 150000"
                        min={0}
                        step="1"
                        className={`fiscow-field ${
                          errors[
                            `employees.${idx}.salaire_brut_mensuel`
                          ]
                            ? 'is-invalid'
                            : ''
                        }`}
                      />

                      <FieldError
                        error={
                          errors[
                            `employees.${idx}.salaire_brut_mensuel`
                          ]
                        }
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="fiscow-employees-footer">
              <div className="fiscow-employees-info">
                <i className="ti ti-info-circle" />

                <span>
                  L’ITS et la CNSS seront calculés à partir
                  des salaires réels renseignés ici.
                </span>
              </div>

               <button
                type="button"
                className="fiscow-add-employee-primary"
                onClick={addRow}
              >
                <i className="ti ti-plus" />
                Ajouter un employé
              </button>
            </div>
          </div>
        )}
      </section>

      <datalist id="postes-suggestions">
        {jobTitles.map((job) => (
          <option
            key={job.id}
            value={job.libelle}
          />
        ))}
      </datalist>

      {/* BIENS IMMOBILIERS */}

      <section className="fiscow-step3-section">
        <div className="fiscow-property-row">
          <div className="fiscow-property-copy">
            <span className="fiscow-property-icon">
              <i className="ti ti-building-estate" />
            </span>

            <div>
              <strong>
                L’entreprise possède-t-elle des biens
                immobiliers ?
                <span className="fiscow-required"> *</span>
              </strong>

              <span>
                Cette information permet d’identifier
                l’éventuelle Taxe Foncière Unique.
              </span>
            </div>
          </div>

          <div className="fiscow-property-options">
            <label className="fiscow-property-option">
              <input
                type="radio"
                name="has_property"
                value="1"
                defaultChecked={
                  initial.has_property === true
                }
              />

              <span>Oui</span>
            </label>

            <label className="fiscow-property-option">
              <input
                type="radio"
                name="has_property"
                value="0"
                defaultChecked={
                  initial.has_property === false ||
                  initial.has_property === undefined
                }
              />

              <span>Non</span>
            </label>
          </div>
        </div>

        <FieldError error={errors.has_property} />

        <Hint>
          Si oui, la Taxe Foncière Unique (TFU) vous
          concernera. Si non, elle ne sera pas affichée dans
          votre tableau de bord.
        </Hint>
      </section>

      {/* ACTIONS */}

      <div className="fiscow-form-actions">
        <Link
          href="/entreprise/onboarding/2"
          className="fiscow-btn fiscow-btn-secondary"
        >
          <i className="ti ti-arrow-left" />
          Retour
        </Link>

        <button
          type="submit"
          className="fiscow-btn fiscow-btn-primary"
        >
          Suivant
          <i className="ti ti-arrow-right" />
        </button>
      </div>
    </form>
  )
}