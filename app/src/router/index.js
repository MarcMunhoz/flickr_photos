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
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
  {
    path: "/recent-photos",
    name: "Recent Photos",
    meta: {
      headerTitle: "Recent public photos on Flickr",
    },
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import("../views/Recent.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
