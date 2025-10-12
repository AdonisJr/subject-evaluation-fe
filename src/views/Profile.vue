<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-800">Profile Page</h1>
      <div class="flex gap-3">
        <button
          @click="openEditModal"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + EDIT
        </button>
      </div>
    </div>

    <!-- Profile Layout -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left Profile Summary -->
      <div class="bg-white rounded-2xl shadow-md p-6 w-full lg:w-1/4 text-center">
        <div class="flex flex-col items-center">
          <div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <span v-if="auth.user.role === 'admin'" class="text-5xl">
              {{ student.gender?.toLowerCase() === 'female' ? '👩' : '👨' }}
            </span>
            <span v-else-if="auth.user.role === 'user'" class="text-5xl">
              {{ student.gender?.toLowerCase() === 'female' ? '👩‍🎓' : '👨‍🎓' }}
            </span>
          </div>
          <h2 class="text-lg font-semibold text-gray-800">
            {{ student.first_name }} {{ student.last_name }}
          </h2>
          <p class="text-gray-500 text-sm mb-1">#{{ student.student_id || 'N/A' }}</p>

          <div class="flex justify-around w-full text-center my-6">
            <div>
              <p class="text-lg font-semibold text-gray-800">{{ student.gender || '-' }}</p>
              <p class="text-xs text-gray-400">GENDER</p>
            </div>
            <div>
              <p class="text-lg font-semibold text-gray-800">{{ student.course.code || '-' }}</p>
              <p class="text-xs text-gray-400">COURSE</p>
            </div>
            <div>
              <p class="text-lg font-semibold text-gray-800">28</p>
              <p class="text-xs text-gray-400">AGE</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Info Panels -->
      <div class="flex-1 space-y-6">
        <!-- Profile Details -->
        <div class="bg-white shadow-md rounded-2xl">
          <div class="flex justify-between items-center border-b px-6 py-3">
            <h3 class="font-semibold text-gray-800 uppercase text-sm">Profile</h3>
          </div>
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-3 text-sm">
            <div><strong>Admission Date:</strong> {{ student.created_at || '—' }}</div>
            <div><strong>Date of Birth:</strong> {{ student.dob || '—' }}</div>
            <div><strong>Category:</strong> {{ student.category || '—' }}</div>
            <div><strong>Mobile Number:</strong> {{ student.mobile || '—' }}</div>
            <div><strong>Email:</strong> {{ student.email || '—' }}</div>
            <div><strong>Religion:</strong> {{ student.religion || '—' }}</div>
            <div><strong>Current Address:</strong> {{ student.current_address || '—' }}</div>
            <div><strong>Permanent Address:</strong> {{ student.permanent_address || '—' }}</div>
            <div><strong>Mother:</strong> {{ student.mother || '—' }}</div>
            <div><strong>Father:</strong> {{ student.father || '—' }}</div>
          </div>
        </div>

        <!-- Miscellaneous Details -->
        <div class="bg-white shadow-md rounded-2xl">
          <div class="flex justify-between items-center border-b px-6 py-3">
            <h3 class="font-semibold text-gray-800 uppercase text-sm">Miscellaneous Details</h3>
          </div>
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-3 text-sm">
            <div><strong>Blood Group:</strong> {{ student.blood_type || '—' }}</div>
            <div><strong>Eye Color:</strong> {{ student.eye_color || '—' }}</div>
            <div><strong>Height:</strong> {{ student.height || '—' }}</div>
            <div><strong>Weight:</strong> {{ student.weight || '—' }}</div>
            <div><strong>As on Date:</strong> {{ student.updated_at || '—' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ✨ Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Edit Profile</h2>

        <form @submit.prevent="saveChanges" class="space-y-4">
          <!-- Basic Info -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">First Name</label>
              <input v-model="editForm.first_name" class="input" type="text" />
            </div>
            <div>
              <label class="label">Last Name</label>
              <input v-model="editForm.last_name" class="input" type="text" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Email</label>
              <input v-model="editForm.email" class="input" type="email" />
            </div>
            <div>
              <label class="label">Gender</label>
              <select v-model="editForm.gender" class="input">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Mobile</label>
              <input v-model="editForm.mobile" class="input" type="text" />
            </div>
            <div>
              <label class="label">Category</label>
              <input v-model="editForm.category" class="input" type="text" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Religion</label>
              <input v-model="editForm.religion" class="input" type="text" />
            </div>
            <div>
              <label class="label">Date of Birth</label>
              <input v-model="editForm.dob" class="input" type="date" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Father</label>
              <input v-model="editForm.father" class="input" type="text" />
            </div>
            <div>
              <label class="label">Mother</label>
              <input v-model="editForm.mother" class="input" type="text" />
            </div>
          </div>

          <div>
            <label class="label">Current Address</label>
            <input v-model="editForm.current_address" class="input" type="text" />
          </div>
          <div>
            <label class="label">Permanent Address</label>
            <input v-model="editForm.permanent_address" class="input" type="text" />
          </div>

          <!-- Misc Details -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Blood Type</label>
              <input v-model="editForm.blood_type" class="input" type="text" />
            </div>
            <div>
              <label class="label">Eye Color</label>
              <input v-model="editForm.eye_color" class="input" type="text" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Height</label>
              <input v-model="editForm.height" class="input" type="text" />
            </div>
            <div>
              <label class="label">Weight</label>
              <input v-model="editForm.weight" class="input" type="text" />
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const toast = useToast()
const auth = useAuthStore()

const student = ref({
  first_name: 'Mayank',
  last_name: 'Singh',
  email: 'hello@campus365.io',
  updated_at: '13-05-2020',
  student_id: 123,
  created_at: '13-05-2020',
  gender: 'Male',
  course: { name: 'B.Tech', code: 'BSIT' },
  category: 'New',
  mobile: '07982639820',
  father: '',
  mother: '123',
  religion: '',
  current_address: '',
  permanent_address: '',
  blood_type: '',
  eye_color: '',
  height: '123',
  weight: '123',
  dob: '',
})

const showModal = ref(false)
const editForm = reactive({})

// Open modal and copy data
const openEditModal = () => {
  Object.assign(editForm, student.value)
  showModal.value = true
}

// Save changes
const saveChanges = () => {
  Object.assign(student.value, editForm)
  showModal.value = false
  toast.success('Profile updated successfully!')
}

// Close modal
const closeModal = () => {
  showModal.value = false
}
</script>

<style scoped>
strong {
  font-weight: 600;
  color: #374151;
}
.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.25rem;
}
.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}
</style>
