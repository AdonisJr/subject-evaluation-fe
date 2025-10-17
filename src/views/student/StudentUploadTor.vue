<template>
    <div>
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">
            Upload Transcript of Records
        </h2>

        <div class="bg-white p-6 rounded-lg hover:shadow-md duration-200 mb-6">
            <FileUpload @file-selected="handleFileUpload" />
        </div>


        <!-- results of upload -->

        <div class="bg-white rounded-lg shadow px-6 pb-6">
            <!-- Loader -->
            <div v-if="isProcessing" class="mt-4">
                <!-- <TableLoader :rows="5" /> -->
                <OcrLoader :show="isProcessing" />
            </div>


            <div class="flex flex-col h-[300px] overflow-y-auto" v-else>
                <div v-if="extractedSubjects.length">
                    <table class="min-w-full text-xs text-gray-700 border border-slate-200 rounded-lg overflow-hidden">
                        <thead class="bg-white sticky top-0">
                            <tr>
                                <th class="px-4 py-2 text-left">Code</th>
                                <th class="px-4 py-2 text-left">Subject Name</th>
                                <th class="px-4 py-2 text-left">Units</th>
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
                                <td class="px-4 py-2">
                                    <!-- {{ subject.is_credited }} -->
                                    <input type="checkbox" v-model="subject.is_credited" />
                                </td>
                                <!-- <td class="px-4 py-2">{{ subject.credited_code }}</td> -->
                                <td class="px-4 py-2">
                                    <!-- <input type="checkbox" v-model="subject.is_credited" class="mr-2" /> -->
                                    <p v-if="!subject.is_credited && !subject.credited_id"></p>
                                    <select v-model="subject.credited_id" v-else
                                        class="border border-gray-300 rounded px-2 py-1 text-xs w-full"
                                        :disabled="!subject.is_credited">
                                        <option value="" disabled>Select subject</option>
                                        <option v-for="s in subjects" :key="s.id" :value="s.id">
                                            {{ s.code }}
                                        </option>
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
            <!-- Subjects Table -->

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
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="subject in advising.first_sem" :key="subject.id"
                                class="odd:bg-white even:bg-blue-50">
                                <td class="px-4 py-2">{{ subject.code }}</td>
                                <td class="px-4 py-2">{{ subject.title }}</td>
                                <td class="px-4 py-2">{{ subject.units }}</td>
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
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="subject in advising.second_sem" :key="subject.id"
                                class="odd:bg-white even:bg-blue-50">
                                <td class="px-4 py-2">{{ subject.code }}</td>
                                <td class="px-4 py-2">{{ subject.title }}</td>
                                <td class="px-4 py-2">{{ subject.units }}</td>
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
import { uploadTor, fetchAllTors, fetchMyTors } from '@/services/apiService'
import { useToast } from "vue-toastification"
import { useAuthStore } from '@/stores/auth'

import OcrLoader from '@/components/OcrLoader.vue'
import FileUpload from '@/components/FileUpload.vue'
import TableLoader from '@/components/TableLoader.vue'

const auth = useAuthStore()
const toast = useToast()

const torsData = ref([])
const extractedData = ref({})
const isProcessing = ref(false)

const extractedSubjects = computed(() => extractedData.value?.analysis?.ocr_records || [])
const totalCreditedUnits = computed(() =>
    extractedSubjects.value
        .filter(s => s.is_credited)
        .reduce((sum, s) => sum + (parseFloat(s.credits) || 0), 0)
)

const advising = computed(() => extractedData.value?.analysis?.advising || {})

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

onMounted(getUploadedTor)

// 👇 Triggered when file is selected from FileUpload.vue
async function handleFileUpload(selectedFile) {
    if (!selectedFile) return toast.warning("No file selected.")

    try {
        isProcessing.value = true
        toast.info("Uploading and analyzing your file...")

        const res = await uploadTor(selectedFile, 1)
        toast.success(res.message || "File uploaded successfully!")
        console.log({ res })
        extractedData.value = res || {}
        getUploadedTor()
    } catch (error) {
        toast.error(error.response?.data?.message || "Upload failed.")
    } finally {
        isProcessing.value = false
    }
}

async function submitCreditedSubjects() {
    console.log("Submitting:", extractedSubjects.value)
    toast.success("Credited subjects submitted.")
}


</script>
