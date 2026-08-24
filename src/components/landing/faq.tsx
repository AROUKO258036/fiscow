'use client'

import { useState } from 'react'

export interface FAQItem {
  q: string
  a: string
}

const DEFAULT_ITEMS: FAQItem[] = [
  {
    q: 'Comment Regule s’intègre-t-il à mon processus existant ?',
    a: 'Regule se connecte directement à vos outils de facturation et banques. Vous pouvez importer vos données en quelques clics sans changer vos habitudes.',
  },
  {
    q: 'Mes données financières sont-elles sécurisées ?',
    a: 'Oui, nous utilisons un chiffrement de niveau bancaire (AES-256) et vos données sont hébergées sur des serveurs sécurisés conformes aux normes locales.',
  },
  {
    q: 'Puis-je l’utiliser si je travaille avec un comptable externe ?',
    a: 'Absolument. Vous pouvez donner un accès en lecture seule ou un accès collaborateur à votre expert-comptable pour simplifier la transmission des pièces.',
  },
]

export function LandingFaq({ items = DEFAULT_ITEMS }: { items?: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <div className="rg-faq">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx
        return (
          <div key={idx} className={`rg-faq-item${isOpen ? ' rg-faq-item--open' : ''}`}>
            <button
              className="rg-faq-q"
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
            >
              <span>{item.q}</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div className="rg-faq-a">
              <p>{item.a}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}