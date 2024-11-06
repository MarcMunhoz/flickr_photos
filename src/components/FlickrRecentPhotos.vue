<template>
  <div>
    <h1>Bleh</h1>

    <ul class="d-flex flex-row flex-wrap align-items-end justify-content-center gap-1">
      <li v-for="photo in photos" :key="photo.id">
        <h3 v-if="photo.title" class="mb-2 text-ellipsis">{{ photo.title }}</h3>
        <h3 v-else class="mb-2 fs-4 text-decoration-line-through text-muted">Untitled</h3>
        <a :href="photo.url_o" target="_photo" @mouseover="bordered(true, $event.target, photo.url_o)" @mouseleave="bordered(false, $event.target, photo.url_o)">
          <img :src="photo.url_z" :title="photo.title" lazy="loading" class="border-4 border-unicorn mw-100" />
        </a>
        <cite v-if="photo.tags.length > 0" class="d-block px-2 simple-font fst-normal text-ellipsis"><span class="fw-bold">Tags:</span> {{ photo.tags }}</cite>
        <cite class="d-block px-2 simple-font fst-normal"><span class="fw-bold">Date</span>: {{ theDate(photo.datetaken) }}</cite>
      </li>
    </ul>
  </div>
</template>

<script>
import { onMounted, defineComponent, ref } from "vue";
import { fetchData, theDate, bordered } from "@/utils/usefulFunctions.js";

export default defineComponent({
  name: "RecentPhotos",
  setup() {
    const photos = ref([]);
    const fetchParams = {
      method: "flickr.photos.getRecent",
      extras: ["url_z", "url_o", "tags", "date_taken", "owner_name"],
      per_page: "12",
    };

    onMounted(async () => {
      try {
        let rawData = Object;
        rawData = await fetchData(fetchParams);

        for (let index = 0; index < rawData.photos.photo.length; index++) {
          photos.value.push(rawData.photos.photo[index]); // It populates the array with all photos comin' from API data
        }
      } catch (error) {}
    });

    return {
      photos,
      theDate,
      bordered,
    };
  },
});
</script>
