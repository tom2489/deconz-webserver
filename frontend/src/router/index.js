import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import AboutView from '@/views/AboutView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import AutomationView from '@/views/AutomationView.vue';
import AutomationAddView from '@/views/AutomationAddView.vue';
import SettingsDeconzApiKeyView from '@/views/SettingsDeconzApiKeyView.vue';
import SettingsUserManagementView from '@/views/SettingsUserManagementView.vue';

const routes = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { title: 'Login' },
  },

  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { title: 'Register' },
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
    path: '/automation-add',
    name: 'AutomationAdd',
    component: AutomationAddView,
    meta: { title: 'Automation' },
  },
  {
    path: '/settings/deconz-api-key',
    name: 'SettingsDeconzApiKey',
    component: SettingsDeconzApiKeyView,
    meta: { title: 'SettingsDeconzApiKey' },
  },
  {
    path: '/settings/user-management',
    name: 'SettingsUserManagement',
    component: SettingsUserManagementView,
    meta: { title: 'SettingsUserManagement' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const publicPages = ['/login', '/register'];
  const authRequired = !publicPages.includes(to.path);

  let usersExist = true;
  if (to.path !== '/register') {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/exists`);
      usersExist = res.data.usersExist;
    } catch (err) {
      console.error('Failed to check users existence:', err);
    }

    if (!usersExist) {
      return next('/register');
    }
  }

  if (authStore.isAuthenticated && publicPages.includes(to.path)) {
    return next('/home');
  }

  if (authRequired && !authStore.isAuthenticated) {
    return next('/login');
  }

  next();
});
export default router;
