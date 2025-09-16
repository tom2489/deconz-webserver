import { defineStore } from 'pinia';
import { login as apiLogin, register as apiRegister } from '@/services/backend-api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
  },

  actions: {
    async login(username, password) {
      try {
        const res = await apiLogin(username, password);
        this.token = res.token;
        this.user = res.user;

        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));

        return true;
      } catch (err) {
        console.error('Login failed:', err);
        throw err;
      }
    },
    async register(username, password, role = 'user') {
      try {
        const res = await apiRegister(username, password, role);
        this.token = res.token;
        this.user = res.user;

        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        return true;
      } catch (err) {
        console.error('Register failed:', err);
        throw err;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
