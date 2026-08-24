import type { ReactNode } from 'react'
import { submitDeclaration } from '@/app/(app)/calculateurs/actions'
import styles from './calculator-shell.module.css'

interface CalculatorShellProps {
  titre: string
  soustitre?: string
  type: 'is' | 'tva' | 'its' | 'cnss' | 'patente' | 'tfu'
  montant: number | null
  eventId?: string | null
  form: ReactNode
  resultats: ReactNode
}

const TYPE_META: Record<
  CalculatorShellProps['type'],
  { icon: string; short: string }
> = {
  is: { icon: 'ti ti-building-bank', short: 'IS' },
  tva: { icon: 'ti ti-arrows-exchange', short: 'TVA' },
  its: { icon: 'ti ti-users', short: 'ITS' },
  cnss: { icon: 'ti ti-shield-check', short: 'CNSS' },
  patente: { icon: 'ti ti-certificate', short: 'TPS' },
  tfu: { icon: 'ti ti-home', short: 'TFU' },
}

export function CalculatorShell({
  titre,
  soustitre = '',
  type,
  montant,
  eventId,
  form,
  resultats,
}: CalculatorShellProps) {
  const meta = TYPE_META[type]

  return (
    <div className={styles.shell}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <i className={meta.icon} />
        </div>

        <div className={styles.heroCopy}>
          <span>Calculateur {meta.short}</span>
          <h2>{titre}</h2>
          {soustitre ? <p>{soustitre}</p> : null}
        </div>
      </div>

      <div className={styles.workspace}>
        <section className={styles.formPane}>
          <div className={styles.paneHead}>
            <span className={styles.step}>01</span>
            <div>
              <h3>Informations de calcul</h3>
              <p>Renseignez les données nécessaires à l’estimation.</p>
            </div>
          </div>

          <div className={styles.formContent}>{form}</div>
        </section>

        <section className={styles.resultPane}>
          <div className={styles.paneHead}>
            <span className={styles.step}>02</span>
            <div>
              <h3>Résultat</h3>
              <p>Votre estimation s’affiche ici après le calcul.</p>
            </div>
          </div>

          <div className={styles.resultContent}>{resultats}</div>
        </section>
      </div>

      {montant != null && montant !== 0 && (
        <div className={styles.submitBar}>
          <div>
            <span>Montant estimé</span>
            <strong>{montant.toLocaleString('fr-FR')} FCFA</strong>
          </div>

          <form
            action={submitDeclaration.bind(
              null,
              type,
              String(montant),
              eventId ?? undefined,
            )}
          >
            <button type="submit">
              <i className="ti ti-file-plus" />
              Soumettre la déclaration
            </button>
          </form>
        </div>
      )}
    </div>
  )
}