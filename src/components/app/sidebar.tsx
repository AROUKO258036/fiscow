'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { TermeExplicable } from '@/components/app/terme-explicable'

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

export function AppSidebar({
  user,
}: {
  user?: {
    name?: string | null
    role?: string | null
  }
}) {
  const pathname = usePathname()

  const [collapsed, setCollapsed] = useState(false)

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

  return (
    <div
      className={`sidebar fiscow-sidebar ${
        collapsed ? 'is-collapsed' : ''
      }`}
      id="sidebar"
    >
      {/* LOGO */}
      <div className="fiscow-sidebar-brand">
       <button
          type="button"
          className="fiscow-sidebar-logo-button"
          onClick={() => {
            if (
              typeof window !== 'undefined' &&
              window.matchMedia('(min-width: 992px)').matches
            ) {
              document.body.classList.toggle('mini-sidebar')
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

      {/* NAV */}
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

            {/* DASHBOARD */}
            <SidebarItem
              href="/dashboard"
              icon="ti ti-layout-dashboard"
              label="Tableau de bord"
              active={pathname === '/dashboard'}
              collapsed={collapsed}
            />

            {/* CALENDRIER */}
            <SidebarItem
              href="/calendrier-fiscal"
              icon="ti ti-calendar-event"
              label="Calendrier fiscal"
              active={calActive}
              collapsed={collapsed}
            />

            {/* CALCULATEURS */}
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

            {/* DECLARATIONS */}
            <SidebarItem
              href="/declarations"
              icon="ti ti-file-invoice"
              label="Déclarations"
              active={declActive}
              collapsed={collapsed}
            />

            {/* CONFIGURATION */}
            <SidebarItem
              href="/entreprise/configuration"
              icon="ti ti-building"
              label="Configuration entreprise"
              active={entActive}
              collapsed={collapsed}
            />

            {/* PARAMETRES */}
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
          </ul>
        </div>
      </div>

      {/* FOOTER */}
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
    </div>
  )
}

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