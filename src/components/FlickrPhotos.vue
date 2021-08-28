<template>
  <div class="flickr py-3 d-flex flex-row flex-wrap justify-content-around mx-auto w-75">
    <FlickrUser />
    <div class="w-100" v-if="photos_owner">
      <h1>Public photos by {{ photos_owner }} on Flickr - Page {{ nextPage }} of {{ totalPages }}</h1>
      <p class="fw-bold w-100">* Click on photo to open original</p>
    </div>
    <div class="spinner text-info w-100">
      <div class="spinner-border" role="status" />
      <p class="fw-bold">Loading... Please wait.</p>
    </div>
    <ul class="d-flex flex-row flex-wrap align-items-end justify-content-start gap-1">
      <li v-for="photo in photos" :key="photo.id">
        <h3 class="mb-2">{{ photo.title }}</h3>
        <a :href="photo.url_o" target="_photo" @mouseover="(isActive = true), bordered($event.target)" @mouseleave="(isActive = false), bordered($event.target)">
          <img :src="photo.url_z" :title="photo.title" lazy="loading" class="border-3 border-primary mw-100" />
        </a>
        <cite v-if="photo.tags.length > 0" class="d-block"><span class="fw-bold">Tags:</span> {{ photo.tags }}</cite>
        <cite class="d-block"><span class="fw-bold">Date</span>: {{ theDate(photo.datetaken) }}</cite>
      </li>
    </ul>
    <button v-if="nextPage > 1 && photos.length > 0" @click="mountExec('down')" class="btn btn-primary fw-bold">Page [ {{ nextPage - 1 }} ]</button>
    <button v-if="nextPage < totalPages && photos.length > 0" @click="mountExec('up')" class="btn btn-primary fw-bold">Page [ {{ nextPage + 1 }} ]</button>
  </div>
</template>

<script>
import FlickrUser from "@/components/FlickrUser.vue";
const api_key = process.env.API_KEY;
const user_id = process.env.USER_ID;
const url = "https://api.flickr.com/services/rest";
const nextPage = 1;

export default {
  name: "FlickrPhotos",
  data() {
    return {
      photos: [],
      user_id,
      photos_owner: "",
      totalPages: 1,
      nextPage,
      url: String,
      spinner: String,
      isActive: false,
    };
  },
  components: {
    FlickrUser,
  },
  methods: {
    pageMount() {
      this.url = `https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&api_key=${api_key}&user_id=${user_id}&page=${this.nextPage}&extras=url_z,url_o,tags,date_taken,owner_name&per_page=12&format=json&nojsoncallback=1`;
      this.spinner.classList.remove("visually-hidden");

      fetch(this.url, { method: "get" })
        .then((resp) => {
          resp.json().then((data) => {
            this.spinner.classList.add("visually-hidden");
            const rawData = data.photos;
            this.totalPages = rawData.pages;
            this.photos_owner = rawData.photo[0].ownername;

            for (let index = 0; index < rawData.photo.length; index++) {
              this.photos.push(rawData.photo[index]);
            }
          });
        })
        .catch((err) => {
          console.error("Failed retrieving information", err);
        });
    },
    mountExec(upDown) {
      this.photos = [];
      upDown === "down" ? (this.nextPage = this.nextPage - 1) : (this.nextPage = this.nextPage + 1);
      return this.pageMount();
    },
    bordered(el) {
      if (this.isActive === true) {
        el.classList.add("border");
      } else {
        el.firstChild.classList.remove("border");
      }
    },
    theDate(dte) {
      const date = new Date(dte);
      const opt = { year: "numeric", month: "long", day: "numeric" };
      return date.toLocaleString("en-US", opt);
    },
  },
  mounted() {
    this.spinner = document.querySelector(".flickr .spinner");
    this.pageMount();
  },
};
</script>

<style scoped lang="less">
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;

  li {
    display: inline-block;
    width: 473px;
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
}
</style>
