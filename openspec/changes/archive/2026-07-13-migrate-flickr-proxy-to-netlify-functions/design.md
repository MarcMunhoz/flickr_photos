## Context

The project is a Vue 3/Vite application deployed on Netlify. Its production frontend currently calls a separately hosted Express proxy at `https://flickr-public-photos.onrender.com/api`, while local development can run the frontend and Express middleware together. The proxy exists because the Flickr API key must remain server-side and because the app should not expose a general-purpose Flickr proxy to arbitrary browser requests.

The current Express middleware already contains important security behavior: it requires `API_KEY`, allowlists only the Flickr methods used by the app, injects fixed Flickr response parameters, prevents credential override, and normalizes upstream failures into JSON responses. The migration should preserve those controls while reducing operational surface area by moving production proxy execution to Netlify Functions.

The nearby `365movies` project provides a useful precedent: it keeps an Express-style proxy locally and exposes an Express app through a Netlify Function using `serverless-http`. This project can borrow the Netlify consolidation idea, but the preferred implementation should be simpler for this project: a native Netlify Function handler with shared Flickr proxy logic, avoiding an Express adapter unless implementation evidence shows the adapter materially reduces complexity.

Netlify Functions are available on the Netlify Free plan, but the current Netlify pricing model uses monthly usage credits for production deploys, compute, bandwidth, and web requests. The design must therefore avoid paid-only features and keep the function lightweight enough for a small public portfolio/project workload. Auto-recharge must not be required.

## Goals / Non-Goals

**Goals:**

- Remove Render as a required production host for the Flickr proxy.
- Keep frontend and proxy production deployment focused on Netlify.
- Keep the deployment compatible with Netlify Free plan constraints.
- Preserve the current browser-facing Flickr proxy contract where practical.
- Keep `API_KEY` exclusively server-side.
- Preserve or strengthen method allowlisting, fixed parameter handling, error normalization, and security headers.
- Keep local development simple and compatible with Docker-based project workflows, removing the local Express middleware only if the replacement is simpler and preserves current behavior.
- Provide implementation tasks that can be split across independent subagents with limited shared state.

**Non-Goals:**

- Do not introduce MCP as the browser-facing integration mechanism.
- Do not change the product UI, routes, Flickr features, or supported Flickr methods.
- Do not expose a broad dynamic Flickr proxy beyond the current application needs.
- Do not migrate the frontend away from Netlify, Vue, Vite, or Yarn.
- Do not introduce Netlify paid add-ons, database services, blob storage, AI features, scheduled/background jobs, custom deployment options, or any feature requiring a paid plan.
- Do not require live Flickr data for routine automated regression tests.
- Do not decommission the Render service until the Netlify Function path has been validated and rollback remains available.

## Decisions

### Use Netlify Functions for the production proxy

Production proxy requests will be served by a Netlify Function in the same Netlify project as the frontend. This aligns deployment ownership, environment variables, and routing under one host and directly addresses the motivation to remove Render.

Alternatives considered:

- Keep Render: lowest code change, but preserves the split-host operational model the change is meant to remove.
- MCP server: useful for agent/tool integrations, but not a direct browser API replacement for a public Vue SPA.
- Cloudflare Workers or Vercel Functions: technically valid, but they introduce another provider instead of consolidating on Netlify.

### Prefer a native Netlify Function handler

A native Netlify Function handler means implementing the function in Netlify's direct request/response shape: a function receives a web `Request` plus Netlify context and returns a web `Response`. In practical terms, this is a small function file that parses the incoming URL, calls shared Flickr proxy logic, and returns `Response.json(...)`. It does not need an Express app or `serverless-http` wrapper.

This is preferred because the Flickr proxy has only one narrow endpoint and does not need Express routing, middleware stacks, view rendering, sessions, cookies, or complex request body parsing. Avoiding Express in the production function reduces dependencies, cold-start work, bundle size, and moving parts.

Alternatives considered:

- Express plus `serverless-http`, like `365movies`: familiar and valid, but likely heavier than needed for a single GET proxy endpoint.
- Keep the current Express server in production: preserves code shape, but does not consolidate production hosting on Netlify.

### Preserve the existing HTTP API contract

The frontend should continue to make Flickr proxy requests through the existing `fetchFlickr` abstraction and the same logical `/api/flickr` endpoint shape. Netlify routing can map that route to the function, and `VITE_API_BASE_URL` can remain an escape hatch for rollback or alternate environments.

Alternatives considered:

- Change all callers to a Netlify-specific `/.netlify/functions/...` URL: simpler routing, but leaks hosting implementation into application code and increases churn.
- Create a new API versioned path: useful for breaking changes, but unnecessary if the contract remains compatible.

### Prefer shared proxy logic and eliminate production middleware

Implementation should avoid maintaining separate, divergent copies of the Flickr proxy rules. The existing middleware behavior can be extracted into a small shared handler/service used by the native Netlify Function and, if still needed, a thin local development wrapper.

The production Express middleware should be eliminated from the production architecture. The local Express middleware may also be removed if local development can remain simple through Netlify Dev, Vite proxying, or direct tests of the shared handler. If removing it makes Docker/local development harder, keep only a minimal local wrapper and document that production uses the Netlify Function.

Alternatives considered:

- Copy the Express handler into the function: fastest initially, but high risk of future drift in security controls and error behavior.
- Keep full Express middleware indefinitely: reduces migration churn, but preserves unnecessary code if the native handler covers local and production needs.

### Stay within the Netlify Free plan

