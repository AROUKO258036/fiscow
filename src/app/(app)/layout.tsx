import type { ReactNode } from 'react'
import Script from 'next/script'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNotifications } from '@/lib/notification-service'

import { FlashAlerts } from '@/components/app/flash-alerts'
import { AppLayoutScripts } from '@/components/app/layout-scripts'
import { AppShell } from '@/components/app/app-shell'

/* =========================================================
   [01] LABELS DES TAXES POUR LE RAPPORT PDF GLOBAL
   ========================================================= */

const TAXE_LABELS: Record<string, string> = {
  is: 'IS',
  iba: 'IBA',
  tva: 'TVA',
  its: 'ITS',
  cnss: 'CNSS',
  tps: 'TPS',
  tfu: 'TFU',
  patente: 'Patente',
}

/* =========================================================
   [02] LAYOUT APPLICATION
   ========================================================= */

export default async function AppLayout({
  children,
}: {
  children: ReactNode
}) {
  /* =======================================================
     [02.1] SESSION
     ======================================================= */

  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const user = {
    name: session.user.name ?? 'Utilisateur',
    email: session.user.email ?? '',
    role: session.user.role ?? 'USER',
  }

  const userId = Number(session.user.id)

  if (!Number.isFinite(userId)) {
    redirect('/login')
  }

  /* =======================================================
     [02.2] UTILISATEUR BDD
     ======================================================= */

  const dbUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      emailVerifiedAt: true,
    },
  })

  if (!dbUser) {
    redirect('/login')
  }

  if (!dbUser.emailVerifiedAt) {
    redirect('/verify-email')
  }

  /* =======================================================
     [02.3] NOTIFICATIONS
     ======================================================= */

  const notifications = await getNotifications(userId, 8).catch(() => [])

  const notificationItems = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link,
    read: n.read,
    createdAt: n.createdAt?.toISOString() ?? null,
  }))

  /* =======================================================
     [02.4] ENTREPRISE POUR EXPORT PDF GLOBAL
     ======================================================= */

  const company = await prisma.company.findFirst({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  /* =======================================================
     [02.5] TOUTES LES DÉCLARATIONS DE L'ENTREPRISE
     ======================================================= */

  const declarations = company
    ? await prisma.declaration.findMany({
        where: {
          companyId: company.id,
        },
        orderBy: {
          dueDate: 'desc',
        },
      })
    : []

  /* =======================================================
     [02.6] DONNÉES SÉRIALISABLES POUR LE HEADER CLIENT
     ======================================================= */

  const reportCompany = company
    ? {
        name: company.raisonSociale,
        nif: company.nif,
        rccm: company.rccm,
        sector: company.secteur,
      }
    : undefined

  const reportDeclarations = declarations.map((item) => ({
    id: item.id,

    type: item.type,

    typeLabel:
      TAXE_LABELS[item.type] ?? item.type.toUpperCase(),

    periode: item.periode,

    amountDue: Number(item.amountDue),
    amountPaid: Number(item.amountPaid),

    status: item.status,

    dueDate: item.dueDate
      ? item.dueDate.toISOString()
      : null,

    filedDate: item.filedDate
      ? item.filedDate.toISOString()
      : null,

    paidDate: item.paidDate
      ? item.paidDate.toISOString()
      : null,
  }))

  /* =======================================================
     [03] RENDER
     ======================================================= */

  return (
    <>
      {/* CSS existants */}
      <link rel="stylesheet" href="/regule/css/bootstrap.min.css" />
      <link
        rel="stylesheet"
        href="/regule/plugins/tabler-icons/tabler-icons.min.css"
      />
      <link
        rel="stylesheet"
        href="/regule/plugins/select2/css/select2.min.css"
      />
      <link
        rel="stylesheet"
        href="/regule/plugins/fontawesome/css/fontawesome.min.css"
      />
      <link
        rel="stylesheet"
        href="/regule/plugins/fontawesome/css/all.min.css"
      />
      <link
        rel="stylesheet"
        href="/regule/css/bootstrap-datetimepicker.min.css"
      />
      <link
        rel="stylesheet"
        href="/regule/plugins/daterangepicker/daterangepicker.css"
      />
      <link
        rel="stylesheet"
        href="/regule/plugins/flatpickr/flatpickr.min.css"
      />
      <link rel="stylesheet" href="/regule/css/style.css" />
      <link rel="stylesheet" href="/regule/css/regule-theme.css" />

      {/* AppShell décide si la sidebar doit être affichée */}
      <AppShell
        user={user}
        notifications={notificationItems}
        reportCompany={reportCompany}
        reportDeclarations={reportDeclarations}
      >
        <FlashAlerts />
        {children}
      </AppShell>

      <AppLayoutScripts />

      {/* Scripts existants */}
      <Script
        src="/regule/js/jquery-3.7.1.min.js"
        strategy="afterInteractive"
      />

      <Script
        src="/regule/js/bootstrap.bundle.min.js"
        strategy="afterInteractive"
      />

      <Script
        src="/regule/js/jquery.slimscroll.min.js"
        strategy="afterInteractive"
      />

      <Script
        src="/regule/js/moment.min.js"
        strategy="afterInteractive"
      />

      <Script
        src="/regule/plugins/daterangepicker/daterangepicker.js"
        strategy="afterInteractive"
      />

      <Script
        src="/regule/plugins/apexchart/apexcharts.min.js"
        strategy="afterInteractive"
      />

      <Script
        src="/regule/plugins/apexchart/chart-data.js"
        strategy="afterInteractive"
      />

      <Script
        src="/regule/js/bootstrap-datetimepicker.min.js"
        strategy="afterInteractive"
      />

      <Script
        src="/regule/plugins/select2/js/select2.min.js"
        strategy="afterInteractive"
      />

      <Script
        src="/regule/plugins/fullcalendar/core.global.min.js"
        strategy="afterInteractive"
      />

      <Script
        src="/regule/plugins/fullcalendar/daygrid.global.min.js"
        strategy="afterInteractive"
      />

      <Script
        src="/regule/js/script.js"
        strategy="afterInteractive"
      />
    </>
  )
}
