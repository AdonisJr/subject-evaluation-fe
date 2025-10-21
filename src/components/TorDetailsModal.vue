<template>
  <div class="fixed inset-0 bg-black/20 z-50 flex justify-center items-start overflow-hidden">
    <div class="bg-white flex gap-2 w-screen overflow-hidden">

      <div class="bg-white shadow-lg w-11/12 md:w-3/4 lg:w-6/6 relative h-screen overflow-y-auto">
        <!-- Close Button -->
        <div class="sticky top-0 z-40 bg-white p-6 shadow-lg"> 
          <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">
            &times;
          </button>

          <!-- Header -->
          <h2 class="text-2xl font-semibold text-gray-800 mb-2">TOR Details</h2>
          <p class="text-gray-600 text-sm mb-6">
            Student:
            <span class="font-semibold">{{ tor.user?.first_name }} {{ tor.user?.last_name }}</span><br />
            Category:
            <span class="font-semibold">{{ tor.user?.other_info?.category }}</span><br />
            Status:
            <span class="font-semibold">{{ tor.user?.other_info?.status || 'pending' }}</span><br />
            Curriculum:
            <span class="font-semibold">{{ tor.curriculum?.course?.name || 'N/A' }}</span>
          </p>
        </div>


        <div class="mb-5 p-3">
          <CurriculumSubjects :subjects="creditedCurriculumSubjects" />
        </div>

        <div class="mb-5 p-3">
          <ExtractedSubjects :torGrades="tor.tor_grades" v-model:torGrades="torGrades"
            :curriculumSubjects="curriculumSubjects" />
        </div>

        <!-- Advising -->
        <div class="mb-5 p-3">
          <AdvisingSubjects :advising="advising" v-model:selectedSemester="selectedSemester" />
        </div>

        <!-- Footer Buttons -->
        <div class="flex justify-end gap-3 p-3 pb-10">
          <button @click="$emit('close')" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Close
          </button>

          <button @click="submitApproveTor" :disabled="isActionDisabled" :class="[
            'px-4 py-2 rounded text-white transition',
            isActionDisabled
              ? 'bg-green-400 cursor-not-allowed opacity-70'
              : 'bg-green-600 hover:bg-green-700'
          ]">
            Approve
          </button>

          <button @click="submitRejectTor" :disabled="isActionDisabled" :class="[
            'px-4 py-2 rounded text-white transition',
            isActionDisabled
              ? 'bg-red-400 cursor-not-allowed opacity-70'
              : 'bg-red-600 hover:bg-red-700'
          ]">
            Reject
          </button>
        </div>
        <!-- 
      <div>
        <RemainingYears :remainingProgress="remainingProgress" />
      </div> -->

      </div>
      <div class="h-screen w-5/12 p-5 flex items-center justify-center">
        <ImageDrag :src="tor.file_path" />
      </div>

    </div>
  </div>
</template>

<script setup>
import { fetchAllSubjects, fetchSubjectsByCurriculum, approveTor, computeRemainingYears, rejectTor } from '@/services/apiService'
import { ref, watch, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import RemainingYears from './RemainingYears.vue'

import CurriculumSubjects from './CurriculumSubjects.vue'
import ExtractedSubjects from './ExtractedSubjects.vue'
import AdvisingSubjects from './AdvisingSubjects.vue'
import ImageDrag from './ImageDrag.vue'

const props = defineProps({
  tor: Object,
  show: Boolean
})

const emit = defineEmits(['close', 'reject', 'refresh'])

const toast = useToast()
const isLoading = ref(false)
const torGrades = ref([])
const advising = ref([])
const subjects = ref([])
const selectedSemester = ref('')
const remainingYearsData = ref(null)
console.log('TOR DETAILS PROP:', props.tor)
const isActionDisabled = computed(() => props.tor?.status !== 'submitted')

const getSubjects = async () => {
  isLoading.value = true
  try {
    const allSubjects = await fetchSubjectsByCurriculum(props.tor.curriculum.id)
    // subjects.value = allSubjects.filter(s => s.curriculum_id === props.tor.curriculum_id)
    subjects.value = allSubjects;
  } catch (error) {
    console.error('Error fetching subjects:', error)
  } finally {
    isLoading.value = false
  }
}

const getRemainingYears = async () => {
  isLoading.value = true
  try {
    const res = await computeRemainingYears(props.tor.id, props.tor.curriculum.id)
    // subjects.value = res.filter(s => s.curriculum_id === props.tor.curriculum_id)
    remainingYearsData.value = res.remaining_progress;
    // subjects.value = res;
  } catch (error) {
    console.error('Error fetching remaining years:', error)
  } finally {
    isLoading.value = false
  }
}

// 🧮 Remaining Progress Computation
const remainingProgress = computed(() => {
  const progress = remainingYearsData.value
  if (!progress) return null

  const total = Number(progress.total_units || 0)
  const credited = Number(progress.credited_units || 0)
  const percent = total > 0 ? ((credited / total) * 100).toFixed(1) : 0
  console.log({
    percent,
    total_units: progress.total_units,
    completed_units: progress.credited_units,
    remaining_units: progress.remaining_units,
    remaining_semesters: progress.estimated_semesters_left,
    remaining_years: progress.estimated_years_left
  })
  return {
    percent,
    total_units: progress.total_units,
    completed_units: progress.credited_units,
    remaining_units: progress.remaining_units,
    remaining_semesters: progress.estimated_semesters_left,
    remaining_years: progress.estimated_years_left
  }
})

onMounted(() => {
  // getRemainingYears()
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
      grade: creditedInfo?.grade || null,
      extracted_code: creditedInfo?.extracted_code || null,
      extracted_title: creditedInfo?.title || null,
    }
  })
})

// Emit actions props.tor)

const submitApproveTor = async () => {
  if (!selectedSemester.value) {
    toast.error('Please select a semester before approving.')
    return
  }

  const payload = {
    tor_id: props.tor.id,
    user_id: props.tor.user_id,
    course_id: props.tor.curriculum.course_id,
    tor_grades: torGrades.value, // includes is_credited flags
    advising: advising.value.filter(a => a.semester === selectedSemester.value)
  }

  try {
    await approveTor(payload);
    emit('refresh')
    emit('close')
    alert('TOR approved successfully!')
  } catch (error) {
    console.error('Error approving TOR:', error)
  }

}

const submitRejectTor = async () => {
  // 🛑 Ask user for confirmation
  const confirmReject = window.confirm('Are you sure you want to reject this TOR? This action cannot be undone.')
  if (!confirmReject) return

  try {
    // 📨 Send reject request to API
    const response = await rejectTor(props.tor.id)

    // ✅ Show success alert
    toast.success('TOR has been rejected successfully.')

    emit('refresh')
    emit('close')
  } catch (error) {
    console.error(error)
    toast.error('Failed to reject TOR. Please try again.')
    // toast.error('Failed to reject TOR.')
  }
}


</script>
