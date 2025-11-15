import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAutomationStore = defineStore('automation', () => {
  const selectedDeviceId = ref(null)
  const selectedAction = ref(null)
  const selectedConditions = ref([])

  // The full list of automations
  const automations = ref([])

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
    selectedConditions.value.push(null)
  }

  function removeCondition(index) {
    selectedConditions.value.splice(index, 1)
  }

  // Add a new automation entry
  function addAutom() {
    if (!selectedDeviceId.value || !selectedAction.value) {
      console.warn('Device or action not selected')
      return
    }

    const newAutomation = {
      id: Date.now(), // simple unique id
      deviceId: selectedDeviceId.value,
      action: selectedAction.value,
      conditions: [...selectedConditions.value],
    }

    automations.value.push(newAutomation)

    // Optionally reset selections after adding
    selectedDeviceId.value = null
    selectedAction.value = null
    selectedConditions.value = []
  }

  return {
    selectedDeviceId,
    selectedAction,
    selectedConditions,
    actions,
    conditions,
    automations,
    addCondition,
    removeCondition,
    addAutom
  }
})