The implementation must use only standard Netlify static hosting, redirects, environment variables, and ordinary request-triggered Netlify Functions. It must not require paid Netlify plan features, paid add-ons, Netlify Database, Blob storage, AI Gateway, Edge Functions, Background Functions, Scheduled Functions, custom deployment options, or auto-recharge.

The proxy should remain a simple stateless GET endpoint. It should not add caching layers, persistent storage, queues, analytics products, or observability dependencies that could create cost or plan pressure. Validation should include reviewing Netlify usage-risk assumptions and documenting that high traffic can still exhaust free monthly credits, causing the site to pause rather than silently bill when auto-recharge is off.

Alternatives considered:

- Add a cache/database to reduce Flickr calls: potentially useful later, but unnecessary now and may introduce paid or more complex operational surfaces.
- Use Edge Functions for latency: unnecessary for this proxy and not needed to preserve current behavior.

### Keep the Flickr proxy narrow

The Netlify Function must continue to allow only `flickr.people.findByUsername`, `flickr.people.getPublicPhotos`, and `flickr.photos.getRecent`. Browser-supplied `api_key`, `format`, and `nojsoncallback` must never override server-controlled values.

Alternatives considered:

- Forward arbitrary Flickr methods: more flexible, but turns the private key into a broader server-side proxy capability.
- Allow configuration-driven method expansion: reasonable in the future, but unnecessary for this migration and harder to audit.

### Keep same-origin production requests

After migration, production should prefer same-origin proxy calls from the Netlify frontend to the Netlify Function. The CSP should remove the Render connect origin and only allow the connections actually needed by the app.

Alternatives considered:

- Keep Render in CSP as a fallback: convenient during rollout, but leaves stale production trust in the final state.
- Configure broad CORS: unnecessary for same-origin production and increases exposure.

### Validate without live Flickr dependency

Routine tests should mock Flickr responses and validate request construction, allowlist behavior, credential protection, and error normalization. A live smoke check may be documented separately, but it should not be required for deterministic CI-style validation.

Alternatives considered:

- Use live Flickr in E2E tests: catches provider integration issues, but makes tests flaky and dependent on external rate limits/data.
- Rely only on frontend Cypress intercepts: preserves UI regression coverage but misses proxy security behavior.

## Risks / Trade-offs

- Netlify route ordering could send `/api/flickr` to the SPA fallback instead of the function -> Mitigate by explicitly defining proxy/function redirects before the catch-all SPA redirect and validating route behavior.
- Function implementation could drift from local Express middleware -> Mitigate by sharing core proxy logic or covering both wrappers with the same tests.
- API key could leak through logs, error responses, or frontend build output -> Mitigate with user-safe errors, no secret-bearing diagnostics, and validation that built assets do not contain `API_KEY`.
- Removing Render defaults could break production if Netlify environment variables are missing -> Mitigate by documenting required Netlify variables, returning clear missing-config errors, and keeping `VITE_API_BASE_URL` as a rollback override during rollout.
- Netlify Functions may have different timeout/runtime behavior than Render -> Mitigate by keeping the proxy request simple, adding upstream timeout/error handling if needed, and validating failure modes.
- Netlify Free credits could be exhausted by unusually high traffic or repeated function calls -> Mitigate by keeping the function lightweight, avoiding paid add-ons, documenting usage risk, and requiring auto-recharge to remain disabled for zero-cost operation.
- CSP changes could block legitimate image or proxy requests -> Mitigate with tests/manual smoke validation for same-origin API requests and Flickr image rendering.
- Adding `serverless-http` or similar dependency increases dependency surface -> Mitigate by preferring native Netlify Function request handling and adding an adapter only if justified by implementation evidence.

## Migration Plan

1. Extract or isolate reusable Flickr proxy behavior so it can be exercised without starting a production server.
2. Add a native Netlify Function endpoint for Flickr proxy requests.
3. Configure Netlify routing so `/api/flickr` reaches the function before the SPA fallback.
4. Update frontend production defaults to same-origin Netlify API routing while preserving `VITE_API_BASE_URL` override.
5. Update CSP and related headers to remove the Render origin from final production trust.
6. Add deterministic tests for proxy behavior, API URL selection, and migrated Cypress intercepts.
7. Update README configuration, production, and validation sections for Netlify-only production hosting.
8. Validate containerized local workflows and Netlify Function behavior.
9. Deploy with the old Render URL retained only as a rollback override.
10. After production verification, remove Render references from operational docs and decommission the Render service outside the codebase.

Rollback strategy:

- Before Render is decommissioned, set `VITE_API_BASE_URL` back to the Render API base URL and redeploy the frontend if a production issue appears in the Netlify Function path.
- Keep the server-side Flickr `API_KEY` only in trusted hosting environments during rollback.
- Revert Netlify CSP removal of the Render origin only if rollback is actually used.

## Resolved Implementation Guidance

- Use a native Netlify Function handler first; add `serverless-http` only if the native handler demonstrably increases complexity.
- Eliminate Express from the production runtime. Remove the local middleware too if local development remains simpler without it; otherwise keep a thin local-only wrapper around shared logic.
- Keep `API_KEY` as the required environment variable for compatibility unless implementation discovers an existing Netlify variable naming conflict. A later rename to `FLICKR_API_KEY` is out of scope unless backward compatibility is preserved.
- Keep live Flickr checks optional and manual. Automated validation must remain deterministic and mocked.
- Treat Netlify Free compatibility as a hard constraint: no paid-only features, no paid add-ons, and no required auto-recharge.
