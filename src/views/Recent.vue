<template>
  <div class="">
    <h1>This is a recent photos page</h1>

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
