import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/login.vue";
import Register from "../views/register.vue";
import Home from "../views/Home.vue";

//será usado para teste, não tem nada a ver com o projeto, pode ser deletado depois
import HomeTeste from "../views/HomeTeste.vue";

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

  //será usado para teste, não tem nada a ver com o projeto, pode ser deletado depois
  { 
    path: "/teste",
    component: HomeTeste 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
