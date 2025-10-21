<template>
    <div class="p-6 bg-white min-h-screen text-xs">
        <!-- Header -->
        <div class="mb-6 flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-semibold text-gray-800">Subjects Management</h1>
                <p class="text-sm text-gray-500">Manage all curriculum subjects.</p>
            </div>
            <button @click="openModal()"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                + Add Subject
            </button>
        </div>

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

        <!-- Search & Filters -->
        <div class="flex flex-wrap items-center gap-3 mb-6">
            <input v-model="search" type="text" placeholder="Search by subject code or title..."
                class="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select v-model="filterSemester"
                class="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Semesters</option>
                <option value="1st">1st Semester</option>
                <option value="2st">2nd Semester</option>
            </select>
            <select v-model="filterYear"
                class="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Years</option>
                <option v-for="year in yearLevels" :key="year" :value="year">
                    Year: {{ year }}
                </option>
            </select>
        </div>

        <!-- Subjects Table -->
        <div class="bg-white rounded-2xl shadow-sm p-4 overflow-x-auto">
            <div v-if="isLoading" class="mt-4">
                <TableLoader :rows="6" />
            </div>

            <div v-else>
                <table class="w-full text-sm text-left text-gray-600 min-h-[400px]">
                    <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
                        <tr>
                            <th class="px-4 py-3">ID</th>
                            <th class="px-4 py-3">Code</th>
                            <th class="px-4 py-3">Title</th>
                            <th class="px-4 py-3">Units</th>
                            <th class="px-4 py-3">Year</th>
                            <th class="px-4 py-3">Semester</th>
                            <th class="px-4 py-3">Prerequisite</th>
                            <th class="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="subject in paginatedSubjects" :key="subject.id"
                            class="border-b border-slate-200 hover:bg-gray-50 transition">
                            <td class="px-4 py-3">{{ subject.id }}</td>
                            <td class="px-4 py-3">{{ subject.code }}</td>
                            <td class="px-4 py-3">{{ subject.name }}</td>
                            <td class="px-4 py-3">{{ subject.units }}</td>
                            <td class="px-4 py-3">{{ subject.year_level }}</td>
                            <td class="px-4 py-3">{{ subject.semester }}</td>
                            <!-- ✅ Prerequisite display -->
                            <td class="px-4 py-3 text-xs">
                                <div v-if="subject.prerequisites && subject.prerequisites.length"
                                    class="">
                                    <div v-for="(pre, i) in subject.prerequisites" :key="i" class="text-gray-700">
                                        <span class="font-medium">{{ pre.code }}</span> :
                                        <span>{{ pre.name }}</span>
                                    </div>
                                </div>
                                <span v-else class="text-gray-400 italic">__</span>
                            </td>
                            <td class="px-4 py-3 text-right space-x-2">
                                <button @click="openModal(subject)" class="text-blue-600 hover:underline">Edit</button>
                                <button @click="deleteSubjectById(subject.id)"
                                    class="text-red-600 hover:underline">Delete</button>
                            </td>
                        </tr>

                        <tr v-if="!filteredSubjects.length">
                            <td colspan="6" class="text-center py-6 text-gray-400">No subjects found.</td>
                        </tr>
                    </tbody>
                </table>


                <!-- Summary (Total Subjects & Units) -->
                <div class="flex justify-end mt-4 pr-2 text-sm text-gray-700 bg-slate-50 p-2">
                    <div class="flex gap-5 text-right">
                        <p>Total Subjects: <b>{{ filteredSubjects.length }}</b></p>
                        <p>Total Units: <b>{{ totalUnits }}</b></p>
                    </div>
                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="flex justify-between items-center mt-4 px-2 text-sm text-gray-700">
                    <span>
                        Showing <b>{{ startItem }}</b> - <b>{{ endItem }}</b> of <b>{{ filteredSubjects.length }}</b>
                    </span>
                    <div class="flex space-x-2">
                        <button @click="prevPage" :disabled="currentPage === 1"
                            class="px-3 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50">Prev</button>
                        <button v-for="page in totalPages" :key="page" @click="goToPage(page)" :class="[
                            'px-3 py-1 rounded-lg border',
                            currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-100 border-gray-300'
                        ]">{{ page }}</button>
                        <button @click="nextPage" :disabled="currentPage === totalPages"
                            class="px-3 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50">Next</button>
                    </div>
                </div>

            </div>
        </div>

        <!-- Modal -->
        <ModalOverlay v-if="showModal">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">
                {{ editMode ? 'Edit Subject' : 'Add Subject' }}
            </h2>

            <form @submit.prevent="saveSubject" class="space-y-4">
                <div>
                    <label class="block text-xs text-gray-600 mb-1">Code</label>
                    <input v-model="form.code" type="text" class="input" placeholder="e.g. MATH101" required />
                </div>
                <div>
                    <label class="block text-xs text-gray-600 mb-1">Title</label>
                    <input v-model="form.name" type="text" class="input" placeholder="e.g. College Algebra" required />
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs text-gray-600 mb-1">Units</label>
                        <input v-model="form.units" type="number" min="1" class="input" required />
                    </div>
                    <div>
                        <label class="block text-xs text-gray-600 mb-1">Year Level</label>
                        <select v-model="form.year_level" class="input" required>
                            <option value="">Select Year</option>
                            <option v-for="year in yearLevels" :key="year" :value="year">{{ year }}</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-xs text-gray-600 mb-1">Semester</label>
                    <select v-model="form.semester" class="input" required>
                        <option value="">Select Semester</option>
                        <option value="1st">1st Semester</option>
                        <option value="2nd">2nd Semester</option>
                    </select>
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" @click="closeModal"
                        class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        {{ editMode ? 'Update' : 'Save' }}
                    </button>
                </div>
            </form>
        </ModalOverlay>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import TableLoader from "@/components/TableLoader.vue"
