'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface Flash {
  type: 'success' | 'error'
  message: string
}

function readFlash(): Flash | null {
  const raw = document.cookie
    .split('; ')
    .find((row) => row.startsWith('rg_flash='))
    ?.split('=')[1]
  if (!raw) return null
  try {
    return JSON.parse(decodeURIComponent(raw)) as Flash
  } catch {
    return null
  }
}

function clearFlash() {
  document.cookie = 'rg_flash=; path=/; max-age=0'
}

export function FlashAlerts() {
  const pathname = usePathname()
  const [flash, setFlash] = useState<Flash | null>(null)

  useEffect(() => {
    const f = readFlash()
    if (f) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFlash(f)
      clearFlash()
    } else {
      setFlash(null)
    }
  }, [pathname])

  if (!flash) return null

  return (
    <div
      className={`alert alert-${flash.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show d-flex align-items-center`}
      role="alert"
    >
      <i className={`ti ${flash.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'} me-2`}></i> {flash.message}
      <button
        type="button"
        className="btn-close ms-auto"
        data-bs-dismiss="alert"
        aria-label="Fermer"
        onClick={() => setFlash(null)}
      ></button>
    </div>
  )
}


