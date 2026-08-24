'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { href: '#probleme', label: 'Le problème' },
  { href: '#solution', label: 'Solution' },
  { href: '#comment-ca-marche', label: 'Comment ça marche' },
  { href: '#temoignages', label: 'Témoignages' },
  { href: '#faq', label: 'FAQ' },
]

/* Logo Fiscow Texte Typographique avec Accent Orange */
function FiscowLogo() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        textDecoration: 'none',
        lineHeight: 1,
      }}
    >
      <span
        style={{
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          fontWeight: 800,
          fontSize: '28px',
          letterSpacing: '-0.04em',
          color: '#0F172A',
        }}
      >
        Fiscow
      </span>
      <span
        style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#FF8A1F',
          marginLeft: '2px',
          alignSelf: 'baseline',
        }}
        aria-hidden="true"
      />
    </div>
  )
}

export function LandingNav({ links = NAV_LINKS }: { links?: { href: string; label: string }[] }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (open) {
      document.body.classList.add('rg-body--no-scroll')
    } else {
      document.body.classList.remove('rg-body--no-scroll')
    }
  }, [open])

  return (
    <header className={`rg-nav${scrolled ? ' rg-nav--scrolled' : ''}`} id="rgNav">
      <div className="rg-container">
        {/* LOGO FISCOW */}
        <Link href="/" className="rg-nav-logo d-flex align-items-center">
          <FiscowLogo />
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className={`rg-nav-links${open ? ' rg-open' : ''}`} aria-label="Navigation Principale">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}

          <div className="rg-nav-drawer-actions">
            <Link href="/login" className="rg-btn rg-btn-outline" onClick={() => setOpen(false)}>
              Se connecter
            </Link>
            <Link href="/register" className="rg-btn rg-btn-primary" onClick={() => setOpen(false)}>
              Créer mon compte
            </Link>
          </div>
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="rg-nav-actions">
          <Link href="/login" className="rg-btn rg-btn-ghost">
            Se connecter
          </Link>
          <Link href="/register" className="rg-btn rg-btn-primary">
            Créer mon compte gratuit
          </Link>
        </div>

        {/* MOBILE BURGER */}
        <button
          className={`rg-burger${open ? ' rg-burger--active' : ''}`}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}