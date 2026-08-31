'use client'

import { useState } from 'react'

// =========================================================
// [01] TYPES
// =========================================================

export type GlobalReportDeclaration = {
  id: number
  type: string
  typeLabel: string
  periode: string
  amountDue: number
  amountPaid: number
  status: string
  dueDate: Date | string | null
  filedDate?: Date | string | null
  paidDate?: Date | string | null
}

export type GlobalReportCompany = {
  name: string
  nif?: string | null
  rccm?: string | null
  sector?: string | null
}

type GlobalReportExportProps = {
  company: GlobalReportCompany
  declarations: GlobalReportDeclaration[]
}

// =========================================================
// [02] CONSTANTES
// =========================================================

const COLORS = {
  orange: [255, 138, 31] as [number, number, number],
  navy: [23, 33, 58] as [number, number, number],
  muted: [125, 115, 107] as [number, number, number],
  border: [232, 223, 214] as [number, number, number],
  light: [250, 248, 246] as [number, number, number],
  green: [22, 132, 75] as [number, number, number],
  red: [190, 48, 48] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  brouillon: 'Brouillon',
  filed: 'Déposée',
  deposee: 'Déposée',
  paid: 'Payée',
  payee: 'Payée',
  cancelled: 'Annulée',
  annulee: 'Annulée',
  overdue: 'En retard',
  en_retard: 'En retard',
}

// =========================================================
// [03] HELPERS
// =========================================================

