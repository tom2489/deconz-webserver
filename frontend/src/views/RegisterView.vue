<script setup>
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useAuthStore } from '@/stores/auth';
  import { useRouter } from 'vue-router';

  const { t } = useI18n();

  const auth = useAuthStore();
  const router = useRouter();
  const showPassword = ref(false);

  const username = ref('');
  const password = ref('');
  const error = ref('');

  const onRegister = async () => {
    error.value = '';
    try {
      await auth.register(username.value, password.value);
      router.push('/');
    } catch (err) {
      error.value =
        err.response?.data?.error || err.message || 'Registration failed. Please try again.';
    }
  };
</script>

<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card class="pa-8" width="400">
      <v-card-title>Login</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="onRegister">
          <v-text-field v-model="username" :label="t('username')" outlined dense required />
          <v-text-field
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :label="t('password')"
            outlined
            dense
            required
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
          />
          <v-alert v-if="error" type="error" dense class="mt-2">{{ error }}</v-alert>

          <v-btn type="submit" block color="primary" class="mt-4">{{ t('register') }}</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>
