# nodejs-maintenance-validation Specification

## Purpose
Define the required environment, package manager, runtime, dependency, and validation controls for Node.js maintenance work in this project.

## Requirements

### Requirement: Canonical environment detection
The maintenance process SHALL identify whether the repository defines a Docker-based execution environment and SHALL use that environment as the canonical validation target when Docker configuration is present.

#### Scenario: Docker configuration is present
- **WHEN** the repository contains Docker or Compose configuration for the application
- **THEN** dependency installation, build validation, test validation, and startup validation MUST be planned against the containerized environment

#### Scenario: Host fallback is needed
- **WHEN** container execution is unavailable during implementation
- **THEN** the process MUST document the host command that would validate the same behavior and identify that final parity validation remains container-based

### Requirement: Package manager preservation
The maintenance process SHALL preserve the active package manager and lockfile used by the project.

#### Scenario: Yarn lockfile exists
- **WHEN** `app/yarn.lock` exists and no other lockfile is the project source of truth
- **THEN** dependency updates MUST use Yarn and MUST update `app/yarn.lock` without creating npm or pnpm lockfiles

#### Scenario: Transitive dependency remediation is required
- **WHEN** a vulnerability exists only in a transitive dependency and no direct compatible upgrade resolves it
- **THEN** the process MUST use the package manager's supported override mechanism and keep the override as narrow as practical

### Requirement: Runtime major version preservation
The maintenance process SHALL NOT change the Node.js major version used by the project.

#### Scenario: Runtime is pinned to Node 22
- **WHEN** the runtime configuration uses the Node 22 major line
- **THEN** runtime updates MUST remain on Node 22 and MUST NOT migrate to a newer major line

### Requirement: Dependency security remediation
The maintenance process SHALL update direct and transitive dependencies to remediate known critical or high vulnerabilities when compatible fixes are available.

#### Scenario: Compatible dependency fixes exist
- **WHEN** security fixes are available without crossing incompatible major versions
- **THEN** dependencies and lockfile entries MUST be updated incrementally to include those fixes

#### Scenario: Fix requires out-of-scope major upgrade
- **WHEN** a vulnerability can only be fixed by a package or runtime major upgrade that is outside scope
- **THEN** the process MUST document the remaining risk and MUST NOT perform the out-of-scope upgrade

### Requirement: Final runtime validation
The maintenance process SHALL define final validation that confirms installation, build, tests, and application startup behavior.

#### Scenario: Final validation is performed
- **WHEN** the maintenance implementation is ready for acceptance
- **THEN** validation MUST include dependency installation, production build, unit tests, Cypress tests, and startup log review in the canonical environment

#### Scenario: Startup logs are reviewed
- **WHEN** the application starts during validation
- **THEN** stdout and stderr MUST be checked for startup errors, unhandled exceptions, dependency resolution failures, and missing runtime configuration that blocks the app

### Requirement: Netlify Function migration validation
The project SHALL define validation steps that cover both local development behavior and the Netlify Function production proxy path.

#### Scenario: Container validation is run
- **WHEN** implementation is ready for acceptance
- **THEN** validation MUST continue to include dependency installation, unit tests, production build, Cypress tests, and startup review in the documented containerized environment

#### Scenario: Function behavior is validated locally
- **WHEN** Netlify Function source is added
- **THEN** validation MUST include a deterministic local command or test path that executes the function behavior without requiring live Flickr data

#### Scenario: Production deployment settings are reviewed
- **WHEN** Netlify deployment configuration is updated
- **THEN** validation MUST confirm required environment variables, function routing, SPA fallback ordering, and security headers are documented for Netlify

#### Scenario: Render decommission readiness is checked
- **WHEN** the migration is considered complete
- **THEN** validation MUST confirm the app no longer depends on the Render origin in source defaults, Netlify headers, tests, or production documentation

#### Scenario: Free plan readiness is checked
- **WHEN** the migration is considered complete
- **THEN** validation MUST confirm the implementation does not require paid Netlify capabilities, paid add-ons, paid plan settings, or auto-recharge
