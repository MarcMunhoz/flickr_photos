FROM node:22-bookworm-slim AS base

LABEL author="Marcelo Munhoz <me@marcelomunhoz.com>" \
  description="WebApp who displays public photos from a Flickr account" \
  version="1.1.0" \
  date_created="2021-08-26" \
  deploy="2022-11-11" \
  modified="2026-06-09"

ARG APP_PATH=/app
WORKDIR ${APP_PATH}

ENV CYPRESS_INSTALL_BINARY=0

COPY ["./app/package.json", "./app/yarn.lock", "./"]

RUN yarn --frozen-lockfile \
  && rm -rf /tmp/* /var/tmp/* /usr/share/man

COPY ./app .

# Development stage runs Vite and the Express proxy together.
FROM base AS develop
EXPOSE 2469 3000
CMD ["yarn", "dev"]

# Cypress needs browser runtime libraries; keep them out of normal app images.
FROM base AS test
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    libasound2 \
    libgbm1 \
    libgtk-3-0 \
    libnss3 \
    libxss1 \
    xvfb \
  && CYPRESS_INSTALL_BINARY=15.18.1 yarn cypress install \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/man
CMD ["yarn", "test:e2e"]

# Optional image build; the primary frontend deployment is handled by Netlify.
FROM base AS build
RUN yarn build

FROM node:22-bookworm-slim AS production
ARG APP_PATH=/app
WORKDIR ${APP_PATH}
ENV NODE_ENV=production

COPY ["./app/package.json", "./app/yarn.lock", "./"]
RUN yarn --production --frozen-lockfile \
  && rm -rf /tmp/* /var/tmp/* /usr/share/man

COPY ./app .
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "middleware/server.js"]
