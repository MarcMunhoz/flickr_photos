import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import VueLazyLoad from "vue3-lazyload";

createApp(App)
  .use(router, VueLazyLoad)
  .mount("#app");
