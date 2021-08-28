<template>
  <div>
    <input type="text" id="" size="20" v-model="user_name" placeholder="Flickr user name" />

    <button type="submit" value="Submit" @click="urlMount()">Submit</button>

    <p class="text-danger">{{ error }}</p>
    <p class="text-info" v-if="user_id.length > 0">{{ user_id }}</p>
  </div>
</template>

<script>
const api_key = process.env.API_KEY;

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
  methods: {
    urlMount() {
      if (this.user_name) {
        this.error = "";
        this.url = `https://api.flickr.com/services/rest/?method=flickr.people.findByUsername&api_key=${api_key}&format=json&nojsoncallback=1&username=${this.user_name}`;

        return this.getUserID(this.url);
      } else {
        this.error = "Please type a username.";
      }
    },
    getUserID(theUrl) {
      fetch(theUrl, { method: "get" })
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          } else {
            throw new Error("Something went wrong");
          }
        })
        .then((respJson) => {
          this.error = "";
          this.user_id = respJson.user.id;
        })
        .catch((err) => {
          this.user_name = "";
          this.user_id = "";

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
