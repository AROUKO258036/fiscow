'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import { AppHeader } from '@/components/app/header'
import { OnboardingHeader } from '@/components/app/onboarding-header'
import { AppSidebar } from '@/components/app/sidebar'

import type { NotificationItem } from '@/components/app/notification-dropdown'
import type {
  GlobalReportCompany,
  GlobalReportDeclaration,
} from '@/components/app/report/global-report-export'

/* =========================================================
   [01] TYPES
   ========================================================= */

type AppUser = {
  name: string
  email: string
  role?: string | null
}

type AppShellProps = {
  children: ReactNode

  user: AppUser

  notifications: NotificationItem[]

  reportCompany?: GlobalReportCompany

  reportDeclarations?: GlobalReportDeclaration[]
}

/* =========================================================
   [02] APP SHELL
   ========================================================= */

export function AppShell({
  children,
  user,
  notifications,
  reportCompany,
  reportDeclarations = [],
}: AppShellProps) {
  const pathname = usePathname()

  /* =======================================================
     [02.1] MODE ONBOARDING
     ======================================================= */

  const isOnboarding =
    pathname === '/entreprise/onboarding' ||
    pathname.startsWith('/entreprise/onboarding/')

  /* =======================================================
     [03] RENDER
     ======================================================= */

  return (
    <div
      className={
        isOnboarding
          ? 'main-wrapper onboarding-mode'
          : 'main-wrapper'
      }
    >
      {/* ===================================================
          [03.1] HEADER SELON LE CONTEXTE
          =================================================== */}

      {isOnboarding ? (
        <OnboardingHeader
          user={user}
          notifications={notifications}
        />
      ) : (
        <AppHeader
          user={user}
          notifications={notifications}
          reportCompany={reportCompany}
          reportDeclarations={reportDeclarations}
        />
      )}

      {/* ===================================================
          [03.2] SIDEBAR
          Les données d'export sont aussi transmises ici
          pour afficher CSV + PDF dans le drawer mobile.
          =================================================== */}

      {!isOnboarding && (
        <AppSidebar
          user={user}
          reportCompany={reportCompany}
          reportDeclarations={reportDeclarations}
        />
      )}

      {/* ===================================================
          [03.3] CONTENU
          =================================================== */}

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
