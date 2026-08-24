'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { updateCompanyAction, type UpdateCompanyState } from './actions'
import styles from './modifier.module.css'

export interface EmployeeInitial {
  id: number
  poste: string
  salaire: string
  is_active: boolean
}

export interface CompanyInitial {
  raison_sociale: string
  nif: string
  rccm: string
  telephone: string
  secteur: string
  type_entite: string
  date_creation: string
  chiffre_affaires: string
  regime_tva: string
  has_property: boolean
  effectif_actif: number
  employees: EmployeeInitial[]
}

const SECTEURS = [
  ['commerce', 'Commerce'],
  ['services', 'Services'],
  ['industrie', 'Industrie'],
  ['agriculture', 'Agriculture'],
  ['transport', 'Transport'],
  ['btp', 'BTP'],
  ['numerique', 'Numérique / Tech'],
  ['autre', 'Autre'],
]

const REGIMES = [
  ['simplifié', 'Simplifié'],
  ['réel', 'Réel'],
  ['transparent', 'Transparent'],
]

const ENTITES = [
  ['societe', 'Société (SARL, SA, SAS, etc.)'],
  ['individuelle', 'Entreprise individuelle'],
]

interface Row {
  key: number
  id: number
  poste: string
  salaire: string
  isActive: boolean
  removed: boolean
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null

  return (
    <p className={styles.error}>
      <i className="ti ti-alert-circle" />
      {error}
    </p>
  )
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <div className={styles.sectionIcon}>
          <i className={icon} />
        </div>

        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className={styles.sectionBody}>{children}</div>
    </section>
  )
}

