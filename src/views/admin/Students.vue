<template>
  <div class="p-6 bg-gray-50 min-h-screen text-xs">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800">Student Management</h1>
        <p class="text-sm text-gray-500">Manage and track all students.</p>
      </div>
      <button @click="openModal()"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
        + Add Student
      </button>
    </div>

    <!-- Search & Filters -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <input v-model="search" type="text" placeholder="Search student name..."
        class="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <select v-model="filterType"
        class="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">All Types</option>
        <option value="New">New</option>
        <option value="Old">Old</option>
        <option value="Transferee">Transferee</option>
      </select>
      <select v-model="filterYear"
        class="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">All Years</option>
        <option v-for="year in yearLevels" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
    </div>

    <!-- Student Table -->
    <div class="bg-white rounded-2xl shadow-sm p-4 overflow-x-auto">
      <!-- Loader -->
      <div v-if="isLoadingUsers" class="mt-4">
        <TableLoader :rows="6" />
      </div>

      <!-- Table Content -->
      <div v-else>
        <table class="w-full text-sm text-left text-gray-600 min-h-[400px]">
          <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th class="px-4 py-3">Student ID</th>
              <th class="px-4 py-3">First Name</th>
              <th class="px-4 py-3">Last Name</th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Type</th>
              <th class="px-4 py-3">Year Level</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in paginatedStudents" :key="student.id"
              class="border-b border-slate-200 hover:bg-gray-50 transition">
              <td class="px-4 py-3">{{ student.student_id || '__' }}</td>
              <td class="px-4 py-3">{{ student.first_name || '__' }}</td>
              <td class="px-4 py-3">{{ student.last_name || '__' }}</td>
              <td class="px-4 py-3">{{ student.email || '__' }}</td>
              <td class="px-4 py-3">{{ student.type || '__' }}</td>
              <td class="px-4 py-3">{{ student.year || '__' }}</td>
              <td class="px-4 py-3 text-right space-x-2">
                <button @click="openModal(student)" class="text-blue-600 hover:underline">
                  Edit
                </button>
                <button @click="deleteStudent(student.id)" class="text-red-600 hover:underline">
                  Delete
                </button>
              </td>
            </tr>

            <tr v-if="!filteredStudents.length">
              <td colspan="7" class="text-center py-6 text-gray-400">
                No students found.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex justify-between items-center mt-4 px-2 text-sm text-gray-700">
          <span>
            Showing
            <b>{{ startItem }}</b> - <b>{{ endItem }}</b> of
            <b>{{ filteredStudents.length }}</b>
          </span>

          <div class="flex space-x-2">
            <button @click="prevPage" :disabled="currentPage === 1"
              class="px-3 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50">
              Prev
            </button>
            <button v-for="page in totalPages" :key="page" @click="goToPage(page)" :class="[
              'px-3 py-1 rounded-lg border',
              currentPage === page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white hover:bg-gray-100 border-gray-300'
            ]">
              {{ page }}
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages"
              class="px-3 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ✨ Modal Overlay -->
    <ModalOverlay v-if="showModal">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">
        {{ editMode ? 'Edit Student' : 'Add Student' }}
      </h2>

      <form @submit.prevent="saveStudent" class="space-y-4">
        <!-- Full Name -->
        <div>
          <label class="block text-xs text-gray-600 mb-1">Full Name</label>
          <input v-model="form.name" type="text" class="input" placeholder="Enter full name" required />
        </div>

        <!-- Type & Year -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-600 mb-1">Type</label>
            <select v-model="form.type" class="input" required>
              <option value="">Select Type</option>
              <option value="New">New</option>
              <option value="Old">Old</option>
              <option value="Transferee">Transferee</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Year Level</label>
            <select v-model="form.year" class="input" required>
              <option value="">Select Year</option>
              <option v-for="year in yearLevels" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-3 mt-6">
          <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">
            Cancel
          </button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            {{ editMode ? 'Update' : 'Save' }}
          </button>
        </div>
      </form>

    </ModalOverlay>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { fetchUsers } from "@/services/apiService";
import TableLoader from "@/components/TableLoader.vue";
import ModalOverlay from "@/components/ModalOverlay.vue";

const isLoadingUsers = ref(false);
const students = ref([]);

const search = ref("");
const filterType = ref("");
const filterYear = ref("");
const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const showModal = ref(false);
const editMode = ref(false);
const form = ref({ id: null, name: "", type: "", year: "" });

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(8);

// Computed: Filter
const filteredStudents = computed(() => {
  return students.value.filter((s) => {
    const fullName = `${s.first_name ?? ""} ${s.last_name ?? ""}`.toLowerCase();
    const matchesSearch = fullName.includes(search.value.toLowerCase());
    const matchesType =
      !filterType.value || s.type === filterType.value || s.type == null;
    const matchesYear =
      !filterYear.value || s.year === filterYear.value || s.year == null;
    return matchesSearch && matchesType && matchesYear;
  });
});

const totalPages = computed(() =>
  Math.ceil(filteredStudents.value.length / itemsPerPage.value)
);

const startItem = computed(() =>
  filteredStudents.value.length
    ? (currentPage.value - 1) * itemsPerPage.value + 1
    : 0
);
const endItem = computed(() =>
  Math.min(currentPage.value * itemsPerPage.value, filteredStudents.value.length)
);

// Paginated students
const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredStudents.value.slice(start, end);
});

// Pagination actions
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};
const prevPage = () => currentPage.value > 1 && currentPage.value--;
const nextPage = () => currentPage.value < totalPages.value && currentPage.value++;

// CRUD modal actions
const openModal = (student = null) => {
  if (student) {
    editMode.value = true;
    form.value = { ...student };
  } else {
    editMode.value = false;
    form.value = { id: null, name: "", type: "", year: "" };
  }
  showModal.value = true;
};
const closeModal = () => (showModal.value = false);

// Save and Delete
const saveStudent = () => {
  if (editMode.value) {
    const index = students.value.findIndex((s) => s.id === form.value.id);
    students.value[index] = { ...form.value };
  } else {
    students.value.push({ ...form.value, id: Date.now() });
  }
  closeModal();
};
const deleteStudent = (id) => {
  if (confirm("Are you sure you want to delete this student?")) {
    students.value = students.value.filter((s) => s.id !== id);
  }
};

// Load users
const loadUsers = async () => {
  isLoadingUsers.value = true;
  try {
    const response = await fetchUsers();
    students.value = response;
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    isLoadingUsers.value = false;
  }
};

onMounted(() => {
  loadUsers();
});
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.25s ease-out;
}
</style>
