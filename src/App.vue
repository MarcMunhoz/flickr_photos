<template>
  <NavBar />
  <router-view />
</template>

<script>
import NavBar from "@/components/NavBar.vue";

export default {
  name: "MainTemplate",
  components: {
    NavBar,
  },
};
</script>

<style lang="less">
@fonts-folder: "@/assets/fonts/";

@font-face {
  font-family: "Kuaile";
  src: url("@{fonts-folder}zcoolkuaile-regular-webfont.woff") format("woff"), url("@{fonts-folder}zcoolkuaile-regular-webfont.woff2") format("woff2");
}

#app {
  font-family: Kuaile;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
