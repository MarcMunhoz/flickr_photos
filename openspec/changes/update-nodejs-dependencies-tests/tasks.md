## 1. Environment and Package Baseline

- [ ] 1.1 Confirm Docker, Compose, Node runtime, Yarn, and lockfile state from `Dockerfile`, `docker-compose.yaml`, `README.md`, and `app/package.json`.
- [ ] 1.2 Confirm Docker is the canonical validation environment and document any host-only fallback commands used during implementation.
- [ ] 1.3 Check for duplicate package-manager artifacts and remove only artifacts introduced by this change if they conflict with Yarn.
- [ ] 1.4 Identify the current Node 22 image tag and decide whether a Node 22 patch or minor tag update is needed.

## 2. Dependency Security Maintenance

- [ ] 2.1 Review direct dependencies and devDependencies for compatible patch or minor updates that do not change product behavior.
- [ ] 2.2 Review known vulnerable transitive dependencies and map each fix to a direct upgrade or a narrow Yarn `resolutions` entry.
- [ ] 2.3 Apply dependency updates incrementally in `app/package.json` and `app/yarn.lock`, preserving Yarn as the only lockfile source.
- [ ] 2.4 Document any remaining vulnerability that requires an out-of-scope major upgrade and leave that upgrade unperformed.

## 3. Vitest Unit Test Infrastructure

- [ ] 3.1 Add Vitest and Vue test utilities needed for the existing Vite/Vue stack.
- [ ] 3.2 Add Vitest configuration and setup files that support Vue components, browser-like globals, and fetch mocking.
- [ ] 3.3 Add package scripts for unit test execution without replacing existing `dev`, `build`, `preview`, or `start` scripts.
- [ ] 3.4 Add unit tests for `app/src/utils/photo.js` and `app/src/utils/date.js`.
- [ ] 3.5 Add unit tests for `app/src/api/flickrApi.js`, including success, HTTP error, Flickr failure, query serialization, and abort signal behavior.
- [ ] 3.6 Add unit tests for core composables, prioritizing loading, success, error, empty-state, and stale request behavior.
- [ ] 3.7 Add focused component tests where component behavior is isolated enough to validate without Cypress.

## 4. Cypress E2E Infrastructure

- [ ] 4.1 Add Cypress and project configuration for the Vite frontend base URL and E2E test layout.
- [ ] 4.2 Add stable fixture data for Flickr username lookup, public photos, recent photos, empty states, and error responses.
- [ ] 4.3 Add Cypress tests for navigation across the home, about, and recent photos routes.
- [ ] 4.4 Add Cypress tests for the public gallery username flow with intercepted proxy responses.
- [ ] 4.5 Add Cypress tests for recent photos loading, filters, incremental loading where available, and error or empty states.
- [ ] 4.6 Add package scripts for Cypress run and open modes without replacing existing application scripts.

## 5. Final Validation and Reporting

- [ ] 5.1 Document the exact canonical Docker validation commands for dependency installation, build, unit tests, Cypress tests, and startup log review.
- [ ] 5.2 Validate that the app can start in the canonical environment and review stdout and stderr for startup exceptions or dependency failures.
- [ ] 5.3 Validate that unit tests pass in the canonical environment.
- [ ] 5.4 Validate that Cypress E2E tests pass in the canonical environment.
- [ ] 5.5 Validate that the production build completes in the canonical environment.
- [ ] 5.6 Summarize updated dependencies, runtime decisions, added tests, validation results, and any residual out-of-scope risks.
