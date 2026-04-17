## ADDED Requirements

### Requirement: Hero has warm gradient background
The home hero section SHALL use a CSS gradient background combining `var(--color-surface)` and `var(--color-surface-alt)` — no plain white or default Angular background.

#### Scenario: Hero section visual background
- **WHEN** the home page (`/`) is loaded
- **THEN** the hero section SHALL display a warm gradient background, not a plain white background

### Requirement: Hero headline uses display font at large size
The hero `h1` SHALL use `var(--font-display)` at a minimum of `clamp(2.2rem, 5vw, 3.5rem)`, in `var(--color-text)`.

#### Scenario: Headline rendering on desktop
- **WHEN** the viewport is ≥ 1024px wide
- **THEN** the hero `h1` SHALL render at ≥ 3rem in Playfair Display

#### Scenario: Headline rendering on mobile
- **WHEN** the viewport is < 640px wide
- **THEN** the hero `h1` SHALL render at ≥ 2.2rem and remain single-column

### Requirement: Hero has a primary CTA button in brand color
The hero section SHALL contain at least one call-to-action button linking to `/udomi`, styled with `var(--color-primary)` background, white text, and rounded corners (`var(--radius-card)`).

#### Scenario: CTA button visibility
- **WHEN** the home page is loaded
- **THEN** a button or link with text directing to adoption SHALL be visible in the hero, using the primary terracotta color

### Requirement: Hero supporting copy uses muted text color
The hero subtitle/description paragraph SHALL use `var(--color-text-muted)` for visual hierarchy below the headline.

#### Scenario: Subtitle color
- **WHEN** the hero is rendered
- **THEN** the subtitle/description text SHALL be visually lighter than the `h1`
