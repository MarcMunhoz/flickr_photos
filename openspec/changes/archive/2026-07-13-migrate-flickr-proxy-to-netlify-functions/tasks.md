## 1. Baseline and Work Split

- [x] 1.1 Confirm current behavior by reading `app/middleware/server.js`, `app/src/api/flickrApi.js`, `app/netlify.toml`, `README.md`, and existing tests that intercept Flickr proxy calls.
- [x] 1.2 Confirm the implementation shape before coding: prefer a native Netlify Function handler with shared proxy logic, and require written justification before adding Express adapters such as `serverless-http`.
- [x] 1.3 Define subagent ownership boundaries: Proxy Agent owns shared proxy/function code, Frontend Config Agent owns API URL and Netlify routing, Test Agent owns automated coverage, Docs Agent owns README/deployment notes, Security Review Agent owns threat review and final security checks.
- [x] 1.4 Identify files likely to be shared across subagents and sequence those edits to avoid concurrent changes to the same file.

## 2. Proxy Agent - Shared Flickr Proxy Behavior

- [x] 2.1 Extract the existing Flickr proxy rules into reusable logic that can be exercised without starting the Express server.
- [x] 2.2 Preserve the supported Flickr method allowlist for `flickr.people.findByUsername`, `flickr.people.getPublicPhotos`, and `flickr.photos.getRecent`.
- [x] 2.3 Preserve server-side `API_KEY` injection and ensure browser-supplied `api_key`, `format`, and `nojsoncallback` cannot override fixed proxy values.
- [x] 2.4 Preserve compatible JSON responses for missing configuration, unsupported methods, Flickr HTTP failures, Flickr `stat: "fail"` failures, and upstream fetch/parsing failures.
- [x] 2.5 Ensure proxy errors and logs do not expose API keys, complete secret-bearing upstream URLs, stack traces, or raw request diagnostics in browser responses.
- [x] 2.6 Remove the Express middleware from production architecture and either remove the local Express middleware or keep it as a local-only wrapper around shared proxy behavior.

## 3. Proxy Agent - Netlify Function Runtime

- [x] 3.1 Add the native Netlify Function source under `app/netlify/functions/` for the Flickr proxy route.
- [x] 3.2 Wire the function to the shared proxy behavior and validate that it accepts the existing `/api/flickr` query shape.
- [x] 3.3 Avoid new runtime dependencies where practical; if any dependency is required, add it with Yarn only and update `app/yarn.lock` without creating npm or pnpm lockfiles.
- [x] 3.4 Confirm the function can run deterministically in tests without making live Flickr requests.
- [x] 3.5 Confirm the implementation does not require paid Netlify features, paid add-ons, databases, blob storage, AI features, background jobs, scheduled jobs, custom deployment options, or auto-recharge.

## 4. Frontend Config Agent - Routing and Client Defaults

- [x] 4.1 Update `app/src/api/flickrApi.js` so production defaults use the Netlify-hosted same-origin proxy route instead of the Render origin while preserving `VITE_API_BASE_URL` override behavior.
- [x] 4.2 Update `app/netlify.toml` so API/function routing is evaluated before the SPA fallback route.
- [x] 4.3 Update Content Security Policy to allow same-origin proxy calls and required Flickr image loading while removing the Render origin from the final production policy.
- [x] 4.4 Verify existing frontend call sites continue to use `fetchFlickr` without UI or composable behavior changes.

## 5. Test Agent - Proxy and Client Coverage

- [x] 5.1 Add unit tests for supported method forwarding that verify upstream URL construction, credential injection, fixed parameter protection, and successful JSON forwarding with mocked Flickr responses.
- [x] 5.2 Add unit tests for unsupported or missing Flickr methods that verify `400` JSON responses and no upstream Flickr request.
- [x] 5.3 Add unit tests for missing `API_KEY` behavior that verify user-safe server configuration errors with no secret leakage.
- [x] 5.4 Add unit tests for Flickr HTTP failures, Flickr `stat: "fail"`, network failures, and invalid upstream JSON.
- [x] 5.5 Add or update frontend API client tests for production default route selection and `VITE_API_BASE_URL` trailing-slash normalization.
- [x] 5.6 Update Cypress intercept patterns and fixtures if needed so user-gallery and recent-photo flows remain deterministic after the route migration.

## 6. Docs Agent - Documentation and Operations

- [x] 6.1 Update `README.md` architecture text to describe Netlify as the production frontend and proxy host.
- [x] 6.2 Update configuration documentation for required Netlify environment variables, including `API_KEY` and any optional API override variables.
- [x] 6.3 Update local development documentation to clarify when to use Docker, local Express middleware, and any Netlify Function local execution path.
- [x] 6.4 Update production documentation to remove Render as a required deployment target and describe Render rollback only as a temporary pre-decommission option.
- [x] 6.5 Update validation documentation with deterministic proxy/function tests, containerized validation commands, and optional live Flickr smoke check if retained.
- [x] 6.6 Document Netlify Free plan assumptions, including disabled auto-recharge for zero-cost operation and the risk that unusually high usage can pause the site at the free monthly credit limit.

## 7. Security Review Agent - Security-Specific Verification

- [x] 7.1 Review the implemented proxy for broad-method forwarding, credential override, secret leakage, excessive CORS allowance, and unsafe error diagnostics.
- [x] 7.2 Verify built frontend assets do not contain `API_KEY` or any configured Flickr secret value.
- [x] 7.3 Verify `app/netlify.toml` no longer trusts `https://flickr-public-photos.onrender.com` in the final Content Security Policy.
- [x] 7.4 Verify same-origin production requests do not require broad CORS and local CORS behavior remains explicitly scoped.
- [x] 7.5 Verify rollback via `VITE_API_BASE_URL` is documented without reintroducing secrets into frontend configuration.
- [x] 7.6 Verify the implementation uses only Netlify Free-compatible features and does not require auto-recharge or paid add-ons.

## 8. Integration and Final Validation

- [x] 8.1 Run the unit test suite in the documented containerized environment.
- [x] 8.2 Run the production build in the documented containerized environment.
- [x] 8.3 Run Cypress E2E tests with deterministic network responses in the documented containerized environment.
- [x] 8.4 Review application startup logs for dependency resolution failures, function-related errors, missing configuration, and unhandled exceptions.
- [x] 8.5 Run OpenSpec validation for `migrate-flickr-proxy-to-netlify-functions`.
- [x] 8.6 Produce a final implementation note listing validation commands, security checks performed, any remaining rollout steps, and whether Render can be decommissioned.
