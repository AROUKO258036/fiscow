'use client'

type DemoVideoProps = {
  videoUrl?: string
  posterUrl?: string
}

export function DemoVideo({
  videoUrl,
  posterUrl,
}: DemoVideoProps) {
  const hasVideo =
    Boolean(videoUrl?.trim())

  return (
    <section
      className="rg-section rg-demo-section"
      id="demo"
    >
      <div className="rg-container">
        <div className="rg-section-head rg-section-head--center">
          <span className="rg-demo-eyebrow">
            Démonstration
          </span>

          <h2 className="rg-h2">
            Découvrez Fiscow en quelques minutes
          </h2>

          <p className="rg-section-sub">
            Voyez concrètement comment Fiscow vous aide
            à suivre vos obligations fiscales, vos échéances
            et vos déclarations depuis un seul espace.
          </p>
        </div>

        <div className="rg-demo-video-wrapper">
          {hasVideo ? (
            <video
              className="rg-demo-video"
              controls
              preload="metadata"
              poster={posterUrl || undefined}
            >
              <source
                src={videoUrl}
              />

              Votre navigateur ne prend pas en charge
              la lecture de cette vidéo.
            </video>
          ) : (
            <div className="rg-demo-placeholder">
              <div className="rg-demo-play">
                <svg
                  viewBox="0 0 24 24"
                  width="30"
                  height="30"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              <div className="rg-demo-placeholder-content">
                <strong>
                  Vidéo de démonstration
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}