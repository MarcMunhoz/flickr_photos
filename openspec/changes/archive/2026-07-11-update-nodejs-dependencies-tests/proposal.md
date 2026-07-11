## Why

The project needs a controlled maintenance pass to reduce dependency and runtime security risk while preserving the existing Vue/Vite application behavior. The current app already uses Docker, Yarn, Vite, Express middleware, and dependency resolutions, so the change must formalize updates and validation without changing the product surface or migrating tooling arbitrarily.

## What Changes

- Identify the canonical execution environment from the repository configuration and use it consistently for install, update, and validation work.
- Keep the active package manager and lockfile as the source of truth, preserving Yarn and avoiding duplicate lockfiles.
- Update Node.js only within the current major version when the runtime is pinned by the project.
- Update direct dependencies and transitive dependencies incrementally, using Yarn resolutions where needed for compatible security fixes.
- Add unit test infrastructure selected by the project stack; because the app uses Vite, Vitest is the required unit test runner.
- Add Cypress-based end-to-end coverage for core application routes and Flickr gallery flows.
- Define final validation expectations for build, unit tests, E2E tests, and application startup log review.

## Capabilities

### New Capabilities
- `nodejs-maintenance-validation`: Defines environment detection, package manager preservation, dependency security remediation, and final runtime validation requirements for Node.js maintenance.
- `test-coverage-modernization`: Defines unit and end-to-end test coverage requirements, including Vitest selection for Vite and Cypress coverage of core user flows.

### Modified Capabilities

None.

## Impact

- Affects `app/package.json`, `app/yarn.lock`, Node runtime configuration such as `Dockerfile` or related version pins, and test configuration files.
- Adds or updates unit tests for utilities, composables, services, and isolated Vue components.
- Adds Cypress configuration and E2E specs for primary routes, API-backed photo loading, user gallery behavior, and error or empty states where supported by the app.
- Requires validation commands to be documented for the native project environment, while respecting repository instructions that restrict command execution during proposal creation.
