## Context

The repository contains a Vue 3 and Vite frontend in `app/`, an Express Flickr API proxy in `app/middleware/server.js`, Yarn as the package manager, and Docker Compose for local development. The Dockerfile currently pins the runtime to the Node 22 major line, while `app/package.json` contains dependency resolutions that indicate prior transitive security remediation work.

The change is a maintenance and validation initiative. It must reduce dependency and test coverage risk without changing user-facing behavior, migrating package managers, redesigning the app, or moving the project to a new Node major version.

## Goals / Non-Goals

**Goals:**

- Preserve the canonical package manager and lockfile, using Yarn and `app/yarn.lock` as the source of truth.
- Keep Node.js within the current major version and apply only compatible patch or minor runtime updates when the runtime is changed.
- Update direct and transitive dependencies incrementally, preferring compatible upgrades and Yarn `resolutions` for targeted subdependency fixes.
- Add Vitest unit test infrastructure because the application uses Vite.
- Add Cypress E2E coverage for the core public gallery, recent photos, route navigation, API success paths, and supported failure or empty states.
- Define final validation around build, unit tests, Cypress, and runtime startup logs in the native project environment.

**Non-Goals:**

- No Node.js major upgrade.
- No migration from Yarn to npm or pnpm.
- No frontend redesign, UI/UX change, or product behavior change.
- No framework migration for Vue, Vite, Express, or routing.
- No deployment or cloud infrastructure redesign.

## Decisions

1. **Use Docker as the preferred validation environment when available.**
   The repository includes `Dockerfile`, `docker-compose.yaml`, and README instructions that place Docker Compose as the local development path. Validation tasks should therefore prefer Docker Compose for parity, while still documenting host equivalents when useful for local diagnosis. Alternative considered: host-only validation. That would be faster but would not match the repository's documented runtime.

2. **Preserve Yarn and the existing lockfile.**
   `app/yarn.lock` is present and `package.json` already uses Yarn-compatible `resolutions`. All dependency work should update that lockfile only and must not introduce `package-lock.json` or `pnpm-lock.yaml`. Alternative considered: migrate to a newer package manager. That is outside scope and increases risk without solving the requested maintenance problem.

3. **Restrict Node runtime updates to the Node 22 line.**
   Runtime configuration must stay on Node 22 and can use the OS base that best fits the execution target. The Dockerfile separates normal app images from the Cypress test image so browser runtime libraries do not inflate production deploys. Alternative considered: upgrade to the latest Node major. That could introduce unrelated compatibility changes and violates the runtime constraint.

4. **Use Vitest for unit tests and Cypress for E2E tests.**
   Vite is the application build tool, making Vitest the compatible unit test default. Cypress is mandated for E2E coverage and should exercise routes through the running app with network interception for Flickr proxy responses where deterministic tests are needed. Alternative considered: Jest for all tests. Jest would add more configuration overhead for Vite and is lower priority under the requested tool selection policy.

5. **Treat dependency remediation as incremental and reversible.**
   Direct dependencies should be updated in small groups, with subdependency vulnerabilities handled via compatible package upgrades first and `resolutions` only when a direct path is unavailable. Each step should keep the app installable and the lockfile coherent. Alternative considered: broad latest-version upgrades. That creates a larger regression surface and may unintentionally introduce major-version changes.

## Risks / Trade-offs

- Dependency minor updates introduce regressions -> Mitigate by updating incrementally and validating with build, unit tests, E2E tests, and app startup.
- Cypress can be flaky against live Flickr data -> Mitigate by intercepting API responses for deterministic core flows and reserving live checks for explicit smoke validation only.
- Docker validation can be slower than host validation -> Mitigate by using Docker for final parity and host commands only as optional local diagnostics.
- Security fixes may require transitive overrides -> Mitigate by documenting each `resolutions` entry and preferring the narrowest compatible override.
- API key-dependent flows may fail in local environments -> Mitigate by testing frontend behavior with intercepted proxy responses and separately validating middleware error handling for missing credentials.

## Migration Plan

1. Inspect Docker, Node, package manager, and lockfile state.
2. Update Node 22 patch or minor tag only if a newer compatible runtime is selected.
3. Update dependencies and lockfile with Yarn, preserving existing package manager artifacts.
4. Add Vitest configuration, scripts, setup, and focused unit tests for utilities, API client behavior, composables, and key isolated components.
5. Add Cypress configuration and E2E specs for home gallery, recent photos, route navigation, and relevant error or empty states.
6. Validate in the canonical environment with install, build, unit test, Cypress, and startup-log checks.
7. If a dependency update causes regressions, rollback the smallest dependency group or resolution responsible and repeat validation.

## Open Questions

- No minimum numeric coverage threshold is defined; initial implementation should prioritize critical utilities, composables, API behavior, and route-level flows instead of enforcing a percentage gate.
- No internal route priority document is present; Cypress coverage should be inferred from the README, router, views, components, and API proxy.
- External connectivity availability is unknown; dependency downloads and Docker image refreshes may require network access during implementation.
