<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';

const emits = defineEmits(['update:show', 'update:show-registration']);

const router = useRouter();
const toast = useToast();
const email = ref('')
const password = ref('')
const isLoading = ref(false);
const auth = useAuthStore()

const handleLogin = async () => {
    isLoading.value = true;

    try {
        const res = await auth.login({ email: email.value, password: password.value });
        if (res.success) {
            toast.success("Login successful!")

            emits('update:show', false)
            console.log(res.data)
            // redirect based on role
            if (res.data.role === 'admin') {
              router.push('/admin/dashboard')
            } else {
              router.push('/student/dashboard')
            }
        } else {
            toast.error(res.message)
        }
    } catch (error) {
        toast.error("An error occurred. Please try again.")
    } finally {
        isLoading.value = false;
    }
};

</script>

<template>
    <div class="absolute w-screen h-screen top-0">
        <div class="absolute top-0 left-0 w-screen h-screen bg-black opacity-50">

        </div>
        <div class="flex items-center justify-center min-h-screen px-4">
            <div class="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
                <!-- Close -->
                <button @click="emits('update:show', false)" class="absolute top-3 right-3 text-gray-500">
                    ✖
                </button>

                <!-- Title -->
                <h2 class="text-2xl font-bold text-center mb-6">Login</h2>

                <!-- Form -->
                <form @submit.prevent="handleLogin" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Email</label>
                        <input v-model="email" type="email" placeholder="Enter your email"
                            class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-green-200" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Password</label>
                        <input v-model="password" type="password" placeholder="Enter your password"
                            class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-green-200" />
                    </div>

                    <div class="flex justify-between items-center">
                        <a href="#" class="text-sm text-green-600 hover:underline"  @click="emits('update:show-registration', false)">
                            No account? Register
                        </a>
                    </div>

                    <button type="submit"
                        class="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition cursor-pointer">
                        {{ isLoading ? 'Logging in...' : 'Login' }}
                    </button>

                    <button type="button" @click="emits('update:show', false)"
                        class="w-full py-2 mt-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>
