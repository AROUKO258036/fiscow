'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import {
  NotificationDropdown,
  type NotificationItem,
} from './notification-dropdown'

type OnboardingHeaderProps = {
  user: {
    name: string
    email: string
  }

  notifications: NotificationItem[]
}

export function OnboardingHeader({
  user,
  notifications,
}: OnboardingHeaderProps) {
  const [darkMode, setDarkMode] = useState(false)

  const initial =
    user.name?.trim().charAt(0).toUpperCase() ||
    user.email?.trim().charAt(0).toUpperCase() ||
    'U'

  /* =========================================================
     01. CHARGEMENT DU THÈME
     ========================================================= */

  useEffect(() => {
    const savedTheme =
      localStorage.getItem('fiscow-theme')

    const systemDark =
      window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches

    const shouldUseDark =
      savedTheme === 'dark' ||
      (!savedTheme && systemDark)

    setDarkMode(shouldUseDark)

    document.documentElement.setAttribute(
      'data-theme',
      shouldUseDark ? 'dark' : 'light',
    )
  }, [])

  /* =========================================================
     02. CHANGEMENT DU THÈME
     ========================================================= */

  function toggleTheme() {
    const nextDarkMode = !darkMode

    setDarkMode(nextDarkMode)

    const theme =
      nextDarkMode ? 'dark' : 'light'

    document.documentElement.setAttribute(
      'data-theme',
      theme,
    )

    localStorage.setItem(
      'fiscow-theme',
      theme,
    )
  }

  return (
    <header className="fiscow-onboarding-header">
      <div className="fiscow-onboarding-header-inner">

        {/* ===================================================
            03. LOGO
            =================================================== */}

        <Link
          href="/"
          className="fiscow-onboarding-logo"
          aria-label="Fiscow"
        >
          Fiscow<span>.</span>
        </Link>

        {/* ===================================================
            04. ACTIONS
            =================================================== */}

        <div className="fiscow-onboarding-header-actions">

          {/* THÈME */}

          <button
            type="button"
            className="fiscow-onboarding-header-icon"
            onClick={toggleTheme}
            aria-label={
              darkMode
                ? 'Activer le mode clair'
                : 'Activer le mode sombre'
            }
            title={
              darkMode
                ? 'Mode clair'
                : 'Mode sombre'
            }
          >
            <i
              className={
                darkMode
                  ? 'ti ti-moon'
                  : 'ti ti-sun'
              }
            />
          </button>

          {/* NOTIFICATIONS */}

          <div className="fiscow-onboarding-notifications">
            <NotificationDropdown
              items={notifications}
            />
          </div>

          {/* =================================================
              05. PROFIL
              ================================================= */}

          <div className="dropdown">

            <button
              type="button"
              className="fiscow-onboarding-profile"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Ouvrir le menu utilisateur"
            >

              <span className="fiscow-onboarding-avatar">
                {initial}
              </span>

              <span className="fiscow-onboarding-user-info">
                <strong>
                  {user.name}
                </strong>

                <small>
                  Utilisateur
                </small>
              </span>

              <i className="ti ti-chevron-down" />

            </button>

            <div className="dropdown-menu dropdown-menu-end">

              <Link
                href="/profile"
                className="dropdown-item"
              >
                <i className="ti ti-user-circle me-2" />
                Mon profil
              </Link>

            </div>
          </div>

        </div>
      </div>
    </header>
  )
}