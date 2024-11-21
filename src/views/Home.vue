<template>
  <div class="home">
    <flickrPhotos />
  </div>
</template>

<script>
import FlickrPhotos from "@/components/FlickrPhotos.vue";

export default {
  name: "Home",
  components: {
    FlickrPhotos,
  },
};
</script>
