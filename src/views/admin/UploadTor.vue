<template>
    <div>
        <h2 class="text-2xl font-semibold text-gray-800 my-4">
            Upload Transcript of Records
        </h2>

        <div class="bg-white p-6 rounded-lg hover:shadow-md duration-200 mb-6">
            <FileUpload :getUploadedTor="getUploadedTor" />
        </div>

        <div class="bg-white rounded-lg hover:shadow-md duration-200 p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Recently Uploaded TORs</h3>
            <table class="min-w-full border border-slate-200 text-sm text-gray-700">
                <thead class="bg-gray-100 text-gray-800">
                    <tr>
                        <th class="border border-slate-200 px-4 py-2 text-left">ID</th>
                        <th class="border border-slate-200 px-4 py-2 text-left">File</th>
                        <th class="border border-slate-200 px-4 py-2 text-left">Uploaded At</th>
                        <th class="border border-slate-200 px-4 py-2 text-left">Uploaded By</th>
                        <th class="border border-slate-200 px-4 py-2 text-left">Status</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="tor in (showAll ? torsData : torsData.slice(0, 3))" :key="tor.id"
                        class="hover:bg-gray-50">
                        <td class="border border-slate-200 px-4 py-2">{{ tor.id }}</td>
                        <td class="border border-slate-200 px-4 py-2 text-blue-600 cursor-pointer hover:underline"
                            @click="openImage(tor.file_path)">
                            Show File
                        </td>
                        <td class="border border-slate-200 px-4 py-2">{{ new Date(tor.created_at).toLocaleString() }}
                        </td>
                        <td class="border border-slate-200 px-4 py-2">{{ tor.user?.first_name }}, {{ tor.user?.last_name
                            }}</td>
                        <td class="border border-slate-200 px-4 py-2">
                            <span :class="{
                                'px-2 py-1 rounded-full text-white text-xs font-semibold': true,
                                'bg-gray-400': tor.status === 'submitted',
                                'bg-blue-500': tor.status === 'processing',
                                'bg-yellow-400 text-gray-800': tor.status === 'advising',
                                'bg-green-500': tor.status === 'done',
                                'bg-red-500': tor.status === 'rejected'
                            }">
                                {{ tor.status }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Show all / show less button -->
            <div class="text-center p-4">
                <button v-if="torsData.length > 3" @click="showAll = !showAll"
                    class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    {{ showAll ? 'Show Less' : 'Show All' }}
                </button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { fetchAllTors, fetchMyTors } from '@/services/apiService'
import FileUpload from '@/components/FileUpload.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore();
const torsData = ref([])
const showAll = ref(false)

// Automatically get base API URL (admin address)
const ADMIN_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

// Fetch uploaded TORs
const getUploadedTor = async () => {
    try {
        let response;
        if (auth.user.role === 'admin') {
            response = await fetchAllTors();
        } else {
            response = await fetchMyTors();
        }
        torsData.value = response;
    } catch (error) {
        console.error('Error fetching uploaded TOR:', error)
    }
}

// Open file in new tab
const openImage = (filePath) => {
    const fullUrl = filePath;
    window.open(fullUrl, '_blank')
}

onMounted(() => {
    getUploadedTor()
})
</script>
