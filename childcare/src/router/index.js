import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth.js'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/news',
        name: 'News',
        component: () => import('../views/News.vue')
    },
    {
        path: '/agency-search',
        name: 'AgencySearch',
        component: () => import('../views/AgencySearch.vue')
    },
    {
        path: '/qualification',
        name: 'Qualification',
        component: () => import('../views/Qualification.vue')
    },
    {
        path: '/member-center',
        name: 'MemberCenter',
        component: () => import('../views/MemberCenter.vue'),
        meta: { requiresAuth: true } // 需要登入才能訪問
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('../views/ForgotPassword.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue')
    },
    {
        path: '/register-terms',
        name: 'RegisterTerms',
        component: () => import('../views/RegisterTerms.vue')
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('../views/ResetPassword.vue')
    },
    {
        path: '/application-status',
        name: 'ApplicationStatus',
        component: () => import('../views/ApplicationStatus.vue')
    },
    {
        path: '/apply-service',
        name: 'ApplyService',
        component: () => import('../views/ApplyService.vue')
    },
    {
        path: '/subsidy-calculator',
        name: 'SubsidyCalculator',
        component: () => import('../views/SubsidyCalculator.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/LoginView.vue'),
        meta: { requiresGuest: true } // 已登入用戶不能訪問登入頁
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})//createWebHistory()是用HTML5的歷史模式 以免網址出現#

// 路由守衛
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // 檢查是否需要認證
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
        // 需要登入但未登入，導向登入頁並記錄原始路徑
        next({
            path: '/login',
            query: { redirect: to.fullPath }
        })
        return
    }

    // 檢查是否為訪客限定頁面（如登入頁）
    if (to.meta.requiresGuest && authStore.isLoggedIn) {
        // 已登入用戶不能訪問登入頁，導向首頁
        next('/')
        return
    }

    next()
})


export default router