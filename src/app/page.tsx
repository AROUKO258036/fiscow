import Link from 'next/link'
import { DemoVideo } from '@/components/landing/demo-video'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { LandingNav } from '@/components/landing/nav'
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

      <style>{`
        .rg-demo-box {
          max-width: 980px;
          margin: 0 auto;
          border: 1px solid rgba(255, 138, 31, 0.26);
          border-radius: 24px;
          background: linear-gradient(145deg, #171512 0%, #24201b 100%);
          padding: 18px;
          box-shadow: 0 24px 70px rgba(23, 21, 18, 0.12);
        }

        .rg-demo-screen {
          position: relative;
          aspect-ratio: 16 / 9;
          width: 100%;
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background:
            radial-gradient(circle at 50% 35%, rgba(255, 138, 31, 0.18), transparent 34%),
            #11100e;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rg-demo-placeholder {
          text-align: center;
          padding: 32px;
          color: #fff;
        }

        .rg-demo-play {
          width: 72px;
          height: 72px;
          margin: 0 auto 18px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ff8a1f;
          color: #fff;
          font-size: 28px;
          box-shadow: 0 10px 35px rgba(255, 138, 31, 0.28);
        }

        .rg-demo-placeholder h3 {
          margin: 0 0 8px;
          color: #fff;
          font-size: clamp(20px, 3vw, 30px);
          font-weight: 800;
        }

        .rg-demo-placeholder p {
          max-width: 560px;
          margin: 0 auto;
          color: #b8b0a8;
          font-size: 14px;
          line-height: 1.7;
        }

        .rg-faq-list {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          gap: 12px;
        }

        .rg-faq-item {
          border: 1px solid #e8dfd6;
          border-radius: 14px;
          background: #fff;
          overflow: hidden;
        }

        .rg-faq-item summary {
          list-style: none;
          cursor: pointer;
          padding: 20px 54px 20px 20px;
          position: relative;
          font-weight: 750;
          color: #37312c;
          user-select: none;
        }

        .rg-faq-item summary::-webkit-details-marker {
          display: none;
        }

        .rg-faq-item summary::after {
          content: '⌄';
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #ff8a1f;
          font-size: 24px;
          line-height: 1;
          transition: transform 0.2s ease;
        }

        .rg-faq-item[open] summary::after {
          transform: translateY(-50%) rotate(180deg);
        }

        .rg-faq-answer {
          padding: 0 20px 20px;
          color: #6f675f;
          font-size: 14px;
          line-height: 1.75;
        }

        @media (max-width: 767px) {
          .rg-demo-box {
            padding: 10px;
            border-radius: 18px;
          }

          .rg-demo-screen {
            border-radius: 13px;
          }

          .rg-demo-play {
            width: 58px;
            height: 58px;
            font-size: 23px;
          }

          .rg-faq-item summary {
            padding: 17px 48px 17px 16px;
            font-size: 14px;
          }

          .rg-faq-answer {
            padding: 0 16px 17px;
            font-size: 13px;
          }
        }
      `}</style>

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
                <Link
                    href="#demo"
                    className="rg-btn rg-btn-outline rg-btn-xl"
                  >
                    Voir la démo
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

        <DemoVideo />

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
              <div className="rg-faq-list">
                <details className="rg-faq-item">
                  <summary>Fiscow remplace-t-il un comptable ?</summary>
                  <div className="rg-faq-answer">
                    Fiscow automatise le suivi de vos principales obligations fiscales, les calculs et les échéances. Il vous aide à gérer votre conformité au quotidien, mais ne remplace pas un accompagnement comptable ou juridique lorsqu’une situation complexe exige l’intervention d’un professionnel.
                  </div>
                </details>

                <details className="rg-faq-item">
                  <summary>Quels impôts et cotisations sont pris en charge ?</summary>
                  <div className="rg-faq-answer">
                    Fiscow couvre actuellement les principales obligations suivies dans l’application : IS, TVA, ITS et CNSS. Les calculs et échéances proposés dépendent des informations renseignées pour votre entreprise.
                  </div>
                </details>

                <details className="rg-faq-item">
                  <summary>Comment Fiscow sait-il quelles échéances me concernent ?</summary>
                  <div className="rg-faq-answer">
                    Lors de la configuration, vous renseignez les informations essentielles de votre entreprise. Fiscow utilise ensuite ces données pour construire votre calendrier fiscal et afficher les obligations qui correspondent à votre situation.
                  </div>
                </details>

                <details className="rg-faq-item">
                  <summary>Mes données d’entreprise sont-elles sécurisées ?</summary>
                  <div className="rg-faq-answer">
                    Les informations sont utilisées uniquement pour faire fonctionner votre espace Fiscow et produire votre suivi fiscal. L’accès à votre compte reste protégé par votre authentification.
                  </div>
                </details>

                <details className="rg-faq-item">
                  <summary>Puis-je utiliser Fiscow sans connaissances comptables ?</summary>
                  <div className="rg-faq-answer">
                    Oui. L’interface a été pensée pour guider les dirigeants de PME et microentreprises sans leur demander de maîtriser les calculs fiscaux. Vous renseignez vos données et Fiscow présente les montants, échéances et actions à effectuer.
                  </div>
                </details>
              </div>
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