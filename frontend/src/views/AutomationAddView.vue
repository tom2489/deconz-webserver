<script setup>
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useLightsStore } from '@/stores/deconz-store';
import { useAutomationStore } from '@/stores/automation-store'

const { t } = useI18n();

const lightsStore = useLightsStore();
const { lights } = storeToRefs(lightsStore);

const automationStore = useAutomationStore()

</script>

<template>
<v-card-title>
  Automation

  <!-- Device select -->
  <v-select
    v-if="lights && lights.length > 0"
    v-model="automationStore.selectedDeviceId"
    :items="lights.map(l => ({ label: l.name, value: l.id }))"
    item-title="label"
    item-value="value"
    :label="t('Choose a device')"
    dense
    outlined
    class="ml-4"
  />

  <!-- Action select -->
  <v-select
    v-model="automationStore.selectedAction"
    :items="automationStore.actions"
    item-title="label"
    item-value="value"
    :label="t('Choose an action')"
    dense
    outlined
    class="ml-4"
  />

  <!-- Dynamic conditions -->
  <div class="d-flex align-center ml-4">
    <template v-for="(condition, index) in automationStore.selectedConditions" :key="index">
      <v-select
        v-model="automationStore.selectedConditions[index]"
        :items="automationStore.conditions"
        item-title="label"
        item-value="value"
        :label="t('Choose a condition')"
        dense
        outlined
        class="mr-2"
      />
      <v-btn icon @click="automationStore.removeCondition(index)">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
    <v-btn icon color="primary" @click="automationStore.addCondition">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </div>
</v-card-title>
</template>