import { defineStore } from 'pinia';
import {
  login as apiLogin,
  register as apiRegister,
  deleteUser as apiDeleteUser,
  getAllUsers,
  updateUserRoles,
} from '@/services/backend-api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    users: [],
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRoles: (state) => state.user?.roles || [],
    hasRole: (state) => (role) => state.user?.roles?.includes(role) || false,
    hasAnyRole: (state) => (roles) => state.user?.roles?.some((r) => roles.includes(r)) || false,
    isAdmin: (state) => state.user?.roles?.includes('admin') || false,
  },

  actions: {
    async login(username, password) {
      try {
        const res = await apiLogin(username, password);

        if (!Array.isArray(res.user.roles)) {
          res.user.roles = [res.user.roles || 'user'];
        }

        this.token = res.token;
        this.user = res.user;

        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));

        if (this.isAdmin) {
          await this.fetchUsers();
        }

        return true;
      } catch (err) {
        console.error('Login failed:', err);
        throw err;
      }
    },

    async register(username, password, roles = ['user']) {
      try {
        const res = await apiRegister(username, password, roles);

        if (!Array.isArray(res.user.roles)) {
          res.user.roles = [res.user.roles || 'user'];
        }

        this.token = res.token;
        this.user = res.user;

        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));

        if (this.isAdmin) {
          await this.fetchUsers();
        }

        return true;
      } catch (err) {
        console.error('Register failed:', err);
        throw err;
      }
    },

    async fetchUsers() {
      try {
        const users = await getAllUsers();
        this.users = users;
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    },

    async deleteUser(user) {
      try {
        if (user.id === this.user.id) {
          return false;
        }

        const res = await apiDeleteUser(user.id);
        if (res.success) {
          this.users = this.users.filter((u) => u.id !== user.id);
          return true;
        } else {
          return false;
        }
      } catch (err) {
        console.error('Failed to delete user:', err);
        return false;
      }
    },

    async updateRoles(userId, roles) {
      try {
        const res = await updateUserRoles(userId, roles);
        const user = this.users.find((u) => u.id === userId);
        if (user) user.roles = res.roles;
        return res.roles;
      } catch (err) {
        console.error('Failed to update roles:', err);
        throw err;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      this.users = [];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
