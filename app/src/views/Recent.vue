<template>
  <div class="">
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
