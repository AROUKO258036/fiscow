'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { logoutAction } from '@/app/(auth)/actions'
import {
  NotificationDropdown,
  type NotificationItem,
} from './notification-dropdown'

export function AppHeader({
  user,
  notifications,
}: {
  user: {
    name: string
    email: string
    role?: string | null
  }
  notifications: NotificationItem[]
}) {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false)

  const initial =
    user.name?.trim().charAt(0).toUpperCase() ||
    user.email?.trim().charAt(0).toUpperCase() ||
    'U'

  /* =====================================================
     MOBILE SIDEBAR
     React devient le SEUL contrôleur.
     ===================================================== */

  useEffect(() => {
    const wrapper =
      document.querySelector<HTMLElement>(
        '.main-wrapper',
      )

    if (!wrapper) return

    /*
     * On neutralise les anciens états Regule.
     */
    document.body.classList.remove(
      'mini-sidebar',
      'expand-menu',
      'menu-opened',
    )

    document.documentElement.classList.remove(
      'menu-opened',
    )

    /*
     * Uniquement notre classe.
     */
    wrapper.classList.toggle(
      'fiscow-mobile-sidebar-open',
      mobileMenuOpen,
    )

    return () => {
      wrapper.classList.remove(
        'fiscow-mobile-sidebar-open',
      )
    }
  }, [mobileMenuOpen])

  /*
   * Fermeture automatique si on repasse en desktop.
   */
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 992) {
        setMobileMenuOpen(false)

        document
          .querySelector('.main-wrapper')
          ?.classList.remove(
            'fiscow-mobile-sidebar-open',
          )
      }
    }

    window.addEventListener(
      'resize',
      handleResize,
    )

    return () => {
      window.removeEventListener(
        'resize',
        handleResize,
      )
    }
  }, [])

  function toggleMobileMenu() {
    setMobileMenuOpen((open) => !open)
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  /* =====================================================
     EXPORT CSV
     ===================================================== */

  function exportDashboardCsv() {
    const existingExportButton =
      document.getElementById(
        'dashboard-export-csv',
      ) as HTMLButtonElement | null

    existingExportButton?.click()
  }

  return (
    <>
      <header className="header fiscow-dashboard-header">
        <div className="main-header fiscow-dashboard-header-inner">

          {/* =================================================
              DESKTOP
              ================================================= */}

          <div className="fiscow-dashboard-header-spacer" />

          <div className="fiscow-dashboard-header-actions">

            {/* EXPORT CSV */}

            <button
              type="button"
              className="fiscow-dashboard-export-btn"
              onClick={exportDashboardCsv}
              title="Exporter le dashboard en CSV"
            >
              <i className="ti ti-download" />

              <span>Exporter CSV</span>
            </button>

            {/* THEME */}

            <button
              type="button"
              className="fiscow-dashboard-header-icon"
              id="rg-theme-toggle"
              title="Changer le thème"
              aria-label="Changer le thème"
            >
              <i
                className="ti ti-sun"
                id="rg-theme-icon"
              />
            </button>

            {/* NOTIFICATIONS */}

            <div className="fiscow-dashboard-notifications">
              <NotificationDropdown
                items={notifications}
              />
            </div>

            {/* AVATAR */}

            <div className="dropdown">
              <button
                type="button"
                className="fiscow-dashboard-avatar-trigger"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label="Ouvrir le menu du profil"
                title={user.name}
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
                    <strong>
                      {user.name}
                    </strong>

                    <span>
                      {user.email}
                    </span>
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
                      <span>
                        Administration
                      </span>
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
                      <span>
                        Déconnexion
                      </span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              MOBILE
              ================================================= */}

          <div className="fiscow-dashboard-mobile-header">

            {/* IMPORTANT :
                aucun id="mobile_btn"
                sinon Regule reprend la main.
            */}

            <button
              type="button"
              className="fiscow-dashboard-mobile-brand"
              aria-label={
                mobileMenuOpen
                  ? 'Fermer le menu'
                  : 'Ouvrir le menu'
              }
              aria-expanded={mobileMenuOpen}
              onClick={toggleMobileMenu}
            >
              <span className="fiscow-mobile-mini-logo">
                F<span>.</span>
              </span>
            </button>

            <div className="fiscow-dashboard-mobile-actions">

              {/* THEME */}

              <button
                type="button"
                className="fiscow-dashboard-header-icon"
                id="rg-theme-toggle-mobile"
                title="Changer le thème"
                aria-label="Changer le thème"
              >
                <i
                  className="ti ti-sun"
                  id="rg-theme-icon-mobile"
                />
              </button>

              {/* NOTIFICATIONS */}

              <NotificationDropdown
                items={notifications}
              />

              {/* AVATAR */}

              <div className="dropdown">

                <button
                  type="button"
                  className="fiscow-dashboard-avatar-trigger"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  aria-label="Ouvrir le profil"
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
                      <strong>
                        {user.name}
                      </strong>

                      <span>
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <div className="fiscow-dashboard-profile-body">

                    <Link
                      href="/profile"
                      className="fiscow-dashboard-profile-item"
                      onClick={
                        closeMobileMenu
                      }
                    >
                      <i className="ti ti-user-circle" />
                      <span>
                        Mon profil
                      </span>
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="fiscow-dashboard-profile-item"
                        onClick={
                          closeMobileMenu
                        }
                      >
                        <i className="ti ti-shield-lock" />

                        <span>
                          Administration
                        </span>
                      </Link>
                    )}
                  </div>

                  <div className="fiscow-dashboard-profile-footer">

                    <form
                      action={logoutAction}
                    >
                      <button
                        type="submit"
                        className="fiscow-dashboard-profile-item fiscow-dashboard-profile-logout"
                      >
                        <i className="ti ti-logout" />

                        <span>
                          Déconnexion
                        </span>
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
          onClick={closeMobileMenu}
        />
      )}
    </>
  )
}