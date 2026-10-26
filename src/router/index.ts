import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  {
    path: "/em-cartaz",
    name: "NowPlaying",
    component: () => import("../pages/ListaFilmes.vue"),
    props: { titulo: "Em cartaz", subtitulo: "Nos cinemas agora", fonte: "em-cartaz" },
  },
  {
    path: "/em-alta",
    name: "Popular",
    component: () => import("../pages/ListaFilmes.vue"),
    props: { titulo: "Em alta", subtitulo: "Os mais vistos da semana", fonte: "em-alta" },
  },
  {
    path: "/top-rated",
    name: "TopRated",
    component: () => import("../pages/ListaFilmes.vue"),
    props: { titulo: "Mais bem avaliados", subtitulo: "Nota do público no TMDb", fonte: "mais-bem-avaliados" },
  },
  { path: "/explorar", name: "Explore", component: () => import("../pages/Explore.vue") },
  { path: "/buscar", name: "Search", component: () => import("../pages/Search.vue") },
  { path: "/filme/:id(\\d+)", name: "MovieDetail", component: () => import("../pages/MovieDetail.vue") },
  { path: "/:catchAll(.*)", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // A âncora #trailer é tratada pela página do filme, que só conhece a seção depois de carregar.
  scrollBehavior: (_to, _from, salvo) => salvo ?? { top: 0 },
});

export default router;
