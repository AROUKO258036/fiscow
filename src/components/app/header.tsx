'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { logoutAction } from '@/app/(auth)/actions'

import {
  NotificationDropdown,
  type NotificationItem,
} from './notification-dropdown'

type AppHeaderProps = {
  user: {
    name: string
    email: string
    role?: string | null
  }
  notifications: NotificationItem[]
}

export function AppHeader({
  user,
  notifications,
}: AppHeaderProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const initial =
    user.name?.trim().charAt(0).toUpperCase() ||
    user.email?.trim().charAt(0).toUpperCase() ||
    'U'

  useEffect(() => {
    const savedTheme = localStorage.getItem('fiscow-theme')

    const systemDark = window.matchMedia(
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

  useEffect(() => {
    const wrapper = document.querySelector('.main-wrapper')

    wrapper?.classList.toggle(
      'fiscow-mobile-sidebar-open',
      mobileMenuOpen,
    )

    return () => {
      wrapper?.classList.remove(
        'fiscow-mobile-sidebar-open',
      )
    }
  }, [mobileMenuOpen])

  function toggleTheme() {
    const nextDark = !darkMode

    setDarkMode(nextDark)

    const theme = nextDark ? 'dark' : 'light'

    document.documentElement.setAttribute(
      'data-theme',
      theme,
    )

    localStorage.setItem(
      'fiscow-theme',
      theme,
    )
  }

  function exportDashboardCsv() {
    const button = document.getElementById(
      'dashboard-export-csv',
    ) as HTMLButtonElement | null

    button?.click()
  }

  return (
    <>
      <header className="header fiscow-dashboard-header">
        <div className="main-header fiscow-dashboard-header-inner">

          <div className="fiscow-dashboard-header-spacer" />

          <div className="fiscow-dashboard-header-actions">

            <button
              type="button"
              className="fiscow-dashboard-export-btn"
              onClick={exportDashboardCsv}
            >
              <i className="ti ti-download" />
              <span>Exporter CSV</span>
            </button>

            <button
              type="button"
              className="fiscow-dashboard-header-icon"
              onClick={toggleTheme}
              title={
                darkMode
                  ? 'Mode clair'
                  : 'Mode sombre'
              }
              aria-label="Changer le thème"
            >
              <i
                className={
                  darkMode
                    ? 'ti ti-moon'
                    : 'ti ti-sun'
                }
              />
            </button>

            <NotificationDropdown
              items={notifications}
            />

            <div className="dropdown">
              <button
                type="button"
                className="fiscow-dashboard-avatar-trigger"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span className="fiscow-dashboard-avatar">
                  {initial}
                </span>
              </button>

              <div className="dropdown-menu dropdown-menu-end fiscow-dashboard-profile-menu">

                <div className="fiscow-dashboard-profile-head">
                  <span className="fiscow-dashboard-avatar fiscow-dashboard-avatar-lg">
                    {initial}
                  </span>

                  <div className="fiscow-dashboard-profile-identity">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                </div>

                <div className="fiscow-dashboard-profile-body">
                  <Link
                    href="/profile"
                    className="fiscow-dashboard-profile-item"
                  >
                    <i className="ti ti-user-circle" />
                    <span>Mon profil</span>
                  </Link>

                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="fiscow-dashboard-profile-item"
                    >
                      <i className="ti ti-shield-lock" />
                      <span>Administration</span>
                    </Link>
                  )}
                </div>

                <div className="fiscow-dashboard-profile-footer">
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="fiscow-dashboard-profile-item fiscow-dashboard-profile-logout"
                    >
                      <i className="ti ti-logout" />
                      <span>Déconnexion</span>
                    </button>
                  </form>
                </div>

              </div>
            </div>

          </div>

          <div className="fiscow-dashboard-mobile-header">

            <button
              type="button"
              className="fiscow-dashboard-mobile-brand"
              onClick={() =>
                setMobileMenuOpen(
                  (current) => !current,
                )
              }
              aria-expanded={mobileMenuOpen}
            >
              <span className="fiscow-mobile-mini-logo">
                F<span>.</span>
              </span>
            </button>

            <div className="fiscow-dashboard-mobile-actions">

              <button
                type="button"
                className="fiscow-dashboard-header-icon"
                onClick={toggleTheme}
                aria-label="Changer le thème"
              >
                <i
                  className={
                    darkMode
                      ? 'ti ti-moon'
                      : 'ti ti-sun'
                  }
                />
              </button>

              <NotificationDropdown
                items={notifications}
              />

              <div className="dropdown">
                <button
                  type="button"
                  className="fiscow-dashboard-avatar-trigger"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span className="fiscow-dashboard-avatar">
                    {initial}
                  </span>
                </button>

                <div className="dropdown-menu dropdown-menu-end fiscow-dashboard-profile-menu">

                  <div className="fiscow-dashboard-profile-head">
                    <span className="fiscow-dashboard-avatar fiscow-dashboard-avatar-lg">
                      {initial}
                    </span>

                    <div className="fiscow-dashboard-profile-identity">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>

                  <div className="fiscow-dashboard-profile-body">
                    <Link
                      href="/profile"
                      className="fiscow-dashboard-profile-item"
                    >
                      <i className="ti ti-user-circle" />
                      <span>Mon profil</span>
                    </Link>
                  </div>

                  <div className="fiscow-dashboard-profile-footer">
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="fiscow-dashboard-profile-item fiscow-dashboard-profile-logout"
                      >
                        <i className="ti ti-logout" />
                        <span>Déconnexion</span>
                      </button>
                    </form>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </header>

      {mobileMenuOpen && (
        <button
          type="button"
          className="fiscow-mobile-sidebar-backdrop"
          aria-label="Fermer le menu"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />
      )}
    </>
  )
}