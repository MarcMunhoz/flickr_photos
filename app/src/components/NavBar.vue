<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand" title="Back to HOME" v-if="!isHome">
        <img src="/favicon.ico" alt="Flickr Gallery" />
      </router-link>
      <span class="navbar-brand" v-else>
        <img src="/favicon.ico" alt="Flickr Gallery" />
      </span>

      <h1 class="page-title">{{ pageTitle }}</h1>

    </div>
  </nav>
</template>

<script>
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "NavBar",
  setup() {
    const route = useRoute();

    const isHome = computed(() => route.path === "/");
    const pageTitle = computed(() => route.meta.headerTitle || route.name || "");

    return {
      isHome,
      pageTitle,
    };
  },
});
</script>

<style scoped>
.navbar {
  min-height: 68px;
}

.container-fluid {
  position: relative;
}

.navbar-brand {
  display: flex;
  align-items: center;
  margin-right: 1.5rem;
}

.navbar-brand img {
  width: 42px;
  height: 42px;
  object-fit: contain;
}

.page-title {
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: calc(100% - 360px);
  margin: 0;
  overflow: hidden;
  transform: translate(-50%, -50%);
  font-size: clamp(1.15rem, 2vw, 1.75rem);
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
  pointer-events: none;
  background: linear-gradient(90deg, #0462dc 0%, #5146d8 42%, #d51a8c 72%, #ff0084 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@media (max-width: 991.98px) {
  .page-title {
    position: static;
    order: 3;
    width: 100%;
    max-width: none;
    margin-top: 0.75rem;
    transform: none;
    font-size: 1.15rem;
    white-space: normal;
  }

  .navbar-collapse {
    order: 4;
    width: 100%;
  }
}
</style>
