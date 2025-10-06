<template>
<p>Admin Dashboard</p>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchUsers } from '@/services/apiService';

const users = ref([]);

const getUsers = async () => {
  // fetch users from API
  try {
    const response = await fetchUsers();
    users.value = response;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

onMounted(() => {
  getUsers();
});

</script>