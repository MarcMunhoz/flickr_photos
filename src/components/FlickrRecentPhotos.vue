<template>
  <div class="gallery-container">
    <div v-for="(photo, index) in photos" :key="index" class="gallery-item" :style="getGridStyles(index)">
      <a
        :href="photo.url_o"
        target="_recent"
        @mouseover="bordered(true, $event.target, photo.url_o)"
        @mouseleave="bordered(false, $event.target, photo.url_o)"
        @click="openModal($event, photo.url_o, photo.title, photo.ownername)"
      >
        <img :src="photo.url_z" :title="`${photo.title ? photo.title : ''} by ${photo.ownername} `" lazy="loading" class="border-4 border-unicorn gallery-image" />
      </a>
    </div>

    <!-- Modal for Larger View -->
    <div
      v-if="showModal"
      class="modal bg-black d-flex flex-wrap justify-content-center align-items-center position-fixed top-0 start-0 h-100 w-100"
      style="--bs-bg-opacity: 0.8; font-family: var(--bs-body-font-family)"
      @click="showModal = false"
    >
      <img :src="currentPhoto" alt="Large view" class="modal-image" />
      <p class="text-light fs-4 w-100">
        <span v-if="currentPhotoTitle.length">{{ currentPhotoTitle }} - </span>by <span class="gradient-flickr text-uppercase">{{ currentPhotoOwner }}</span>
      </p>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted } from "vue";
import { fetchData, theDate, bordered } from "@/utils/usefulFunctions.js";

export default defineComponent({
  name: "RecentPhotos",
  setup() {
    const photos = ref([]);

    // Modal state
    const showModal = ref(false);
    const currentPhoto = ref(null);
    const currentPhotoTitle = ref(String);
    const currentPhotoOwner = ref(String);

    // Open modal with the selected image
    const openModal = (evt, src, title, owner) => {
      evt.preventDefault();
      currentPhoto.value = src;
      currentPhotoTitle.value = title;
      currentPhotoOwner.value = owner;
      src && (showModal.value = true);
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

    let rawData = Object;
    let fetchParams = {
      method: "flickr.photos.getRecent",
      extras: ["url_z", "url_o", "date_taken", "owner_name"],
      per_page: 35,
    };

    const fetchRecent = async () => {
      try {
        rawData = {};
        rawData = await fetchData(fetchParams);

        for (let index = 0; index < rawData.photos.photo.length; index++) {
          photos.value.push(rawData.photos.photo[index]);
        }
      } catch (error) {}
    };

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        fetchParams.per_page += 35; // Incrementa 35
        fetchRecent(); // Carrega novas fotos
      }
    };

    onMounted(() => {
      fetchRecent();
      window.addEventListener("scroll", handleScroll);
    });

    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
    });

    return {
      photos,
      theDate,
      bordered,
      showModal,
      currentPhoto,
      currentPhotoTitle,
      currentPhotoOwner,
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

.modal-image {
  max-width: 90%;
  max-height: 90%;
}
</style>
