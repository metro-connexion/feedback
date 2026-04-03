import { createRouter, createWebHistory } from "vue-router";

import { useAuthStore } from "@/stores/auth.js";
import LoginView from "@/views/authentication/LoginView.vue";
import HomeView from "@/views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/accueil",
    },
    {
      path: "/authentication/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/accueil",
      name: "accueil",
      component: HomeView,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
    return { name: "login" };
  }
});

export default router;
