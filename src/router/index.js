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
        { path: 'uploaded-tor', name: 'AdminUploadTor', component: () => import('@/views/admin/UploadTor.vue') },
        { path: 'subjects', name: 'AdminSubjects', component: () => import('@/views/admin/Subjects.vue') },
        { path: 'transcript-extract', name: 'TranscriptExtract', component: () => import('@/views/admin/TranscriptExtract.vue') },
        { path: 'students', name: 'students', component: () => import('@/views/admin/Students.vue') },
        { path: 'profile', name: 'AdminProfile', component: () => import('@/views/Profile.vue') },
        { path: 'curriculum', name: 'AdminCurriculum', component: () => import('@/views/admin/Curriculum.vue') },
      ]
    },

    // 🔹 Student Routes
    {
      path: '/student',
      component: Layout,
      children: [
        { path: 'upload-tor', name: 'StudentUploadTor', component: () => import('@/views/student/StudentUploadTor.vue') },
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
  const user = JSON.parse(localStorage.getItem('user'));

  // If user is not logged in
  if (!user?.id) {
    return next(); // let them access public pages (landing, login)
  }

  // User is logged in
  const isAdmin = user.role === 'admin';
  const isStudent = user.role === 'user';

  // Check if other_info is missing or empty
  const missingInfo = !user.other_info || Object.keys(user.other_info).length === 0;

  // If profile info is missing, force redirect to profile
  if (missingInfo) {
    if (isStudent && to.path !== '/student/profile') {
      toast.warning('Please complete your profile information.');
      return next('/student/profile');
    }
  }

  // If user goes to landing page while logged in, redirect to dashboard
  if (to.path === '/' || to.path === '/login') {
    if (isAdmin) return next('/admin/dashboard');
    if (isStudent) return next('/student/dashboard');
  }

  next(); // allow other routes
});



export default router
