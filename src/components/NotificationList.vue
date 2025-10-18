<template>
    <div
        class="fixed top-14 right-5 z-50 bg-white shadow-lg rounded-lg p-4 w-[350px] max-h-[500px] overflow-y-auto max-w-md mx-auto">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Notifications</h2>

        <!-- Loader -->
        <div v-if="isLoading" class="mt-4">
            <TableLoader :rows="7" />
        </div>

        <!-- Notification List -->
        <ul v-else class="divide-y divide-gray-200">
            <li v-for="notif in notifications" :key="notif.id"
                class="py-3 px-2 hover:bg-gray-50 transition rounded cursor-pointer" @click="handleNotifClick(notif)">
                <div class="flex items-start">
                    <div class="flex-1">
                        <p :class="[
                            'text-xs leading-tight',
                            !notif.read_at ? 'text-black font-bold' : 'text-slate-800'
                        ]">
                            {{ notif.data?.message || 'No message available' }}
                        </p>
                        <p class="text-xs text-blue-600 mt-1">
                            {{ timeAgo(notif.created_at) }}
                        </p>
                    </div>
                    <span v-if="notif.is_read === false" class="w-2 h-2 bg-blue-500 rounded-full ml-3 mt-2"></span>
                </div>
            </li>
        </ul>

        <!-- Empty State -->
        <p v-if="!notifications.length && !isLoading" class="text-gray-400 text-center py-4">
            No notifications available.
        </p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchAllNotifications, markNotificationAsRead } from '@/services/apiService'
import TableLoader from './TableLoader.vue'
import { timeAgo } from '@/utils/formatters'

const emits = defineEmits(['toggleThisModal', 'refresh'])

const notifications = ref([])
const isLoading = ref(false)

const getNotifications = async () => {
    try {
        isLoading.value = true
        const response = await fetchAllNotifications()
        notifications.value = response
    } catch (error) {
        console.error('Error fetching notifications:', error)
    } finally {
        isLoading.value = false
    }
}

const handleNotifClick = async (notif) => {
    try {
        if (!notif.is_read) {
            emits('toggleThisModal', notif)
            await markNotificationAsRead(notif.id)
            notif.is_read = true // Update UI immediately
            emits('refresh', notif)
        }

        // Emit event with notification data (for opening modal or navigation)
    } catch (error) {
        console.error('Error marking notification as read:', error)
    }
}

onMounted(() => {
    getNotifications()
})
</script>

<style scoped>
li {
    transition: background-color 0.2s ease;
}
</style>
