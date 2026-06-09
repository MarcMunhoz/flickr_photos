import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      headerTitle: "Public Flickr Gallery",
    },
  },
  {
    path: "/about",
    name: "About",
    meta: {
      headerTitle: "About",
    },
    // Secondary views are loaded only when their route is requested.
    component: () => import("../views/About.vue"),
  },
  {
    path: "/recent-photos",
    name: "Recent Photos",
    meta: {
      headerTitle: "Recent public photos on Flickr",
    },
    // Keep the initial Home bundle focused on the username gallery flow.
    component: () => import("../views/Recent.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