function formatMoney(value: number) {
  return `${new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)} FCFA`
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return '—'

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function getStatusLabel(status: string) {
  const normalized = status.toLowerCase()
  return STATUS_LABELS[normalized] ?? status
}

function isLate(item: GlobalReportDeclaration) {
  if (!item.dueDate) return false

  const status = item.status.toLowerCase()
  if (['paid', 'payee', 'cancelled', 'annulee'].includes(status)) {
    return false
  }

  const dueDate = new Date(item.dueDate)
  if (Number.isNaN(dueDate.getTime())) return false

  return dueDate.getTime() < Date.now()
}

function safeText(value: string | null | undefined) {
  const cleaned = value?.trim()
  return cleaned && cleaned.length > 0 ? cleaned : '—'
}

// =========================================================
// [04] COMPOSANT
// =========================================================

export function GlobalReportExport({
  company,
  declarations,
}: GlobalReportExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  // =======================================================
  // [05] EXPORT PDF
  // =======================================================

  async function handleExportPdf() {
    if (isExporting) return

    setIsExporting(true)

    try {
      const { jsPDF } = await import('jspdf')

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const marginX = 15
      const contentWidth = pageWidth - marginX * 2
      const bottomLimit = pageHeight - 18

      let y = 16
      let pageNumber = 1

      // ===================================================
      // [06] OUTILS PDF
      // ===================================================

      const setText = (
        color: [number, number, number],
        size: number,
        style: 'normal' | 'bold' = 'normal',
      ) => {
        doc.setTextColor(...color)
        doc.setFont('helvetica', style)
        doc.setFontSize(size)
      }

      const drawFooter = () => {
        doc.setDrawColor(...COLORS.border)
        doc.line(marginX, pageHeight - 13, pageWidth - marginX, pageHeight - 13)

        setText(COLORS.muted, 7.5)
        doc.text(
          'Fiscow — Gestion fiscale simplifiée',
          marginX,
          pageHeight - 8,
        )
        doc.text(
          `Page ${pageNumber}`,
          pageWidth - marginX,
          pageHeight - 8,
          { align: 'right' },
        )
      }

      const addPage = () => {
        drawFooter()
        doc.addPage()
        pageNumber += 1
        y = 16
      }

      const ensureSpace = (requiredHeight: number) => {
        if (y + requiredHeight > bottomLimit) {
          addPage()
        }
      }

      const sectionTitle = (title: string) => {
        ensureSpace(14)

        setText(COLORS.navy, 10, 'bold')
        doc.text(title.toUpperCase(), marginX, y)

        y += 3
        doc.setDrawColor(...COLORS.orange)
        doc.setLineWidth(0.8)
        doc.line(marginX, y, marginX + 18, y)

        y += 7
      }

      // ===================================================
      // [07] EN-TÊTE
      // ===================================================

      setText(COLORS.orange, 18, 'bold')
      doc.text('Fiscow.', marginX, y)

      setText(COLORS.navy, 15, 'bold')
      doc.text('Rapport fiscal global', marginX, y + 10)

      setText(COLORS.muted, 8.5)
      doc.text(
        `Généré le ${formatDate(new Date())}`,
        pageWidth - marginX,
        y,
        { align: 'right' },
      )

      y += 19

      doc.setDrawColor(...COLORS.border)
      doc.line(marginX, y, pageWidth - marginX, y)
      y += 9

      // ===================================================
      // [08] ENTREPRISE
      // ===================================================

      sectionTitle('Entreprise')

      const companyBoxHeight = 35
      ensureSpace(companyBoxHeight + 4)

      doc.setFillColor(...COLORS.light)
      doc.setDrawColor(...COLORS.border)
      doc.roundedRect(
        marginX,
        y,
        contentWidth,
        companyBoxHeight,
        3,
        3,
        'FD',
      )

      const leftX = marginX + 6
      const rightX = marginX + contentWidth / 2 + 3

      setText(COLORS.muted, 7.5, 'bold')
      doc.text('ENTREPRISE', leftX, y + 7)
      doc.text('NIF', rightX, y + 7)

      setText(COLORS.navy, 9.5, 'bold')
      doc.text(safeText(company.name), leftX, y + 13)
      doc.text(safeText(company.nif), rightX, y + 13)

      setText(COLORS.muted, 7.5, 'bold')
      doc.text('RCCM', leftX, y + 22)
      doc.text('SECTEUR', rightX, y + 22)

      setText(COLORS.navy, 9)
      doc.text(safeText(company.rccm), leftX, y + 28)
      doc.text(safeText(company.sector), rightX, y + 28)

      y += companyBoxHeight + 10

      // ===================================================
      // [09] DÉCLARATIONS
      // ===================================================

      sectionTitle('Déclarations')

      if (declarations.length === 0) {
        ensureSpace(24)

        doc.setFillColor(...COLORS.light)
        doc.setDrawColor(...COLORS.border)
        doc.roundedRect(marginX, y, contentWidth, 20, 3, 3, 'FD')

        setText(COLORS.muted, 9)
        doc.text(
          'Aucune déclaration fiscale enregistrée.',
          pageWidth / 2,
          y + 12,
          { align: 'center' },
        )

        y += 28
      } else {
        // =================================================
        // [10] TABLEAU DES DÉCLARATIONS
        // =================================================

        const columns = [
          { label: 'Taxe', width: 22 },
          { label: 'Période', width: 27 },
          { label: 'Échéance', width: 27 },
          { label: 'Dû', width: 35 },
          { label: 'Payé', width: 35 },
          { label: 'Statut', width: 34 },
        ]

        const rowHeight = 10
        const headerHeight = 9

        const drawTableHeader = () => {
          ensureSpace(headerHeight + rowHeight)

          doc.setFillColor(...COLORS.navy)
          doc.roundedRect(
            marginX,
            y,
            contentWidth,
            headerHeight,
            2,
            2,
            'F',
          )

          let x = marginX
          setText(COLORS.white, 7.2, 'bold')

          for (const column of columns) {
            doc.text(column.label, x + 2, y + 5.8)
            x += column.width
          }

          y += headerHeight
        }

        drawTableHeader()

        const sortedDeclarations = [...declarations].sort((a, b) => {
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0
          return bDate - aDate
        })

        sortedDeclarations.forEach((item, index) => {
          if (y + rowHeight > bottomLimit) {
            addPage()
            sectionTitle('Déclarations — suite')
            drawTableHeader()
          }

          if (index % 2 === 0) {
            doc.setFillColor(...COLORS.light)
            doc.rect(marginX, y, contentWidth, rowHeight, 'F')
          }

          doc.setDrawColor(...COLORS.border)
          doc.line(marginX, y + rowHeight, pageWidth - marginX, y + rowHeight)

          let x = marginX
          const values = [
            item.typeLabel || item.type.toUpperCase(),
            item.periode || '—',
            formatDate(item.dueDate),
            formatMoney(item.amountDue),
            formatMoney(item.amountPaid),
            isLate(item) ? 'En retard' : getStatusLabel(item.status),
          ]

          values.forEach((value, columnIndex) => {
            const column = columns[columnIndex]
            const maxWidth = column.width - 4

            if (columnIndex === 5 && isLate(item)) {
              setText(COLORS.red, 6.8, 'bold')
            } else if (
              columnIndex === 5 &&
              ['paid', 'payee'].includes(item.status.toLowerCase())
            ) {
              setText(COLORS.green, 6.8, 'bold')
            } else {
              setText(COLORS.navy, 6.8, columnIndex === 0 ? 'bold' : 'normal')
            }

            const displayValue = doc.splitTextToSize(String(value), maxWidth)[0]
            doc.text(displayValue, x + 2, y + 6.2)
            x += column.width
          })

          y += rowHeight
        })

        y += 10
      }

      // ===================================================
      // [11] DÉTAIL PAR TAXE
      // ===================================================

      if (declarations.length > 0) {
        sectionTitle('Détail par taxe')

        const grouped = declarations.reduce<
          Record<string, GlobalReportDeclaration[]>
        >((acc, item) => {
          const key = item.typeLabel || item.type.toUpperCase()
          if (!acc[key]) acc[key] = []
          acc[key].push(item)
          return acc
        }, {})

        Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b, 'fr'))
          .forEach(([taxLabel, items]) => {
            const totalDue = items.reduce(
              (sum, item) => sum + Number(item.amountDue || 0),
              0,
            )
            const totalPaid = items.reduce(
              (sum, item) => sum + Number(item.amountPaid || 0),
              0,
            )

            ensureSpace(21)

            doc.setFillColor(...COLORS.light)
            doc.setDrawColor(...COLORS.border)
            doc.roundedRect(marginX, y, contentWidth, 17, 2.5, 2.5, 'FD')

            setText(COLORS.navy, 9.5, 'bold')
            doc.text(taxLabel, marginX + 5, y + 7)

            setText(COLORS.muted, 7.5)
            doc.text(
              `${items.length} déclaration${items.length > 1 ? 's' : ''}`,
              marginX + 5,
              y + 12.5,
            )

            setText(COLORS.navy, 8)
            doc.text(
              `Dû : ${formatMoney(totalDue)}`,
              marginX + 75,
              y + 7,
            )
            doc.text(
              `Payé : ${formatMoney(totalPaid)}`,
              marginX + 75,
              y + 12.5,
            )

            y += 21
          })
      }

      // ===================================================
      // [12] FIN DU DOCUMENT
      // ===================================================

      ensureSpace(18)
      y += 3

      doc.setDrawColor(...COLORS.border)
      doc.line(marginX, y, pageWidth - marginX, y)
      y += 7

      setText(COLORS.muted, 7.5)
      doc.text(
        'Ce document récapitule les déclarations enregistrées dans Fiscow à la date de génération.',
        marginX,
        y,
      )

      drawFooter()

      // ===================================================
      // [13] TÉLÉCHARGEMENT
      // ===================================================

      const dateStamp = new Date().toISOString().slice(0, 10)
      doc.save(`fiscow-rapport-fiscal-global-${dateStamp}.pdf`)
    } catch (error) {
      console.error('Erreur export PDF global Fiscow :', error)
    } finally {
      setIsExporting(false)
    }
  }

  // =======================================================
  // [14] RENDER
  // =======================================================

  return (
    <button
      type="button"
      className="fiscow-dashboard-export-btn"
      onClick={handleExportPdf}
      disabled={isExporting}
      title="Exporter le rapport fiscal global en PDF"
    >
      <i className="ti ti-file-type-pdf" aria-hidden="true" />
      <span>{isExporting ? 'Génération...' : 'Export PDF'}</span>
    </button>
  )
}

export default GlobalReportExport
