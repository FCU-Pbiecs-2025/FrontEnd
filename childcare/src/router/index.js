import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth.js'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: {breadcrumb: '首頁'},
        children: [
            {
                path: '/news',
                name: 'News',
                component: () => import('../views/News.vue'),
                meta: {breadcrumb: '最新消息'}
            },
            {
                path: '/agency-search',
                name: 'AgencySearch',
                component: () => import('../views/AgencySearch.vue'),
                meta: {breadcrumb: '查詢機構'}
            },
            {
                path: '/qualification',
                name: 'Qualification',
                component: () => import('../views/Qualification.vue'),
                meta: {breadcrumb: '公托資格說明'}
            },
            {
                path: '/member-center',
                name: 'MemberCenter',
                component: () => import('../views/MemberCenter.vue'),
                meta: { requiresAuth: true, breadcrumb: '會員中心' }
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
                component: () => import('../views/ApplicationStatus.vue'),
                meta: {breadcrumb: '申請進度查詢'}
            },
            {
                path: '/apply-service',
                name: 'ApplyService',
                component: () => import('../views/ApplyService.vue'),
                meta: {breadcrumb: '申請托育服務'}
            },
            {
                path: '/subsidy-calculator',
                name: 'SubsidyCalculator',
                component: () => import('../views/SubsidyCalculator.vue'),
                meta: {breadcrumb: '補助試算'}
            },
            {
                path: '/login',
                name: 'Login',
                component: () => import('../views/LoginView.vue'),
                meta: { requiresGuest: true } // 已登入用戶不能訪問登入頁
            }
        ]
    },
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