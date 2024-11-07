<template>
  <div class="gallery-container">
    <div v-for="(photo, index) in photos" :key="index" class="gallery-item" :style="getGridStyles(index)">
      <a :href="photo.url_o" target="_recent" @mouseover="bordered(true, $event.target, photo.url_o)" @mouseleave="bordered(false, $event.target, photo.url_o)" @click="openModal($event, photo.url_o)">
        <img :src="photo.url_z" :title="photo.title ? photo.title : 'NO TITLE'" lazy="loading" class="border-4 border-unicorn gallery-image" />
      </a>
    </div>

    <!-- Modal for Larger View -->
    <div v-if="showModal" class="modal" @click="showModal = false">
      <img :src="currentPhoto" alt="Large view" class="modal-image" />
    </div>
  </div>
</template>

<script>
import { onMounted, defineComponent, ref } from "vue";
import { fetchData, theDate, bordered } from "@/utils/usefulFunctions.js";

export default defineComponent({
  name: "RecentPhotos",
  setup() {
    const photos = ref([]);
    const perPage = ref(35);
    const currentPage = ref(1);

    // Modal state
    const showModal = ref(false);
    const currentPhoto = ref(null);

    // Open modal with the selected image
    const openModal = (evt, src) => {
      evt.preventDefault();
      currentPhoto.value = src;
      showModal.value = true;
    };

    // Grid layout styles for mosaic effect
    const getGridStyles = (index) => {
      // Customize the mosaic effect by defining different spans
      const spans = [
        { gridColumn: "span 2", gridRow: "span 2" },
        { gridColumn: "span 1", gridRow: "span 1" },
        { gridColumn: "span 1", gridRow: "span 2" },
        { gridColumn: "span 2", gridRow: "span 1" },
      ];
      return spans[index % spans.length];
    };

    const fetchParams = {
      method: "flickr.photos.getRecent",
      extras: ["url_z", "url_o", "tags", "date_taken", "owner_name"],
      per_page: perPage.value,
    };

    const fetchRecent = async () => {
      try {
        let rawData = Object;
        rawData = await fetchData(fetchParams);

        for (let index = 0; index < rawData.photos.photo.length; index++) {
          photos.value.push(rawData.photos.photo[index]);
        }
      } catch (error) {}
    };

    window.addEventListener("scroll", () => {
      // Verifica se a rolagem chegou ao final da página
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        perPage.value += 35;
        fetchRecent();
      }
    });

    onMounted(() => {
      return fetchRecent();
    });

    return {
      photos,
      theDate,
      bordered,
      showModal,
      currentPhoto,
      openModal,
      getGridStyles,
    };
  },
});
</script>

<style scoped>
.gallery-container {
  display: grid;
  grid-auto-flow: row dense;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-auto-rows: 150px;
  gap: 5px;
  margin: 0 auto;
  width: 90%;
}

.gallery-item {
  overflow: hidden;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Modal styling */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
}

.modal-image {
  max-width: 90%;
  max-height: 90%;
}
</style>
