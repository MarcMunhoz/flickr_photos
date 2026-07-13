## Why

The Flickr proxy is currently deployed separately on Render while the frontend is deployed on Netlify, which splits ownership, configuration, observability, and secret management across two hosting surfaces. Moving the proxy into Netlify Functions keeps the application operational model simpler, reduces external hosting dependency, and lets the project focus production deployment on Netlify without exposing the Flickr API key to the browser.

## What Changes

- Replace the production dependency on the Render-hosted Express middleware with a Netlify Function that preserves the existing Flickr proxy behavior.
- Keep the browser-facing API contract compatible with the current frontend client: requests to the Flickr proxy must continue to support username lookup, public user photos, and recent public photos.
- Preserve server-side Flickr API key handling so `API_KEY` is never bundled into frontend assets or sent to the browser.
- Preserve method allowlisting, fixed credential injection, upstream error normalization, and defensive request handling from the current middleware.
- Keep the migration compatible with Netlify's free plan by avoiding paid-only Netlify features, paid add-ons, databases, blob storage, AI features, background jobs, scheduled jobs, or any dependency on auto-recharge.
- Update Netlify configuration, frontend production defaults, security headers, and deployment documentation so production traffic targets the Netlify-hosted proxy.
- Remove the production Express middleware dependency and allow the implementation to remove or reduce the local Express middleware if a simpler Netlify-compatible local workflow preserves the project's development ergonomics.
- Add focused tests and validation covering the Netlify Function behavior, frontend API base URL behavior, and regression paths already covered by the app.
- Remove Render-specific production configuration and documentation once the Netlify Function path is validated.

## Capabilities

### New Capabilities

- `netlify-flickr-proxy`: Defines the production Flickr proxy behavior, security controls, Netlify routing/configuration, and validation expectations for replacing the Render middleware.

### Modified Capabilities

- `test-coverage-modernization`: Extend coverage expectations to include the Netlify Function proxy and the frontend's production API routing behavior.
- `nodejs-maintenance-validation`: Extend validation expectations so deployment/runtime validation covers the Netlify Function path in addition to the containerized local workflow.

## Impact

- Affected frontend API client: `app/src/api/flickrApi.js`.
- Affected proxy/runtime code: `app/middleware/server.js` and new Netlify Function source under `app/netlify/functions/`.
- Affected Netlify deployment configuration and headers: `app/netlify.toml`.
- Affected package metadata: `app/package.json` and `app/yarn.lock` if serverless/function dependencies or scripts are required.
- Cost constraints: implementation must stay within Netlify Free capabilities and must not require enabling paid plan features or auto-recharge.
- Affected documentation: `README.md`, especially production, local development, configuration, and validation sections.
- Affected tests: unit tests for API base URL behavior and proxy/function request handling, plus existing Cypress proxy intercept assumptions.
- External system impact: production no longer depends on Render for the Flickr proxy after migration; Flickr remains the upstream API provider.
