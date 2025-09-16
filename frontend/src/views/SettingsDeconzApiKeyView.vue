<script setup>
  import { ref, onMounted } from 'vue';
  import { getDeconzApiKey, postDeconzApiKey, deleteDeconzApiKey } from '@/services/backend-api';
  import { createDeconzApiKey } from '@/services/deconz-api';

  const apiKey = ref('');
  const statusMessage = ref('');

  async function loadApiKey() {
    try {
      const data = await getDeconzApiKey();
      apiKey.value = data.apiKey || '';
    } catch (err) {
      console.error(err);
      apiKey.value = '';
    }
  }

  async function addDeconzApiKey() {
    let data;

    try {
      data = await createDeconzApiKey();
    } catch (err) {
      console.error(err);
      statusMessage.value =
        'Error adding API key. Please make sure you clicked Authenticate App in the Phoscon App.';
      return;
    }

    if (data && data[0]?.success?.username) {
      apiKey.value = data[0].success.username;

      try {
        await postDeconzApiKey(apiKey.value);
        statusMessage.value = 'API Key successfully added and saved!';
      } catch (err) {
        console.error(err);
        statusMessage.value = 'Error adding API key. There seems to be an internal error.';
      }
    } else {
      statusMessage.value = 'Failed to get API key from Deconz.';
    }
  }

  async function deleteApiKey() {
    try {
      await deleteDeconzApiKey();
      apiKey.value = '';
      statusMessage.value = 'API Key successfully deleted.';
    } catch (err) {
      console.error(err);
      statusMessage.value = 'Error deleting API key: ' + err.message;
    }
  }

  onMounted(() => {
    loadApiKey();
  });
</script>

<template>
  <v-container class="d-flex justify-center mt-8">
    <v-card class="pa-6" width="450">
      <v-card-title>Deconz API Key</v-card-title>
      <v-card-text>
        <v-row class="mt-2" dense>
          <v-text-field :value="apiKey" readonly variant="outlined" clearable />
          <v-col v-if="!apiKey" cols="12">
            <v-btn color="primary" block @click="addDeconzApiKey">Add API Key</v-btn>
          </v-col>
          <v-col v-else cols="12">
            <v-btn color="error" block @click="deleteApiKey">Delete API Key</v-btn>
          </v-col>
          <v-alert
            class="mt-2"
            v-if="statusMessage"
            :type="statusMessage.includes('Error') ? 'error' : 'success'"
            variant="outlined"
            dense
          >
            {{ statusMessage }}
          </v-alert>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>
