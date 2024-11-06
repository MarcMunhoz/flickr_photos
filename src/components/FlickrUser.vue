<template>
  <div class="w-100">
    <input type="text" size="20" v-model="user_name" @keyup.enter="getUserID()" class="border border-2 border-info text-info p-1 me-2" placeholder="Flickr user name" autofocus />

    <button type="submit" value="Submit" @click="getUserID()" class="btn btn-sm btn-danger">Submit</button>

    <p class="text-danger">{{ error }}</p>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { fetchData } from "@/utils/usefulFunctions.js";

export default defineComponent({
  name: "FlickrUser",
  setup(props, context) {
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
        context.emit("userID", user_id.value);
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
