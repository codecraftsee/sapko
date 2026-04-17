## 1. Foundation — Tokens & Typography

- [x] 1.1 Add Google Fonts `<link>` preconnect and stylesheet tags for Playfair Display + Nunito (with `display=swap`) to `src/index.html`
- [x] 1.2 Add `:root` CSS custom property block to `src/styles.scss` with all color tokens: `--color-primary`, `--color-primary-light`, `--color-surface`, `--color-surface-alt`, `--color-text`, `--color-text-muted`, `--color-green`, `--color-amber`, `--color-border`
- [x] 1.3 Add typography tokens to `:root` in `src/styles.scss`: `--font-display`, `--font-body`
- [x] 1.4 Add spacing/shape tokens to `:root`: `--radius-card`, `--shadow-card`
- [x] 1.5 Write base typographic resets in `src/styles.scss`: `body`, `h1`–`h4`, `p` using token values
- [x] 1.6 Verify all token contrast ratios meet WCAG AA (manually check `--color-primary` on `--color-surface` and `--color-text` on `--color-surface`)

## 2. Navbar

- [x] 2.1 Update `nav.component.scss` — set background to `var(--color-surface)`, add bottom border `var(--color-border)`
- [x] 2.2 Style brand/logo text in `nav.component.scss` — `var(--font-display)`, `1.5rem`, `var(--color-primary)`
- [x] 2.3 Style nav links — add hover transition to `var(--color-primary)` with underline accent in `nav.component.scss`
- [x] 2.4 Add `routerLinkActive` styling for active route link (terracotta color + bottom border indicator)

## 3. Hero Section

- [x] 3.1 Update `home.component.scss` — hero section background with warm CSS gradient (`--color-surface` → `--color-surface-alt`)
- [x] 3.2 Style hero `h1` — `var(--font-display)`, `clamp(2.2rem, 5vw, 3.5rem)`, `var(--color-text)`
- [x] 3.3 Style hero subtitle paragraph — `var(--color-text-muted)`, `1.2rem`, `line-height: 1.7`
- [x] 3.4 Style CTA button linking to `/udomi` — `var(--color-primary)` background, white text, `var(--radius-card)` border-radius, hover darkens to `var(--color-primary-light)`
- [x] 3.5 Verify hero is single-column on mobile (< 640px) and multi-column on desktop (≥ 1024px)

## 4. Animal Cards — Adoption Page

- [x] 4.1 Update `adoption-list.component.scss` — apply `.animal-card` styles: `var(--color-surface-alt)` background, `var(--radius-card)`, `var(--shadow-card)`
- [x] 4.2 Add hover elevation effect to `.animal-card` — deeper shadow + `translateY(-3px)`, `transition: 300ms`
- [x] 4.3 Style card image area — fixed height, `object-fit: cover`, rounded top corners
- [x] 4.4 Add placeholder style for missing animal photo — `var(--color-surface-alt)` fill with centered icon in `var(--color-text-muted)`
- [x] 4.5 Style card text content — name in `var(--font-display)`, details in `var(--color-text-muted)`

## 5. Urgent Board Cards

- [x] 5.1 Update `urgent-board.component.scss` — apply same card token styles as adoption cards
- [x] 5.2 Add `.badge--urgent` style — `var(--color-amber)` background, white text, small `border-radius`, `font-size: 0.75rem`
- [x] 5.3 Wire `.badge--urgent` class to urgent-status items in the template (add `[class.badge--urgent]="item.urgent"` or equivalent)
- [x] 5.4 Verify hover elevation works on urgent board cards

## 6. Footer

- [x] 6.1 Update `footer.component.scss` — background `var(--color-text)` (dark warm brown), text `var(--color-surface)`
- [x] 6.2 Build two-column responsive grid layout in footer: navigation links column + contact/social column
- [x] 6.3 Style footer links — `var(--color-surface)` default, `var(--color-primary-light)` hover, `transition: 200ms`
- [x] 6.4 Verify footer stacks to single column on mobile (< 768px)
- [x] 6.5 Check footer text contrast ratio ≥ 4.5:1 against dark background

## 7. QA & Cleanup

- [x] 7.1 Run `npm run build` and confirm zero SCSS compilation errors
- [ ] 7.2 Visually review all 6 routes in browser at desktop (1280px) and mobile (375px) viewports
- [x] 7.3 Remove `openspec-pet-theme.html` prototype file from project root
- [ ] 7.4 Run `npm start` and verify no console errors on any route
