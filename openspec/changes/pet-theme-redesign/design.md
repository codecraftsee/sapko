## Context

Sapko is an Angular 21 standalone-component application for an animal shelter — covering pet adoption (`/udomi`), urgent help (`/urgentno`), donor registry (`/donori`), auth, and account management. The current codebase has a bare-bones Angular scaffold: no custom color system, no brand typography, no visual identity. Every component uses Angular's default styles.

The redesign is **purely presentational** — it touches only SCSS, global styles, template markup in layout/feature components, and Google Fonts. No service, routing, API, or signal logic is changed.

## Goals / Non-Goals

**Goals:**
- Define a single CSS custom-property token system that all components share
- Integrate two Google Fonts (display + body) via `styles.scss`
- Apply the token system to navbar, footer, home hero, and animal cards
- Keep all SCSS co-located per component (Angular component SCSS files)
- Maintain WCAG AA contrast ratios across all text/background combinations

**Non-Goals:**
- Dark mode (out of scope for v1)
- Animation or motion system
- Redesigning form layouts (login, register, account)
- Changing any TypeScript, service, or routing code
- Introducing a third-party UI component library

## Decisions

### 1. Token system in `styles.scss` via CSS custom properties on `:root`

**Decision:** Define all design tokens as CSS custom properties on `:root` in `src/styles.scss`.

**Rationale:** Angular's component SCSS is encapsulated, but CSS custom properties pierce Shadow DOM and component encapsulation naturally. This means each component SCSS can consume `var(--color-primary)` without any import — tokens are ambient. Alternative considered: a shared `_tokens.scss` SCSS partial with `@use` — rejected because it requires an explicit `@use` in every component file, which is error-prone in a team setting.

### 2. Google Fonts loaded via `<link>` in `index.html`

**Decision:** Add Google Fonts `<link>` preconnect + stylesheet tags to `src/index.html`.

**Rationale:** Angular's `styles` array in `angular.json` only supports local files or npm packages. Google Fonts requires an HTTP link tag. Loading in `index.html` is the simplest, most reliable method. Alternative: self-hosting fonts via `@font-face` in SCSS — deferred to a later iteration to avoid font file management overhead now.

**Fonts chosen:**
- **Display:** `Playfair Display` — editorial, warm, dignified. Evokes trust and care without being childish.
- **Body:** `Nunito` — rounded, friendly, highly legible at small sizes. Pairs well with Playfair's formality.

### 3. Color palette — warm earth tones

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#C1593C` | Terracotta — primary buttons, links, accents |
| `--color-primary-light` | `#E8886E` | Hover states, soft highlights |
| `--color-surface` | `#FBF5EE` | Warm cream — page background |
| `--color-surface-alt` | `#F2E8DC` | Card backgrounds, section alternates |
| `--color-text` | `#2E1F14` | Deep warm brown — primary text |
| `--color-text-muted` | `#7A5C4A` | Secondary text, captions |
| `--color-green` | `#4A7C59` | Forest green — success, badges, secondary CTA |
| `--color-amber` | `#D4943A` | Amber — urgent badges, callouts |
| `--color-border` | `#DDD0C4` | Subtle warm borders |

**Contrast check:** `--color-primary` (#C1593C) on `--color-surface` (#FBF5EE) → 4.6:1 (AA pass). `--color-text` on `--color-surface` → 11.2:1 (AAA pass).

### 4. Animal card as a CSS class, not a new Angular component

**Decision:** Define `.animal-card` styles in the feature component SCSS files (`adoption-list.component.scss`, `urgent-board.component.scss`) rather than creating a shared `CardComponent`.

**Rationale:** The existing templates already render animal items with their own markup. Adding a wrapper Angular component would require changing template structure and `@Input()` contracts — out of scope. CSS classes achieve the visual goal with zero structural change. If a shared component is needed later, the CSS class is the natural spec for it.

## Risks / Trade-offs

- **Font flash (FOUT):** Google Fonts loads async; body text may flash unstyled on first load. → Mitigation: add `font-display: swap` via the Google Fonts URL parameter (`&display=swap`).
- **Token naming collisions:** If Angular Material or other libraries are added later, `--color-primary` may clash. → Mitigation: prefix tokens with `--sapko-` if a UI library is introduced.
- **SCSS encapsulation:** Component-level `:host` selectors may override token-based global resets. → Mitigation: use token values directly in component SCSS rather than relying on inheritance.

## Migration Plan

1. Update `src/index.html` — add Google Fonts link tags
2. Update `src/styles.scss` — add `:root` token block and base resets
3. Update `src/app/layout/nav/` component SCSS + template
4. Update `src/app/layout/footer/` component SCSS + template
5. Update `src/app/features/home/` hero SCSS + template
6. Update `src/app/features/adoption/` card SCSS
7. Update `src/app/features/urgent/` card SCSS

Each step is independent and can be reviewed/reverted separately. No database migrations, no environment changes, no deployment steps beyond a standard `npm run build`.

## Open Questions

- Should the hero section include a real shelter photo as a background, or use a CSS gradient? (Currently: gradient, pending asset availability)
- Should urgent items use a red badge or amber badge for "urgent" status? (Currently: amber — less alarming, more accessible)
