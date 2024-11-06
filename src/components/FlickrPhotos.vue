<template>
  <div class="flickr py-3 d-flex flex-row flex-wrap justify-content-around mx-auto w-75">
    <h1 class="w-100 text-center text-uppercase mb-4 gradient-flickr">Public Flickr Gallery</h1>
    <cite>Search any Flickr user's photos by username</cite>
    <FlickrUser @userID="emittedUserId" />

    <p class="text-danger w-100">{{ error }}</p>

    <div class="w-100" v-if="photos.length > 0">
      <h1>
        Photos by <span class="text-success fw-bolder">{{ photos_owner }}</span> on Flickr - Page {{ nextPage }} of {{ totalPages }}
      </h1>
      <p class="fw-bold w-100" v-if="photos[0].url_o">
        *** Gallery with links ***<br />
        Click on photo to open original
      </p>
    </div>
    <div class="spinner text-info w-100 visually-hidden">
      <div class="spinner-border" role="status" />
      <p class="fw-bold">Loading... Please wait.</p>
    </div>
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
    <button v-if="nextPage > 1 && photos.length > 0" @click="mountExec('down')" class="btn btn-primary simple-font fw-bold">Page [ {{ nextPage - 1 }} ]</button>
    <button v-if="nextPage < totalPages && photos.length > 0" @click="mountExec('up')" class="btn btn-primary simple-font fw-bold">Page [ {{ nextPage + 1 }} ]</button>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import FlickrUser from "@/components/FlickrUser.vue";
import { fetchData, theDate, bordered } from "@/utils/usefulFunctions.js";

export default defineComponent({
  name: "FlickrPhotos",
  components: {
    FlickrUser,
  },
  setup() {
    const photos = ref(Array);
    const user_id = ref(String);
    const photos_owner = ref(String);
    const totalPages = ref(Number);
    const nextPage = ref(null);
    const error = ref(String);
    const spinner = ref(String);

    photos.value = [];
    photos_owner.value = "";
    totalPages.value = 1;
    error.value = "";

    const emittedUserId = (userId) => {
      user_id.value = userId;
      return pageMount();
    };

    const pageMount = async () => {
      spinner.value.classList.remove("visually-hidden");
      let rawData = Object;
      photos.value = [];

      const fetchParams = {
        method: "flickr.people.getPublicPhotos",
        extras: ["url_z", "url_o", "tags", "date_taken", "owner_name"],
        page: nextPage.value,
        per_page: "12",
        user_id: user_id.value,
      };

      try {
        rawData = await fetchData(fetchParams);

        error.value = null;
        spinner.value.classList.add("visually-hidden");
      } catch (err) {
        // Cleaning up the old gallery data from app
        photos.value = "";

        // Errors handling
        if (err == "TypeError: Cannot read property 'ownername' of undefined") {
          return (error.value = "Invalid username. Please, check it out.");
        } else {
          return (error.value = err);
        }
      }

      totalPages.value = rawData.photos.pages;
      photos_owner.value = rawData.photos.photo[0].ownername;

      for (let index = 0; index < rawData.photos.photo.length; index++) {
        photos.value.push(rawData.photos.photo[index]); // It populates the array with all photos comin' from API data
      }
    };

    const mountExec = (upDown) => {
      // Cleaning up the old gallery data from app and executing next/prev page action
      photos.value = [];
      upDown === "down" ? (nextPage.value = nextPage.value - 1) : (nextPage.value = nextPage.value + 1);
      pageMount();
    };

    onMounted(() => {
      spinner.value = document.querySelector(".flickr .spinner");
    });

    return {
      emittedUserId,
      bordered,
      mountExec,
      theDate,
      error,
      photos,
      photos_owner,
      nextPage,
      totalPages,
    };
  },
});
</script>

<style scoped lang="less">
h3 {
  margin: 40px 0 0;
  min-height: 36px;

  @media @sm-screens {
    min-height: 28px;
  }
}

ul {
  list-style-type: none;
  padding: 0;

  li {
    display: inline-block;
    min-height: 436px;
    width: 473px;
  }

  @media @sm-screens {
    width: 100%;

    li {
      min-height: unset;
      width: 100%;
    }
  }
}

.simple-font {
  font-family: Avenir, Helvetica !important;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gradient-flickr {
  background: linear-gradient(to right, white, white, @color-flickr-blue, @color-flickr-pink, white, white);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media @sm-screens {
    background: linear-gradient(to right, white, @color-flickr-blue, @color-flickr-pink, white);
    background-clip: text;
  }
}

.flickr {
  img {
    height: 305px;
    object-fit: cover;
    transition: transform 0.5s ease;
    width: 100%;

    &:hover {
      transform: scale(1.1);
    }
  }

  .spinner-border {
    height: 10rem;
    width: 10rem;
  }

  @media @sm-screens {
    &.w-75 {
      width: 100% !important;
    }
  }
}
</style>
