# Fiscow Dashboard — Tailwind/shadcn migration

## Dashboard
- Dashboard, header and sidebar use Tailwind utility classes and shadcn/ui components.
- No dashboard-specific CSS file is used.
- The dashboard is isolated from Bootstrap, `style.css` and `regule-theme.css` to prevent legacy selectors from breaking the sidebar/layout.
- ApexCharts remains loaded only as a JS dependency for the existing payment chart.

## Sidebar safeguards
- Fixed viewport sidebar (`fixed`, `h-dvh`).
- Explicit width/min-width/max-width in expanded and collapsed states.
- Expanded: 236px, brand `Fiscow.`.
- Collapsed: 76px, brand `F.` with Times New Roman.
- Desktop content margin follows the exact sidebar width.
- Mobile sidebar is an overlay and always uses 236px.
- Collapsed preference persists in localStorage.
- shadcn/Radix tooltips display labels while collapsed.

## Legacy screens
Legacy CSS/JS is conditionally kept for screens not migrated yet. It is not loaded on `/dashboard`.
This avoids breaking onboarding/calendar/declarations while the migration continues.
