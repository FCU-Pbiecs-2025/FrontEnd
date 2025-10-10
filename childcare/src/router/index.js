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
                meta: {breadcrumb: '最新消息'},
                children: [
                    {
                        path: ':id',
                        name: 'NewsDetail',
                        component: () => import('../views/NewsDetail.vue'),
                        meta: {breadcrumb: '公告說明'}
                    }
                ]
            },
            {
                path: '/agency-search',
                name: 'AgencySearch',
                component: () => import('../views/AgencySearch.vue'),
                meta: {breadcrumb: '查詢機構'},
                children: [
                    {
                        path: 'map',
                        name: 'AgencyMap',
                        component: () => import('../views/AgencyMap.vue'),
                        meta: {breadcrumb: '地圖檢視'}
                    },
                    {
                        path: 'info',
                        name: 'AgencyInfo',
                        component: () => import('../views/AgencyInfo.vue'),
                        meta: {breadcrumb: '機構說明'}
                    }
                ]
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
                path: '/family-register',
                name: 'FamilyRegister',
                component: () => import('../views/FamilyRegister.vue'),
                meta: {breadcrumb: '家庭註冊'}
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
            },
            {
                path: '/admin',
                name: 'AdminHome',
                component: () => import('../views/AdminHome.vue'),
                meta: { requiresAuth: true, requiresAdmin: true, breadcrumb: '後台' },
                children: [
                    {
                        path: '',
                        redirect: { name: 'AdminDashboard' }
                    },
                    {
                        path: 'citizen',
                        name: 'AdminCitizenAccount',
                        component: () => import('../views/AdminCitizenAccount.vue'),
                        meta: { breadcrumb: '民眾帳號' }
                    },
                    {
                        path: 'backend',
                        name: 'AdminBackendAccount',
                        component: () => import('../views/AdminBackendAccount.vue'),
                        meta: { breadcrumb: '後台帳號' }
                    },
                    {
                        path: 'banner',
                        name: 'AdminBannerManager',
                        component: () => import('../views/AdminBannerManager.vue'),
                        meta: { breadcrumb: '首頁海報' }
                    },
                    {
                        path: 'announcement',
                        name: 'AdminAnnouncement',
                        component: () => import('../views/AdminAnnouncement.vue'),
                        meta: { breadcrumb: '系統公告' }
                    },
                    {
                        path: 'guidelines',
                        name: 'AdminGuidelines',
                        component: () => import('../views/AdminGuidelines.vue'),
                        meta: { breadcrumb: '規範說明', requiresAuth: true, requiresAdmin: true }
                    },
                    {
                        path: 'institution',
                        name: 'AdminInstitution',
                        component: () => import('../views/AdminInstitution.vue'),
                        meta: { breadcrumb: '機構管理' }
                    },
                    {
                        path: 'application-review',
                        name: 'AdminApplicationReview',
                        component: () => import('../views/AdminApplicationReview.vue'),
                        meta: { breadcrumb: '審核申請' }
                    },
                    {
                        path: 'application-revoke',
                        name: 'AdminApplicationRevoke',
                        component: () => import('../views/AdminApplicationRevoke.vue'),
                        meta: { breadcrumb: '撤銷審核' }
                    },
                    {
                        path: 'class',
                        name: 'AdminClassManager',
                        component: () => import('../views/AdminClassManager.vue'),
                        meta: { breadcrumb: '班級管理' }
                    },
                    {
                        path: '',
                        name: 'AdminDashboard',
                        component: () => import('../views/AdminDashboard.vue'),
                        meta: { breadcrumb: '後台首頁' }
                    }
                ]
            },
            {
                path: '/admin/banner/new',
                name: 'AdminBannerNew',
                component: () => import('../views/AdminBannerEdit.vue'),
                meta: { requiresAuth: true, requiresAdmin: true, breadcrumb: '新增海報' }
            },
            {
                path: '/admin/banner/:id/edit',
                name: 'AdminBannerEdit',
                component: () => import('../views/AdminBannerEdit.vue'),
                meta: { requiresAuth: true, requiresAdmin: true, breadcrumb: '編輯海報' }
            },
            {
                path: '/admin/announcement/:id/edit',
                name: 'AdminAnnouncementEdit',
                component: () => import('../views/AdminAnnouncementEdit.vue'),
                meta: { requiresAuth: true, requiresAdmin: true, breadcrumb: '系統公告編輯' }
            },
            {
                path: '/admin/institution/new',
                name: 'AdminInstitutionNew',
                component: () => import('../views/AdminInstitutionEdit.vue'),
                meta: { requiresAuth: true, requiresAdmin: true, breadcrumb: '新增機構' }
            },
            {
                path: '/admin/institution/:id/edit',
                name: 'AdminInstitutionEdit',
                component: () => import('../views/AdminInstitutionEdit.vue'),
                meta: { requiresAuth: true, requiresAdmin: true, breadcrumb: '編輯機構' }
            },
            {
                path: '/admin/class/new',
                name: 'AdminClassNew',
                component: () => import('../views/AdminClassEdit.vue'),
                meta: { requiresAuth: true, requiresAdmin: true, breadcrumb: '新增班級' }
            },
            {
                path: '/admin/class/:id/edit',
                name: 'AdminClassEdit',
                component: () => import('../views/AdminClassEdit.vue'),
                meta: { requiresAuth: true, requiresAdmin: true, breadcrumb: '編輯班級' }
            },
            {
                path: '/dashboard',
                name: 'Dashboard',
                component: () => import('../views/AdminHome.vue'),
                meta: { requiresAuth: true, requiresAdmin: true, breadcrumb: '後台' }
            },
            {
                path: '/manage',
                name: 'Manage',
                component: () => import('../views/AdminHome.vue'),
                meta: { requiresAuth: true, requiresAdmin: true, breadcrumb: '後台' }
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

    // 檢查是否需要 admin 權限
    if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
        // 非 admin 角色，導向首頁
        next('/')
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