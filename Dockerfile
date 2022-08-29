FROM node:16-alpine

LABEL author="Marcelo Munhoz <me@marcelomunhoz.com>" \
  description="WebApp who displays public photos from a Flickr account" \
  version="1.0.0" \
  date_created="2021-08-26" \
  deploy="2021-08-26"

ARG APP_PATH=/app

ENV PORT=2469

COPY ["package.json", "yarn.lock", "./"]

RUN yarn global add @vue/cli-service \
  && yarn \
  && rm -rf /var/cache/apk/* /tmp/* /var/tmp/* /usr/share/man

WORKDIR $APP_PATH

VOLUME $APP_PATH

ENTRYPOINT ["yarn", "serve"]