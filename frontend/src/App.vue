<script setup>
  import { watch, onUnmounted } from 'vue';
  import { useLightsStore } from './stores/deconz-store';
  import { useAuthStore } from '@/stores/auth';
  import { ref } from 'vue';
  import { useRoute, useRouter, RouterLink } from 'vue-router';

  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();
  const lightsStore = useLightsStore();

  const drawer = ref(true);
  const rail = ref(true);
  const settingsOpen = ref(true);

  watch(
    () => authStore.isAuthenticated,
    (isAuth) => {
      if (isAuth) {
        lightsStore.startPolling();
      } else {
        lightsStore.stopPolling();
      }
    },
    { immediate: true }
  );

  watch(
    () => route.name,
    (name) => {
      const settingsRoutes = ['SettingsDeconzApiKey'];
      settingsOpen.value = settingsRoutes.includes(name);
    },
    { immediate: true }
  );

  onUnmounted(() => {
    lightsStore.stopPolling();
  });

  const items = [
    { title: 'Home', to: { name: 'Home' } },
    { title: 'Automation', to: { name: 'Automation' } },
    {
      title: 'Settings',
      to: { name: 'SettingsDeconzApiKey' },
      children: [{ title: 'Deconz API Key', to: { name: 'SettingsDeconzApiKey' } }],
    },
    { title: 'About', to: { name: 'About' } },
  ];

  function handleLogout() {
    authStore.logout();
    router.push({ name: 'Login' });
  }
</script>

<template>
  <v-app>
    <template v-if="authStore.isAuthenticated">
      <v-navigation-drawer v-model="drawer" variant="permanent">
        <v-list nav>
          <template v-for="item in items" :key="item.title">
            <v-list-group v-if="item.children" v-model="settingsOpen" no-action>
              <template #activator>
                <v-list-item
                  link
                  :component="RouterLink"
                  :to="item.to"
                  @click.stop="
                    settingsOpen = !settingsOpen;
                    console.log('Settings toggled', settingsOpen);
                  "
                  style="cursor: pointer"
                >
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in item.children"
                :key="child.title"
                link
                :component="RouterLink"
                :to="child.to"
              >
                <v-list-item-title>{{ child.title }}</v-list-item-title>
              </v-list-item>
            </v-list-group>

            <v-list-item v-else link :component="RouterLink" :to="item.to">
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </template>
        </v-list>
      </v-navigation-drawer>

      <v-app-bar :elevation="2">
        <v-app-bar-nav-icon @click="drawer = !drawer" />
        <v-app-bar-title>Application Bar</v-app-bar-title>

        <v-spacer />

        <v-btn color="error" text @click="handleLogout">Logout</v-btn>
      </v-app-bar>
    </template>

    <v-main class="d-flex align-center justify-center" style="min-height: 100vh">
      <router-view />
    </v-main>
  </v-app>
</template>

<style scoped>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
  }
</style>
