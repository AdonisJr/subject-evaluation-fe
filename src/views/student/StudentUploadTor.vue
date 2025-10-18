<template>
    <div>
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">
            Upload Transcript of Records
        </h2>

        <!-- Curriculum Selector -->
        <div class="relative mb-4 w-full sm:w-1/3">
            <div class="border border-gray-300 rounded-lg px-3 py-2 bg-white cursor-pointer"
                @click="toggleCurriculumDropdown">
                {{ selectedCurriculum?.course?.name ?? 'Select Curriculum' }}
            </div>

            <!-- Dropdown -->
            <div v-if="showCurriculumDropdown"
                class="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <input v-model="curriculumSearch" type="text" placeholder="Search curriculum..."
                    class="w-full px-3 py-2 border-b border-gray-200 text-sm focus:outline-none" />

                <ul class="max-h-56 overflow-y-auto">
                    <li v-for="curriculum in filteredCurriculums" :key="curriculum.id"
                        @click="selectCurriculum(curriculum)" class="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm">
                        {{ curriculum.course?.name }} ({{ curriculum.year_start }} - {{ curriculum.year_end }})
                    </li>
                    <li v-if="!filteredCurriculums.length" class="px-3 py-2 text-gray-400 text-sm">No results found.
                    </li>
                </ul>
            </div>
        </div>

        <!-- File Upload -->
        <div class="bg-white p-6 rounded-lg hover:shadow-md duration-200 mb-6">
            <FileUpload @file-selected="handleFileUpload" />
        </div>

        <!-- Results / Loader -->
        <div class="bg-white rounded-lg shadow px-6 pb-6">
            <div v-if="isProcessing" class="mt-4">
                <OcrLoader :show="isProcessing" />
            </div>

            <div class="flex flex-col h-[300px] overflow-y-auto" v-else>
                <div v-if="extractedSubjects.length">
                    <table class="min-w-full text-xs text-gray-700 border border-slate-200 rounded-lg overflow-hidden">
                        <thead class="bg-white sticky top-0">
                            <tr>
                                <th class="px-4 py-2 text-left">Code</th>
                                <th class="px-4 py-2 text-left">Subject Title</th>
                                <th class="px-4 py-2 text-left">Units</th>
                                <th class="px-4 py-2 text-left">Grade</th>
                                <th class="px-4 py-2 text-left">Percent Grade</th>
                                <th class="px-4 py-2 text-left">Credited</th>
                                <th class="px-4 py-2 text-left">Credited To</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="subject in extractedSubjects" :key="subject.id"
                                class="odd:bg-gray-50 even:bg-white hover:bg-blue-50 transition">
                                <td class="px-4 py-2">{{ subject.code }}</td>
                                <td class="px-4 py-2">{{ subject.title }}</td>
                                <td class="px-4 py-2">{{ subject.credits }}</td>
                                <td class="px-4 py-2">{{ subject.grade }}</td>
                                <td class="px-4 py-2">{{ subject.percent_grade }}</td>
                                <td class="px-4 py-2">
                                    <input type="checkbox" v-model="subject.is_credited" />
                                </td>
                                <td class="px-4 py-2">
                                    <p v-if="!subject.is_credited && !subject.credited_id"></p>
                                    <select v-model="subject.credited_id" v-else
                                        class="border border-gray-300 rounded px-2 py-1 text-xs w-full"
                                        :disabled="!subject.is_credited">
                                        <option value="" disabled>Select subject</option>
                                        <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.code }}</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Empty State -->
                <div v-else class="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p class="text-center">No subjects found.</p>
                </div>
            </div>

            <!-- Advising Section -->
            <div v-if="advising.first_sem?.length || advising.second_sem?.length"
                class="bg-blue-50 border border-blue-200 rounded-lg mt-6 p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M12 20h9" />
                    </svg>
                    Advising Recommendation
                </h3>

                <!-- 1st Semester -->
                <div v-if="advising.first_sem?.length" class="mb-6">
                    <h4 class="text-md font-semibold text-blue-700 mb-2">First Semester</h4>
                    <table
                        class="min-w-full text-xs text-gray-700 border border-slate-200 rounded-lg overflow-hidden mb-4">
                        <thead class="bg-blue-100">
                            <tr>
                                <th class="px-4 py-2 text-left">Code</th>
                                <th class="px-4 py-2 text-left">Subject Name</th>
                                <th class="px-4 py-2 text-left">Units</th>
                                <th class="px-4 py-2 text-left">Semester</th>
                                <th class="px-4 py-2 text-left">Year Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="subject in advising.first_sem" :key="subject.id"
                                class="odd:bg-white even:bg-blue-50">
                                <td class="px-4 py-2">{{ subject.code }}</td>
                                <td class="px-4 py-2">{{ subject.title }}</td>
                                <td class="px-4 py-2">{{ subject.units }}</td>
                                <td class="px-4 py-2">{{ subject.semester }}</td>
                                <td class="px-4 py-2">{{ subject.year_level }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p class="text-sm text-gray-500">Total units (1st sem):
                        <span class="font-semibold text-blue-700">
                            {{advising.first_sem.reduce((sum, s) => sum + (parseFloat(s.units) || 0), 0)}}
                        </span>
                    </p>
                </div>

                <!-- 2nd Semester -->
                <div v-if="advising.second_sem?.length">
                    <h4 class="text-md font-semibold text-blue-700 mb-2">Second Semester</h4>
                    <table
                        class="min-w-full text-xs text-gray-700 border border-slate-200 rounded-lg overflow-hidden mb-4">
                        <thead class="bg-blue-100">
                            <tr>
                                <th class="px-4 py-2 text-left">Code</th>
                                <th class="px-4 py-2 text-left">Subject Name</th>
                                <th class="px-4 py-2 text-left">Units</th>
                                <th class="px-4 py-2 text-left">Semester</th>
                                <th class="px-4 py-2 text-left">Year Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="subject in advising.second_sem" :key="subject.id"
                                class="odd:bg-white even:bg-blue-50">
                                <td class="px-4 py-2">{{ subject.code }}</td>
                                <td class="px-4 py-2">{{ subject.title }}</td>
                                <td class="px-4 py-2">{{ subject.units }}</td>
                                <td class="px-4 py-2">{{ subject.semester }}</td>
                                <td class="px-4 py-2">{{ subject.year_level }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p class="text-sm text-gray-500">Total units (2nd sem):
                        <span class="font-semibold text-blue-700">
                            {{advising.second_sem.reduce((sum, s) => sum + (parseFloat(s.units) || 0), 0)}}
                        </span>
                    </p>
                </div>

                <div v-if="advising.total_units" class="mt-4 text-right text-sm text-gray-600">
                    <p>Total Suggested Load:
                        <span class="font-semibold text-gray-800">{{ advising.total_units }}</span> units
                    </p>
                </div>
            </div>

            <div class="flex flex-col items-end justify-center py-2 text-gray-700">
                <p>Total Credited Units: <span class="font-bold">{{ totalCreditedUnits }}</span></p>
                <button
                    class="my-3 p-2 bg-blue-500 hover:bg-blue-600 w-50 cursor-pointer rounded-md duration-200 text-white"
                    @click="submitCreditedSubjects">
                    SUBMIT
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { uploadTor, fetchAllTors, fetchMyTors, saveAdvising, fetchAllCurriculums } from '@/services/apiService'
import { useToast } from "vue-toastification"
import { useAuthStore } from '@/stores/auth'

import OcrLoader from '@/components/OcrLoader.vue'
import FileUpload from '@/components/FileUpload.vue'

const auth = useAuthStore()
const toast = useToast()

const torsData = ref([])
const extractedData = ref({})
const isProcessing = ref(false)

const curriculums = ref([])
const showCurriculumDropdown = ref(false)
const selectedCurriculum = ref(null)
const curriculumSearch = ref("")

const extractedSubjects = computed(() => extractedData.value?.analysis?.ocr_records || [])
const totalCreditedUnits = computed(() =>
    extractedSubjects.value
        .filter(s => s.is_credited)
        .reduce((sum, s) => sum + (parseFloat(s.credits) || 0), 0)
)
const advising = computed(() => extractedData.value?.analysis?.advising || {})

// Computed: Filter curriculums
const filteredCurriculums = computed(() => {
    return curriculums.value.filter(c =>
        c.course?.name?.toLowerCase().includes(curriculumSearch.value.toLowerCase())
    )
})


// Fetch uploaded TORs
async function getUploadedTor() {
    try {
        let response
        if (auth.user.role === 'admin') {
            response = await fetchAllTors()
        } else {
            response = await fetchMyTors()
        }
        torsData.value = response
    } catch (error) {
        console.error('Error fetching uploaded TOR:', error)
    }
}

// Dropdown controls
const toggleCurriculumDropdown = () => (showCurriculumDropdown.value = !showCurriculumDropdown.value)
const selectCurriculum = async (curriculum) => {
    selectedCurriculum.value = curriculum
    showCurriculumDropdown.value = false
}



// Fetch curriculums
async function getcurriculums() {
    try {
        const res = await fetchAllCurriculums()
        curriculums.value = res
    } catch (error) {
        toast.error("Failed to fetch curriculums")
    }
}

onMounted(() => {
    getUploadedTor()
    getcurriculums()
})

// Handle file upload
async function handleFileUpload(selectedFile) {
    if (!selectedFile) return toast.warning("No file selected.")
    if (!selectedCurriculum.value) return toast.warning("Please select a curriculum first.")

    const confirmProceed = window.confirm(
        `You selected curriculum ID ${selectedCurriculum.value.course.name}. Proceed with this curriculum?`
    )
    if (!confirmProceed) return

    try {
        isProcessing.value = true
        toast.info("Uploading and analyzing your file...")

        const res = await uploadTor(selectedFile, selectedCurriculum.value.id)
        toast.success(res.message || "File uploaded successfully!")
        extractedData.value = res || {}
        getUploadedTor()
    } catch (error) {
        toast.error(error.response?.data?.message || "Upload failed.")
    } finally {
        isProcessing.value = false
    }
}

// Submit credited subjects
async function submitCreditedSubjects() {
    if (!extractedData.value?.analysis?.id && !extractedData.value?.analysis?.tor_id) {
        toast.warning("No TOR data found.")
        return
    }

    const payload = {
        tor_id: extractedData.value?.analysis?.id || extractedData.value?.analysis?.tor_id,
        curriculum_id: selectedCurriculum.value.id,
        advising: advising.value,
        ocr_records: extractedSubjects.value.map(s => ({
            code: s.code,
            title: s.title,
            credits: s.credits,
            grade: s.grade,
            percent_grade: s.percent_grade,
            is_credited: s.is_credited || false,
            credited_id: s.credited_id || null,
        }))
    }

    try {
        toast.info("Saving advising and OCR records...")
        const res = await saveAdvising(payload)
        toast.success(res.message || "Advising saved successfully!")
        await getUploadedTor()
        extractedData.value = {};
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to save advising.")
    }
}
</script>
