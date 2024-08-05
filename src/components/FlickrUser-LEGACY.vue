<template>
  <div class="w-100">
    <input type="text" size="20" v-model="user_name" @keyup.enter="urlMount()" class="border border-2 border-info text-info p-1 me-2" placeholder="Flickr user name" autofocus />

    <button type="submit" value="Submit" @click="urlMount()" class="btn btn-sm btn-danger">Submit</button>

    <p class="text-danger">{{ error }}</p>
  </div>
</template>

<script>
const api_key = import.meta.env.VITE_API_KEY;

export default {
  name: "FlickrUser",
  data() {
    return {
      user_name: "",
      user_id: [],
      error: "",
      url: String,
    };
  },
  props: {
    // Importing from FickrPhotos component
    apiUrl: {
      type: Object,
    },
    url_params: {
      type: Array,
    },
  },
  methods: {
    urlMount() {
      if (this.user_name) {
        // Cleaning up old input error message and defining the Flickr user to search it
        this.error = "";
        this.url = `${this.apiUrl[0].url}${this.apiUrl[0].endpoint}?method=${this.apiUrl[0].method[1]}&api_key=${api_key}&${this.url_params[2]}=${this.apiUrl[0].params[0].format}&${this.url_params[3]}=${this.apiUrl[0].params[0].nojsoncallback}&username=${this.user_name}`;

        return this.getUserID(this.url);
      } else {
        this.error = "Please type a username.";
      }
    },
    getUserID(theUrl) {
      fetch(theUrl, { method: "get" })
        .then((resp) => {
          // Getting the response from the Flickr API
          if (resp.ok) {
            return resp.json();
          } else {
            throw new Error("Something went wrong");
          }
        })
        .then((respJson) => {
          // If API returns data, it clears old fetch error messages and gets the user ID
          this.error = "";
          this.user_id = respJson.user.id;

          // Emits the user ID to the FlickrPhotos component
          return this.$emit("userID", this.user_id);
        })
        .catch((err) => {
          // Cleaning up input field and old user iD from app
          this.user_name = "";
          this.user_id = "";

          // Errors handling
          if (err == "TypeError: Failed to fetch") {
            return (this.error = "Connection error. Try it later.");
          } else {
            return (this.error = "User not found. Please, check it out.");
          }
        });
    },
  },
};
</script>

<style scoped lang="less">
input {
  outline: 0;
}
</style>
