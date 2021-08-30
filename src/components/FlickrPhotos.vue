<template>
  <div class="flickr py-3 d-flex flex-row flex-wrap justify-content-around mx-auto w-75">
    <FlickrUser @userID="emittedUserId" :apiUrl="apiUrl" :url_params="url_params" />

    <p class="text-danger">{{ error }}</p>

    <div class="w-100" v-if="photos.length > 0">
      <h1>
        Public photos by <span class="text-success fw-bolder">{{ photos_owner }}</span> on Flickr - Page {{ nextPage }} of {{ totalPages }}
      </h1>
      <p class="fw-bold w-100">* Click on photo to open original</p>
    </div>
    <div class="spinner text-info w-100 visually-hidden">
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
import apiUrl from "@/utils/apiUrl.js";
const api_key = process.env.API_KEY;
const nextPage = 1;

export default {
  name: "FlickrPhotos",
  data() {
    return {
      photos: [],
      user_id: String,
      photos_owner: "",
      totalPages: 1,
      nextPage,
      apiUrl,
      url: String,
      url_params: Array,
      error: "",
      spinner: String,
      isActive: false,
    };
  },
  components: {
    FlickrUser,
  },
  created() {
    this.url_params = Object.keys(this.apiUrl[0].params[0]);
  },
  methods: {
    emittedUserId(userId) {
      this.user_id = userId;
      return this.pageMount();
    },
    pageMount() {
      this.url = `${this.apiUrl[0].url}${this.apiUrl[0].endpoint}?method=${this.apiUrl[0].method[0]}&api_key=${api_key}&user_id=${this.user_id}&page=${this.nextPage}&${this.url_params[0]}=${this.apiUrl[0].params[0].extras}&${this.url_params[1]}=${this.apiUrl[0].params[0].per_page}&${this.url_params[2]}=${this.apiUrl[0].params[0].format}&${this.url_params[3]}=${this.apiUrl[0].params[0].nojsoncallback}`;
      this.spinner.classList.remove("visually-hidden");
      this.photos = [];

      fetch(this.url, { method: "get" })
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          } else {
            throw new Error("Something went wrong");
          }
        })
        .then((respJson) => {
          this.spinner.classList.add("visually-hidden");
          const rawData = respJson.photos;
          this.totalPages = rawData.pages;
          this.photos_owner = rawData.photo[0].ownername;

          for (let index = 0; index < rawData.photo.length; index++) {
            this.photos.push(rawData.photo[index]);
          }
        })
        .catch((err) => {
          this.photos = "";

          return (this.error = err);
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
