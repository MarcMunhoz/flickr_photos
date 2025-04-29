<template>
  <div class="">
    <h1 class="gradient-flickr my-4 text-uppercase">Recent public photos on Flickr</h1>

    <RecentPhotos />
  </div>
</template>

<script>
import RecentPhotos from "@/components/FlickrRecentPhotos.vue";

export default {
  name: "PageRecent",
  components: {
    RecentPhotos,
  },
};
</script>

<style lang="less">
.recent {
  font-family: Arial, Helvetica, sans-serif;
}
</style>
