<template>
  <div class="recents">
    <h1>This is a recents page</h1>
  </div>
</template>

<script>
import { onMounted, defineComponent, ref } from "vue";
import fetchData from "@/utils/callOfFlickr.js";

export default defineComponent({
  name: "Recents",
  setup() {
    const data = ref();
    const fetchParams = {
      method: "flickr.photos.getRecent",
      extras: ["url_z", "url_o", "tags", "date_taken", "owner_name"],
      per_page: "12",
    };

    onMounted(async () => {
      data.value = await fetchData(fetchParams);
    });

    console.log(data);

    return {};
  },
});
</script>

<style lang="less">
.recents {
  font-family: Arial, Helvetica, sans-serif;
}
</style>
