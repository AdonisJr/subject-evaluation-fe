<template>
  <div class="bg-white rounded-lg shadow px-6 pb-6">
    <div class="flex justify-between items-center mb-3">
      <h3 class="font-semibold text-gray-800 text-sm uppercase tracking-wide">
        Advising Records
      </h3>

      <!-- Semester Filter -->
      <select v-model="selectedSemester" class="text-xs border rounded px-2 py-1">
        <option value="">All Semesters</option>
        <option value="first_sem">First Semester</option>
        <option value="second_sem">Second Semester</option>
      </select>
    </div>

    <div class="h-[350px] overflow-y-auto border rounded">
      <table class="min-w-full text-xs text-gray-700 border-collapse">
        <thead class="bg-gray-100 sticky top-0">
          <tr>
            <th class="px-4 py-2 text-left">ID</th>
            <th class="px-4 py-2 text-left">Subject Code</th>
            <th class="px-4 py-2 text-left">Title</th>
            <th class="px-4 py-2 text-left">Units</th>
            <th class="px-4 py-2 text-left">Semester</th>
            <th class="px-4 py-2 text-left">Year Level</th>
            <th class="px-4 py-2 text-left">Advice For</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="adv in filteredAdvising"
            :key="adv.id"
            class="odd:bg-white even:bg-gray-50 hover:bg-blue-50"
          >
            <td class="px-4 py-2">{{ adv.subject?.id }}</td>
            <td class="px-4 py-2">{{ adv.subject?.code }}</td>
            <td class="px-4 py-2">{{ adv.subject?.name }}</td>
            <td class="px-4 py-2">{{ adv.subject?.units }}</td>
            <td class="px-4 py-2">{{ adv.subject?.semester }}</td>
            <td class="px-4 py-2">{{ adv.subject?.year_level }}</td>
            <td class="px-4 py-2">{{ adv.semester }}</td>
          </tr>

          <tr v-if="!filteredAdvising.length">
            <td colspan="7" class="px-4 py-2 text-center text-gray-400">
              No advising records found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Total Units -->
    <div class="text-right text-xs mt-3 font-semibold text-gray-700">
      Total Units: {{ totalUnits }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  advising: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:selectedSemester'])

const selectedSemester = ref('')

// ✅ Watch for changes and emit to parent
watch(selectedSemester, (newValue) => {
  emit('update:selectedSemester', newValue)
})

const filteredAdvising = computed(() => {
  if (!props.advising.length) return []
  if (!selectedSemester.value) return props.advising

  return props.advising.filter((adv) =>
    adv.semester?.toLowerCase().includes(selectedSemester.value.toLowerCase())
  )
})

const totalUnits = computed(() =>
  filteredAdvising.value.reduce((sum, adv) => sum + Number(adv.subject?.units || 0), 0)
)
</script>
