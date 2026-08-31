'use client'

/* =========================================================
   FISCOW — DECLARATION EXPORT
   PDF + CSV
   ========================================================= */


/* =========================================================
   [01] TYPES
   ========================================================= */

type DeclarationExportData = {
  id: number

  type: string
  typeLabel: string

  periode: string

  amountDue: string
  amountPaid: string

  status: string

  dueDate: string
  filedDate: string
  paidDate: string

  notes: string

  companyName: string
  companyNif: string
}


type Props = {
  data: DeclarationExportData
}


/* =========================================================
   [02] CONSTANTES FISCOW
   ========================================================= */

const COLORS = {
  orange: [255, 138, 31] as const,
  orangeDark: [226, 102, 0] as const,

  navy: [23, 33, 58] as const,
  text: [55, 49, 44] as const,
  muted: [125, 115, 107] as const,

  green: [22, 132, 75] as const,
  blue: [37, 117, 170] as const,
  red: [190, 64, 64] as const,

  border: [232, 223, 214] as const,
  soft: [250, 248, 246] as const,
  orangeSoft: [255, 248, 242] as const,
}


/* =========================================================
   [03] HELPERS
   ========================================================= */

function getReference(
  id: number,
): string {
  return `DEC-${String(id).padStart(
    4,
    '0',
  )}`
}


function getGeneratedDate(): string {
  return new Date().toLocaleDateString(
    'fr-FR',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    },
  )
}


function getFileDate(): string {
  const now = new Date()

  const year =
    now.getFullYear()

  const month =
    String(
      now.getMonth() + 1,
    ).padStart(
      2,
      '0',
    )

  const day =
    String(
      now.getDate(),
    ).padStart(
      2,
      '0',
    )

  return `${year}-${month}-${day}`
}


function cleanFilename(
  value: string,
): string {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .replace(
      /[^a-zA-Z0-9-_]/g,
      '-',
    )
}


function escapeCsv(
  value:
    | string
    | number,
): string {
  const text =
    String(value ?? '')

  if (
    text.includes(',') ||
    text.includes('"') ||
    text.includes('\n')
  ) {
    return `"${text.replace(
      /"/g,
      '""',
    )}"`
  }

  return text
}


function parseNotes(
  notes: string,
): Array<{
  label: string
  value: string
}> {
  if (!notes?.trim()) {
    return []
  }

  return notes
    .split(';')
    .map(
      item =>
        item.trim(),
    )
    .filter(Boolean)
    .map(item => {
      const separatorIndex =
        item.indexOf(':')

      if (
        separatorIndex === -1
      ) {
        return {
          label:
            'Information',
          value:
            item,
        }
      }

      return {
        label:
          item
            .slice(
              0,
              separatorIndex,
            )
            .trim(),

        value:
          item
            .slice(
              separatorIndex + 1,
            )
            .trim(),
      }
    })
}


function statusColor(
  status: string,
) {
  const normalized =
    status
      .trim()
      .toLowerCase()

  if (
    normalized.includes('pay')
  ) {
    return COLORS.green
  }

  if (
    normalized.includes('dépos') ||
    normalized.includes('depos')
  ) {
    return COLORS.blue
  }

  if (
    normalized.includes('annul')
  ) {
    return COLORS.red
  }

  return COLORS.orangeDark
}


/* =========================================================
   [04] COMPONENT
   ========================================================= */

