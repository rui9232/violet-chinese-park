import { createRouter, createWebHistory } from "vue-router";
import HomeView from "./views/HomeView.vue";
import GradeView from "./views/GradeView.vue";
import GameView from "./views/GameView.vue";
import StudioView from "./views/StudioView.vue";

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", component: HomeView },
    { path: "/grade/:grade", component: GradeView },
    { path: "/grade/:grade/play/:type", component: GameView },
    { path: "/play/:code", component: GameView },
    { path: "/studio", component: StudioView },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});
