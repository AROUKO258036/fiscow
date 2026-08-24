'use client'

import { useActionState } from 'react'
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

import { TermeExplicable } from '@/components/app/terme-explicable'

export function Step2Form({
  initial,
}: {
  initial: OnboardingData
}) {
  const [state, formAction] =
    useActionState<OnboardingState, FormData>(
      (_prev, fd) =>
        postStepAction(2, _prev, fd),
      {},
    )

  const errors = state.errors ?? {}

  return (
    <form
      action={formAction}
      noValidate
      className="fiscow-step-form"
    >
      <ErrorBox errors={state.errors} />

      {/* =====================================================
          RÉGIME TVA
          ===================================================== */}

      <div className="fiscow-field-group">
        <label
          className="fiscow-field-label"
          htmlFor="regime_tva"
        >
          Régime TVA{' '}
          <span className="fiscow-required">*</span>
        </label>

        <select
          id="regime_tva"
          name="regime_tva"
          required
          defaultValue={initial.regime_tva ?? ''}
          className={`fiscow-field fiscow-select ${
            errors.regime_tva ? 'is-invalid' : ''
          }`}
        >
          <option value="simplifié">
            Simplifié
          </option>

          <option value="réel">
            Réel normal
          </option>

          <option value="transparent">
            Transparent (TPS)
          </option>
        </select>

        <FieldError error={errors.regime_tva} />

        <div className="fiscow-step2-help">
          <Hint>
            <span>
              <strong>Simplifié</strong> : une{' '}
              <TermeExplicable
                term="declaration"
                text="déclaration"
              />{' '}
              annuelle + 2 acomptes (CA &lt; 50M FCFA)
              <br />

              <strong>Réel normal</strong> : déclaration mensuelle
              (CA &gt; 50M FCFA)
              <br />

              <strong>
                Transparent (
                <TermeExplicable
                  term="tva_regime_transparent"
                  text="TPS"
                />
                )
              </strong>{' '}
              : régime simplifié pour les très petites entreprises
            </span>
          </Hint>
        </div>
      </div>

      {/* =====================================================
          TYPE D’ENTITÉ
          ===================================================== */}

      <div className="fiscow-field-group fiscow-step2-section">
        <label
          className="fiscow-field-label"
          htmlFor="type_entite"
        >
          Type d’entité{' '}
          <span className="fiscow-required">*</span>
        </label>

        <select
          id="type_entite"
          name="type_entite"
          required
          defaultValue={initial.type_entite ?? ''}
          className={`fiscow-field fiscow-select ${
            errors.type_entite ? 'is-invalid' : ''
          }`}
        >
          <option value="societe">
            Société (SARL, SA, SAS, etc.) — soumise à l’IS
          </option>

          <option value="individuelle">
            Entreprise individuelle — soumise à l’IBA
          </option>
        </select>

        <FieldError error={errors.type_entite} />

        <div className="fiscow-step2-help">
          <Hint>
            <span>
              <strong>
                <TermeExplicable
                  term="is"
                  text="IS"
                />{' '}
                (Impôt sur les Sociétés)
              </strong>{' '}
              : taux de 25% (industriel) ou 30%
              (commercial/services) sur le{' '}
              <TermeExplicable
                term="benefice"
                text="bénéfice"
              />{' '}
              (Art. 46 CGI)
              <br />

              <strong>
                <TermeExplicable
                  term="iba"
                  text="IBA"
                />{' '}
                (Impôt sur les Bénéfices d’Affaires)
              </strong>{' '}
              : taux progressif pour les entrepreneurs individuels,
              minimum 1,5% du CA (Art. 64 CGI)
            </span>
          </Hint>
        </div>
      </div>

      {/* =====================================================
          ACTIONS
          ===================================================== */}

      <div className="fiscow-form-actions">
        <Link
          href="/entreprise/onboarding/1"
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