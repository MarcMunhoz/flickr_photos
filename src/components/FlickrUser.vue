<template>
  <div class="d-flex" role="search">
    <input
      class="form-control me-2"
      style="font-family: var(--bs-body-font-family)"
      type="search"
      placeholder="Flickr user name"
      aria-label="Search"
      v-model="user_name"
      @keyup.enter="getUserID()"
      autofocus
    />
    <button class="btn btn-outline-primary" type="submit" @click="getUserID()">Search</button>

    <div class="alert alert-danger fixed-bottom text-uppercase" style="font-family: var(--bs-body-font-family)" role="alert" v-if="error">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { emit, fetchData } from "@/utils/usefulFunctions.js";

export default defineComponent({
  name: "FlickrUser",
  setup() {
    // App variables
    const user_name = ref(String);
    const user_id = ref(Array);
    const error = ref(String);

    // Default values
    user_name.value = "";
    user_id.value = [];
    error.value = null;

    // Methods
    const getUserID = async () => {
      if (user_name.value.length === 0) {
        return (error.value = "Please type a username.");
      }

      let rawData = Object;

      const fetchParams = {
        method: "flickr.people.findByUsername",
        username: user_name.value,
      };

      rawData = await fetchData(fetchParams);
      try {
        rawData = await fetchData(fetchParams);

        error.value = null;
        user_id.value = rawData.user.id;

        // Emits the user ID to the FlickrPhotos component
        const spinner = document.querySelector(".spinner");
        spinner.classList.remove("visually-hidden");

        const gallery = document.querySelector(".gallery");
        gallery.classList.add("visually-hidden");
        emit("userID", user_id.value);
      } catch (err) {
        // Errors handling
        if (err == "TypeError: Failed to fetch") {
          return (error.value = "Connection error. Try it later.");
        } else {
          return (error.value = "User not found. Please, check it out.");
        }
      }

      // Cleaning up input field and old user iD from app
      user_name.value = "";
      user_id.value = null;
    };

    // Exposing data to template
    return {
      getUserID,
      error,
      user_name,
    };
  },
});
</script>

<style scoped lang="less">
input {
  outline: 0;
}
</style>
