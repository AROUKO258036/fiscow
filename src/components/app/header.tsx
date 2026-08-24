'use client'

import Link from 'next/link'

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
  const initial =
    user.name?.trim().charAt(0).toUpperCase() ||
    user.email?.trim().charAt(0).toUpperCase() ||
    'U'

  return (
    <header className="fiscow-onboarding-header">
      <div className="fiscow-onboarding-header-inner">

        {/* LOGO */}

        <Link
          href="/"
          className="fiscow-onboarding-logo"
          aria-label="Fiscow"
        >
          Fiscow<span>.</span>
        </Link>

        {/* ACTIONS */}

        <div className="fiscow-onboarding-header-actions">

          {/* THEME */}

          <button
            type="button"
            className="fiscow-onboarding-header-icon"
            id="rg-theme-toggle-onboarding"
            aria-label="Changer le thème"
            title="Changer le thème"
          >
            <i
              className="ti ti-sun"
              id="rg-theme-icon-onboarding"
            />
          </button>

          {/* NOTIFICATIONS */}

          <div className="fiscow-onboarding-notifications">
            <NotificationDropdown
              items={notifications}
            />
          </div>

          {/* PROFIL */}

          <div className="dropdown">
            <button
              type="button"
              className="fiscow-onboarding-profile"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span className="fiscow-onboarding-avatar">
                {initial}
              </span>

              <span className="fiscow-onboarding-user-info">
                <strong>{user.name}</strong>
                <small>Utilisateur</small>
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