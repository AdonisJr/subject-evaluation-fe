<template>
    <div>
        <h2 class="text-2xl font-semibold text-gray-800 my-4">
            Upload Transcript of Records
        </h2>

        <!-- Curriculum Filter -->
        <div class="relative w-full mb-4">
            <div class="border rounded-lg p-2 flex items-center justify-between bg-white cursor-pointer"
                @click="showCurriculumDropdown = !showCurriculumDropdown">
                <span class="text-gray-700 text-sm">
                    {{ selectedCurriculum
                        ? `${selectedCurriculum.course?.name} (${selectedCurriculum.year_start} -
                    ${selectedCurriculum.year_end})`
                        : 'Select Curriculum'
                    }}
                </span>
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            <!-- Dropdown -->
            <div v-if="showCurriculumDropdown"
                class="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <input v-model="curriculumSearch" type="text" placeholder="Search curriculum..."
                    class="w-full px-3 py-2 border-b border-gray-200 text-xs focus:outline-none" />
                <ul class="max-h-56 overflow-y-auto">
                    <li v-for="curriculum in filteredCurriculums" :key="curriculum.id"
                        @click="selectCurriculum(curriculum)" class="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm">
                        {{ curriculum.course?.name }} ({{ curriculum.year_start }} - {{ curriculum.year_end }})
                    </li>
                    <li v-if="!filteredCurriculums.length" class="px-3 py-2 text-gray-400 text-sm">
                        No results found.
                    </li>
                </ul>
            </div>
        </div>

        <!-- 🔍 TOR Search -->
        <div class="flex flex-wrap items-center gap-2 mb-4">
            <input v-model="searchQuery" type="text" placeholder="Search by TOR ID, Student ID, or Student Name..."
                class="w-full md:w-1/2 px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-400 focus:outline-none" />
        </div>

        <!-- Table -->
        <div class="bg-white rounded-lg hover:shadow-md duration-200 p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Uploaded TORs</h3>

            <table class="min-w-full border border-slate-200 text-xs text-gray-700">
                <thead class="bg-gray-100 text-gray-800">
                    <tr>
                        <th class="border border-slate-200 px-4 py-2 text-left">ID</th>
                        <th class="border border-slate-200 px-4 py-2 text-left">File</th>
                        <th class="border border-slate-200 px-4 py-2 text-left">Curriculum</th>
                        <th class="border border-slate-200 px-4 py-2 text-left">Student ID</th>
                        <th class="border border-slate-200 px-4 py-2 text-left">Uploaded By</th>
                        <th class="border border-slate-200 px-4 py-2 text-left">Subjects</th>
                        <th class="border border-slate-200 px-4 py-2 text-left">Status</th>
                        <th class="border border-slate-200 px-4 py-2 text-left">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="tor in paginatedTors" :key="tor.id" class="hover:bg-gray-50">
                        <td class="border border-slate-200 px-4 py-2">{{ tor.id }}</td>
                        <td class="border border-slate-200 px-4 py-2 text-blue-600 cursor-pointer hover:underline"
                            @click="openImage(tor.file_path)">
                            {{ tor.file_path ? 'Show File' : 'Invalid' }}
                        </td>
                        <td class="border border-slate-200 px-4 py-2">
                            {{ tor.curriculum?.course?.name || 'N/A' }}
                        </td>
                        <td class="border border-slate-200 px-4 py-2">
                            {{ tor.user.student_id ?? '__' }}
                        </td>
                        <td class="border border-slate-200 px-4 py-2">
                            {{ tor.user?.first_name }} {{ tor.user?.last_name }}
                        </td>

                        <td class="border border-slate-200 px-4 py-2">
                            {{ getCreditedSummary(tor.tor_grades) }}
                        </td>
                        <td class="border border-slate-200 px-4 py-2">
                            <span :class="{
                                'px-2 py-1 rounded-full text-white text-xs font-semibold': true,
                                'bg-gray-400': tor.status === 'submitted',
                                'bg-blue-500': tor.status === 'processing',
                                'bg-yellow-400 text-gray-800': tor.status === 'advising',
                                'bg-green-500': tor.status === 'done' || tor.status === 'approved',
                                'bg-red-500': tor.status === 'rejected' || tor.status === 'failed'
                            }">
                                {{ tor.status }}
                            </span>
                        </td>
                        <td class="border border-slate-200 px-4 py-2 space-x-2">
                            <button @click="openDetails(tor)"
                                class="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
                                View Details
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination -->
            <div class="flex justify-end items-center mt-4 space-x-2">
                <button :disabled="currentPage === 1" @click="currentPage--"
                    class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 disabled:opacity-50">
                    Prev
                </button>
                <span class="px-2 text-xs text-gray-600">
                    Page {{ currentPage }} of {{ totalPages }}
                </span>
                <button :disabled="currentPage === totalPages" @click="currentPage++"
                    class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 disabled:opacity-50">
                    Next
                </button>
            </div>

            <!-- Modal -->
            <TorDetailsModal v-if="showModal" :tor="selectedTor" @close="showModal = false"
                @refresh="getUploadedTor()" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { fetchAllTors, fetchMyTors, fetchAllCurriculums, approveTor } from '@/services/apiService'
