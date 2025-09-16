import { getLights, setLightState } from '../services/deconz-api';
import { defineStore } from 'pinia';

export const useLightsStore = defineStore('lights', {
  state: () => ({
    lights: {},
    loading: false,
    error: null,
  }),
  getters: {
    getLightById: (state) => {
      return (id) => {
        return state.lights.find((light) => light.id === String(id)) || null;
      };
    },
  },
  actions: {
    async fetchLights() {
      this.loading = true;
      this.error = null;
      try {
        this.lights = await getLights();
      } catch (err) {
        this.error = err;
        console.error('Failed to fetch lights', err);
      } finally {
        this.loading = false;
      }
    },

    async toggleLight(id) {
      console.log(id);
      const light = this.getLightById(id);
      if (!light) return;

      const newState = { on: !light.state.on };

      try {
        await setLightState(id, newState);

        await this.fetchLights();
      } catch (err) {
        console.error('Failed to update light', err);
        await this.fetchLights();
      }
    },

    startPolling(intervalMs = 5000) {
      this.fetchLights();
      this._poller = setInterval(() => this.fetchLights(), intervalMs);
    },

    stopPolling() {
      if (this._poller) {
        clearInterval(this._poller);
        this._poller = null;
      }
    },
  },
});
