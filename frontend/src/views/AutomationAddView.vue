<script setup>
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useLightsStore } from '@/stores/deconz-store';
import { useAutomationStore } from '@/stores/automation-store';

const { t } = useI18n();
const router = useRouter();

const lightsStore = useLightsStore();
const { lights } = storeToRefs(lightsStore);

const automationStore = useAutomationStore();

// Navigate back to automation view
const goBack = () => {
  router.push({ name: 'Automation' });
};

const handleAdd = () => {
  automationStore.addAutom()
  goBack()
};

</script>

<template>
  <v-card>
    <v-card-title>
      {{ t('Automation') }}

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

    <!-- Action buttons -->
    <v-card-actions class="justify-end">
      <v-btn color="grey" variant="outlined" @click="goBack">
        {{ t('Cancel') }}
      </v-btn>
      <v-btn color="primary" variant="elevated" @click="handleAdd">
        {{ t('Add') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
