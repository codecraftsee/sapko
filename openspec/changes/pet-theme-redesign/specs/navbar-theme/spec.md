## ADDED Requirements

### Requirement: Navbar uses warm surface background
The navbar component SHALL use `var(--color-surface)` as its background with a subtle bottom border in `var(--color-border)`, replacing any default white or transparent background.

#### Scenario: Navbar background on scroll
- **WHEN** the page is loaded or scrolled
- **THEN** the navbar background SHALL display the warm cream surface color

### Requirement: Navbar brand uses display font
The navbar logo/brand text SHALL render in `var(--font-display)` at a minimum size of 1.5rem, in `var(--color-primary)`.

#### Scenario: Brand text rendering
- **WHEN** the navbar is visible
- **THEN** the brand/logo text SHALL use Playfair Display and terracotta color

### Requirement: Nav links have warm hover state
Navigation links SHALL transition to `var(--color-primary)` color on hover with an underline accent, replacing any default Angular router link styles.

#### Scenario: Link hover interaction
- **WHEN** a user hovers over a nav link
- **THEN** the link color SHALL transition to `var(--color-primary)` within 200ms

### Requirement: Active route link is visually indicated
The currently active route link SHALL be visually distinguished using `var(--color-primary)` color and a bottom border or underline.

#### Scenario: Active link on /udomi
- **WHEN** the user navigates to `/udomi`
- **THEN** the "Udomi" nav link SHALL appear in `var(--color-primary)` with an active indicator
