import type { ReactNode } from 'react'

const TOTAL_STEPS = 4

export function OnboardingShell({
  step,
  title,
  children,
}: {
  step: number
  title: string
  children: ReactNode
}) {
  return (
    <section className="fiscow-onboarding">
      <div className="fiscow-onboarding-wrapper">

        {/* Progression */}
        <div className="fiscow-onboarding-progress">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
            const current = index + 1
            const active = current === step
            const completed = current < step

            return (
              <div
                key={current}
                className={`fiscow-step ${
                  active ? 'is-active' : ''
                } ${
                  completed ? 'is-completed' : ''
                }`}
              >
                <div className="fiscow-step-circle">
                  {completed ? (
                    <i className="ti ti-check" />
                  ) : (
                    current
                  )}
                </div>

                {current < TOTAL_STEPS && (
                  <div className="fiscow-step-line" />
                )}
              </div>
            )
          })}
        </div>

        <div className="fiscow-onboarding-step-label">
          Étape {step} sur {TOTAL_STEPS}
        </div>

        <h1 className="fiscow-onboarding-title">
          {title}
        </h1>

        <div className="fiscow-onboarding-card">
          <div className="fiscow-onboarding-card-body">
            {children}
          </div>
        </div>

      </div>
    </section>
  )
}