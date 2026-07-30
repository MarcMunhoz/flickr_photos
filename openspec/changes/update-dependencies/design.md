## Context

The project is a Node.js 22 Vue 3/Vite application in `app/`, with Express middleware, Netlify Functions, Vitest unit tests, Cypress E2E tests, Yarn v1, and `app/yarn.lock`. Runtime configuration is pinned to the Node 22 major line through `.node-version`, `app/.node-version`, `app/package.json`, and `node:22-bookworm-slim` Docker stages.

The repository has Docker and Docker Compose, and local rules require package-manager, build, and validation commands to run in the container context. The existing scripts are `dev`, `build`, `preview`, `start`, `test:unit`, and `test:e2e`; there are no dedicated `lint` or `typecheck` scripts.

GitHub Dependabot currently reports open alerts for `brace-expansion`, `body-parser`, `js-yaml`, and `shell-quote`. A containerized `yarn outdated --json` run also shows multiple outdated direct dependencies and major updates, including `vite`, `@vitejs/plugin-vue`, `@vuepic/vue-datepicker`, `express`, `eslint`, `eslint-plugin-vue`, `vue-router`, `css-select`, `less-loader`, `jsdom`, and `concurrently`.

## Goals / Non-Goals

**Goals:**

- Preserve Node.js 22 as the runtime major version.
- Preserve Yarn v1 and `app/yarn.lock` as the package manager source of truth.
- Correct applicable Dependabot alerts and locally discovered vulnerabilities.
- Update direct and transitive dependencies to the highest technically safe versions.
- Evaluate major upgrades explicitly and apply only those that remain compatible with the current application and validation suite.
- Keep `resolutions` narrow and justified when transitive remediation cannot be achieved through direct upgrades.
- Validate installation, build, unit tests, E2E tests, and startup logs in the containerized environment.
- Document residual vulnerabilities, blocked upgrades, validation gaps, and commands executed.

**Non-Goals:**

- No migration to Node 23 or another Node major line.
- No migration from Yarn to npm, pnpm, or another package manager.
- No frontend redesign, product behavior change, route redesign, or unrelated architecture cleanup.
- No automatic installation of new lint, typecheck, or test tools beyond the existing project mechanisms.
- No forced dependency installation that hides incompatibilities without technical justification.
- No claims of complete runtime validation without command output or equivalent evidence.

## Decisions

### 1. Establish a containerized baseline first

Before changing versions, the implementation will record runtime files, package manager files, Docker files, direct dependency versions, Dependabot alerts, outdated package data, and available validation scripts. Initial install/audit/build/test failures will be captured so preexisting failures are not mistaken for dependency regressions.

**Alternatives considered:**

- Update directly without baseline: rejected because it would make regressions difficult to isolate.

### 2. Keep the runtime and package manager stable

The implementation will remain on Node 22 and Yarn v1. Docker base images may receive compatible tag updates only within the Node 22 line. `app/yarn.lock` will be regenerated only through Yarn, and npm or pnpm lockfiles must not be introduced.

**Alternatives considered:**

- Upgrade to the latest Node major: rejected because the specs require runtime major preservation.
- Migrate package managers: rejected because it expands scope and changes lockfile semantics unrelated to the maintenance goal.

### 3. Remediate vulnerable transitive dependencies before broad modernization

The first implementation target is to clear the open Dependabot alerts. The preferred order is direct package upgrades, then dependency-tree inspection, then a narrow Yarn `resolutions` entry if a vulnerable transitive package cannot be corrected through a compatible direct dependency update.

**Alternatives considered:**

- Apply broad `resolutions` for every vulnerable package immediately: rejected because it can mask incompatible dependency trees.
- Ignore development-only paths: rejected because dev dependencies can still affect build, test, or release workflows.

### 4. Apply updates in controlled groups

Dependencies should be updated in groups with related blast radius: security/transitive fixes, Vue ecosystem patches, Vite/build tooling, Cypress/Vitest/jsdom testing tools, Express/runtime server packages, formatting/dev utilities, and finally higher-risk major upgrades. Each group should keep the project installable and should be followed by the narrowest useful validation before moving on.

**Alternatives considered:**

- Update all packages to latest in one step: rejected because failures would be hard to attribute.
- Restrict all updates to patch/minor versions: rejected because technically viable major updates are in scope.

### 5. Treat major upgrades as migration work

Major updates such as Vite 8, Express 5, datepicker 14, Vue Router 5, ESLint 10, and less-loader 13 require compatibility checks against Node 22, current source code, current test setup, and current Docker images. A major upgrade may be accepted if required migrations are small and validation passes; otherwise it must be documented as deferred with residual risk.

**Alternatives considered:**

- Automatically defer all major updates: rejected because it may leave avoidable maintenance debt.
- Automatically apply all major updates: rejected because unrelated migration churn could exceed the dependency maintenance scope.

### 6. Validate with existing mechanisms only

Final validation will use the existing project scripts and Docker paths: Yarn install, `yarn build`, `yarn test:unit`, `yarn test:e2e`, and startup-log review. No lint or typecheck command will be required because the project does not define those scripts.

**Alternatives considered:**

- Add lint or typecheck tooling for this change: rejected because it is not requested and would broaden scope.
- Treat successful install as sufficient: rejected because it does not validate app behavior.

### 7. Preserve runtime behavior and secrets boundaries

Dependency changes must not alter user-facing app behavior, API route contracts, Netlify Function behavior, or Express middleware behavior except where a dependency migration requires equivalent compatibility changes. Implementation and validation must not read `.env`, `.env.*`, secrets, credentials, or private keys.

**Alternatives considered:**

- Use local secrets to run live Flickr validation: rejected because deterministic tests and startup checks can validate maintenance behavior without reading sensitive files.

### 8. Revert by dependency group

If validation fails after a dependency group, the implementation should inspect the failure, revert or narrow the responsible package group, and retry with a smaller update set. The manifest and lockfile are the primary rollback surface; source/test adaptations should only remain when they are required for accepted dependency versions.

**Alternatives considered:**

- Keep all failed upgrades and work around them broadly: rejected because it can accumulate unrelated behavior changes.

## Risks / Trade-offs

- **Breaking changes in major upgrades.** Impact high, probability medium. Mitigate with per-package migration review and group-level validation. Accept residual risk only when the deferred package, reason, and future path are documented.
- **Transitive override incompatibility.** Impact medium, probability medium. Mitigate by preferring direct upgrades and keeping `resolutions` narrow. Evidence required: dependency tree inspection plus passing install/build/tests.
- **Container validation cost and time.** Impact low, probability high. Mitigate by using targeted checks during intermediate steps and full Docker validation at the end.
- **Cypress browser/runtime dependency drift.** Impact medium, probability medium. Mitigate by using the Docker test target and keeping Cypress binary installation aligned with `app/package.json`.
- **Existing validation failures.** Impact medium, probability unknown. Mitigate by capturing baseline failures before attributing regressions to dependency updates.
- **Dependabot state changes during implementation.** Impact medium, probability medium. Mitigate by re-querying open alerts near the final security check and documenting the exact date of observed alerts.
- **Residual vulnerabilities without compatible fixes.** Impact varies by package and exposure. Mitigate by documenting dependency path, severity, exposure, and recommended future migration.
