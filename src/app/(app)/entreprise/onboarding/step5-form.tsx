'use client'

import Link from 'next/link'
import {
  useActionState,
} from 'react'

import {
  postStepAction,
  type OnboardingState,
} from './actions'

import type {
  OnboardingData,
} from '@/lib/onboarding'

export function Step5Form({
  initial,
}: {
  initial: OnboardingData
}) {
  const [state, formAction] =
    useActionState<
      OnboardingState,
      FormData
    >(
      (_prev, fd) =>
        postStepAction(
          5,
          _prev,
          fd,
        ),
      {},
    )

  const today =
    new Date()

  const defaultMonth =
    `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}`

  const defaultPayroll =
    initial.employees?.reduce(
      (sum, employee) =>
        sum +
        Number(
          employee.salaire_brut_mensuel ??
            0,
        ),
      0,
    ) ?? 0

  return (
    <form
      action={formAction}
      className="fiscow-step-form"
    >

      {/* INTRO */}

      <div className="fiscow-step4-alert">

        <span className="fiscow-step4-alert-icon">
          <i className="ti ti-chart-bar" />
        </span>

        <div>

          <strong>
            Dernière étape
          </strong>

          <p>
            Renseignez vos chiffres du mois.
            Ils permettront à Fiscow
            d’alimenter vos premières
            déclarations et votre tableau
            de bord.
          </p>

        </div>

      </div>

      {/* ERREUR */}

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

      {/* PÉRIODE */}

      <div className="fiscow-field-group">

        <label
          htmlFor="periode"
          className="fiscow-field-label"
        >
          Mois concerné
          <span className="fiscow-required">
            {' '}*
          </span>
        </label>

        <input
          id="periode"
          name="periode"
          type="month"
          required
          defaultValue={
            defaultMonth
          }
          className="fiscow-field"
        />

      </div>

      {/* VENTES / ACHATS */}

      <div className="fiscow-form-grid">

        <div className="fiscow-field-group">

          <label
            htmlFor="ventes_ht"
            className="fiscow-field-label"
          >
            Ventes HT
          </label>

          <input
            id="ventes_ht"
            name="ventes_ht"
            type="number"
            min="0"
            step="1"
            defaultValue=""
            placeholder="Ex : 5000000"
            className="fiscow-field"
          />

          <small className="fiscow-field-hint">
            Total des ventes hors taxes
            du mois.
          </small>

        </div>

        <div className="fiscow-field-group">

          <label
            htmlFor="achats_ht"
            className="fiscow-field-label"
          >
            Achats HT
          </label>

          <input
            id="achats_ht"
            name="achats_ht"
            type="number"
            min="0"
            step="1"
            defaultValue=""
            placeholder="Ex : 1500000"
            className="fiscow-field"
          />

          <small className="fiscow-field-hint">
            Total des achats hors taxes
            du mois.
          </small>

        </div>

      </div>

      {/* SALAIRES / CHARGES */}

      <div className="fiscow-form-grid">

        <div className="fiscow-field-group">

          <label
            htmlFor="masse_salariale"
            className="fiscow-field-label"
          >
            Masse salariale brute
          </label>

          <input
            id="masse_salariale"
            name="masse_salariale"
            type="number"
            min="0"
            step="1"
            defaultValue={
              defaultPayroll > 0
                ? defaultPayroll
                : ''
            }
            placeholder="Ex : 450000"
            className="fiscow-field"
          />

          <small className="fiscow-field-hint">
            Somme des salaires bruts
            versés pour le mois.
          </small>

        </div>

        <div className="fiscow-field-group">

          <label
            htmlFor="charges_deductibles"
            className="fiscow-field-label"
          >
            Charges déductibles
          </label>

          <input
            id="charges_deductibles"
            name="charges_deductibles"
            type="number"
            min="0"
            step="1"
            defaultValue=""
            placeholder="Ex : 700000"
            className="fiscow-field"
          />

          <small className="fiscow-field-hint">
            Charges professionnelles
            déductibles du mois.
          </small>

        </div>

      </div>

      {/* TVA */}

      <div className="fiscow-form-grid">

        <div className="fiscow-field-group">

          <label
            htmlFor="tva_collectee"
            className="fiscow-field-label"
          >
            TVA collectée
          </label>

          <input
            id="tva_collectee"
            name="tva_collectee"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            className="fiscow-field"
          />

          <small className="fiscow-field-hint">
            TVA facturée aux clients.
          </small>

        </div>

        <div className="fiscow-field-group">

          <label
            htmlFor="tva_deductible"
            className="fiscow-field-label"
          >
            TVA déductible
          </label>

          <input
            id="tva_deductible"
            name="tva_deductible"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            className="fiscow-field"
          />

          <small className="fiscow-field-hint">
            TVA récupérable sur les
            achats admissibles.
          </small>

        </div>

      </div>

      {/* ACTIONS */}

      <div className="fiscow-form-actions">

        <Link
          href="/entreprise/onboarding/4"
          className="fiscow-btn fiscow-btn-secondary"
        >
          <i className="ti ti-arrow-left" />
          Retour
        </Link>

        <button
          type="submit"
          className="fiscow-btn fiscow-btn-primary"
        >
          <i className="ti ti-check" />
          Enregistrer et accéder au dashboard
        </button>

      </div>

    </form>
  )
}