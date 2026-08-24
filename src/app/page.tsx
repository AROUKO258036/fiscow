import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { LandingNav } from '@/components/landing/nav'
import { LandingFaq } from '@/components/landing/faq'
import './landing.css'

const CHECK_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

/* Logo Fiscow Blanc pour le Footer */
function FiscowFooterLogo() {
  return (
    <div className="d-flex align-items-center gap-2 text-decoration-none mb-3">
      <div
        className="d-flex align-items-center justify-content-center rounded-3"
        style={{
          width: '32px',
          height: '32px',
          background: 'linear-gradient(135deg, #FF8A1F 0%, #E9740B 100%)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V7l-9-5z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </div>
      <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '22px', color: '#FFFFFF', lineHeight: 1 }}>
        Fiscow<span style={{ color: '#FF8A1F' }}>.</span>
      </span>
    </div>
  )
}

export default async function Home() {
  const session = await auth()
  if (session?.user) redirect('/dashboard')

  return (
    <div className="rg-body rg-landing">
      <LandingNav />

      <main>
        {/* HERO SECTION */}
        <section className="rg-hero" id="hero">
          <div className="rg-container">
            <div className="rg-hero-content rg-center">
              <span className="rg-badge">Conformité Fiscale · PME & Microentreprises</span>
              <h1 className="rg-hero-title">
                Un outil. Zéro comptable. <br />
                <span className="rg-text-highlight">Toutes vos obligations en règle.</span>
              </h1>
              <p className="rg-hero-sub">
                Fiscow calcule vos impôts (IS, TVA, ITS, CNSS) aux barèmes exacts de la DGI. Ne manquez plus aucune échéance fiscale et évitez 100% des pénalités de retard.
              </p>

              <div className="rg-hero-cta">
                <Link href="/register" className="rg-btn rg-btn-primary rg-btn-xl">
                  Créer mon compte gratuit
                </Link>
                <Link href="#solution" className="rg-btn rg-btn-outline rg-btn-xl">
                  Voir la demo
                </Link>
              </div>

              <ul className="rg-hero-proof">
                <li>{CHECK_ICON} Configuration en 5 minutes</li>
                <li>{CHECK_ICON} Barèmes DGI mis à jour</li>
                <li>{CHECK_ICON} Sans engagement</li>
              </ul>
            </div>

            {/* Stats Bar */}
            <div className="rg-hero-stats">
              <div className="rg-hero-stats-grid">
                <div className="rg-hero-stat">
                  <strong>4 Impôts</strong>
                  <span>Couverts (IS, TVA, ITS, CNSS)</span>
                </div>
                <div className="rg-hero-stat">
                  <strong>5 min</strong>
                  <span>Pour configurer votre entreprise</span>
                </div>
                <div className="rg-hero-stat">
                  <strong>0</strong>
                  <span>Compétence comptable requise</span>
                </div>
                <div className="rg-hero-stat">
                  <strong>100%</strong>
                  <span>Conforme aux règles DGI</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION PROBLÈME (1 Image unique conservée) */}
        <section className="rg-section rg-section--subtle" id="probleme">
          <div className="rg-container">
            <div className="rg-section-head">
              <h2 className="rg-h2">Vous gérez votre entreprise. Qui surveille vos impôts ?</h2>
              <p className="rg-section-sub">
                Suivre les dates, calculer les montants et éviter les pénalités ne devrait pas être un second métier.
              </p>
            </div>

            <div className="rg-problem-split">
              <div className="rg-problem-text-side">
                <div className="rg-problem-big-stat">
                  <strong>74%</strong>
                  <p>des microentreprises accumulent des pénalités par manque d’alertes et de suivi automatique.</p>
                </div>

                <div className="rg-problem-points">
                  <div className="rg-problem-point">
                    <div className="rg-problem-point-icon">!</div>
                    <div className="rg-problem-point-text">
                      <h4>Jusqu’à 40% de pénalités</h4>
                      <p>Un retard de déclaration entraîne 20% de majoration immédiate et 40% après deux mois.</p>
                    </div>
                  </div>
                  <div className="rg-problem-point">
                    <div className="rg-problem-point-icon">!</div>
                    <div className="rg-problem-point-text">
                      <h4>Des calculs manuels à risque</h4>
                      <p>Appliquer de mauvais barèmes fiscaux produit des erreurs coûteuses lors des contrôles.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* IMAGE UNIQUE DE LA LANDING PAGE */}
              <div className="rg-problem-card-visual">
                <img
                  src="/regule/img/landing/photo-caissier.jpg"
                  alt="Gestion d'entreprise"
                  loading="lazy"
                  style={{ width: '100%', height: '380px', objectFit: 'cover', borderRadius: '16px' }}
                />
                <div className="rg-problem-badge-overlay">
                  ⚠️ Une seule pénalité évitée rembourse plus d'un an d'abonnement Fiscow.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION SOLUTION (Interfaces CSS modernes & légères) */}
        <section className="rg-section" id="solution">
          <div className="rg-container">
            <div className="rg-section-head rg-section-head--center">
              <h2 className="rg-h2">Reprenez le contrôle complet de votre fiscalité</h2>
              <p className="rg-section-sub">
                Fiscow simplifie vos démarches fiscales en une routine automatisée de quelques minutes par mois.
              </p>
            </div>

            <div className="rg-showcase-list">
              {/* Feature 1 */}
              <div className="rg-showcase-item">
                <div className="rg-showcase-text">
                  <span className="rg-showcase-num">01 · Visibilité Totale</span>
                  <h3 className="rg-showcase-title">Un score de conformité clair en un coup d'œil</h3>
                  <p className="rg-showcase-desc">
                    Sachez instantanément si votre entreprise est à jour ou si des échéances approchent grâce à votre indicateur de santé fiscale en temps réel.
                  </p>
                </div>
                {/* CSS Mockup Score */}
                <div className="rg-showcase-visual p-4 rounded-4 border bg-white shadow-sm">
                  <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                    <span className="fw-bold text-dark">Santé Fiscale Fiscow</span>
                    <span className="badge bg-success-subtle text-success px-2 py-1 rounded-pill">À jour</span>
                  </div>
                  <div className="text-center py-3">
                    <div className="display-4 fw-black text-primary mb-1">94%</div>
                    <p className="text-muted small mb-0">Score de conformité globale</p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="rg-showcase-item rg-showcase-item--reverse">
                <div className="rg-showcase-text">
                  <span className="rg-showcase-num">02 · Calcul Automatique</span>
                  <h3 className="rg-showcase-title">Moteurs de calcul IS, TVA, ITS et CNSS intègres</h3>
                  <p className="rg-showcase-desc">
                    Plus aucun calcul complexe sur tableur. Entrez vos chiffres et obtenez les montants exacts en FCFA selon les barèmes en vigueur à la DGI.
                  </p>
                </div>
                {/* CSS Mockup Calculateur */}
                <div className="rg-showcase-visual p-4 rounded-4 border bg-white shadow-sm">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary">Chiffre d'affaires HT</span>
                    <span className="fw-bold">12 500 000 FCFA</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                    <span className="text-secondary">Taux TVA appliqué</span>
                    <span className="fw-bold">18%</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ background: '#FFF7ED', border: '1px solid #FFEDD5' }}>
                    <span className="fw-semibold text-warning-emphasis">TVA à reverser :</span>
                    <span className="fs-5 fw-bold text-warning-emphasis">2 250 000 FCFA</span>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="rg-showcase-item">
                <div className="rg-showcase-text">
                  <span className="rg-showcase-num">03 · Calendrier d'Échéances</span>
                  <h3 className="rg-showcase-title">Alertes préventives avant chaque date limite</h3>
                  <p className="rg-showcase-desc">
                    Recevez des notifications personnalisées avant chaque échéance. Votre calendrier fiscal se remplit automatiquement.
                  </p>
                </div>
                {/* CSS Mockup Alertes */}
                <div className="rg-showcase-visual p-4 rounded-4 border bg-white shadow-sm">
                  <div className="d-flex align-items-center gap-3 p-3 mb-2 rounded-3 bg-light">
                    <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>🔔</div>
                    <div>
                      <h6 className="mb-0 fw-bold fs-14">Acompte IS trimestriel</h6>
                      <small className="text-muted">Échéance dans 5 jours (15 du mois)</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light">
                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>✓</div>
                    <div>
                      <h6 className="mb-0 fw-bold fs-14">Cotisations CNSS</h6>
                      <small className="text-success fw-medium">Déclaration validée</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMMENT ÇA MARCHE */}
        <section className="rg-section rg-section--subtle" id="comment-ca-marche">
          <div className="rg-container">
            <div className="rg-section-head rg-section-head--center">
              <h2 className="rg-h2">Trois étapes simples vers la sérénité</h2>
              <p className="rg-section-sub">Pas de formation nécessaire. Démarrez en moins de 5 minutes.</p>
            </div>

            <div className="rg-steps-grid">
              <div className="rg-step-card">
                <div className="rg-step-big-num">01</div>
                <h3>Configurez votre entreprise</h3>
                <p>Renseignez votre secteur, régime d'imposition et masse salariale en 2 minutes chrono.</p>
              </div>

              <div className="rg-step-card">
                <div className="rg-step-big-num">02</div>
                <h3>Obtenez vos calculs</h3>
                <p>Fiscow génère votre calendrier et calcule automatiquement les montants exacts à verser.</p>
              </div>

              <div className="rg-step-card">
                <div className="rg-step-big-num">03</div>
                <h3>Déclarez sans stress</h3>
                <p>Procédez à vos déclarations dans les temps et dites adieu aux pénalités de retard.</p>
              </div>
            </div>

            <div className="rg-center" style={{ marginTop: '48px' }}>
              <Link href="/register" className="rg-btn rg-btn-primary rg-btn-lg">
                Démarrer la configuration
              </Link>
            </div>
          </div>
        </section>

        {/* TÉMOIGNAGES */}
        <section className="rg-section" id="temoignages">
          <div className="rg-container">
            <div className="rg-section-head rg-section-head--center">
              <h2 className="rg-h2">Adopté par les entrepreneurs d'ici</h2>
            </div>

            <div className="rg-testimonials-grid">
              <div className="rg-testimonial-card">
                <p className="rg-testimonial-quote">
                  "Avant Fiscow, je découvrais mes échéances de TVA en retard presque à chaque trimestre. Les rappels ont changé ma gestion."
                </p>
                <div className="rg-testimonial-author">
                  <div className="rg-avatar">FA</div>
                  <div className="rg-author-info">
                    <h4>Fabrice A.</h4>
                    <p>Import-export · Cotonou</p>
                  </div>
                </div>
                <div className="rg-testimonial-impact">0 pénalité depuis 8 mois</div>
              </div>

              <div className="rg-testimonial-card">
                <p className="rg-testimonial-quote">
                  "Avoir mon score de conformité directement en ouvrant l'application me rassure énormément sur l'état de ma structure."
                </p>
                <div className="rg-testimonial-author">
                  <div className="rg-avatar">RD</div>
                  <div className="rg-author-info">
                    <h4>Rachidatou D.</h4>
                    <p>Commerce · Porto-Novo</p>
                  </div>
                </div>
                <div className="rg-testimonial-impact">Score passé de 54% à 94%</div>
              </div>

              <div className="rg-testimonial-card">
                <p className="rg-testimonial-quote">
                  "Un outil simple adapté aux barèmes officiels sans devoir payer des sommes exorbitantes pour de la petite comptabilité."
                </p>
                <div className="rg-testimonial-author">
                  <div className="rg-avatar">CK</div>
                  <div className="rg-author-info">
                    <h4>Corneille K.</h4>
                    <p>Services · Bohicon</p>
                  </div>
                </div>
                <div className="rg-testimonial-impact">+40 000 FCFA économisés / mois</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION TARIFS */}
        <section className="rg-section rg-section--subtle" id="tarifs">
          <div className="rg-container">
            <div className="rg-pricing-box">
              <span className="rg-pricing-pop-badge">Offre PME</span>
              <h2 className="rg-pricing-title">Un tarif clair et accessible</h2>
              <p className="rg-pricing-sub">Accédez à l'ensemble des modules sans engagement long terme.</p>

              <ul className="rg-pricing-features">
                <li>{CHECK_ICON} Calculateurs IS, TVA, ITS et CNSS</li>
                <li>{CHECK_ICON} Alertes automatiques d'échéances</li>
                <li>{CHECK_ICON} Suivi du score de conformité</li>
                <li>{CHECK_ICON} Mises à jour selon les règles de la DGI</li>
              </ul>

              <Link href="/register" className="rg-btn rg-btn-primary rg-btn-xl" style={{ width: '100%' }}>
                Créer un compte & Essayer
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="rg-section" id="faq">
          <div className="rg-container">
            <div className="rg-section-head rg-section-head--center">
              <h2 className="rg-h2">Questions fréquentes</h2>
            </div>
            <div className="rg-faq-wrapper">
              <LandingFaq />
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="rg-section">
          <div className="rg-container">
            <div className="rg-cta-final-box">
              <h2 className="rg-cta-final-title">Soyez en règle dès aujourd'hui.</h2>
              <p className="rg-cta-final-sub">
                Rejoignez les entreprises qui gèrent leurs obligations fiscales en toute sérénité.
              </p>
              <Link href="/register" className="rg-btn rg-btn-white rg-btn-xl">
                Créer mon compte gratuit
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="rg-footer">
        <div className="rg-container rg-footer-grid">
          <div className="rg-footer-brand">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                textDecoration: 'none',
                lineHeight: 1,
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                  fontWeight: 800,
                  fontSize: '28px',
                  letterSpacing: '-0.04em',
                  color: '#ffffff',
                }}
              >
                Fiscow
              </span>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#FF8A1F',
                  marginLeft: '2px',
                  alignSelf: 'baseline',
                }}
                aria-hidden="true"
              />
            </div>
            <p>Conformité fiscale simplifiée pour les PME.</p>
          </div>
          <div className="rg-footer-col">
            <h3>Produit</h3>
            <a href="#solution">Solution</a>
            <a href="#comment-ca-marche">Comment ça marche</a>
            <a href="#temoignages">Témoignages</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="rg-footer-col">
            <h3>Compte</h3>
            <Link href="/login">Se connecter</Link>
            <Link href="/register">Créer un compte</Link>
          </div>
          <div className="rg-footer-col">
            <h3>Plateforme</h3>
            <span>Fiscow SaaS</span>
            <span>Afrique de l'Ouest</span>
          </div>
        </div>
        <div className="rg-container rg-footer-bottom">
          <p>© {new Date().getFullYear()} Fiscow. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}