## ADDED Requirements

### Requirement: Animal card has warm surface background and border-radius
Each animal listing item on `/udomi` and `/urgentno` SHALL be styled with `var(--color-surface-alt)` background, `var(--radius-card)` border-radius, and `var(--shadow-card)` box-shadow.

#### Scenario: Card appearance on adoption page
- **WHEN** the `/udomi` page renders a list of animals
- **THEN** each animal item SHALL display with a warm cream card background, rounded corners, and a soft shadow

#### Scenario: Card appearance on urgent board
- **WHEN** the `/urgentno` page renders urgent help items
- **THEN** each item SHALL use the same card style as adoption cards

### Requirement: Animal card has a hover elevation effect
Animal cards SHALL increase their box-shadow depth on hover to provide tactile feedback, using a CSS `transition` of ≤ 300ms.

#### Scenario: Card hover state
- **WHEN** a user hovers over an animal card
- **THEN** the card shadow SHALL deepen and the card MAY translate up by 2–4px within 300ms

### Requirement: Urgent badge uses amber color token
Items on the `/urgentno` board that have an "urgent" or high-priority flag SHALL display a badge using `var(--color-amber)` background with white text.

#### Scenario: Urgent badge rendering
- **WHEN** an item on `/urgentno` has urgent status
- **THEN** a badge element SHALL appear with amber background, not red or default blue

### Requirement: Card image placeholder uses surface-alt color
If an animal card has no photo, the image area SHALL display `var(--color-surface-alt)` with a centered paw or animal icon in `var(--color-text-muted)`.

#### Scenario: Missing photo fallback
- **WHEN** an animal listing has no photo URL
- **THEN** the card image area SHALL show a warm placeholder, not a broken image or empty white box
