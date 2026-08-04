## Validation Report

### Baseline

- Runtime remains Node.js 22 through `.node-version`, `app/.node-version`, `app/package.json` engines, and `node:22-bookworm-slim`.
- Package manager remains Yarn v1 with `app/yarn.lock`; no `package-lock.json` or `pnpm-lock.yaml` was introduced.
- Existing scripts are `dev`, `build`, `preview`, `start`, `test:unit`, and `test:e2e`; there are no dedicated `lint` or `typecheck` scripts.
- Baseline install, build, and unit tests passed in Docker before dependency changes.
- Baseline Yarn install warning: `less-loader@10.2.0` has unmet peer dependency `webpack@^5.0.0`.
- Baseline Dependabot query on 2026-08-04 returned 11 open alerts in `app/yarn.lock`: `js-yaml` alerts 87 and 89, `shell-quote` alert 88, `body-parser` alert 90, `brace-expansion` alert 91, `postcss` alert 92, and `undici` alerts 94-98.
- Baseline `yarn audit --json` reported 25 vulnerabilities: 1 low, 8 moderate, and 16 high.

### Dependency Changes

- Updated direct dependencies: `dotenv` 16.5.0 -> 17.4.2, `eslint` 6.x -> 10.8.0, `eslint-plugin-vue` 6.x -> 10.10.0, `express` 4.x -> 5.2.1, `less` 4.6.7 -> 4.8.1, `terser` 5.49.0 -> 5.49.1, and `vue` 3.5.39 -> 3.5.40.
- Updated dev dependencies: `@vue/compiler-dom` 3.5.39 -> 3.5.40, `concurrently` 8.x -> 10.0.4, `cypress` 15.18.1 -> 15.19.0, `prettier` 3.9.5 -> 3.9.6, and added `vue-eslint-parser` 10.3.0 for the new `eslint-plugin-vue` peer dependency.
- Updated Docker Cypress binary pin from 15.18.1 to 15.19.0 to match the package version.
- Added narrow Yarn resolutions for `brace-expansion`, `body-parser`, `js-yaml`, `postcss`, `shell-quote`, and `undici`.
- Updated existing `flatted` resolution from 3.4.2 to 3.4.4.

### Vulnerability Results

- `brace-expansion` resolves to 2.1.4.
- `body-parser` resolves to 1.20.6.
- `js-yaml` resolves to 3.15.1.
- `postcss` resolves to 8.5.25.
- `shell-quote` resolves to 1.10.0.
- `undici` resolves to 7.29.0.
- Final `yarn audit --json` in Docker reports 0 vulnerabilities.
- GitHub Dependabot still reports the 11 alerts before this local change is committed and pushed; this is expected because the GitHub API reads repository state, not the unpushed working tree.

### Major Upgrade Decisions

- Applied: Express 5.2.1, ESLint 10.8.0, eslint-plugin-vue 10.10.0, concurrently 10.0.4, and dotenv 17.4.2 because install, build, unit tests, E2E tests, and startup validation remained compatible.
- Deferred: Vite 8, `@vitejs/plugin-vue` 6, `@vuepic/vue-datepicker` 14, Vue Router 5, css-select 7, less-loader 13, jsdom 30, and esbuild 0.28. These are not required to clear the vulnerability baseline and have broader migration or peer-dependency risk.
- `less-loader` still warns about missing `webpack@^5.0.0`; this was preexisting and is not used by the Vite validation path.

### Validation Commands

- `rtk docker compose run --rm --entrypoint yarn app --frozen-lockfile`: passed before changes.
- `rtk docker compose run --rm --entrypoint yarn app build`: passed before and after changes.
- `rtk docker compose run --rm --entrypoint yarn app test:unit`: passed before and after changes.
- `rtk docker compose run --rm --entrypoint yarn app audit --json`: baseline 25 vulnerabilities; final 0 vulnerabilities.
- `rtk docker compose --profile test run --rm e2e`: passed after aligning the Cypress binary pin.
- `rtk docker compose logs app`: startup log summary reported 0 errors and 0 warnings after E2E startup.

### Limitations

- No `.env`, `.env.*`, secrets, credentials, or private keys were read.
- No lint or typecheck command was executed because the project does not define dedicated scripts.
- Dependabot alert closure requires the updated lockfile to reach GitHub and for Dependabot to rescan the manifest.
