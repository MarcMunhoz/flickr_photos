# Flickr Photos

Public photo gallery from Flickr users.

This' a simple photo gallery that uses the Flickr API to show the photos.

You can search the photos of any Flickr user by the username. Like example below:

![Flickr people search](/src/assets/img/example.jpg)

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
