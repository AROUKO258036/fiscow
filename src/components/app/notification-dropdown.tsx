'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { markReadAction, markAllReadAction } from '@/app/(app)/notifications/actions'

export type NotificationItem = {
  id: number
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: string | null
}

const TYPE_ICONS: Record<string, string> = {
  'reminder:7d': 'ti ti-calendar-due',
  'reminder:3d': 'ti ti-calendar-exclamation',
  'reminder:1d': 'ti ti-alert-triangle',
  declaration: 'ti ti-file-invoice',
  payment: 'ti ti-wallet',
  system: 'ti ti-info-circle',
}

function timeAgo(date: string | null): string {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'à l\'instant'
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'hier'
  return `il y a ${days} j`
}

export function NotificationDropdown({ items }: { items: NotificationItem[] }) {
  const [localItems, setLocalItems] = useState(items)
  const [pending, startTransition] = useTransition()

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.notifications)) setLocalItems(data.notifications)
    } catch {
      // silencieux : le polling échoue sans session ou hors-ligne
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const run = () => refresh().then(() => mounted && undefined)
    const timer = setTimeout(run, 0)
    const id = setInterval(run, 30_000)
    return () => {
      mounted = false
      clearTimeout(timer)
      clearInterval(id)
    }
  }, [refresh])

  const handleMarkOne = useCallback((id: number) => {
    startTransition(async () => {
      await markReadAction(id)
      setLocalItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    })
  }, [])

  const handleMarkAll = useCallback(() => {
    startTransition(async () => {
      await markAllReadAction()
      setLocalItems((prev) => prev.map((n) => ({ ...n, read: true })))
    })
  }, [])

  const unreadCount = localItems.filter((n) => !n.read).length

  return (
    <div className="me-2 notification_item">
      <a
        href="#"
        className="btn btn-menubar position-relative me-1"
        id="notification_popup"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        onClick={(e) => e.preventDefault()}
      >
        <i className="ti ti-bell"></i>
        {unreadCount > 0 && <span className="notification-status-dot"></span>}
      </a>
      <div className="dropdown-menu dropdown-menu-end notification-dropdown p-4">
        <div className="d-flex align-items-center justify-content-between border-bottom p-0 pb-3 mb-3">
          <h4 className="notification-title">Notifications</h4>
          {unreadCount > 0 && (
            <button
              type="button"
              disabled={pending}
              onClick={handleMarkAll}
              className="text-primary fs-15 me-3 lh-1 bg-transparent border-0"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
        <div className="noti-content">
          {localItems.length === 0 ? (
            <p className="text-center text-muted py-3">Aucune notification</p>
          ) : (
            <ul className="list-unstyled mb-0">
              {localItems.map((n) => {
                const Icon = TYPE_ICONS[n.type] ?? TYPE_ICONS.system
                const inner = (
                  <div
                    className={`d-flex align-items-start gap-3 rounded-2 p-2 ${n.read ? '' : 'bg-light'}`}
                    onClick={() => handleMarkOne(n.id)}
                  >
                    <span className="avatar avatar-sm bg-primary-subtle text-primary flex-shrink-0">
                      <i className={`${Icon} fs-16`}></i>
                    </span>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center gap-2">
                        <h6 className="mb-0 fs-13 fw-semibold">{n.title}</h6>
                        <small className="text-muted flex-shrink-0 fs-12">{timeAgo(n.createdAt)}</small>
                      </div>
                      <p className="mb-0 fs-13 text-muted">{n.message}</p>
                    </div>
                  </div>
                )
                return n.link ? (
                  <li key={n.id}>
                    <Link href={n.link} className="text-decoration-none text-body">
                      {inner}
                    </Link>
                  </li>
                ) : (
                  <li key={n.id}>{inner}</li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
