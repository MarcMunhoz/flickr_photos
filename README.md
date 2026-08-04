# Flickr Photos - Public Gallery Viewer

## Project Status

This project is archived.

It depended on Flickr metadata and media delivery behaving consistently enough
to present public galleries and recent photo streams in real time. The Flickr
API can still return valid metadata, but recent media URLs served by
`live.staticflickr.com` have become unreliable enough to leave the product with
delayed, missing, or stale visual results. Further client-side fallback logic
would not provide a production-quality gallery experience.

The repository remains available as a reference implementation for a Vue 3
frontend, a same-origin Netlify Function API proxy, and the OpenSpec records
behind the decision to discontinue it.

[![Version](https://img.shields.io/badge/version-1.4.0-0462dc)](https://github.com/MarcMunhoz/flickr_photos)
[![Vue](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Frontend](https://img.shields.io/badge/frontend-Netlify-00c7b7?logo=netlify&logoColor=white)](https://www.netlify.com/)

A Vue 3 application for exploring public Flickr photography. Search for a Flickr
username to browse their public gallery, or discover recent public uploads with
filters for dates, titles, publishers, tags, and safe content.

![Flickr gallery example](app/src/assets/img/example.jpg)

---

## ✨ Features

- Public galleries resolved from Flickr usernames
- Recent public photo stream with incremental loading
- Date range, title, publisher, tag, and safe-content filters
- Photo details and links to the original Flickr pages
- Responsive interface with custom Flickr-inspired styling
- Netlify Function API proxy that keeps the Flickr API key on the server

---

## 🏗️ Architecture

The Vue frontend communicates with a same-origin Flickr API proxy instead of
accessing the Flickr API directly. In production, Netlify routes `/api/flickr`
to a native Netlify Function that validates supported Flickr methods, injects
the private API key, and returns the upstream response.

Production uses a single Netlify deployment surface:

- The frontend is built by Netlify with `yarn build`
- The API proxy runs as a Netlify Function in the same site
- `VITE_API_BASE_URL` remains available as an explicit rollback or alternate
  environment override
- Docker Compose remains available for local development

---

## 📦 Technology

- 🟢 [Vue 3](https://vuejs.org/) and [Vue Router](https://router.vuejs.org/)
- ⚡ [Vite](https://vite.dev/)
- 📅 [Vue Datepicker](https://vue3datepicker.com/)
- 🎨 [Bootstrap](https://getbootstrap.com/) and Less
- 🌐 [Express](https://expressjs.com/)
- ▲ [Netlify Functions](https://docs.netlify.com/build/functions/overview/)
- 🐳 Docker and Docker Compose

---

## 📁 Project Structure

```text
.
├── app/
│   ├── middleware/          # Express proxy for the Flickr API
│   ├── netlify/functions/   # Netlify Function proxy for production
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── api/             # Frontend API client
│   │   ├── components/      # Reusable Vue components
│   │   ├── composables/     # Shared reactive behavior
│   │   ├── utils/           # Date and photo helpers
│   │   └── views/           # Route-level views
│   ├── netlify.toml         # Netlify redirects and security headers
│   ├── package.json
│   └── vite.config.js
├── Dockerfile
└── docker-compose.yaml
```

---

## 🚀 Local Development

Docker and Docker Compose are required for the containerized environment:

```bash
docker compose up --build
```

The frontend is served at [http://localhost:2469](http://localhost:2469). The
local API wrapper remains available at
[http://localhost:3000/api/flickr](http://localhost:3000/api/flickr), and Vite
proxies browser `/api` requests to it during local development.

The application can also run directly from the `app` directory after its
dependencies are installed:

```bash
yarn dev
```

Available commands:

```text
yarn dev         Start Vite and the local API wrapper
yarn dev:vite    Start only the Vite development server
yarn dev:api     Start only the local API wrapper
yarn build       Create the production frontend bundle
yarn preview     Preview the production frontend bundle
yarn start       Start only the local API wrapper
yarn test:unit   Run Vitest unit tests
yarn test:e2e    Run Cypress end-to-end tests
```

### Validation

Run validation from the containerized environment to match the documented local
runtime:

```bash
docker compose up -d --build
docker compose exec -T app yarn audit --groups dependencies --groups devDependencies
docker compose exec -T app yarn test:unit
docker compose exec -T app yarn build
docker compose --profile test run --rm e2e
docker compose logs --no-color --tail 160 app
```

Cypress uses deterministic fixtures and intercepted Flickr proxy responses for
repeatable regression coverage. Unit tests cover the shared proxy behavior used
by the Netlify Function and the local API wrapper without calling live Flickr.

---

## ⚙️ Configuration

The API proxy requires a Flickr API key in the server-side runtime environment:

```text
API_KEY=your_flickr_api_key
```

Optional configuration:

```text
ALLOWED_ORIGINS=https://your-frontend.example
VITE_API_BASE_URL=https://your-api.example/api
```

`ALLOWED_ORIGINS` configures the local API wrapper CORS allowlist.
`VITE_API_BASE_URL` overrides the frontend API endpoint at build time and should
only be used for rollback or alternate environments. Do not put `API_KEY` or any
Flickr secret in `VITE_*` variables because Vite exposes those values to the
browser bundle.

For Netlify production, configure `API_KEY` in the Netlify site environment.
The Netlify Function uses ordinary request-triggered Functions, redirects,
headers, and environment variables only. It does not require paid Netlify
features, paid add-ons, databases, blob storage, AI features, background jobs,
scheduled jobs, custom deployment options, or auto-recharge. Keep auto-recharge
disabled for zero-cost operation; unusually high traffic can exhaust the free
monthly usage credits and pause service instead of billing automatically.

---

## 🌐 Production

Netlify builds the frontend from the `app` directory and publishes the generated
`dist` directory. The Flickr proxy function, SPA redirect, proxy redirect, and
response security headers are defined in `app/netlify.toml`.

The Express-based wrapper is local-only. Production no longer requires Render or
any separate Node host for the Flickr proxy. Before decommissioning an existing
Render deployment, keep `VITE_API_BASE_URL` available as a temporary rollback
override and redeploy Netlify with that value only if the Netlify Function path
fails production validation.

---

## 🧠 Flickr API

The application uses the official
[Flickr API](https://www.flickr.com/services/api/) for username lookup, public
photo galleries, recent uploads, and photo metadata.

---

## 📄 License

Personal/public project. Reuse freely.
