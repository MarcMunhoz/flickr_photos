## ADDED Requirements

### Requirement: Netlify-hosted Flickr proxy
The application SHALL expose the production Flickr proxy from Netlify Functions so the frontend and proxy can be deployed from the same Netlify project.

#### Scenario: Production frontend requests Flickr data
- **WHEN** the production frontend sends a Flickr proxy request
- **THEN** the request MUST be handled by the Netlify Function rather than the Render-hosted middleware

#### Scenario: Existing browser API contract is preserved
- **WHEN** existing frontend code requests `/api/flickr` with supported Flickr query parameters
- **THEN** the Netlify-hosted proxy MUST accept the request shape without requiring UI or composable behavior changes

#### Scenario: Netlify routing is configured
- **WHEN** Netlify receives a request for the application Flickr proxy route
- **THEN** Netlify MUST route the request to the Flickr proxy function before falling back to the SPA route

#### Scenario: Native function handler is sufficient
- **WHEN** the Flickr proxy is implemented as a Netlify Function
- **THEN** the implementation MUST prefer Netlify's native request/response handler shape unless an adapter dependency is explicitly justified by lower complexity

### Requirement: Server-side Flickr credential protection
The Netlify Flickr proxy SHALL keep the Flickr API key exclusively in server-side environment configuration.

#### Scenario: Flickr request is proxied
- **WHEN** the proxy sends a request to Flickr
- **THEN** it MUST inject the configured `API_KEY` server-side
- **AND** it MUST NOT require or accept a browser-supplied `api_key` as the effective Flickr credential

#### Scenario: API key is missing
- **WHEN** the Netlify Function runs without `API_KEY`
- **THEN** it MUST return a non-success JSON error response that identifies missing server configuration without leaking any secret value

#### Scenario: Frontend assets are built
- **WHEN** production frontend assets are generated
- **THEN** the Flickr API key MUST NOT appear in built JavaScript, HTML, CSS, source maps, or static assets

### Requirement: Supported Flickr method allowlist
The Netlify Flickr proxy SHALL only forward the Flickr methods used by this application.

#### Scenario: Username lookup is requested
- **WHEN** the request method is `flickr.people.findByUsername`
- **THEN** the proxy MUST forward the request to Flickr with fixed proxy credentials and browser-supplied non-credential parameters

#### Scenario: Public user photos are requested
- **WHEN** the request method is `flickr.people.getPublicPhotos`
- **THEN** the proxy MUST forward the request to Flickr with fixed proxy credentials and browser-supplied non-credential parameters

#### Scenario: Recent photos are requested
- **WHEN** the request method is `flickr.photos.getRecent`
- **THEN** the proxy MUST forward the request to Flickr with fixed proxy credentials and browser-supplied non-credential parameters

#### Scenario: Unsupported method is requested
- **WHEN** the request method is absent or is not in the supported method allowlist
- **THEN** the proxy MUST return a `400` JSON error response without contacting Flickr

### Requirement: Credential override prevention
The Netlify Flickr proxy SHALL prevent browser-supplied parameters from overriding fixed proxy-controlled Flickr parameters.

#### Scenario: Browser supplies fixed Flickr parameters
- **WHEN** the browser request includes `api_key`, `format`, or `nojsoncallback`
- **THEN** the proxy MUST use its own fixed values for those parameters in the upstream Flickr request

#### Scenario: Browser supplies application parameters
- **WHEN** the browser request includes non-fixed parameters needed by supported Flickr methods
- **THEN** the proxy MUST forward those parameters as strings without mutating fixed credential or response-format parameters

### Requirement: Error response compatibility
The Netlify Flickr proxy SHALL return JSON errors compatible with the existing frontend error handling.

#### Scenario: Flickr returns an HTTP error
- **WHEN** Flickr responds with a non-2xx HTTP status
- **THEN** the proxy MUST return a JSON error response with the upstream HTTP status where practical and a stable user-safe message

#### Scenario: Flickr returns stat fail
- **WHEN** Flickr responds with JSON containing `stat: "fail"`
- **THEN** the proxy MUST return a non-success HTTP response that preserves the Flickr failure code and user-safe message when available

#### Scenario: Flickr cannot be reached
- **WHEN** the proxy cannot fetch or parse a Flickr response
- **THEN** the proxy MUST return a `502` JSON error response without exposing stack traces or secret-bearing request details

### Requirement: Netlify security headers and CORS posture
The Netlify deployment SHALL allow the application to call its own proxy while avoiding unnecessary third-party connection permissions.

#### Scenario: Security headers are configured
- **WHEN** Netlify serves the frontend
- **THEN** the Content Security Policy MUST allow same-origin proxy requests and Flickr-hosted images required by the application
- **AND** it MUST NOT include the old Render proxy origin after production migration is complete

#### Scenario: Cross-origin access is evaluated
- **WHEN** the proxy is deployed on the same Netlify site as the frontend
- **THEN** the implementation MUST prefer same-origin requests over broad CORS allowance

#### Scenario: CORS remains necessary for local development
- **WHEN** the local frontend calls a separately running local proxy during development
- **THEN** allowed origins MUST be explicit and limited to documented local origins

### Requirement: Render dependency removal
The application SHALL remove Render as a required production runtime after the Netlify Function proxy is validated.

#### Scenario: Production configuration is updated
- **WHEN** the Netlify Function proxy is ready for production
- **THEN** default production API configuration MUST no longer point at `https://flickr-public-photos.onrender.com/api`

#### Scenario: Documentation is updated
- **WHEN** the migration is complete
- **THEN** project documentation MUST describe Netlify as the production frontend and proxy host
- **AND** it MUST remove instructions that require deploying the Express middleware separately on Render

#### Scenario: Rollback is needed
- **WHEN** the Netlify Function proxy fails production validation before Render is decommissioned
- **THEN** the application MUST be able to restore the previous Render API base URL through configuration without exposing the Flickr API key

### Requirement: Netlify Free plan compatibility
The Netlify Flickr proxy SHALL remain compatible with the Netlify Free plan and SHALL NOT require paid Netlify capabilities.

#### Scenario: Netlify resources are selected
- **WHEN** implementation selects Netlify runtime features
- **THEN** it MUST use ordinary request-triggered Netlify Functions, static hosting, redirects, headers, and environment variables only

#### Scenario: Paid capabilities are avoided
- **WHEN** implementation is complete
- **THEN** it MUST NOT require Netlify Database, Blob storage, AI features, Background Functions, Scheduled Functions, paid add-ons, custom deployment options, paid observability products, or a paid plan

#### Scenario: Zero-cost operation is documented
- **WHEN** production documentation is updated
- **THEN** it MUST state that auto-recharge is not required and should remain disabled for zero-cost operation
- **AND** it MUST document that unusually high traffic can exhaust free monthly usage credits and pause service rather than silently bill when auto-recharge is disabled

### Requirement: Production middleware elimination
The application SHALL eliminate the standalone Express middleware from the production architecture.

#### Scenario: Production proxy path is deployed
- **WHEN** production proxy traffic is handled by Netlify
- **THEN** it MUST NOT require running `node middleware/server.js` on Render or any separate production host

#### Scenario: Local middleware is evaluated
- **WHEN** local development workflow is updated
- **THEN** the implementation MUST either remove the local Express middleware or keep it as a local-only wrapper around shared proxy logic with no production deployment requirement
