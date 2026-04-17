## ADDED Requirements

### Requirement: CSS custom property token system on :root
The application SHALL define all visual design tokens as CSS custom properties on the `:root` selector in `src/styles.scss`. Tokens SHALL cover color, typography, spacing, border-radius, and box-shadow.

#### Scenario: Token availability in any component
- **WHEN** any Angular component SCSS references `var(--sapko-color-primary)`
- **THEN** the browser resolves the value without any SCSS import in the component file

#### Scenario: Token set completeness
- **WHEN** `src/styles.scss` is compiled
- **THEN** the `:root` block SHALL contain at minimum: `--color-primary`, `--color-primary-light`, `--color-surface`, `--color-surface-alt`, `--color-text`, `--color-text-muted`, `--color-green`, `--color-amber`, `--color-border`, `--font-display`, `--font-body`, `--radius-card`, `--shadow-card`

### Requirement: WCAG AA contrast compliance
All foreground/background color token combinations used for body text SHALL meet WCAG 2.1 AA contrast ratio (≥ 4.5:1).

#### Scenario: Primary text on surface background
- **WHEN** `--color-text` is rendered on `--color-surface`
- **THEN** the contrast ratio SHALL be ≥ 7:1 (AAA)

#### Scenario: Primary accent on surface background
- **WHEN** `--color-primary` is used as text or icon on `--color-surface`
- **THEN** the contrast ratio SHALL be ≥ 4.5:1 (AA)
