<script setup>
  import '@/assets/styles/styles.css';
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { storeToRefs } from 'pinia';
  import { renameLight } from '@/services/deconz-api';
  import { useLightsStore } from '@/stores/deconz-store';
  import switchOnIcon from '@/assets/vectors/switch-on.svg';
  import switchOffIcon from '@/assets/vectors/switch-off.svg';
  import lightOnIcon from '@/assets/vectors/light-bulb-on.svg';
  import lightOffIcon from '@/assets/vectors/light-bulb-off.svg';

  const { t } = useI18n();

  const lightsStore = useLightsStore();
  const { lights, loading } = storeToRefs(lightsStore);

  const hoverStates = ref(new Map());

  const editingId = ref(null);
  const newName = ref('');

  function setHover(id, state) {
    hoverStates.value.set(id, state);
  }

  const getIcon = (light, id) => {
    if (hoverStates.value.get(id)) return light.state.on ? switchOnIcon : switchOffIcon;
    return light.state.on ? lightOnIcon : lightOffIcon;
  };

  function startEditing(light) {
    editingId.value = light.id;
    newName.value = light.name;
  }

  async function saveName(light) {
    if (!newName.value.trim()) return;
    try {
      await renameLight(light.id, newName.value.trim());
      light.name = newName.value.trim();
    } catch (err) {
      console.error('Failed to rename light:', err);
    }
    editingId.value = null;
  }
</script>

<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="height: 600px">
      <v-container>
        <v-row>
          <v-col cols="12" sm="6" lg="4" v-if="lights && Object.keys(lights).length > 0">
            <v-card>
              <v-card-title>{{ t('lights') }}</v-card-title>
              <v-list>
                <v-list-item
                  v-for="(light, id) in lights"
                  :key="id"
                  class="align-center"
                  @click="lightsStore.toggleLight(light.id)"
                  @mouseenter="setHover(id, true)"
                  @mouseleave="setHover(id, false)"
                >
                  <template v-slot:prepend>
                    <v-avatar color="grey-lighten-4" class="bordered-avatar" size="48">
                      <img :src="getIcon(light, id)" width="42" height="42" />
                    </v-avatar>
                  </template>

                  <template v-if="editingId === light.id">
                    <v-text-field
                      v-model="newName"
                      dense
                      hide-details
                      autofocus
                      @blur="saveName(light)"
                      @keyup.enter="saveName(light)"
                      @click.stop
                    />
                  </template>
                  <template v-else>
                    <v-list-item-title
                      class="editable"
                      style="cursor: text"
                      @click.stop="startEditing(light)"
                    >
                      {{ light.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ light.state.on ? t('on') : t('off') }}
                    </v-list-item-subtitle>
                  </template>

                  <template v-slot:append>
                    <v-btn
                      icon
                      small
                      v-if="hoverStates.get(light.id) && editingId !== light.id"
                      @click.stop="startEditing(light)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
