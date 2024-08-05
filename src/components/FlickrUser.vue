<template>
  <div class="w-100">
    <input type="text" size="20" v-model="user_name" @keyup.enter="urlMount()" class="border border-2 border-info text-info p-1 me-2" placeholder="Flickr user name" autofocus />

    <button type="submit" value="Submit" @click="urlMount()" class="btn btn-sm btn-danger">Submit</button>

    <p class="text-danger">{{ error }}</p>
  </div>
</template>

<script>
import { defineComponent, defineEmits, ref } from "vue";
const api_key = import.meta.env.VITE_API_KEY;

export default defineComponent({
  name: "FlickrUser",
  props: {
    // Importing from FickrPhotos component
    apiUrl: {
      type: Object,
    },
    url_params: {
      type: Array,
    },
  },
  setup(props) {
    // App variables
    const user_name = ref(String);
    const user_id = ref(Array);
    const error = ref(String);
    const url = ref(URL);

    // Default values
    user_name.value = "";
    user_id.value = [];
    error.value = "";

    // Methods
    const urlMount = () => {
      if (user_name.value.length) {
        error.value = "";
        url.value = `${props.apiUrl[0].url}${props.apiUrl[0].endpoint}?method=${props.apiUrl[0].method[1]}&api_key=${api_key}&${props.url_params[2]}=${props.apiUrl[0].params[0].format}&${props.url_params[3]}=${props.apiUrl[0].params[0].nojsoncallback}&username=${user_name.value}`;

        return getUserID(url.value);
      } else {
        error.value = "Please type a username.";
      }
    };

    const getUserID = (theUrl) => {
      fetch(theUrl, { method: "get" })
        .then((res) => {
          // Getting the response from the Flickr API
          if (res.ok) {
            return res.json();
          } else {
            throw new Error("Something went wrong");
          }
        })
        .then((resJson) => {
          // If API returns data, it clears old fetch error messages and gets the user ID
          error.value = "";
          user_id.value = resJson.user.id;

          // Emits the user ID to the FlickrPhotos component
          const emitter = defineEmits(["userID"]);
          const emitUserId = () => {
            emitter("userID"), user_id.value;
          };

          return emitUserId;
        })
        .catch((err) => {
          // Cleaning up input field and old user iD from app
          user_name.value = "";
          user_id.value = "";

          console.log(err);

          // Errors handling
          if (err == "TypeError: Failed to fetch") {
            return (error.value = "Connection error. Try it later.");
          } else {
            return (error.value = "User not found. Please, check it out.");
          }
        });
    };

    // Exposing data to template
    return {
      user_name,
      error,
      urlMount,
    };
  },
});
</script>

<style scoped lang="less">
input {
  outline: 0;
}
</style>
