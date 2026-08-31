'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { TermeExplicable } from '@/components/app/terme-explicable'
import {
  GlobalReportExport,
  type GlobalReportCompany,
  type GlobalReportDeclaration,
} from '@/components/app/report/global-report-export'

/* =========================================================
   [01] HELPERS
   ========================================================= */

function isActive(pathname: string, match: string): boolean {
  if (match === '/dashboard') return pathname === '/dashboard'

  if (match === '/entreprise') {
    return (
      pathname.startsWith('/entreprise/configuration') ||
      pathname.startsWith('/entreprise/onboarding')
    )
  }

  return pathname.startsWith(match)
}

/* =========================================================
   [02] TYPES
   ========================================================= */

type AppSidebarProps = {
  user?: {
    name?: string | null
    role?: string | null
  }

  reportCompany?: GlobalReportCompany

  reportDeclarations?: GlobalReportDeclaration[]
}

/* =========================================================
   [03] SIDEBAR
   ========================================================= */

export function AppSidebar({
  user,
  reportCompany,
  reportDeclarations = [],
}: AppSidebarProps) {
  const pathname = usePathname()

  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const isAdmin = user?.role === 'ADMIN'

  const calActive = isActive(
    pathname,
    '/calendrier-fiscal',
  )

  const declActive = isActive(
    pathname,
    '/declarations',
  )

  const entActive = isActive(
    pathname,
    '/entreprise',
  )

  const calcOpen =
    pathname.startsWith('/calculateurs')

  /* =======================================================
     [03.1] ÉTAT SIDEBAR DESKTOP
     ======================================================= */

  useEffect(() => {
    const saved =
      localStorage.getItem(
        'fiscow-sidebar-collapsed',
      )

    if (saved === 'true') {
      setCollapsed(true)
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle(
      'mini-sidebar',
      collapsed,
    )

    localStorage.setItem(
      'fiscow-sidebar-collapsed',
      String(collapsed),
    )

    return () => {
      document.body.classList.remove(
        'mini-sidebar',
      )
    }
  }, [collapsed])

  /* =======================================================
     [03.2] DÉTECTION MOBILE
     ======================================================= */

  useEffect(() => {
    const media = window.matchMedia(
      '(max-width: 991.98px)',
    )

    const update = () => {
      setIsMobile(media.matches)
    }

    update()

    media.addEventListener?.('change', update)

    return () => {
      media.removeEventListener?.('change', update)
    }
  }, [])

  /* =======================================================
     [03.3] EXPORT CSV GLOBAL
     ======================================================= */

  function exportGlobalCsv() {
    const button = document.getElementById(
      'dashboard-export-csv',
    ) as HTMLButtonElement | null

    button?.click()
  }

  /* =======================================================
     [04] RENDER
     ======================================================= */

  return (
    <div
      className={`sidebar fiscow-sidebar ${
        collapsed ? 'is-collapsed' : ''
      }`}
      id="sidebar"
    >
      {/* ===================================================
          [04.1] LOGO
          =================================================== */}

      <div className="fiscow-sidebar-brand">
        <button
          type="button"
          className="fiscow-sidebar-logo-button"
          onClick={() => {
            if (
              typeof window !== 'undefined' &&
              window
                .matchMedia('(min-width: 992px)')
                .matches
            ) {
              document.body.classList.toggle(
                'mini-sidebar',
              )
            }
          }}
          aria-label="Réduire ou ouvrir la sidebar"
        >
          <span className="fiscow-sidebar-logo">
            Fiscow<span>.</span>
          </span>

          <span className="fiscow-sidebar-logo-mini">
            F<span>.</span>
          </span>
        </button>
      </div>

      {/* ===================================================
          [04.2] NAVIGATION
          =================================================== */}

      <div className="sidebar-inner">
        <div
          id="sidebar-menu"
          className="sidebar-menu fiscow-sidebar-menu"
        >
          <ul>
            {!collapsed && (
              <li className="menu-title">
                <span>Navigation</span>
              </li>
            )}

            <SidebarItem
              href="/dashboard"
              icon="ti ti-layout-dashboard"
              label="Tableau de bord"
              active={pathname === '/dashboard'}
              collapsed={collapsed}
            />

            <SidebarItem
              href="/calendrier-fiscal"
              icon="ti ti-calendar-event"
              label="Calendrier fiscal"
              active={calActive}
              collapsed={collapsed}
            />

            <li
              className={`submenu ${
                calcOpen ? 'active' : ''
              }`}
            >
              <Link
                href="/calculateurs"
                className={`fiscow-sidebar-link ${
                  calcOpen ? 'active' : ''
                }`}
              >
                <i className="ti ti-calculator" />

                {!collapsed && (
                  <span>Calculateurs</span>
                )}

                {!collapsed && (
                  <span className="menu-arrow" />
                )}

                {collapsed && (
                  <span className="fiscow-tooltip">
                    Calculateurs
                  </span>
                )}
              </Link>

              {!collapsed && calcOpen && (
                <ul
                  style={{
                    display: 'block',
                  }}
                >
                  <li>
                    <Link href="/calculateurs">
                      Tous les calculateurs
                    </Link>
                  </li>

                  <li>
                    <Link href="/calculateurs/is">
                      <TermeExplicable
                        term="is"
                        text="IS"
                      />
                    </Link>
                  </li>

                  <li>
                    <Link href="/calculateurs/tva">
                      <TermeExplicable
                        term="tva"
                        text="TVA"
                      />
                    </Link>
                  </li>

                  <li>
                    <Link href="/calculateurs/its">
                      <TermeExplicable
                        term="its"
                        text="ITS"
                      />
                    </Link>
                  </li>

                  <li>
                    <Link href="/calculateurs/cnss">
                      <TermeExplicable
                        term="cnss"
                        text="CNSS"
                      />
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <SidebarItem
              href="/declarations"
              icon="ti ti-file-invoice"
              label="Déclarations"
              active={declActive}
              collapsed={collapsed}
            />

            <SidebarItem
              href="/entreprise/configuration"
              icon="ti ti-building"
              label="Configuration entreprise"
              active={entActive}
              collapsed={collapsed}
            />

            <SidebarItem
              href="/profile"
              icon="ti ti-settings"
              label="Paramètres"
              active={pathname === '/profile'}
              collapsed={collapsed}
            />

            {isAdmin && (
              <>
                {!collapsed && (
                  <li className="menu-title mt-4">
                    <span>Administration</span>
                  </li>
                )}

                <SidebarItem
                  href="/admin"
                  icon="ti ti-shield-lock"
                  label="Administration"
                  active={pathname.startsWith(
                    '/admin',
                  )}
                  collapsed={collapsed}
                />
              </>
            )}

            {/* ===============================================
                [04.3] EXPORTS GLOBAUX — MOBILE UNIQUEMENT
                =============================================== */}

            {isMobile && (
              <li
                style={{
                  listStyle: 'none',
                  margin: '18px 14px 8px',
                  paddingTop: '16px',
                  borderTop:
                    '1px solid var(--fiscow-sidebar-export-border, #e8dfd6)',
                }}
              >
                <div
                  style={{
                    marginBottom: '9px',
                    paddingInline: '2px',
                    fontSize: '9px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color:
                      'var(--fiscow-sidebar-export-muted, #8c8178)',
                  }}
                >
                  Exports
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'minmax(0, 1fr)',
                    gap: '8px',
                  }}
                >
                  <button
                    type="button"
                    onClick={exportGlobalCsv}
                    className="fiscow-dashboard-export-btn"
                    style={{
                      width: '100%',
                      minHeight: '42px',
                      justifyContent: 'flex-start',
                    }}
                  >
                    <i className="ti ti-file-type-csv" />
                    <span>Exporter CSV</span>
                  </button>

                  {reportCompany && (
                    <div
                      style={{
                        width: '100%',
                      }}
                    >
                      <GlobalReportExport
                        company={reportCompany}
                        declarations={
                          reportDeclarations
                        }
                      />
                    </div>
                  )}
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* ===================================================
          [04.4] FOOTER
          =================================================== */}

      <div className="fiscow-sidebar-footer">
        {!collapsed && (
          <div className="fiscow-sidebar-help">
            <strong>Besoin d’aide ?</strong>

            <span>
              Consultez le centre d’aide
            </span>
          </div>
        )}

        <button
          type="button"
          className="fiscow-sidebar-collapse"
          onClick={() =>
            setCollapsed((value) => !value)
          }
        >
          <i
            className={
              collapsed
                ? 'ti ti-chevrons-right'
                : 'ti ti-chevrons-left'
            }
          />

          {!collapsed && <span>Réduire</span>}
        </button>
      </div>

      {/* ===================================================
          [05] DARK MODE DES EXPORTS MOBILE
          =================================================== */}

      <style jsx global>{`
        html[data-theme='dark'] {
          --fiscow-sidebar-export-border: #48423c;
          --fiscow-sidebar-export-muted: #b8b0a8;
        }

        @media (max-width: 991.98px) {
          /*
           * IMPORTANT :
           * le bouton global utilise aussi la classe
           * .fiscow-dashboard-export-btn.
           * Dans le header, cette classe est masquée sur mobile.
           * On la réactive explicitement uniquement dans la sidebar.
           */
          .fiscow-sidebar .fiscow-dashboard-export-btn,
          .fiscow-sidebar button.fiscow-dashboard-export-btn {
            display: inline-flex !important;
            visibility: visible !important;
            opacity: 1 !important;

            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;
            min-height: 42px !important;

            align-items: center !important;
            justify-content: flex-start !important;
            gap: 9px !important;

            margin: 0 !important;
            padding: 0 13px !important;

            border: 1px solid #ff8a1f !important;
            border-radius: 10px !important;

            background: #ffffff !important;
            color: #e86f00 !important;

            font-size: 11px !important;
            font-weight: 800 !important;
            line-height: 1 !important;

            cursor: pointer !important;
          }

          .fiscow-sidebar .fiscow-dashboard-export-btn i {
            display: inline-flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            flex: 0 0 auto !important;
            color: #ff8a1f !important;
            font-size: 16px !important;
          }

          .fiscow-sidebar .fiscow-dashboard-export-btn span {
            display: inline !important;
            visibility: visible !important;
            opacity: 1 !important;
          }

          html[data-theme='dark']
            .fiscow-sidebar
            .fiscow-dashboard-export-btn,
          html[data-theme='dark']
            .fiscow-sidebar
            button.fiscow-dashboard-export-btn {
            border-color: #5a544d !important;
            background: #282521 !important;
            color: #f3f0ec !important;
          }

          html[data-theme='dark']
            .fiscow-sidebar
            .fiscow-dashboard-export-btn i {
            color: #ff8a1f !important;
          }
        }
      `}</style>
    </div>
  )
}

/* =========================================================
   [06] SIDEBAR ITEM
   ========================================================= */

function SidebarItem({
  href,
  icon,
  label,
  active,
  collapsed,
}: {
  href: string
  icon: string
  label: string
  active: boolean
  collapsed: boolean
}) {
  return (
    <li className={active ? 'active' : ''}>
      <Link
        href={href}
        className={`fiscow-sidebar-link ${
          active ? 'active' : ''
        }`}
      >
        <i className={icon} />

        {!collapsed && <span>{label}</span>}

        {collapsed && (
          <span className="fiscow-tooltip">
            {label}
          </span>
        )}
      </Link>
    </li>
  )
}
