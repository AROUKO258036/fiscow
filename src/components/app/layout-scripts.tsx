'use client'

import { useEffect } from 'react'

declare global {
  interface HTMLElement {
    _closing?: boolean
  }
}

export function AppLayoutScripts() {
  useEffect(() => {
    // Theme toggle
    function toggleTheme(e?: Event) {
      if (e) e.preventDefault()
      const html = document.documentElement
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
      html.setAttribute('data-theme', next)
      localStorage.setItem('theme', next)
      const icons = document.querySelectorAll('#rg-theme-icon, #rg-theme-icon-mobile')
      for (let i = 0; i < icons.length; i++) {
        ;(icons[i] as HTMLElement).className = next === 'dark' ? 'ti ti-sun' : 'ti ti-moon'
      }
      const labels = document.getElementById('rg-theme-label-mobile')
      if (labels) labels.textContent = next === 'dark' ? 'Mode clair' : 'Mode sombre'
    }
    const cleanupHandlers: (() => void)[] = []

    // Theme toggle
    const toggle = document.getElementById('rg-theme-toggle')
    if (toggle) {
      toggle.addEventListener('click', toggleTheme)
      cleanupHandlers.push(() => toggle.removeEventListener('click', toggleTheme))
    }
    const toggleM = document.getElementById('rg-theme-toggle-mobile')
    if (toggleM) {
      toggleM.addEventListener('click', toggleTheme)
      cleanupHandlers.push(() => toggleM.removeEventListener('click', toggleTheme))
    }

    // Sidebar toggle + icon swap
    const toggleBtn = document.getElementById('toggle_btn')
    if (toggleBtn) {
      const btn = toggleBtn
      function updateSidebarIcon() {
        const iconEl = btn.querySelector('i') as HTMLElement | null
        if (!iconEl) return
        iconEl.className = document.body.classList.contains('mini-sidebar')
          ? 'ti ti-arrow-bar-to-right'
          : 'ti ti-arrow-bar-to-left'
      }
      const sideBarMo = window.MutationObserver
        ? new MutationObserver(updateSidebarIcon)
        : null
      if (sideBarMo) {
        sideBarMo.observe(document.body, { attributes: true, attributeFilter: ['class'] })
      }
      const onSidebarToggle = function () {
        setTimeout(updateSidebarIcon, 50)
      }
      btn.addEventListener('click', onSidebarToggle)
      cleanupHandlers.push(() => {
        btn.removeEventListener('click', onSidebarToggle)
        if (sideBarMo) sideBarMo.disconnect()
      })
      updateSidebarIcon()
    }

    // Popovers fiscaux — custom glassmorphique (remplace Bootstrap popover)
    function initTermeExplicable(el: HTMLElement) {
      if (el.dataset.teInit) return
      el.dataset.teInit = '1'

      el.addEventListener('click', function (e) {
        e.stopPropagation()
        e.preventDefault()

        const existing = document.querySelector<HTMLElement>(
          `.te-popover[data-te-trigger="${el.id}"]`,
        )
        if (existing) {
          existing.classList.remove('te-visible')
          setTimeout(function () {
            existing.remove()
          }, 200)
          const ov = document.querySelector('.te-popover-overlay')
          if (ov) ov.remove()
          return
        }

        // Close any other open popover first
        document.querySelectorAll('.te-popover.te-visible').forEach(function (p) {
          p.classList.remove('te-visible')
          ;(p as HTMLElement)._closing = true
          setTimeout(function () {
            if (p.parentNode) p.remove()
          }, 200)
        })

        const sigle = el.dataset.sigle || ''
        const nom = el.dataset.nom || ''
        const def = el.dataset.def || ''
        const exemple = el.dataset.exemple || ''

        const popover = document.createElement('div')
        popover.className = 'te-popover'
        popover.dataset.teTrigger = el.id
        popover.setAttribute('role', 'dialog')
        popover.setAttribute('aria-label', nom)

        const headerHtml = sigle
          ? '<div class="te-popover-header"><div class="te-popover-sigle"><span class="te-popover-sigle-badge">' +
            sigle +
            '</span>' +
            nom +
            '</div><button class="te-popover-close" aria-label="Fermer"><i class="ti ti-x"></i></button></div>'
          : '<div class="te-popover-header"><div class="te-popover-sigle">' +
            nom +
            '</div><button class="te-popover-close" aria-label="Fermer"><i class="ti ti-x"></i></button></div>'

        const exempleHtml = exemple
          ? '<div class="te-popover-exemple">' + exemple + '</div>'
          : ''
        const refHtml =
          '<div class="te-popover-ref"><i class="ti ti-file-text"></i> CGI Bénin 2025</div>'

        popover.innerHTML =
          headerHtml + '<p class="te-popover-def">' + def + '</p>' + exempleHtml + refHtml
        document.body.appendChild(popover)

        // Position
        const rect = el.getBoundingClientRect()
        const popHeight = popover.offsetHeight || 200
        const spaceBelow = window.innerHeight - rect.bottom - 16
        const spaceAbove = rect.top - 16
        const placement = spaceBelow < popHeight && spaceAbove > spaceBelow ? 'top' : 'bottom'
        popover.dataset.placement = placement
        popover.style.top =
          placement === 'bottom'
            ? rect.bottom + 10 + 'px'
            : Math.max(8, rect.top - popHeight - 10) + 'px'
        popover.style.left =
          Math.max(12, Math.min(rect.left - 12, window.innerWidth - popover.offsetWidth - 12)) +
          'px'

        // Trigger reflow for animation
        void popover.offsetWidth
        popover.classList.add('te-visible')

        // Close handlers
        function closePopover() {
          if (popover._closing) return
          popover._closing = true
          popover.classList.remove('te-visible')
          setTimeout(function () {
            if (popover.parentNode) popover.remove()
          }, 200)
        }

        popover.querySelector('.te-popover-close')!.addEventListener('click', closePopover)

        // Click outside (document-level, doesn't block other term-explicable clicks)
        const teDocHandler = function (teE: MouseEvent) {
          if (popover._closing) return
          const t = teE.target as Node
          if (popover.contains(t) || el.contains(t)) return
          closePopover()
          document.removeEventListener('click', teDocHandler)
        }
        setTimeout(function () {
          document.addEventListener('click', teDocHandler)
        }, 50)

        // Escape key
        const teEscHandler = function (ke: KeyboardEvent) {
          if (ke.key === 'Escape' && !popover._closing) {
            closePopover()
            document.removeEventListener('keydown', teEscHandler)
          }
        }
        document.addEventListener('keydown', teEscHandler)

        // Reposition on scroll/resize
        let repositionTimer: number
        function reposition() {
          clearTimeout(repositionTimer)
          repositionTimer = window.setTimeout(function () {
            if (!popover.parentNode) return
            const newRect = el.getBoundingClientRect()
            popover.style.top =
              placement === 'bottom'
                ? newRect.bottom + 10 + 'px'
                : Math.max(8, newRect.top - popover.offsetHeight - 10) + 'px'
            popover.style.left =
              Math.max(
                12,
                Math.min(newRect.left - 12, window.innerWidth - popover.offsetWidth - 12),
              ) + 'px'
          }, 50)
        }
        window.addEventListener('scroll', reposition, { passive: true })
        window.addEventListener('resize', reposition, { passive: true })
      })
    }

    // Init static + MutationObserver for dynamic
    document.querySelectorAll<HTMLElement>('.terme-explicable').forEach(initTermeExplicable)
    const teObserver = new MutationObserver(function () {
      document
        .querySelectorAll<HTMLElement>('.terme-explicable:not([data-te-init])')
        .forEach(initTermeExplicable)
    })
    teObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      teObserver.disconnect()
      for (let i = 0; i < cleanupHandlers.length; i++) {
        cleanupHandlers[i]()
      }
    }
  }, [])

  return null
}
