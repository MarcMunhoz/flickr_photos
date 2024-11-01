<template>
  <div class="">
    <h1>This is a recent photos page</h1>
  </div>
</template>

<script>
import { onMounted, defineComponent, ref } from "vue";
import fetchData from "@/utils/callOfFlickr.js";

export default defineComponent({
  name: "Recent",
  setup() {
    const data = ref(Object);
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
.recent {
  font-family: Arial, Helvetica, sans-serif;
}
</style>
