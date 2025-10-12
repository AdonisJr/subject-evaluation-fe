<template>
    <div class="absolute w-screen h-screen top-0">
        <div class="absolute top-0 left-0 w-screen h-screen bg-black opacity-50"></div>

        <div class="flex items-center justify-center min-h-screen px-4">
            <div class="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
                <!-- Close -->
                <button @click="emits('update:show', false)" class="absolute top-3 right-3 text-gray-500 cursor-pointer">
                    ✖
                </button>

                <h2 class="text-2xl font-bold text-center mb-6">Register</h2>

                <form @submit.prevent="handleRegister" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">First Name</label>
                        <input v-model="firstName" type="text" placeholder="Enter first name"
                            class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-green-200" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Last Name</label>
                        <input v-model="lastName" type="text" placeholder="Enter last name"
                            class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-green-200" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Email</label>
                        <input v-model="email" type="email" placeholder="Enter email"
                            class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-green-200" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Password</label>
                        <input v-model="password" type="password" placeholder="Enter password"
                            class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-green-200" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Confirm Password</label>
                        <input v-model="passwordConfirm" type="password" placeholder="Confirm password"
                            class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-green-200" />
                    </div>

                    <button type="submit"
                        class="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition cursor-pointer">
                        {{ isLoading ? 'Registering...' : 'Register' }}
                    </button>

                    <button type="button" @click="emits('update:show', false)"
                        class="w-full py-2 mt-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';

const emits = defineEmits(['update:show', 'update:show-registration']);

const router = useRouter();
const toast = useToast();
const auth = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const isLoading = ref(false)

const handleRegister = async () => {
    if (password.value !== passwordConfirm.value) {
        toast.error("Passwords do not match!")
        return;
    }

    isLoading.value = true;

    try {
        const res = await auth.register({
            first_name: firstName.value,
            last_name: lastName.value,
            email: email.value,
            password: password.value
        });

        if (res.success) {
            toast.success("Registration successful!")
            emits('update:show', false)
        } else {
            toast.error(res.message)
        }
    } catch (error) {
        console.log(error)
        toast.error("An error occurred. Please try again.")
    } finally {
        isLoading.value = false
    }
}
</script>
