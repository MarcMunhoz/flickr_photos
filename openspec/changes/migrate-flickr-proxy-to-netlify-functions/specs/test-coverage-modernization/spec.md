## ADDED Requirements

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
