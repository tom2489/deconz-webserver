<script setup>
  import { ref } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const username = ref('');
  const password = ref('');
  const showPassword = ref(false);

  const authStore = useAuthStore();

  async function handleLogin() {
    try {
      await authStore.login(username.value, password.value);
      router.push({ name: 'Home' });
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  }
</script>

<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card class="pa-8" width="400">
      <v-card-title>Login</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleLogin">
          <v-text-field v-model="username" label="Username" outlined dense required />
          <v-text-field
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            outlined
            dense
            required
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
          />
          <v-btn type="submit" block color="primary" class="mt-4">Login</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>
