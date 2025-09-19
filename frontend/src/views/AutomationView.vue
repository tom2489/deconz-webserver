<script setup>
  import { reactive, ref } from 'vue';
  import { useLightsStore } from '../stores/deconz-store';
  import { storeToRefs } from 'pinia';

  const lightsStore = useLightsStore();
  const { lights, loading, error } = storeToRefs(lightsStore);

  const hoverStates = reactive({});
</script>

<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="height: 600px">
      <v-container></v-container>
    </v-main>
  </v-app>
</template>

<style scoped></style>
