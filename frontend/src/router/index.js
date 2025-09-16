import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AboutView from '../views/AboutView.vue';
import LoginView from '../views/LoginView.vue';
import AutomationView from '../views/AutomationView.vue';
import SettingsDeconzApiKeyView from '../views/SettingsDeconzApiKeyView.vue';
import { useAuthStore } from '@/stores/auth';

const routes = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { title: 'Login' },
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: { title: 'Home' },
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView,
    meta: { title: 'About' },
  },
  {
    path: '/automation',
    name: 'Automation',
    component: AutomationView,
    meta: { title: 'Automation' },
  },
  {
    path: '/settings/deconz-api-key',
    name: 'SettingsDeconzApiKey',
    component: SettingsDeconzApiKeyView,
    meta: { title: 'SettingsDeconzApiKey' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const publicPages = ['/login', '/register'];
  const authRequired = !publicPages.includes(to.path);

  if (authStore.isAuthenticated && publicPages.includes(to.path)) {
    return next('/home');
  }

  if (authRequired && !authStore.isAuthenticated) {
    return next('/login');
  }

  next();
});

export default router;
