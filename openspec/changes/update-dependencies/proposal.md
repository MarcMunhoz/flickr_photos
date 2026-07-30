## Why

The project has open Dependabot alerts in the GitHub repository and several direct or transitive npm packages with newer compatible versions available. This maintenance pass is needed to remediate known vulnerabilities, reduce dependency drift, and keep the Vue/Vite application on supported package versions while preserving the current runtime and deployment model.

## Current State

- The application is a Node.js 22 project with Vue 3, Vite, Express middleware, Netlify Functions, Vitest, and Cypress.
- Runtime is pinned to the Node 22 major line through `.node-version`, `app/.node-version`, `app/package.json` engines, and `node:22-bookworm-slim` Docker stages.
- The active package manager is Yarn v1 with `app/yarn.lock` as the lockfile source of truth.
- Docker is present through `Dockerfile` and `docker-compose.yaml`; repository rules require package manager, build, and validation commands to run in the container context.
- Existing scripts include `dev`, `build`, `preview`, `start`, `test:unit`, and `test:e2e`.
- Existing automated validation includes Vitest unit tests under `app/src/**/*.test.js` and Cypress specs under `app/cypress/e2e/*.cy.js`.
- GitHub remote is `MarcMunhoz/flickr_photos`.
- Open Dependabot alerts were available through the GitHub API for `app/yarn.lock`: `brace-expansion` high severity patched in `1.1.16`, `body-parser` low severity patched in `1.20.6`, `js-yaml` high and medium severity patched in `3.15.0`, and `shell-quote` high severity patched in `1.9.0`.
- `yarn outdated --json` executed inside the Docker Compose app service shows available updates for packages including `@vitejs/plugin-vue`, `@vue/compiler-dom`, `@vuepic/vue-datepicker`, `concurrently`, `css-select`, `cypress`, `dotenv`, `esbuild`, `eslint`, `eslint-plugin-vue`, `express`, `flatted`, `jsdom`, `less`, `less-loader`, `prettier`, `vite`, `vue`, and `vue-router`.

## What Changes

- Update vulnerable transitive dependencies in `app/yarn.lock` to patched versions, using direct dependency upgrades first and Yarn `resolutions` only when no compatible direct upgrade resolves the vulnerable package.
- Keep runtime updates within Node 22 and keep Docker stages based on the Node 22 major line.
- Preserve Yarn v1 and avoid creating npm or pnpm lockfiles.
- Update direct dependencies to the latest technically compatible versions where validation remains green.
- Evaluate major upgrades separately for packages with substantial breaking-change risk, especially `vite` 8, `@vitejs/plugin-vue` 6, `@vuepic/vue-datepicker` 14, `express` 5, `eslint` 10, `eslint-plugin-vue` 10, `vue-router` 5, `css-select` 7, `less-loader` 13, `jsdom` 30, and `concurrently` 10.
- Update `app/yarn.lock` to reflect all accepted direct and transitive dependency changes.
- Adjust source, tests, or configuration only where dependency breaking changes require it.

## Validation

- Run dependency installation in the Docker context with Yarn and the lockfile.
- Run the production build through the containerized project environment.
- Run Vitest with `yarn test:unit` in the containerized environment.
- Run Cypress with `yarn test:e2e` through the Docker Compose test profile or equivalent container path.
- Start the app in the containerized environment and review stdout/stderr for startup errors, unhandled exceptions, dependency resolution failures, and missing runtime configuration that blocks the app.
- No separate lint or typecheck validation is planned because the project does not define dedicated `lint` or `typecheck` scripts.

## Constraints

- Package manager commands, build, and validation must run in containers, not directly on the host.
- Node major version must remain 22.
- Yarn v1 and `app/yarn.lock` must remain the package manager source of truth.
- Some available latest versions are major upgrades and may require code or configuration changes; they should be applied only when compatible with the current Vue/Vite/Express application and validation suite.
- Existing `less-loader` reports an unmet `webpack` peer dependency during Yarn install; this should not drive a tooling migration unless it affects validation.
- Dependency updates must not read or rely on `.env`, `.env.*`, secrets, credentials, or private keys.

## Impact

- Affects `app/package.json` and `app/yarn.lock`.
- May affect Docker build cache, Docker image layers, and package installation behavior.
- May affect Vite/Vue build behavior, Express middleware behavior, Netlify Function tests, Cypress browser setup, and dependency resolutions.
- May require focused updates to source code, unit tests, E2E tests, or configuration files if accepted package upgrades introduce breaking changes.

## Security References

- GitHub repository: `MarcMunhoz/flickr_photos`.
- Open Dependabot alerts consulted through GitHub API on 2026-07-30:
  - `GHSA-3jxr-9vmj-r5cp` / `CVE-2026-13149`: `brace-expansion` `< 1.1.16`, high severity, patched in `1.1.16`.
  - `GHSA-v422-hmwv-36x6` / `CVE-2026-12590`: `body-parser` `< 1.20.6`, low severity, patched in `1.20.6`.
  - `GHSA-52cp-r559-cp3m` / `CVE-2026-59869`: `js-yaml` `>= 3.0.0, < 3.15.0`, high severity, patched in `3.15.0`.
  - `GHSA-395f-4hp3-45gv` / `CVE-2026-13311`: `shell-quote` `<= 1.8.4`, high severity, patched in `1.9.0`.
  - `GHSA-h67p-54hq-rp68` / `CVE-2026-53632`: `js-yaml` `< 3.15.0`, medium severity, patched in `3.15.0`.
- Local dependency drift was checked with `docker compose run --rm --entrypoint yarn app outdated --json`.
