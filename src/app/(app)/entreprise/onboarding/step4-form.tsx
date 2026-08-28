'use client'

import { useActionState } from 'react'
import Link from 'next/link'

import {
  postStepAction,
  type OnboardingState,
} from './actions'

import type {
  OnboardingData,
} from '@/lib/onboarding'

export function Step4Form({
  data,
  typeEntiteLabel,
  chiffreAffairesLabel,
}: {
  data: OnboardingData
  typeEntiteLabel: string
  chiffreAffairesLabel: string
}) {
  const [state, formAction] =
    useActionState<
      OnboardingState,
      FormData
    >(
      (_prev, fd) =>
        postStepAction(
          4,
          _prev,
          fd,
        ),
      {},
    )

  const fmt =
    new Intl.NumberFormat(
      'fr-FR',
    )

  const effectif =
    data.sans_salaries
      ? 0
      : data.employees?.length ??
        data.effectif ??
        0

  return (
    <div className="fiscow-step4">

      {/* INFORMATION */}

      <div className="fiscow-step4-alert">

        <span className="fiscow-step4-alert-icon">
          <i className="ti ti-info-circle" />
        </span>

        <div>
          <strong>
            Vérifiez vos informations
          </strong>

          <p>
            Vérifiez les informations
            ci-dessous avant de continuer
            vers vos données financières.
          </p>
        </div>

      </div>

      {/* IDENTITÉ */}

      <section className="fiscow-review-section">

        <div className="fiscow-review-section-head">

          <div className="fiscow-review-section-icon">
            <i className="ti ti-building" />
          </div>

          <div>
            <h3>
              Identité de l’entreprise
            </h3>

            <p>
              Informations générales
              renseignées à l’étape 1.
            </p>
          </div>

        </div>

        <div className="fiscow-review-grid">

          <ReviewItem
            label="Raison sociale"
            value={
              data.raison_sociale ||
              '-'
            }
          />

          <ReviewItem
            label="NIF"
            value={
              data.nif ||
              '-'
            }
          />

          <ReviewItem
            label="RCCM"
            value={
              data.rccm ||
              'Non renseigné'
            }
          />

          <ReviewItem
            label="Secteur"
            value={
              data.secteur ||
              '-'
            }
          />

          <ReviewItem
            label="Date de création"
            value={
              data.date_creation ||
              'Non renseignée'
            }
          />

        </div>

      </section>

      {/* RÉGIME */}

      <section className="fiscow-review-section">

        <div className="fiscow-review-section-head">

          <div className="fiscow-review-section-icon">
            <i className="ti ti-receipt-tax" />
          </div>

          <div>
            <h3>
              Régime fiscal
            </h3>

            <p>
              Informations fiscales
              et type d’entité.
            </p>
          </div>

        </div>

        <div className="fiscow-review-grid">

          <ReviewItem
            label="Régime TVA"
            value={
              data.regime_tva ||
              '-'
            }
          />

          <ReviewItem
            label="Type d’entité"
            value={
              typeEntiteLabel ||
              '-'
            }
          />

          <ReviewItem
            label="CA annuel"
            value={
              chiffreAffairesLabel
            }
          />

        </div>

      </section>

      {/* EMPLOYÉS */}

      <section className="fiscow-review-section">

        <div
          className="
            fiscow-review-section-head
            fiscow-review-section-head-between
          "
        >

          <div className="fiscow-review-head-main">

            <div className="fiscow-review-section-icon">
              <i className="ti ti-users" />
            </div>

            <div>
              <h3>Employés</h3>

              <p>
                Effectif et salaires
                renseignés.
              </p>
            </div>

          </div>

          <span className="fiscow-review-count">
            {effectif}{' '}
            {effectif === 1
              ? 'salarié'
              : 'salariés'}
          </span>

        </div>

        {data.sans_salaries ||
        !data.employees?.length ? (

          <div className="fiscow-review-empty">

            <i className="ti ti-user-off" />

            <span>
              Aucun salarié renseigné
            </span>

          </div>

        ) : (

          <div className="fiscow-review-employees">

            {data.employees.map(
              (employee, index) => (

                <div
                  key={index}
                  className="fiscow-review-employee-card"
                >

                  <div className="fiscow-review-employee-head">

                    <span>
                      {index + 1}
                    </span>

                    <strong>
                      Salarié {index + 1}
                    </strong>

                  </div>

                  <div className="fiscow-review-employee-grid">

                    <ReviewItem
                      label="Poste"
                      value={
                        employee.poste ||
                        '-'
                      }
                    />

                    <ReviewItem
                      label="Salaire brut mensuel"
                      value={`${fmt.format(
                        employee.salaire_brut_mensuel ??
                          0,
                      )} FCFA`}
                    />

                  </div>

                </div>

              ),
            )}

          </div>

        )}

      </section>

      {/* IMMOBILIER */}

      <section className="fiscow-review-section">

        <div className="fiscow-review-property">

          <div className="fiscow-review-head-main">

            <div className="fiscow-review-section-icon">
              <i className="ti ti-building-estate" />
            </div>

            <div>
              <h3>
                Biens immobiliers
              </h3>

              <p>
                L’entreprise possède-t-elle
                des biens immobiliers ?
              </p>
            </div>

          </div>

          <span
            className={`fiscow-review-status ${
              data.has_property
                ? 'is-yes'
                : 'is-no'
            }`}
          >
            {data.has_property
              ? 'Oui'
              : 'Non'}
          </span>

        </div>

      </section>

      {/* ACTION */}

      <form
        action={formAction}
        className="fiscow-step4-actions-form"
      >

        {state.error && (

          <div
            className="fiscow-error-box"
            role="alert"
          >

            <i className="ti ti-alert-circle" />

            <span>
              {state.error}
            </span>

          </div>

        )}

        <div className="fiscow-form-actions">

          <Link
            href="/entreprise/onboarding/3"
            className="fiscow-btn fiscow-btn-secondary"
          >
            <i className="ti ti-arrow-left" />
            Retour
          </Link>

          <button
            type="submit"
            className="fiscow-btn fiscow-btn-primary fiscow-btn-confirm"
          >
            Continuer
            <i className="ti ti-arrow-right" />
          </button>

        </div>

      </form>

    </div>
  )
}

function ReviewItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="fiscow-review-item">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  )
}