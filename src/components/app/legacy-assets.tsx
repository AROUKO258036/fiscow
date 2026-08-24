'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

/**
 * Legacy Regule assets are still required by screens that have not yet been
 * migrated. The Fiscow dashboard is deliberately isolated from them so that
 * Bootstrap/style.css cannot alter the Tailwind/shadcn shell or sidebar.
 */
export function LegacyAssets() {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/')

  if (isDashboard) {
    // ApexCharts is the only legacy runtime dependency still used by the dashboard.
    // It has no global CSS, so it cannot affect the Fiscow shell.
    return <Script src="/regule/plugins/apexchart/apexcharts.min.js" strategy="afterInteractive" />
  }

  return (
    <>
      <link rel="stylesheet" href="/regule/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/regule/plugins/tabler-icons/tabler-icons.min.css" />
      <link rel="stylesheet" href="/regule/plugins/select2/css/select2.min.css" />
      <link rel="stylesheet" href="/regule/plugins/fontawesome/css/fontawesome.min.css" />
      <link rel="stylesheet" href="/regule/plugins/fontawesome/css/all.min.css" />
      <link rel="stylesheet" href="/regule/css/bootstrap-datetimepicker.min.css" />
      <link rel="stylesheet" href="/regule/plugins/daterangepicker/daterangepicker.css" />
      <link rel="stylesheet" href="/regule/plugins/flatpickr/flatpickr.min.css" />
      <link rel="stylesheet" href="/regule/css/style.css" />
      <link rel="stylesheet" href="/regule/css/regule-theme.css" />

      <Script src="/regule/js/jquery-3.7.1.min.js" strategy="afterInteractive" />
      <Script src="/regule/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/regule/js/jquery.slimscroll.min.js" strategy="afterInteractive" />
      <Script src="/regule/js/moment.min.js" strategy="afterInteractive" />
      <Script src="/regule/plugins/daterangepicker/daterangepicker.js" strategy="afterInteractive" />
      <Script src="/regule/plugins/apexchart/apexcharts.min.js" strategy="afterInteractive" />
      <Script src="/regule/js/bootstrap-datetimepicker.min.js" strategy="afterInteractive" />
      <Script src="/regule/plugins/select2/js/select2.min.js" strategy="afterInteractive" />
      <Script src="/regule/plugins/fullcalendar/core.global.min.js" strategy="afterInteractive" />
      <Script src="/regule/plugins/fullcalendar/daygrid.global.min.js" strategy="afterInteractive" />
      <Script src="/regule/js/script.js" strategy="afterInteractive" />
    </>
  )
}
