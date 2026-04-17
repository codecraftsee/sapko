## Why

The Sapko frontend currently uses a generic, unstyled Angular scaffold with no visual identity. Users visiting an animal shelter platform expect warmth, trust, and emotional resonance — a design that communicates care for animals. A purposeful visual theme will increase emotional engagement and conversion for adoption, urgent help, and donor flows.

## What Changes

- Replace the default Angular styles with a cohesive design token system (CSS custom properties)
- Introduce a warm, nature-inspired color palette (terracotta, cream, forest green, amber)
- Redesign the global typography pairing (display + body fonts via Google Fonts)
- Redesign the navbar and footer to reflect a shelter brand identity
- Redesign the hero section on the home page with an emotional headline and CTA
- Introduce a reusable animal card component style for `/udomi` (adoptions) and `/urgentno` (urgent board)
- Add subtle background textures and organic shapes to reinforce a nature/care aesthetic
- Ensure all existing routes and feature components adopt the new tokens without structural changes

## Capabilities

### New Capabilities

- `design-tokens`: Global CSS custom properties for color, spacing, typography, radius, and shadow — the single source of truth for the visual system
- `global-typography`: Google Fonts integration and base typographic scale applied to `styles.scss`
- `navbar-theme`: Redesigned navigation bar with shelter branding, warm background, and accessible hover states
- `hero-section`: Redesigned home hero with emotional headline, supporting copy, and primary CTA button in new theme
- `animal-card`: Reusable card styles for animal listing items (adoption cards on `/udomi`, urgent items on `/urgentno`)
- `footer-theme`: Redesigned footer with warm tones, shelter contact info layout, and social links

### Modified Capabilities

- `global-styles`: `src/styles.scss` gains the design token import and resets — existing component styles remain untouched

## Impact

- `src/styles.scss` — gains token imports and global resets
- `src/app/layout/` navbar and footer components — template and SCSS updated
- `src/app/features/home/` — hero section template and SCSS updated
- `src/app/features/adoption/` — card styles applied
- `src/app/features/urgent/` — card styles applied
- No route changes, no service changes, no API changes
- No breaking changes to component APIs or inputs/outputs
