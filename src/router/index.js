import { createRouter, createWebHistory } from 'vue-router'

// Layout
import Layout from '@/layouts/Layout.vue'
import LandingPage from '@/views/LandingPage.vue'
import NotFound from '@/views/NotFound.vue'
import { useToast } from 'vue-toastification'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public Landing Page
    { path: '/', name: 'Landing', component: LandingPage },

    // 🔹 Admin Routes
    {
      path: '/admin',
      component: Layout,
      children: [
        { path: 'dashboard', name: 'AdminDashboard', component: () => import('@/views/admin/Dashboard.vue') },
        { path: 'upload-tor', name: 'AdminUploadTor', component: () => import('@/views/admin/UploadTor.vue') },
        { path: 'transcript-extract', name: 'TranscriptExtract', component: () => import('@/views/admin/TranscriptExtract.vue') },
        { path: 'students', name: 'students', component: () => import('@/views/admin/Students.vue') },
        { path: 'profile', name: 'AdminProfile', component: () => import('@/views/Profile.vue') },
      ]
    },

    // 🔹 Student Routes
    {
      path: '/student',
      component: Layout,
      children: [
        { path: 'upload-tor', name: 'StudentUploadTor', component: () => import('@/views/admin/UploadTor.vue') },
        { path: 'dashboard', name: 'StudentDashboard', component: () => import('@/views/student/StudentDashboard.vue') },
        { path: 'profile', name: 'StudentProfile', component: () => import('@/views/Profile.vue') },
      ]
    },

    // 🔹 404 Page (catch all)
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ]
})


router.beforeEach((to, from, next) => {
  const toast = useToast();
  const user = JSON.parse(localStorage.getItem('user'))

  // If route starts with /student and user is logged in
  if (to.path.startsWith('/student')) {
    if (!user) {
      toast.error('Please log in first.')
      return next('/') // redirect to landing/login
    }

    // Check if other_info is missing or empty
    if (user.role === 'user' && !user.other_info || user.role === 'user' && Object.keys(user.other_info).length === 0) {
      if (to.path !== '/student/profile') {
        toast.error('Please complete your profile information first.')
        return next('/student/profile')
      }
    }
  }

  next()
})


export default router
