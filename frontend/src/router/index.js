import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/login.vue";
import Register from "../views/register.vue";
import Home from "../views/Home.vue";
import exercicio from "../views/exercicio.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/register",
    component: Register,
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/home",
    component: Home,
  },
  {
    path: "/exercicio",
    component: exercicio,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
