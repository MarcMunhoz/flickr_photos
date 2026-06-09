<template>
  <form class="d-flex" role="search" @submit.prevent="submitSearch">
    <input
      class="user-name form-control me-2"
      :class="{ 'is-invalid': error }"
      type="search"
      placeholder="Flickr user name"
      aria-label="Search"
      v-model="username"
      autofocus
    />
    <button class="btn btn-outline-primary" type="submit" :disabled="isLoading">
      {{ isLoading ? "Loading..." : "Search" }}
    </button>

    <div class="alert alert-danger fixed-bottom text-uppercase" role="alert" v-if="error">
      {{ error }}
    </div>
  </form>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useUserGallery } from "@/composables/useUserGallery.js";

export default defineComponent({
  name: "FlickrUser",
  setup() {
    const username = ref("");
    const { error, isLoading, searchUserGallery } = useUserGallery();

    const submitSearch = async () => {
      const succeeded = await searchUserGallery(username.value);
      if (succeeded) {
        username.value = "";
      }
    };

    return {
      error,
      isLoading,
      submitSearch,
      username,
    };
  },
});
</script>

<style scoped lang="less">
input {
  outline: 0;
}
</style>
