# Flickr Photos

## What's need

- [Docker](https://www.docker.com/get-started)
- [Docker compose](https://docs.docker.com/compose/install)

## Project setup | It Compiles and hot-reloads for development

```
docker-compose up -d
```

## Compiles and minifies for production

\* **Inside container**

```
docker container exec -it flickr-gallery_ctn sh

yarn build
```

## Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).


### Internal used

- Bootstrap
- [Flickr API](https://www.flickr.com/services/api)
- Less CSS
- NodeJS
- Vue 3
