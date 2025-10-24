import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAutomationStore = defineStore('automation', () => {
  const selectedDeviceId = ref(null)
  const selectedAction = ref(null)

  // Make conditions dynamic
  const selectedConditions = ref([]) // array of selected condition values

  const actions = ref([
    { label: 'Turn On', value: 'turn_on' },
    { label: 'Turn Off', value: 'turn_off' },
    { label: 'Toggle', value: 'toggle' },
  ])

  const conditions = ref([
    { label: 'Time is', value: 'time_is' },
    { label: 'Device is On', value: 'device_on' },
    { label: 'Device is Off', value: 'device_off' },
  ])

  function addCondition() {
    selectedConditions.value.push(null) // push empty initially
  }

  function removeCondition(index) {
    selectedConditions.value.splice(index, 1)
  }

  return {
    selectedDeviceId,
    selectedAction,
    selectedConditions,
    actions,
    conditions,
    addCondition,
    removeCondition
  }
})