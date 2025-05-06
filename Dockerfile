FROM node:22-alpine AS base

LABEL author="Marcelo Munhoz <me@marcelomunhoz.com>" \
  description="WebApp who displays public photos from a Flickr account" \
  version="1.0.1" \
  date_created="2021-08-26" \
  deploy="2022-11-11" \
  modified="2025-05-06"

ARG APP_PATH=/app
WORKDIR ${APP_PATH}

COPY ["./app/package.json", "./app/yarn.lock", "./"]

RUN apk add --no-cache exa \
  && yarn \
  && rm -rf /var/cache/apk/* /tmp/* /var/tmp/* /usr/share/man

COPY ./app .

# Stage para desenvolvimento (dev com Vite + Express)
FROM base AS develop
EXPOSE 2469 3000
CMD ["yarn", "dev"]

# Stage para produção (serve frontend com Express)
FROM base AS production
RUN yarn build
EXPOSE 3000
CMD ["node", "middleware/server.js"]
