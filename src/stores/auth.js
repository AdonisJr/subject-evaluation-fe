import { defineStore } from 'pinia'
import axios from 'axios'
import { useToast } from 'vue-toastification'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
  }),

  actions: {
    async login({ email, password, role }) {
      try {
        const res = await axios.post('/api/login', { email, password })

        this.token = res.data.token
        this.user = res.data.user

        // persist
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))

        return { success: true, data: res.data }
      } catch (err) {
        console.error(err)
        return { success: false, message: err.response?.data?.message || 'Login failed' }
      }
    },
    async register({ first_name, last_name, email, password }) {
      try {
        const res = await axios.post('/api/register', { first_name, last_name, email, password })

        // this.token = res.data.token
        // this.user = res.data.user

        // // persist
        // localStorage.setItem('token', this.token)
        // localStorage.setItem('user', JSON.stringify(this.user))

        return { success: true, data: res.data }
      } catch (err) {
        console.error(err)
        return { success: false, message: err.response?.data?.message || 'Login failed' }
      }
    },

    logout() {
      const toast = useToast();
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      toast.error("Logged out successfully.");
      window.location.href = '/'  // Redirect to landing page after logout
    }
  }
})
