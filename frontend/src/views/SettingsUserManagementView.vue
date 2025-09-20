<script setup>
  import { useAuthStore } from '@/stores/auth';
  import { computed, ref, onMounted, watch } from 'vue';

  const authStore = useAuthStore();

  const allRoles = ['admin', 'user'];
  const users = computed(() => authStore.users);

  // Local role selections, keyed by user ID
  const roleSelections = ref({});

  // Snackbar state
  const snackbar = ref({
    show: false,
    message: '',
    color: 'info',
    timeout: 3000,
  });

  // Init users + role selections
  onMounted(async () => {
    if (authStore.isAdmin && authStore.users.length === 0) {
      await authStore.fetchUsers();
    }
    users.value.forEach((user) => {
      roleSelections.value[user.id] = [...user.roles];
    });
  });

  // Keep roleSelections in sync if users update
  watch(users, (newUsers) => {
    newUsers.forEach((user) => {
      if (!roleSelections.value[user.id]) {
        roleSelections.value[user.id] = [...user.roles];
      }
    });
  });

  function sanitizeRoles(userId, selectedRoles) {
    const safeRoles = [...selectedRoles];

    if (!safeRoles.includes('user')) {
      snackbar.value = {
        show: true,
        message: 'Cannot remove "user" role',
        color: 'info',
        timeout: 3000,
      };
      safeRoles.push('user');
    }

    if (userId === authStore.user.id && !safeRoles.includes('admin')) {
      snackbar.value = {
        show: true,
        message: 'You cannot remove your own admin role',
        color: 'info',
        timeout: 3000,
      };
      safeRoles.push('admin');
    }

    return [...new Set(safeRoles)];
  }

  async function onRolesChange(userId) {
    const selectedRoles = roleSelections.value[userId];
    const safeRoles = sanitizeRoles(userId, selectedRoles);

    try {
      const updatedRoles = await authStore.updateRoles(userId, safeRoles);
      if (updatedRoles) {
        // Sync roleSelections with confirmed backend state
        roleSelections.value[userId] = [...updatedRoles];
      } else {
        snackbar.value = {
          show: true,
          message: 'Failed to update roles',
          color: 'error',
          timeout: 4000,
        };
        // rollback
        roleSelections.value[userId] = users.value.find((u) => u.id === userId)?.roles || [];
      }
    } catch (err) {
      snackbar.value = {
        show: true,
        message: err.message || 'Failed to update roles',
        color: 'error',
        timeout: 4000,
      };
      // rollback
      roleSelections.value[userId] = users.value.find((u) => u.id === userId)?.roles || [];
    }
  }

  async function deleteUser(user) {
    if (user.id === authStore.user.id) {
      snackbar.value = {
        show: true,
        message: 'You cannot delete yourself',
        color: 'info',
        timeout: 3000,
      };
      return;
    }

    try {
      const success = await authStore.deleteUser(user);
      if (success) {
        snackbar.value = {
          show: true,
          message: `User "${user.username}" deleted`,
          color: 'success',
          timeout: 3000,
        };
      } else {
        throw new Error('Backend deletion failed');
      }
    } catch (err) {
      snackbar.value = {
        show: true,
        message: err.message || 'Failed to delete user',
        color: 'error',
        timeout: 4000,
      };
    }
  }

  const headers = [
    { title: 'ID', key: 'id' },
    { title: 'Username', key: 'username' },
    { title: 'Roles', key: 'roles' },
    { title: '', key: 'actions', sortable: false },
  ];
</script>

<template>
  <v-container class="d-flex justify-center mt-8" style="max-width: 600px">
    <v-data-table :headers="headers" :items="users" class="elevation-1" item-key="id">
      <template #item.roles="{ item }">
        <v-select
          v-model="roleSelections[item.id]"
          :items="allRoles"
          multiple
          chips
          dense
          hide-details
          :item-props="
            (role) => ({
              disabled: role === 'user' || (item.id === authStore.user.id && role === 'admin'),
            })
          "
          @update:model-value="() => onRolesChange(item.id)"
        />
      </template>

      <template #item.actions="{ item }">
        <v-btn
          v-if="authStore.isAdmin"
          icon
          size="32"
          color="error"
          :disabled="item.id === authStore.user.id"
          @click="deleteUser(item)"
        >
          <v-icon size="16">mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      top
      right
      :timeout="snackbar.timeout"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>
