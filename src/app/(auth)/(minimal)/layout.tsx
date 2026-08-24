import Link from 'next/link'

export default function MinimalAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fiscow-auth-page">
      <div className="fiscow-auth-shell">
        <Link href="/" className="fiscow-auth-logo" aria-label="Retour à l'accueil">
          Fiscow<span>.</span>
        </Link>

        <div className="fiscow-auth-card">
          <Link className="fiscow-auth-back" href="/">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Retour à l’accueil
          </Link>

          {children}
        </div>
      </div>
    </div>
  )
}
