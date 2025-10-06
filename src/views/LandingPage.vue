<script setup>
import { ref, onMounted } from 'vue'
import LoginModal from '@/components/LoginModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const showLogin = ref(false)
const auth = useAuthStore()
const router = useRouter();

const closeModal = () => {
  showLogin.value = false
}

onMounted(() => {
  // If already logged in, redirect
  if (auth.user) {
    if (auth.user.role === 'admin') router.push('/admin/dashboard')
    else router.push('/student/dashboard')
  }
});
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <header class="py-6 shadow-sm bg-white">
      <h1 class="text-center text-2xl font-bold text-gray-800">
        Web-Based Subject Evaluation System for Transferee Students
      </h1>
    </header>

    <main class="flex flex-col flex-grow items-center justify-center text-center px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
        Streamline Your Subject <br /> Evaluation Process
      </h2>
      <p class="text-gray-600 max-w-2xl mb-6">
        Our system simplifies the process of evaluating subjects for transferee
        students, ensuring a smooth and efficient transition.
      </p>
      <button @click="showLogin = true"
        class="px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition">
        Get Started
      </button>
    </main>

    <Footer />

    <!-- Login Modal -->
    <LoginModal @update:show="closeModal" v-if="showLogin" />
  </div>
</template>
<script>
import Footer from '@/components/Footer.vue';
</script>