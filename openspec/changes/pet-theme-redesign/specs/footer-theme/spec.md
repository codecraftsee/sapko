## ADDED Requirements

### Requirement: Footer uses dark warm background
The footer SHALL use a dark warm brown (`var(--color-text)` or a derived dark token) as its background, with light text in `var(--color-surface)` for contrast.

#### Scenario: Footer color contrast
- **WHEN** the footer is rendered
- **THEN** footer text SHALL have a contrast ratio ≥ 4.5:1 against the footer background

### Requirement: Footer contains shelter info columns
The footer layout SHALL include at least two columns: one for navigation links and one for contact/social information, displayed in a responsive CSS grid.

#### Scenario: Footer layout on desktop
- **WHEN** the viewport is ≥ 768px
- **THEN** footer columns SHALL display side-by-side in a grid

#### Scenario: Footer layout on mobile
- **WHEN** the viewport is < 768px
- **THEN** footer columns SHALL stack vertically

### Requirement: Footer links use primary accent on hover
Footer navigation links SHALL transition to `var(--color-primary-light)` on hover.

#### Scenario: Footer link hover
- **WHEN** a user hovers over a footer link
- **THEN** the link color SHALL change to `var(--color-primary-light)` within 200ms
