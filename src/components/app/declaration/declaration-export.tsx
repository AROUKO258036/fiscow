'use client'

import { jsPDF } from 'jspdf'

export type DeclarationExportData = {
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

export function DeclarationExport({ data }: { data: DeclarationExportData }) {
  const handlePdf = () => {
    const doc = new jsPDF()
    const left = 20

    doc.setFillColor(11, 31, 38)
    doc.rect(0, 0, 210, 34, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Regule', left, 17)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Conformité fiscale au Bénin', left, 25)

    doc.setTextColor(26, 46, 54)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`Déclaration ${data.typeLabel} — Période ${data.periode}`, left, 46)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 122, 130)
    doc.text(`N° ${data.id}`, left, 53)

    const rows: [string, string][] = [
      ['Entreprise', data.companyName],
      ['NIF', data.companyNif],
      ["Type d'impôt", data.typeLabel],
      ['Période', data.periode],
      ['Montant dû', `${data.amountDue} FCFA`],
      ['Montant payé', `${data.amountPaid} FCFA`],
      ['Statut', data.status],
      ["Date d'échéance", data.dueDate],
      ['Date de dépôt', data.filedDate],
      ['Date de paiement', data.paidDate],
    ]

    let y = 68
    doc.setFillColor(248, 250, 251)
    doc.setDrawColor(238, 241, 244)
    for (const [label, value] of rows) {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.setFillColor(y % 2 === 0 ? 248 : 255, 250, 251)
      doc.rect(left - 5, y - 5, 170, 12, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(26, 46, 54)
      doc.setFontSize(10)
      doc.text(label, left, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60, 80, 90)
      doc.text(String(value), left + 80, y)
      y += 14
    }

    if (data.notes) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(26, 46, 54)
      doc.text('Notes', left, y + 6)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60, 80, 90)
      doc.text(doc.splitTextToSize(data.notes, 160), left, y + 14)
    }

    doc.setFontSize(9)
    doc.setTextColor(107, 122, 130)
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, left, 287)

    doc.save(`declaration-${data.typeLabel}-${data.periode}.pdf`)
  }

  const handleCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
    const lines = [
      ['Champ', 'Valeur'].map(esc).join(','),
      ['Entreprise', data.companyName].map(esc).join(','),
      ['NIF', data.companyNif].map(esc).join(','),
      ["Type d'impôt", data.typeLabel].map(esc).join(','),
      ['Période', data.periode].map(esc).join(','),
      ['Montant dû', `${data.amountDue} FCFA`].map(esc).join(','),
      ['Montant payé', `${data.amountPaid} FCFA`].map(esc).join(','),
      ['Statut', data.status].map(esc).join(','),
      ["Date d'échéance", data.dueDate].map(esc).join(','),
      ['Date de dépôt', data.filedDate].map(esc).join(','),
      ['Date de paiement', data.paidDate].map(esc).join(','),
      ['Notes', data.notes].map(esc).join(','),
    ]
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `declaration-${data.typeLabel}-${data.periode}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="d-flex gap-2">
      <button type="button" className="btn btn-outline-primary d-inline-flex align-items-center" onClick={handlePdf}>
        <i className="ti ti-file-text me-1"></i>PDF
      </button>
      <button type="button" className="btn btn-outline-secondary d-inline-flex align-items-center" onClick={handleCsv}>
        <i className="ti ti-file-spreadsheet me-1"></i>CSV
      </button>
    </div>
  )
}
