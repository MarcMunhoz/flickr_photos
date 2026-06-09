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
