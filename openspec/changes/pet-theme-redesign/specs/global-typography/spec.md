## ADDED Requirements

### Requirement: Google Fonts loaded in index.html
The application SHALL load two Google Fonts families via `<link>` tags in `src/index.html`: one display font (Playfair Display) and one body font (Nunito), both with `display=swap`.

#### Scenario: Fonts available on page load
- **WHEN** the browser loads `index.html`
- **THEN** `font-family: 'Playfair Display'` and `font-family: 'Nunito'` SHALL be resolvable by the browser

#### Scenario: Font display swap prevents invisible text
- **WHEN** Google Fonts is slow to load
- **THEN** the browser SHALL display fallback system fonts immediately (no invisible text period)

### Requirement: Base typographic scale in styles.scss
The application SHALL define a base typographic scale in `src/styles.scss` applying `font-family`, `font-size`, `line-height`, and `color` to `body`, `h1`–`h4`, and `p` elements.

#### Scenario: Headings use display font
- **WHEN** any `h1`, `h2`, or `h3` element is rendered
- **THEN** it SHALL use `var(--font-display)` (Playfair Display) as font-family

#### Scenario: Body text uses body font
- **WHEN** any `p` or `body` element is rendered
- **THEN** it SHALL use `var(--font-body)` (Nunito) as font-family with a line-height of at least 1.6
