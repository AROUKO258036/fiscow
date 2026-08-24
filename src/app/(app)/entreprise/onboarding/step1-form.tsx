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

const SECTEURS = [
  { value: 'commerce', label: 'Commerce' },
  { value: 'services', label: 'Services' },
  { value: 'industrie', label: 'Industrie' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'transport', label: 'Transport' },
  { value: 'btp', label: 'BTP / Construction' },
  { value: 'numerique', label: 'Numérique / Tech' },
  { value: 'autre', label: 'Autre' },
]

export function Step1Form({
  initial,
}: {
  initial: OnboardingData
}) {
  const [state, formAction] =
    useActionState<OnboardingState, FormData>(
      (_prev, fd) =>
        postStepAction(1, _prev, fd),
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

      {/* Raison sociale */}
      <div className="fiscow-field-group">
        <label
          className="fiscow-field-label"
          htmlFor="raison_sociale"
        >
          Raison sociale{' '}
          <span className="fiscow-required">*</span>
        </label>

        <input
          id="raison_sociale"
          name="raison_sociale"
          type="text"
          required
          defaultValue={initial.raison_sociale ?? ''}
          placeholder="Ex: SARL BENIN TRANSIT"
          className={`fiscow-field ${
            errors.raison_sociale ? 'is-invalid' : ''
          }`}
        />

        <FieldError error={errors.raison_sociale} />

        <Hint>
          Nom officiel de votre entreprise tel qu’enregistré au RCCM
        </Hint>
      </div>

      {/* NIF / RCCM */}
      <div className="fiscow-form-grid">
        <div className="fiscow-field-group">
          <label
            className="fiscow-field-label"
            htmlFor="nif"
          >
            NIF (Numéro d’Identification Fiscale){' '}
            <span className="fiscow-required">*</span>
          </label>

          <input
            id="nif"
            name="nif"
            type="text"
            required
            defaultValue={initial.nif ?? ''}
            placeholder="Ex: 3202401234567"
            className={`fiscow-field ${
              errors.nif ? 'is-invalid' : ''
            }`}
          />

          <FieldError error={errors.nif} />

          <Hint>
            Numéro à 13 chiffres délivré par la DGI
          </Hint>
        </div>

        <div className="fiscow-field-group">
          <label
            className="fiscow-field-label"
            htmlFor="rccm"
          >
            RCCM
          </label>

          <input
            id="rccm"
            name="rccm"
            type="text"
            defaultValue={initial.rccm ?? ''}
            placeholder="Ex: RB/COT/23 A 12345"
            className={`fiscow-field ${
              errors.rccm ? 'is-invalid' : ''
            }`}
          />

          <FieldError error={errors.rccm} />

          <Hint>
            Numéro d’enregistrement au Registre du Commerce (si disponible)
          </Hint>
        </div>
      </div>

      {/* Secteur / Date */}
      <div className="fiscow-form-grid">
        <div className="fiscow-field-group">
          <label
            className="fiscow-field-label"
            htmlFor="secteur"
          >
            Secteur d’activité{' '}
            <span className="fiscow-required">*</span>
          </label>

          <select
            id="secteur"
            name="secteur"
            required
            defaultValue={initial.secteur ?? ''}
            className={`fiscow-field fiscow-select ${
              errors.secteur ? 'is-invalid' : ''
            }`}
          >
            <option value="">
              Sélectionnez...
            </option>

            {SECTEURS.map((secteur) => (
              <option
                key={secteur.value}
                value={secteur.value}
              >
                {secteur.label}
              </option>
            ))}
          </select>

          <FieldError error={errors.secteur} />
        </div>

        <div className="fiscow-field-group">
          <label
            className="fiscow-field-label"
            htmlFor="date_creation"
          >
            Date de création
          </label>

          <input
            id="date_creation"
            name="date_creation"
            type="date"
            defaultValue={initial.date_creation ?? ''}
            className={`fiscow-field ${
              errors.date_creation ? 'is-invalid' : ''
            }`}
          />

          <FieldError error={errors.date_creation} />

          <Hint>
            Date de création ou d’immatriculation de l’entreprise
          </Hint>
        </div>
      </div>

      {/* Actions */}
      <div className="fiscow-form-actions">
        <Link
          href="/dashboard"
          className="fiscow-btn fiscow-btn-secondary"
        >
          Annuler
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