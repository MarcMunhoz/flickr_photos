# Validation Report

## Change

`migrate-flickr-proxy-to-netlify-functions`

## Implementation Summary

- Added shared Flickr proxy logic in `app/src/api/flickrProxy.js`.
- Added a native Netlify Function handler in `app/netlify/functions/flickr.js`.
- Added explicit `GET`-only enforcement in the Netlify Function to match the old Express route surface.
- Updated the local Express wrapper to reuse the shared proxy behavior.
- Changed the frontend default API base URL to same-origin `/api`.
- Added Netlify function routing before the SPA fallback and removed the Render origin from CSP.
- Removed the unused `node-fetch` dependency with Yarn.
- Updated README production, configuration, validation, and Netlify Free plan guidance.

## Validation Commands

```bash
docker compose run --rm --entrypoint /bin/sh app -c "yarn test:unit"
docker compose run --rm --entrypoint /bin/sh app -c "yarn build"
rg -n "API_KEY|server-secret|flickr-public-photos|onrender\\.com" app/dist
docker compose up -d --build
docker compose --profile test run --rm e2e
docker compose logs --no-color --tail 160 app
openspec validate "migrate-flickr-proxy-to-netlify-functions"
```

## Results

- Unit tests passed: 8 files, 29 tests.
- Production build passed with Vite.
- Built frontend assets did not contain `API_KEY`, test secrets, `flickr-public-photos`, or `onrender.com`.
- Code review found that non-GET requests could reach the Function proxy. A regression test was added and the Function now returns JSON `405` with `Allow: GET` before calling Flickr.
- Cypress E2E passed: 3 specs, 5 tests.
- App startup logs showed dependency install, Vite startup, and local API wrapper startup without unhandled exceptions.
- OpenSpec validation passed.

## Security Checks

- Flickr method allowlist remains limited to the supported application methods.
- Browser-supplied `api_key`, `format`, and `nojsoncallback` cannot override server-controlled upstream parameters.
- Proxy error responses avoid stack traces, upstream URLs, and secret-bearing diagnostics.
- Non-GET requests are rejected before contacting Flickr.
- Production CSP uses same-origin `connect-src 'self'` and no longer trusts the old Render proxy origin.
- Netlify implementation uses ordinary request-triggered Functions, redirects, headers, and environment variables only.
- Documentation warns against putting secrets in `VITE_*` variables and documents disabled auto-recharge for zero-cost Netlify operation.

## Rollout Notes

- Configure `API_KEY` in the Netlify site environment before deploying.
- Keep the existing Render deployment available only as a temporary rollback target until the Netlify Function path is verified in production.
- If rollback is needed before Render decommissioning, set `VITE_API_BASE_URL` to the previous Render API base URL and redeploy Netlify.
- After production verification, Render can be decommissioned because source defaults, Netlify CSP, docs, and tests no longer require the Render origin.
