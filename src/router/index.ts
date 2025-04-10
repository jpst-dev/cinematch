import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import Explore from "../pages/Explore.vue";
import TopRated from "../pages/TopRated.vue";
import MovieDetail from "../pages/MovieDetail.vue";
import Search from "../pages/Search.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/top-rated", name: "TopRated", component: TopRated },
  { path: "/explorar", name: "Explore", component: Explore },
  { path: "/buscar", name: "Search", component: Search },
  { path: "/filme/:id", name: "MovieDetail", component: MovieDetail },
  { path: "/:catchAll(.*)", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
