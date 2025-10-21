import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutPage.vue'),
    meta: {
      title: '关于我们'
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminPage.vue'),
    meta: {
      title: '管理员面板'
    }
  },
  {
    path: '/examiner',
    name: 'Examiner',
    component: () => import('@/views/ExaminerPage.vue'),
    meta: {
      title: '考官面板'
    }
  },
  {
    path: '/enterprise',
    name: 'Enterprise',
    component: () => import('@/views/EnterprisePage.vue'),
    meta: {
      title: '州牧面板'
    }
  },
  {
    path: '/student',
    name: 'Student',
    component: () => import('@/views/StudentPage.vue'),
    meta: {
      title: '监生面板'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Chancellor App`
  }
  next()
})

export default router