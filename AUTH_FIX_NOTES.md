# Fiscow — Correctifs Auth 2026-08-17

## Problème principal identifié

La landing page importe `landing.css` directement depuis `src/app/page.tsx`. Ce fichier contenait des règles globales (`:root` et `*`) qui continuaient à influencer les routes `/login` et `/register` lors d'une navigation client. Après un rafraîchissement direct sur la route d'authentification, ces styles de landing n'étaient plus présents de la même façon, ce qui expliquait la différence visuelle.

### Correctif

- variables de landing désormais limitées à `.rg-landing` ;
- reset `*` limité à `.rg-landing` ;
- authentification stylée avec classes `fiscow-auth-*` entièrement scopées ;
- `src/app/(auth)/auth.css` importé depuis `src/app/(auth)/layout.tsx` ;
- login/register/forgot/reset/verify/confirm utilisent le même système visuel stable.

## Emails

Le `.env` contient `BREVO_API_KEY`, mais `src/lib/email.ts` utilisait Resend et cherchait `RESEND_API_KEY`. Les emails partaient donc en fallback console au lieu d'être envoyés.

### Correctif

- `email.ts` utilise maintenant l'API transactionnelle Brevo ;
- `EMAIL_FROM` et `EMAIL_FROM_NAME` sont conservés ;
- confirmation email, mot de passe oublié et rappels utilisent Brevo ;
- les anciens tokens de vérification/reset sont nettoyés avant d'en créer de nouveaux.

## Vérification email

- les routes de l'application vérifient maintenant `emailVerifiedAt` ;
- un compte non vérifié est redirigé vers `/verify-email` ;
- un lien de vérification utilisé sans session redirige vers `/login?verified=1` ;
- un lien de vérification utilisé avec session redirige vers `/dashboard`.

## Réinitialisation du mot de passe

- après succès, redirection vers `/login?reset=1` avec message de confirmation.

## Points à vérifier dans l'environnement

1. `BREVO_API_KEY` doit être une clé API Brevo valide.
2. `EMAIL_FROM` doit être un expéditeur/domaine autorisé dans Brevo.
3. En production, `AUTH_URL` doit être l'URL Vercel publique, pas `http://localhost:3000`.
4. Vérifier les variables d'environnement Vercel séparément du `.env` local.

## Tests manuels recommandés

1. Depuis `/`, cliquer vers `/login` sans rafraîchir : le rendu doit être immédiatement correct.
2. `/login` -> `/register` -> `/login` sans refresh : aucun changement de mise en page.
3. Créer un nouveau compte : arrivée sur `/verify-email`.
4. Confirmer via l'email reçu : `emailVerifiedAt` doit être rempli.
5. Tester `/forgot-password` avec un compte existant.
6. Ouvrir le lien reçu, définir un nouveau mot de passe et se reconnecter.
7. Tester Google si les identifiants Google sont configurés.

## Ajustements UI demandés après le correctif auth
- Cards Login / Register / Forgot / Verify / Reset ramenées à 460px max, avec padding, champs et boutons plus compacts.
- Sur mobile, uniquement pendant l'onboarding : suppression du bouton hamburger (aucune sidebar n'est rendue sur ces routes), logo Fiscow à gauche et menu utilisateur à droite.
- Les autres pages de l'application conservent leur header mobile et leur bouton hamburger.