import { useAuthStore } from '@/stores/auth'
import TorDetailsModal from '@/components/TorDetailsModal.vue'
import { useRoute } from 'vue-router'

const route = useRoute();
const showModal = ref(false)
const selectedTor = ref(null)
const subjects = ref([])
const auth = useAuthStore()
const torsData = ref([])
const curriculums = ref([])
const selectedCurriculum = ref(null)
const curriculumSearch = ref('')
const showCurriculumDropdown = ref(false)
const searchQuery = ref(route.query.tor || '')
const currentPage = ref(1)
const perPage = 5

const getCreditedSummary = (grades) => {
    if (!grades || !grades.length) return '0/0 subjects credited'
    const creditedCount = grades.filter(g => g.is_credited).length
    return `${creditedCount}/${grades.length} subjects credited`
}

// 🔍 Filtered by curriculum + search
const filteredTors = computed(() => {
    let result = torsData.value

    if (selectedCurriculum.value) {
        result = result.filter(t => t.curriculum_id === selectedCurriculum.value.id)
    }

    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(t =>
            t.id.toString().includes(query) ||
            `${t.user?.first_name} ${t.user?.last_name}`.toLowerCase().includes(query)
        )
    }

    return result
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredTors.value.length / perPage))
const paginatedTors = computed(() => {
    const start = (currentPage.value - 1) * perPage
    return filteredTors.value.slice(start, start + perPage)
})

const openDetails = (tor) => {
    selectedTor.value = tor
    showModal.value = true
}

// Fetch Data
const getUploadedTor = async () => {
    try {
        const response = auth.user.role === 'admin' ? await fetchAllTors() : await fetchMyTors()
        torsData.value = response
    } catch (error) {
        console.error('Error fetching uploaded TOR:', error)
    }
}

const getCurriculums = async () => {
    try {
        const response = await fetchAllCurriculums()
        curriculums.value = response
    } catch (error) {
        console.error('Error fetching curriculums:', error)
    }
}

const selectCurriculum = (curriculum) => {
    selectedCurriculum.value = curriculum
    showCurriculumDropdown.value = false
    curriculumSearch.value = ''
}

const filteredCurriculums = computed(() => {
    if (!curriculumSearch.value) return curriculums.value
    const search = curriculumSearch.value.toLowerCase()
    return curriculums.value.filter(c =>
        c.course?.name.toLowerCase().includes(search)
    )
})

// Open File
const openImage = (filePath) => {
    if (!filePath) return
    window.open(filePath, '_blank')
}

// Close dropdown when clicking outside
const handleClickOutside = (e) => {
    if (!e.target.closest('.relative')) showCurriculumDropdown.value = false
}

watch(() => route.query, (newVal) => {
    if (newVal.tor) {
        searchQuery.value = newVal.tor
    }
})

onMounted(() => {
    getUploadedTor()
    getCurriculums()
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>