export function DeclarationExport({
  data,
}: Props) {

  /* =======================================================
     [04.1] EXPORT CSV
     ======================================================= */

  function exportCsv() {
    const reference =
      getReference(
        data.id,
      )

    const rows = [
      [
        'Référence',
        reference,
      ],

      [
        'Entreprise',
        data.companyName,
      ],

      [
        'NIF',
        data.companyNif,
      ],

      [
        "Type d'impôt",
        data.typeLabel,
      ],

      [
        'Période',
        data.periode,
      ],

      [
        'Montant dû',
        `${data.amountDue} FCFA`,
      ],

      [
        'Montant payé',
        `${data.amountPaid} FCFA`,
      ],

      [
        'Statut',
        data.status,
      ],

      [
        "Date d'échéance",
        data.dueDate,
      ],

      [
        'Date de dépôt',
        data.filedDate,
      ],

      [
        'Date de paiement',
        data.paidDate,
      ],

      [
        'Données utilisées',
        data.notes,
      ],
    ]

    const csv =
      '\uFEFF' +
      rows
        .map(row =>
          row
            .map(
              value =>
                escapeCsv(
                  value,
                ),
            )
            .join(';'),
        )
        .join('\n')

    const blob =
      new Blob(
        [csv],
        {
          type:
            'text/csv;charset=utf-8;',
        },
      )

    const url =
      URL.createObjectURL(
        blob,
      )

    const link =
      document.createElement(
        'a',
      )

    link.href =
      url

    link.download =
      cleanFilename(
        `fiscow-${reference}-${data.typeLabel}-${data.periode}.csv`,
      )

    document.body.appendChild(
      link,
    )

    link.click()

    document.body.removeChild(
      link,
    )

    URL.revokeObjectURL(
      url,
    )
  }


  /* =======================================================
     [04.2] EXPORT PDF
     ======================================================= */

  async function exportPdf() {
    const {
      jsPDF,
    } = await import(
      'jspdf'
    )

    const doc =
      new jsPDF({
        orientation:
          'portrait',

        unit:
          'mm',

        format:
          'a4',
      })

    const pageWidth =
      doc.internal.pageSize.getWidth()

    const pageHeight =
      doc.internal.pageSize.getHeight()

    const margin = 16

    const contentWidth =
      pageWidth -
      margin * 2

    const reference =
      getReference(
        data.id,
      )

    const notes =
      parseNotes(
        data.notes,
      )

    let y = 17


    /* =====================================================
       [05] HEADER FISCOW
       ===================================================== */

    doc.setFont(
      'helvetica',
      'bold',
    )

    doc.setFontSize(
      22,
    )

    doc.setTextColor(
      ...COLORS.navy,
    )

    doc.text(
      'Fiscow',
      margin,
      y,
    )

    const fiscowWidth =
      doc.getTextWidth(
        'Fiscow',
      )

    doc.setTextColor(
      ...COLORS.orange,
    )

    doc.text(
      '.',
      margin +
        fiscowWidth +
        0.6,
      y,
    )

    doc.setFont(
      'helvetica',
      'normal',
    )

    doc.setFontSize(
      8,
    )

    doc.setTextColor(
      ...COLORS.muted,
    )

    doc.text(
      'Suivi fiscal & conformité',
      margin,
      y + 6,
    )

    doc.setDrawColor(
      ...COLORS.border,
    )

    doc.setLineWidth(
      0.3,
    )

    doc.line(
      margin,
      y + 11,
      pageWidth -
        margin,
      y + 11,
    )

    y += 23


    /* =====================================================
       [06] TITRE DÉCLARATION
       ===================================================== */

    doc.setFont(
      'helvetica',
      'bold',
    )

    doc.setFontSize(
      8,
    )

    doc.setTextColor(
      ...COLORS.orangeDark,
    )

    doc.text(
      'DÉCLARATION FISCALE',
      margin,
      y,
    )

    y += 7

    doc.setFontSize(
      18,
    )

    doc.setTextColor(
      ...COLORS.navy,
    )

    doc.text(
      `${data.typeLabel} — Période ${data.periode}`,
      margin,
      y,
    )

    y += 8

    doc.setFont(
      'helvetica',
      'normal',
    )

    doc.setFontSize(
      8,
    )

    doc.setTextColor(
      ...COLORS.muted,
    )

    doc.text(
      `Référence : ${reference}`,
      margin,
      y,
    )


    /* STATUS BADGE */

    const badgeColor =
      statusColor(
        data.status,
      )

    const badgeWidth =
      Math.max(
        24,
        doc.getTextWidth(
          data.status,
        ) + 10,
      )

    const badgeX =
      pageWidth -
      margin -
      badgeWidth

    doc.setFillColor(
      ...badgeColor,
    )

    doc.roundedRect(
      badgeX,
      y - 5,
      badgeWidth,
      7,
      3,
      3,
      'F',
    )

    doc.setFont(
      'helvetica',
      'bold',
    )

    doc.setFontSize(
      7,
    )

    doc.setTextColor(
      255,
      255,
      255,
    )

    doc.text(
      data.status.toUpperCase(),
      badgeX +
        badgeWidth / 2,
      y - 0.6,
      {
        align:
          'center',
      },
    )

    y += 13


    /* =====================================================
       [07] ENTREPRISE
       ===================================================== */

    drawSectionTitle(
      doc,
      'ENTREPRISE',
      margin,
      y,
    )

    y += 7

    doc.setFillColor(
      ...COLORS.soft,
    )

    doc.roundedRect(
      margin,
      y,
      contentWidth,
      22,
      3,
      3,
      'F',
    )

    doc.setFont(
      'helvetica',
      'bold',
    )

    doc.setFontSize(
      11,
    )

    doc.setTextColor(
      ...COLORS.navy,
    )

    doc.text(
      data.companyName,
      margin + 5,
      y + 8,
    )

    doc.setFont(
      'helvetica',
      'normal',
    )

    doc.setFontSize(
      8,
    )

    doc.setTextColor(
      ...COLORS.muted,
    )

    doc.text(
      `NIF : ${data.companyNif}`,
      margin + 5,
      y + 15,
    )

    y += 31


    /* =====================================================
       [08] RÉSUMÉ FISCAL
       ===================================================== */

    drawSectionTitle(
      doc,
      'RÉSUMÉ DE LA DÉCLARATION',
      margin,
      y,
    )

    y += 7

    y = drawInfoRow(
      doc,
      margin,
      y,
      contentWidth,
      "Type d'impôt",
      data.typeLabel,
    )

    y = drawInfoRow(
      doc,
      margin,
      y,
      contentWidth,
      'Période fiscale',
      data.periode,
      true,
    )

    y = drawInfoRow(
      doc,
      margin,
      y,
      contentWidth,
      "Date d'échéance",
      data.dueDate,
    )

    y += 6


    /* =====================================================
       [09] MONTANTS
       ===================================================== */

    const boxGap = 4

    const boxWidth =
      (
        contentWidth -
        boxGap * 2
      ) / 3

    drawAmountBox(
      doc,
      margin,
      y,
      boxWidth,
      'Montant dû',
      `${data.amountDue} FCFA`,
      COLORS.orangeDark,
    )

    drawAmountBox(
      doc,
      margin +
        boxWidth +
        boxGap,
      y,
      boxWidth,
      'Montant payé',
      `${data.amountPaid} FCFA`,
      COLORS.green,
    )

    const due =
      parseAmount(
        data.amountDue,
      )

    const paid =
      parseAmount(
        data.amountPaid,
      )

    const remaining =
      Math.max(
        0,
        due -
          paid,
      )

    drawAmountBox(
      doc,
      margin +
        (
          boxWidth +
          boxGap
        ) *
          2,
      y,
      boxWidth,
      'Reste à payer',
      `${formatNumber(
        remaining,
      )} FCFA`,
      remaining > 0
        ? COLORS.orangeDark
        : COLORS.green,
    )

    y += 28


    /* =====================================================
       [10] SUIVI
       ===================================================== */

    drawSectionTitle(
      doc,
      'SUIVI',
      margin,
      y,
    )

    y += 7

    y = drawInfoRow(
      doc,
      margin,
      y,
      contentWidth,
      'Statut',
      data.status,
    )

    y = drawInfoRow(
      doc,
      margin,
      y,
      contentWidth,
      'Date de dépôt',
      data.filedDate,
      true,
    )

    y = drawInfoRow(
      doc,
      margin,
      y,
      contentWidth,
      'Date de paiement',
      data.paidDate,
    )

    y += 8


    /* =====================================================
       [11] DONNÉES UTILISÉES
       ===================================================== */

    if (
      notes.length > 0
    ) {
      if (
        y >
        pageHeight - 65
      ) {
        doc.addPage()
        y = 20
      }

      drawSectionTitle(
        doc,
        'DONNÉES UTILISÉES',
        margin,
        y,
      )

      y += 7

      for (
        let index = 0;
        index <
        notes.length;
        index++
      ) {
        const item =
          notes[index]

        y = drawInfoRow(
          doc,
          margin,
          y,
          contentWidth,
          item.label,
          formatPossibleAmount(
            item.value,
          ),
          index % 2 === 1,
        )
      }

      y += 5
    }


    /* =====================================================
       [12] FOOTER
       ===================================================== */

    const footerY =
      pageHeight - 14

    doc.setDrawColor(
      ...COLORS.border,
    )

    doc.line(
      margin,
      footerY - 5,
      pageWidth -
        margin,
      footerY - 5,
    )

    doc.setFont(
      'helvetica',
      'normal',
    )

    doc.setFontSize(
      7,
    )

    doc.setTextColor(
      ...COLORS.muted,
    )

    doc.text(
      `Document généré le ${getGeneratedDate()}`,
      margin,
      footerY,
    )

    doc.setFont(
      'helvetica',
      'bold',
    )

    doc.setTextColor(
      ...COLORS.navy,
    )

    doc.text(
      'Fiscow',
      pageWidth -
        margin -
        23,
      footerY,
    )

    const footerBrandWidth =
      doc.getTextWidth(
        'Fiscow',
      )

    doc.setTextColor(
      ...COLORS.orange,
    )

    doc.text(
      '.',
      pageWidth -
        margin -
        23 +
        footerBrandWidth +
        0.3,
      footerY,
    )


    /* =====================================================
       [13] SAVE
       ===================================================== */

    doc.save(
      cleanFilename(
        `fiscow-${reference}-${data.typeLabel}-${data.periode}-${getFileDate()}.pdf`,
      ),
    )
  }


  /* =======================================================
     [14] BUTTONS
     ======================================================= */

  return (
    <>
      <button
        type="button"
        onClick={
          exportPdf
        }
        aria-label="Exporter en PDF"
        style={{
          height:
            '42px',

          padding:
            '0 16px',

          display:
            'inline-flex',

          alignItems:
            'center',

          justifyContent:
            'center',

          gap:
            '7px',

          border:
            '1px solid #ff6500',

          borderRadius:
            '11px',

          background:
            '#ffffff',

          color:
            '#ff6500',

          fontSize:
            '10px',

          fontWeight:
            800,

          cursor:
            'pointer',
        }}
      >
        <i className="ti ti-file-type-pdf" />

        <span>
          PDF
        </span>
      </button>

      <button
        type="button"
        onClick={
          exportCsv
        }
        aria-label="Exporter en CSV"
        style={{
          height:
            '42px',

          padding:
            '0 16px',

          display:
            'inline-flex',

          alignItems:
            'center',

          justifyContent:
            'center',

          gap:
            '7px',

          border:
            '1px solid #0b5775',

          borderRadius:
            '11px',

          background:
            '#ffffff',

          color:
            '#0b5775',

          fontSize:
            '10px',

          fontWeight:
            800,

          cursor:
            'pointer',
        }}
      >
        <i className="ti ti-file-type-csv" />

        <span>
          CSV
        </span>
      </button>
    </>
  )
}