export function ModifierForm({
  initial,
  postes,
}: {
  initial: CompanyInitial
  postes: string[]
}) {
  const [state, formAction, pending] = useActionState<
    UpdateCompanyState,
    FormData
  >(updateCompanyAction, {})

  const errors = state.errors ?? {}

  const [rows, setRows] = useState<Row[]>(
    initial.employees.length
      ? initial.employees.map((e) => ({
          key: e.id,
          id: e.id,
          poste: e.poste,
          salaire: e.salaire,
          isActive: e.is_active,
          removed: false,
        }))
      : [
          {
            key: 0,
            id: 0,
            poste: '',
            salaire: '',
            isActive: true,
            removed: false,
          },
        ],
  )

  const nextKey = () => Math.max(0, ...rows.map((r) => r.key)) + 1

  const addRow = () =>
    setRows((current) => [
      ...current,
      {
        key: nextKey(),
        id: 0,
        poste: '',
        salaire: '',
        isActive: true,
        removed: false,
      },
    ])

  const removeRow = (key: number) =>
    setRows((current) =>
      current.map((row) =>
        row.key === key ? { ...row, removed: true } : row,
      ),
    )

  const updateRow = (key: number, patch: Partial<Row>) =>
    setRows((current) =>
      current.map((row) =>
        row.key === key ? { ...row, ...patch } : row,
      ),
    )

  const visible = rows.filter((row) => !row.removed)

  const effectif = visible.filter(
    (row) =>
      (row.poste.trim() !== '' || row.salaire.trim() !== '') &&
      row.isActive,
  ).length

  return (
    <form action={formAction} noValidate className={styles.form}>
      <div className={styles.topbar}>
        <Link href="/entreprise/configuration" className={styles.backLink}>
          <i className="ti ti-arrow-left" />
          Configuration
        </Link>

        <span className={styles.topbarSeparator}>/</span>

        <span className={styles.topbarCurrent}>Modifier les informations</span>
      </div>

      {state.error && (
        <div className={styles.alertError}>
          <i className="ti ti-alert-circle" />
          {state.error}
        </div>
      )}

      <div className={styles.hero}>
        <div className={styles.heroMain}>
          <div className={styles.heroIcon}>
            <i className="ti ti-edit" />
          </div>

          <div>
            <span className={styles.eyebrow}>Mise à jour</span>
            <h1>{initial.raison_sociale}</h1>
            <p>
              Modifiez les informations utilisées par Fiscow pour vos calculs,
              échéances et obligations fiscales.
            </p>
          </div>
        </div>

        <div className={styles.countPill}>
          <i className="ti ti-users" />
          {effectif} salarié{effectif > 1 ? 's' : ''} actif{effectif > 1 ? 's' : ''}
        </div>
      </div>

      <div className={styles.twoCols}>
        <Section
          icon="ti ti-building"
          title="Identité de l’entreprise"
          description="Informations générales utilisées sur votre espace Fiscow."
        >
          <div className={styles.grid2}>
            <div>
              <label className={styles.label} htmlFor="raison_sociale">
                Raison sociale <span>*</span>
              </label>
              <input
                id="raison_sociale"
                name="raison_sociale"
                type="text"
                defaultValue={initial.raison_sociale}
                required
                className={styles.field}
              />
              <FieldError error={errors.raison_sociale} />
            </div>

            <div>
              <label className={styles.label} htmlFor="secteur">
                Secteur d’activité <span>*</span>
              </label>
              <select
                id="secteur"
                name="secteur"
                defaultValue={initial.secteur}
                required
                className={styles.field}
              >
                <option value="">Sélectionnez...</option>
                {SECTEURS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <FieldError error={errors.secteur} />
            </div>

            <div>
              <label className={styles.label} htmlFor="type_entite">
                Type d’entité <span>*</span>
              </label>
              <select
                id="type_entite"
                name="type_entite"
                defaultValue={initial.type_entite}
                required
                className={styles.field}
              >
                {ENTITES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <FieldError error={errors.type_entite} />
            </div>

            <div>
              <label className={styles.label} htmlFor="telephone">
                Téléphone
              </label>
              <input
                id="telephone"
                name="telephone"
                type="text"
                defaultValue={initial.telephone}
                placeholder="Ex : +229 01 23 45 67"
                className={styles.field}
              />
              <FieldError error={errors.telephone} />
            </div>
          </div>
        </Section>

        <Section
          icon="ti ti-id-badge-2"
          title="Identifiants fiscaux"
          description="Références administratives officielles de votre entreprise."
        >
          <div className={styles.grid2}>
            <div>
              <label className={styles.label} htmlFor="nif">
                NIF <span>*</span>
              </label>
              <input
                id="nif"
                name="nif"
                type="text"
                defaultValue={initial.nif}
                required
                className={styles.field}
              />
              <FieldError error={errors.nif} />
            </div>

            <div>
              <label className={styles.label} htmlFor="rccm">
                RCCM
              </label>
              <input
                id="rccm"
                name="rccm"
                type="text"
                defaultValue={initial.rccm}
                className={styles.field}
              />
              <FieldError error={errors.rccm} />
            </div>
          </div>
        </Section>
      </div>

      <Section
        icon="ti ti-receipt-tax"
        title="Informations fiscales et financières"
        description="Ces paramètres influencent directement les obligations et estimations générées."
      >
        <div className={styles.grid4}>
          <div>
            <label className={styles.label} htmlFor="date_creation">
              Date de création
            </label>
            <input
              id="date_creation"
              name="date_creation"
              type="date"
              defaultValue={initial.date_creation}
              className={styles.field}
            />
            <FieldError error={errors.date_creation} />
          </div>

          <div>
            <label className={styles.label} htmlFor="chiffre_affaires">
              CA annuel (FCFA)
            </label>
            <input
              id="chiffre_affaires"
              name="chiffre_affaires"
              type="number"
              min="0"
              step="1"
              defaultValue={initial.chiffre_affaires}
              placeholder="Ex : 50000000"
              className={styles.field}
            />
            <FieldError error={errors.chiffre_affaires} />
          </div>

          <div>
            <label className={styles.label} htmlFor="regime_tva">
              Régime TVA <span>*</span>
            </label>
            <select
              id="regime_tva"
              name="regime_tva"
              defaultValue={initial.regime_tva}
              required
              className={styles.field}
            >
              {REGIMES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <FieldError error={errors.regime_tva} />
          </div>

          <div>
            <span className={styles.label}>Bien immobilier</span>

            <div className={styles.segmented}>
              <label>
                <input
                  type="radio"
                  name="has_property"
                  value="1"
                  defaultChecked={initial.has_property}
                />
                <span>Oui</span>
              </label>

              <label>
                <input
                  type="radio"
                  name="has_property"
                  value="0"
                  defaultChecked={!initial.has_property}
                />
                <span>Non</span>
              </label>
            </div>

            <p className={styles.hint}>Si oui, la TFU peut être applicable.</p>
          </div>
        </div>
      </Section>

      <Section
        icon="ti ti-users"
        title="Employés"
        description="Gérez les salariés utilisés pour le calcul de l’ITS et de la CNSS."
      >
        <div className={styles.employeeTop}>
          <div className={styles.employeeCount}>
            <span>Effectif actif</span>
            <strong>{effectif}</strong>
          </div>

          <button type="button" onClick={addRow} className={styles.addButton}>
            <i className="ti ti-plus" />
            Ajouter un employé
          </button>
        </div>

        <div className={styles.employeeList}>
          {rows.map((row, idx) => {
            const rowError =
              errors[`employees.${idx}.poste`] ??
              errors[`employees.${idx}.salaire_brut_mensuel`]

            return (
              <div
                key={row.key}
                className={row.removed ? styles.removed : styles.employeeCard}
              >
                <input type="hidden" name={`employees[${idx}][id]`} value={row.id} />
                <input
                  type="hidden"
                  name={`employees[${idx}][to_delete]`}
                  value={row.removed ? '1' : '0'}
                />

                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  title="Retirer cet employé"
                  className={styles.removeButton}
                >
                  <i className="ti ti-x" />
                </button>

                <div className={styles.employeeTitle}>
                  <span>{idx + 1}</span>
                  <div>
                    <strong>Salarié {idx + 1}</strong>
                    <small>Poste, salaire et statut</small>
                  </div>
                </div>

                <div className={styles.employeeGrid}>
                  <div>
                    <label className={styles.label}>Poste</label>
                    <input
                      type="text"
                      name={`employees[${idx}][poste]`}
                      value={row.poste}
                      onChange={(e) => updateRow(row.key, { poste: e.target.value })}
                      list="postes-suggestions"
                      placeholder="Ex : Comptable"
                      className={styles.field}
                    />
                  </div>

                  <div>
                    <label className={styles.label}>Salaire brut mensuel</label>
                    <input
                      type="number"
                      name={`employees[${idx}][salaire_brut_mensuel]`}
                      value={row.salaire}
                      onChange={(e) => updateRow(row.key, { salaire: e.target.value })}
                      placeholder="150000"
                      min="0"
                      step="1"
                      className={styles.field}
                    />
                  </div>

                  <div>
                    <span className={styles.label}>Statut</span>

                    <label className={styles.statusToggle}>
                      <span>{row.isActive ? 'Actif' : 'Inactif'}</span>

                      <input
                        type="checkbox"
                        name={`employees[${idx}][is_active]`}
                        value="1"
                        checked={row.isActive}
                        onChange={(e) =>
                          updateRow(row.key, { isActive: e.target.checked })
                        }
                      />

                      <span className={styles.switch}>
                        <span />
                      </span>
                    </label>
                  </div>
                </div>

                <FieldError error={rowError} />
              </div>
            )
          })}
        </div>

        <datalist id="postes-suggestions">
          {postes.map((poste) => (
            <option key={poste} value={poste} />
          ))}
        </datalist>
      </Section>

      <div className={styles.actions}>
        <Link href="/entreprise/configuration" className={styles.cancelButton}>
          <i className="ti ti-arrow-left" />
          Annuler
        </Link>

        <button
          type="submit"
          disabled={pending}
          className={styles.saveButton}
        >
          {pending ? (
            <>
              <span className={styles.spinner} />
              Enregistrement...
            </>
          ) : (
            <>
              <i className="ti ti-device-floppy" />
              Enregistrer les modifications
            </>
          )}
        </button>
      </div>
    </form>
  )
}