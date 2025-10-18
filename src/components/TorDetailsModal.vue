<template>
  <<div class="fixed inset-0 bg-black/60 bg-opacity-40 z-50 flex justify-center items-start overflow-auto pt-10">
    <div class="bg-white rounded-xl shadow-lg w-11/12 md:w-3/4 lg:w-2/3 relative p-6">
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
      >
        &times;
      </button>

      <!-- Header -->
      <h2 class="text-2xl font-semibold text-gray-800 mb-2">TOR Details</h2>
      <p class="text-gray-600 text-sm mb-6">
        Student:
        <span class="font-semibold">{{ tor.user?.first_name }} {{ tor.user?.last_name }}</span><br />
        Curriculum:
        <span class="font-semibold">{{ tor.curriculum?.course?.name || 'N/A' }}</span>
      </p>

      <!-- Curriculum Subjects -->
      <div class="bg-white rounded-lg shadow px-6 pb-6 mb-6">
        <h3 class="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
          Curriculum Subjects
        </h3>
        <div class="h-[200px] overflow-y-auto border rounded">
          <table class="min-w-full text-xs text-gray-700 border-collapse">
            <thead class="bg-gray-100 sticky top-0">
              <tr>
                <th class="px-4 py-2 text-left">Code</th>
                <th class="px-4 py-2 text-left">Title</th>
                <th class="px-4 py-2 text-left">Units</th>
                <th class="px-4 py-2 text-left">Credited</th>
                <th class="px-4 py-2 text-left">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="subject in creditedCurriculumSubjects"
                :key="subject.id"
                class="odd:bg-white even:bg-gray-50 hover:bg-blue-50"
              >
                <td class="px-4 py-2">{{ subject.code }}</td>
                <td class="px-4 py-2">{{ subject.name }}</td>
                <td class="px-4 py-2">{{ subject.units }}</td>
                <td class="px-4 py-2">
                  <span
                    v-if="subject.credited"
                    class="text-green-600 font-semibold"
                  >Yes</span>
                  <span
                    v-else
                    class="text-gray-400"
                  >No</span>
                </td>
                <td class="px-4 py-2">
                  <span v-if="subject.grade">{{ subject.grade }}</span>
                  <span v-else class="text-gray-400">—</span>
                </td>
              </tr>
              <tr v-if="!curriculumSubjects.length">
                <td colspan="5" class="px-4 py-2 text-center text-gray-400">
                  No curriculum subjects found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TOR Grades -->
      <div class="bg-white rounded-lg shadow px-6 pb-6 mb-6">
        <h3 class="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
          Extracted Subjects / Grades
        </h3>
        <div class="h-[250px] overflow-y-auto border rounded">
          <table class="min-w-full text-xs text-gray-700 border-collapse">
            <thead class="bg-gray-100 sticky top-0">
              <tr>
                <th class="px-4 py-2 text-left">Code</th>
                <th class="px-4 py-2 text-left">Title</th>
                <th class="px-4 py-2 text-left">Units</th>
                <th class="px-4 py-2 text-left">Grade</th>
                <th class="px-4 py-2 text-left">Credited</th>
                <th class="px-4 py-2 text-left">Credited To</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="subject in torGrades"
                :key="subject.id"
                class="odd:bg-white even:bg-gray-50 hover:bg-blue-50"
              >
                <td class="px-4 py-2">{{ subject.extracted_code }}</td>
                <td class="px-4 py-2">{{ subject.title }}</td>
                <td class="px-4 py-2">{{ subject.credits }}</td>
                <td class="px-4 py-2">{{ subject.grade || '—' }}</td>
                <td class="px-4 py-2">
                  <input type="checkbox" v-model="subject.is_credited" />
                </td>
                <td class="px-4 py-2">
                  <select
                    v-model="subject.credited_id"
                    :disabled="!subject.is_credited"
                    class="border border-gray-300 rounded px-2 py-1 text-xs w-full"
                  >
                    <option value="" disabled>Select subject</option>
                    <option
                      v-for="s in curriculumSubjects"
                      :key="s.id"
                      :value="s.id"
                    >
                      {{ s.code }} - {{ s.name }}
                    </option>
                  </select>
                </td>
              </tr>
              <tr v-if="!torGrades.length">
                <td colspan="6" class="px-4 py-2 text-center text-gray-400">
                  No extracted subjects found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Advising -->
      <div class="bg-white rounded-lg shadow px-6 pb-6">
        <h3 class="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
          Advising Records
        </h3>
        <div class="h-[200px] overflow-y-auto border rounded">
          <table class="min-w-full text-xs text-gray-700 border-collapse">
            <thead class="bg-gray-100 sticky top-0">
              <tr>
                <th class="px-4 py-2">Subject Code</th>
                <th class="px-4 py-2">Title</th>
                <th class="px-4 py-2">Semester</th>
                <th class="px-4 py-2">Year Level</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="adv in advising"
                :key="adv.id"
                class="odd:bg-white even:bg-gray-50 hover:bg-blue-50"
              >
                <td class="px-4 py-2">{{ adv.subject_code }}</td>
                <td class="px-4 py-2">{{ adv.subject_title }}</td>
                <td class="px-4 py-2">{{ adv.semester }}</td>
                <td class="px-4 py-2">{{ adv.year_level }}</td>
              </tr>
              <tr v-if="!advising.length">
                <td colspan="4" class="px-4 py-2 text-center text-gray-400">
                  No advising records found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="flex justify-end gap-3 mt-6">
        <button @click="$emit('close')" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Close
        </button>
        <button @click="approveTor" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Approve
        </button>
        <button @click="rejectTor" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Reject
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { fetchAllSubjects } from '@/services/apiService'
import { ref, watch, computed, onMounted } from 'vue'

const props = defineProps({
  tor: Object,
  show: Boolean
})

const emit = defineEmits(['close', 'approve', 'reject'])

const isLoading = ref(false)
const torGrades = ref([])
const advising = ref([])
const subjects = ref([])

const getSubjects = async () => {
  isLoading.value = true
  try {
    const allSubjects = await fetchAllSubjects()
    subjects.value = allSubjects.filter(s => s.curriculum_id === props.tor.curriculum_id)
  } catch (error) {
    console.error('Error fetching subjects:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  getSubjects()
  torGrades.value = props.tor.tor_grades || []
  advising.value = props.tor.advising || []
})

// Curriculum subjects from API
const curriculumSubjects = computed(() => subjects.value || [])

// Merge credited info from torGrades into curriculum subjects
const creditedCurriculumSubjects = computed(() => {
  return curriculumSubjects.value.map(sub => {
    const creditedInfo = torGrades.value.find(
      t => t.is_credited && Number(t.credited_id) === Number(sub.id)
    )
    return {
      ...sub,
      credited: !!creditedInfo,
      grade: creditedInfo?.grade || null
    }
  })
})

// Emit actions
const approveTor = () => emit('approve', props.tor)
const rejectTor = () => emit('reject', props.tor)
</script>
