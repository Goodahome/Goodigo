import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      name: 'practice',
      component: () => import('@/views/practice/PracticeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/practice',
      redirect: '/',
    },
    {
      path: '/questions/manage',
      name: 'questions-manage',
      component: () => import('@/views/questions/QuestionManageView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      redirect: '/',
    },
    {
      path: '/resumes/:pathMatch(.*)*',
      redirect: '/',
    },
    {
      path: '/skills/:pathMatch(.*)*',
      redirect: '/',
    },
    {
      path: '/knowledge/:pathMatch(.*)*',
      redirect: '/',
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return { path: '/' }
  }

  return true
})

export default router
