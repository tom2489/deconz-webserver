<script setup>
  import { useLightsStore } from '../stores/deconz-store';
  import { ref } from 'vue';

  const drawer = ref(true);
  const rail = ref(true);

  const lightsStore = useLightsStore();
</script>

<template>
  <div>HelloWorld</div>
</template>

<style scoped></style>
