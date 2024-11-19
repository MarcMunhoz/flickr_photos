<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand" title="Back to HOME" v-if="!isHome"><img src="/favicon.ico" class="w-50" /></router-link>
      <span class="navbar-brand" v-else><img src="/favicon.ico" class="w-50" /></span>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item" v-if="!isRecentPhotos">
            <router-link to="/recent-photos" class="nav-link">Recent Photos</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/about" class="nav-link disabled" aria-disabled="true">About</router-link>
          </li>
        </ul>

        <FlickrUser v-if="isHome" />
      </div>
    </div>
  </nav>
</template>

<script>
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import FlickrUser from "@/components/FlickrUser.vue";

export default defineComponent({
  name: "NavBar",
  components: {
    FlickrUser,
  },
  setup() {
    const route = useRoute();

    const isHome = computed(() => route.path === "/");
    const isRecentPhotos = computed(() => route.path === "/recent-photos");

    return {
      isHome,
      isRecentPhotos,
    };
  },
});
</script>