import ModalOverlay from "@/components/ModalOverlay.vue"
import { fetchAllCurriculums, fetchSubjectsByCurriculum, createSubject, updateSubject, deleteSubject } from "@/services/apiService"

const curriculums = ref([])
const selectedCurriculum = ref(null)
const showCurriculumDropdown = ref(false)
const curriculumSearch = ref("")

const subjects = ref([])
const isLoading = ref(false)
const search = ref("")
const filterSemester = ref("")
const filterYear = ref("")
const yearLevels = ["1", "2", "3", "4"]

const showModal = ref(false)
const editMode = ref(false)
const form = ref({ id: null, code: "", name: "", units: "", year_level: "", semester: "" })

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Computed: Filter curriculums
const filteredCurriculums = computed(() => {
    return curriculums.value.filter(c =>
        c.course?.name?.toLowerCase().includes(curriculumSearch.value.toLowerCase())
    )
})

// Computed: Total Units
const totalUnits = computed(() =>
    filteredSubjects.value.reduce((sum, s) => sum + (parseInt(s.units) || 0), 0)
)

// Computed: Filtered subjects
const filteredSubjects = computed(() => {
    return subjects.value.filter((s) => {
        const matchesSearch =
            s.code.toLowerCase().includes(search.value.toLowerCase()) ||
            s.name.toLowerCase().includes(search.value.toLowerCase())
        const matchesSem = !filterSemester.value || s.semester == filterSemester.value
        const matchesYear = !filterYear.value || s.year_level == filterYear.value
        return matchesSearch && matchesSem && matchesYear
    })
})

const totalPages = computed(() => Math.ceil(filteredSubjects.value.length / itemsPerPage.value))
const startItem = computed(() => filteredSubjects.value.length ? (currentPage.value - 1) * itemsPerPage.value + 1 : 0)
const endItem = computed(() => Math.min(currentPage.value * itemsPerPage.value, filteredSubjects.value.length))
const paginatedSubjects = computed(() => filteredSubjects.value.slice(startItem.value - 1, endItem.value))

const goToPage = (p) => { if (p >= 1 && p <= totalPages.value) currentPage.value = p }
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }

// Dropdown controls
const toggleCurriculumDropdown = () => (showCurriculumDropdown.value = !showCurriculumDropdown.value)
const selectCurriculum = async (curriculum) => {
    selectedCurriculum.value = curriculum
    showCurriculumDropdown.value = false
    await loadSubjects(curriculum.id)
}

// CRUD
const openModal = (subject = null) => {
    if (subject) {
        editMode.value = true
        form.value = { ...subject }
    } else {
        editMode.value = false
        form.value = { id: null, code: "", name: "", units: "", year_level: "", semester: "" }
    }
    showModal.value = true
}
const closeModal = () => (showModal.value = false)

const saveSubject = async () => {
    try {
        const payload = { ...form.value, curriculum_id: selectedCurriculum.value.id }
        if (editMode.value) await updateSubject(payload.id, payload)
        else await createSubject(payload)
        await loadSubjects(selectedCurriculum.value.id)
        closeModal()
    } catch (err) {
        console.error(err)
    }
}

const deleteSubjectById = async (id) => {
    if (confirm("Are you sure you want to delete this subject?")) {
        await deleteSubject(id)
        await loadSubjects(selectedCurriculum.value.id)
    }
}

// Load data
const loadCurriculums = async () => {
    const data = await fetchAllCurriculums()
    curriculums.value = data
    if (data.length > 0) {
        selectedCurriculum.value = data[0]
        await loadSubjects(selectedCurriculum.value.id)
    }
}

const loadSubjects = async (curriculum_id) => {
    isLoading.value = true
    try {
        const data = await fetchSubjectsByCurriculum(curriculum_id)
        subjects.value = data
    } catch (error) {
        console.error(`Error fetching subjects for curriculum ID ${curriculum_id}:`, error)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => loadCurriculums())
</script>

<style scoped>
.input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: #374151;
}
</style>
