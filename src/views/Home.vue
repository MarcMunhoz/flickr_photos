<template>
  <div class="home">
    <router-link to="/about" class="link-info">About</router-link>
    <flickrPhotos />
  </div>
</template>

<script>
// @ is an alias to /src
import FlickrPhotos from "@/components/FlickrPhotos.vue";

export default {
  name: "Home",
  components: {
    FlickrPhotos,
  },
};
</script>
