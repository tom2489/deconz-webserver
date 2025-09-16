<script setup>
  import { reactive, ref } from 'vue';
  import { useLightsStore } from '../stores/deconz-store';
  import { storeToRefs } from 'pinia';
  import lightOnIcon from '../assets/light-bulb-on.svg';
  import lightOffIcon from '../assets/light-bulb-off.svg';
  import switchOnIcon from '../assets/switch-on.svg';
  import switchOffIcon from '../assets/switch-off.svg';

  const lightsStore = useLightsStore();
  const { lights, loading, error } = storeToRefs(lightsStore);

  const hoverStates = reactive({});
</script>

<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="height: 600px">
      <v-container>
        <v-row>
          <v-col cols="12" sm="6" lg="4">
            <v-card :loading="loading" title="Card title" subtitle="Subtitle" text="...">
              <v-list>
                <v-list-item v-for="(light, id) in lights" :key="id" class="d-flex align-center">
                  <template v-slot:prepend>
                    <v-btn
                      icon
                      @click="
                        () => {
                          console.log('clicked on', light);
                          lightsStore.toggleLight(light.id);
                        }
                      "
                      @mouseenter="hoverStates[id] = true"
                      @mouseleave="hoverStates[id] = false"
                    >
                      <v-avatar color="grey-lighten-1" class="cursor-pointer">
                        <v-img
                          :src="
                            hoverStates[id]
                              ? light.state.on
                                ? switchOnIcon
                                : switchOffIcon
                              : light.state.on
                                ? lightOnIcon
                                : lightOffIcon
                          "
                          max-width="24"
                          max-height="36"
                        />
                      </v-avatar>
                    </v-btn>
                  </template>

                  <!-- Text content -->
                  <v-list-item-content>
                    <v-list-item-title>{{ light.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ light.state.on ? 'On' : 'Off' }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <v-card-actions>
                <v-btn>Click me</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" lg="8">
            <v-card loading title="Card title" subtitle="Subtitle" text="...">
              <v-card-actions>
                <v-btn>Click me</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped></style>