/* =========================================================
   [15] PDF HELPERS
   ========================================================= */

function drawSectionTitle(
  doc: any,
  title: string,
  x: number,
  y: number,
) {
  doc.setFont(
    'helvetica',
    'bold',
  )

  doc.setFontSize(
    8,
  )

  doc.setTextColor(
    ...COLORS.orangeDark,
  )

  doc.text(
    title,
    x,
    y,
  )
}


function drawInfoRow(
  doc: any,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  alternate = false,
): number {
  const height = 10

  if (alternate) {
    doc.setFillColor(
      ...COLORS.soft,
    )

    doc.rect(
      x,
      y,
      width,
      height,
      'F',
    )
  }

  doc.setFont(
    'helvetica',
    'normal',
  )

  doc.setFontSize(
    8,
  )

  doc.setTextColor(
    ...COLORS.muted,
  )

  doc.text(
    label,
    x + 4,
    y + 6.4,
  )

  doc.setFont(
    'helvetica',
    'bold',
  )

  doc.setTextColor(
    ...COLORS.text,
  )

  doc.text(
    value || '—',
    x +
      width -
      4,
    y + 6.4,
    {
      align:
        'right',
    },
  )

  return y + height
}


function drawAmountBox(
  doc: any,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  color:
    readonly [
      number,
      number,
      number,
    ],
) {
  doc.setFillColor(
    ...COLORS.orangeSoft,
  )

  doc.setDrawColor(
    ...COLORS.border,
  )

  doc.roundedRect(
    x,
    y,
    width,
    21,
    3,
    3,
    'FD',
  )

  doc.setFont(
    'helvetica',
    'normal',
  )

  doc.setFontSize(
    7,
  )

  doc.setTextColor(
    ...COLORS.muted,
  )

  doc.text(
    label,
    x + 4,
    y + 6,
  )

  doc.setFont(
    'helvetica',
    'bold',
  )

  doc.setFontSize(
    10,
  )

  doc.setTextColor(
    ...color,
  )

  doc.text(
    value,
    x + 4,
    y + 15,
  )
}


/* =========================================================
   [16] AMOUNT HELPERS
   ========================================================= */

function parseAmount(
  value: string,
): number {
  const digits =
    value.replace(
      /[^\d-]/g,
      '',
    )

  const parsed =
    Number(digits)

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0
}


function formatNumber(
  value: number,
): string {
  return value.toLocaleString(
    'fr-FR',
  )
}


function formatPossibleAmount(
  value: string,
): string {
  const trimmed =
    value.trim()

  if (
    !/^-?\d+([.,]\d+)?$/.test(
      trimmed,
    )
  ) {
    return trimmed
  }

  const number =
    Number(
      trimmed.replace(
        ',',
        '.',
      ),
    )

  if (
    !Number.isFinite(
      number,
    )
  ) {
    return trimmed
  }

  return `${number.toLocaleString(
    'fr-FR',
  )} FCFA`
}