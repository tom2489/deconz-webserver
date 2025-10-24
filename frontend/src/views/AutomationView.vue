<script setup>
  import { useRouter } from 'vue-router'

  const router = useRouter()

  function goToAddView() {
    router.push({ name: 'AutomationAdd' })
  }
</script>

<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="height: 600px">
      <v-container>
        <v-btn icon @click="goToAddView">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped></style>
