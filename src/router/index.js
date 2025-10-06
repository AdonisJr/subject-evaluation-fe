import { createRouter, createWebHistory } from 'vue-router'

// Layout
import Layout from '@/layouts/Layout.vue'
import LandingPage from '@/views/LandingPage.vue'
import NotFound from '@/views/NotFound.vue'

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
      ]
    },

    // 🔹 Student Routes
    {
      path: '/student',
      component: Layout,
      children: [
        { path: 'dashboard', name: 'StudentDashboard', component: () => import('@/views/student/StudentDashboard.vue') },
      ]
    },

    // 🔹 404 Page (catch all)
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ]
})

export default router
