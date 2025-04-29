FROM node:18-alpine

LABEL author="Marcelo Munhoz <me@marcelomunhoz.com>" \
  description="WebApp who displays public photos from a Flickr account" \
  version="1.0.1" \
  date_created="2021-08-26" \
  deploy="2022-11-11" \
  modified="2024-08-01"

ARG APP_PATH=/app
ENV PORT=2469

WORKDIR ${APP_PATH}

COPY ["./app/package.json", "./app/yarn.lock", "./"]

RUN apk add exa \
  && yarn \
  && rm -rf /var/cache/apk/* /tmp/* /var/tmp/* /usr/share/man

# Copia o restante da aplicação
COPY ./app .

# Expõe portas do Vite e Express
EXPOSE 2469 3000

ENTRYPOINT ["yarn", "dev"]