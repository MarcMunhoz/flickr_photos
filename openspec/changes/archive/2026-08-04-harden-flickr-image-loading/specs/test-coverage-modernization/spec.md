## MODIFIED Requirements

### Requirement: Unit test coverage for critical code
The project SHALL include unit tests for critical frontend and middleware-adjacent logic that can be exercised without a browser E2E flow.

#### Scenario: Utility logic is tested
- **WHEN** photo or date utility behavior is changed or validated
- **THEN** unit tests MUST cover formatting, filtering, normalization, image URL candidate ordering, display URL fallback selection, and edge cases represented in the existing utility modules

#### Scenario: API client behavior is tested
- **WHEN** Flickr proxy client behavior is validated
- **THEN** unit tests MUST cover successful responses, HTTP failures, Flickr `stat: fail` responses, query serialization, and abort signal forwarding

#### Scenario: Composable behavior is tested
- **WHEN** photo-loading composables are validated
- **THEN** unit tests MUST cover loading, success, error, empty-state, stale request behavior, and requested Flickr image URL extras where the composable implements them

### Requirement: Cypress E2E coverage
The project SHALL include Cypress tests for the primary user-visible application flows.

#### Scenario: Core routes are tested
- **WHEN** Cypress E2E tests run
- **THEN** the tests MUST cover navigation for the home route, about route, and recent photos route

#### Scenario: Public gallery flow is tested
- **WHEN** a user searches for a Flickr username on the home route
- **THEN** Cypress tests MUST verify the username lookup request, public photo loading behavior, rendered photo results, and supported empty or error states using deterministic network responses

#### Scenario: Recent photos flow is tested
- **WHEN** a user visits recent public photos
- **THEN** Cypress tests MUST verify initial loading, filter interactions, incremental loading where available, rendered recent-photo results, image URL fallback behavior after individual image load failures, and modal preview behavior using deterministic network responses
