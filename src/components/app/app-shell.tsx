'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import { AppHeader } from '@/components/app/header'
import { AppSidebar } from '@/components/app/sidebar'
import type { NotificationItem } from '@/components/app/notification-dropdown'

type AppUser = {
  name: string
  email: string
  role?: string | null
}

export function AppShell({
  children,
  user,
  notifications,
}: {
  children: ReactNode
  user: AppUser
  notifications: NotificationItem[]
}) {
  const pathname = usePathname()

  const isOnboarding =
    pathname === '/entreprise/onboarding' ||
    pathname.startsWith('/entreprise/onboarding/')

  return (
    <div
      className={
        isOnboarding
          ? 'main-wrapper onboarding-mode'
          : 'main-wrapper'
      }
    >
      <AppHeader
        user={user}
        notifications={notifications}
      />

      {!isOnboarding && (
        <AppSidebar user={user} />
      )}

      <div
        className={
          isOnboarding
            ? 'page-wrapper onboarding-page-wrapper'
            : 'page-wrapper'
        }
      >
        <div
          className={
            isOnboarding
              ? 'onboarding-content'
              : 'content'
          }
        >
          {children}
        </div>
      </div>
    </div>
  )
}