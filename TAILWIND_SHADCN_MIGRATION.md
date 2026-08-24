# Migration Fiscow — Tailwind CSS v4 + shadcn/ui

## Migré dans cette version
- Design tokens Fiscow dans `src/app/globals.css`.
- Base shadcn/ui dans `src/components/ui`.
- Header applicatif en Tailwind + shadcn/Radix.
- Sidebar fixe/collapsible en Tailwind + shadcn Tooltip.
- Dashboard en Tailwind + composants shadcn Card/Button/Badge.
- Authentification (login, register, forgot/reset/verify/confirm) sans `auth.css`.
- Export CSV du dashboard rendu fonctionnel.
- Branding visible `Regule` remplacé par `Fiscow` dans l'UI et les exports.

## Compatibilité volontaire
Les chemins techniques `/regule/...`, le nom package `regule-next` et les valeurs de seed/base contenant `regule` ne sont pas renommés. Ce sont des identifiants techniques/données, pas du branding d'affichage.

Les anciens CSS/JS `public/regule/...` restent chargés temporairement pour les routes applicatives qui ne sont pas encore migrées (calculateurs, déclarations, administration, configuration et onboarding). Les supprimer maintenant casserait ces écrans. Le dashboard/header/sidebar/auth ne dépendent plus de leur CSS spécifique.

## Installation
Le conteneur de génération n'a pas accès au registre npm. Après extraction, exécuter :

```bash
npm install
npm run dev
```

Le `package.json` contient les dépendances shadcn/Radix nécessaires.
