# test-coverage-modernization Specification

## Purpose
Define the required unit and end-to-end regression coverage for the Vite application after dependency and runtime maintenance.

## Requirements

### Requirement: Vitest unit test selection
The project SHALL use Vitest as the unit test runner because the application is built with Vite.

#### Scenario: Unit test tooling is added
- **WHEN** unit test infrastructure is configured
- **THEN** Vitest MUST be installed and configured instead of Jest unless the Vite stack is removed in a future change

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
- **THEN** unit tests MUST cover loading, success, error, empty-state, stale request behavior, stale gallery clearing, and requested Flickr image URL extras where the composable implements them

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

#### Scenario: Public gallery refresh flow is tested
- **WHEN** a user starts a new public gallery search while previous user photos are visible
- **THEN** Cypress tests MUST verify the previous gallery is cleared while the new Flickr request is loading using deterministic network responses

### Requirement: Deterministic E2E network behavior
Cypress tests SHALL avoid relying on live Flickr data for repeatable regression coverage.

#### Scenario: Flickr-backed flow is exercised
- **WHEN** an E2E test exercises a Flickr-backed UI path
- **THEN** the test MUST intercept the application proxy requests and return stable fixture data unless the test is explicitly documented as a live smoke check

### Requirement: Validation scripts and documentation
The project SHALL expose or document validation commands for the unit and E2E test suites without replacing existing app scripts.

#### Scenario: Test commands are added
- **WHEN** package scripts are updated for test execution
- **THEN** the scripts MUST preserve existing development, build, preview, and start commands while adding commands for Vitest and Cypress execution

### Requirement: Netlify Function proxy unit coverage
The project SHALL include automated tests for the Netlify Flickr proxy behavior that can run without contacting live Flickr.

#### Scenario: Supported method request is tested
- **WHEN** proxy tests exercise a supported Flickr method
- **THEN** tests MUST verify upstream URL construction, server-side credential injection, fixed parameter protection, and successful JSON forwarding using deterministic mocked Flickr responses

#### Scenario: Unsupported method request is tested
- **WHEN** proxy tests exercise an unsupported or missing Flickr method
- **THEN** tests MUST verify that the proxy returns a `400` JSON error without making an upstream Flickr request

#### Scenario: Missing credential request is tested
- **WHEN** proxy tests run without `API_KEY`
- **THEN** tests MUST verify that the proxy returns a server configuration error without exposing any secret value

#### Scenario: Upstream failure request is tested
- **WHEN** proxy tests simulate Flickr HTTP failure, Flickr `stat: "fail"`, network failure, or invalid upstream JSON
- **THEN** tests MUST verify compatible JSON error handling for each failure mode

### Requirement: Production API routing coverage
The project SHALL include tests or deterministic validation for the frontend API base URL and Netlify routing assumptions introduced by the migration.

#### Scenario: Production default API URL is validated
- **WHEN** the frontend API client runs in production mode without `VITE_API_BASE_URL`
- **THEN** tests MUST verify that Flickr requests use the Netlify-hosted application route rather than the old Render origin

#### Scenario: Explicit API override is validated
- **WHEN** `VITE_API_BASE_URL` is configured
- **THEN** tests MUST verify that the frontend API client uses the configured override after normalizing trailing slashes

#### Scenario: E2E intercepts remain deterministic
- **WHEN** Cypress tests intercept Flickr-backed UI flows
- **THEN** the intercept patterns MUST match the migrated proxy route and continue returning deterministic fixture data
