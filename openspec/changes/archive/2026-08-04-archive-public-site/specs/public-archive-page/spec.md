## ADDED Requirements

### Requirement: Archived public landing page
The application SHALL present a single public archive notice instead of an active Flickr gallery experience.

#### Scenario: User visits the root URL
- **WHEN** a user opens the application root URL
- **THEN** the page MUST state that the Flickr Photos project is archived
- **AND** it MUST explain that Flickr media delivery became too unreliable for the public gallery experience
- **AND** it MUST provide a link to the source repository

#### Scenario: User visits a previous gallery route
- **WHEN** a user opens a previous application route such as `/recent-photos` or `/about`
- **THEN** the application MUST show the archive notice instead of the former interactive route

### Requirement: No live Flickr interactions on archive page
The archive page SHALL avoid live Flickr metadata and media interactions.

#### Scenario: Archive page renders
- **WHEN** the archive page is displayed
- **THEN** it MUST NOT render Flickr username search controls
- **AND** it MUST NOT render recent-photo filters or gallery controls
- **AND** it MUST NOT require live Flickr media to complete the visual layout
