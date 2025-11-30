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
                        path: 'info/:id',
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
                path: '/manage-parents',
                name: 'ManageParents',
                component: () => import('../views/ManageParents.vue'),
                meta: { requiresAuth: true, breadcrumb: '家長資料管理' }
            },
            {
                path: '/manage-children',
                name: 'ManageChildren',
                component: () => import('../views/ManageChildren.vue'),
                meta: { requiresAuth: true, breadcrumb: '幼兒資料管理' }
            },
            {
                path: '/supplement-document',
                name: 'SupplementDocument',
                component: () => import('../views/SupplementDocument.vue'),
                meta: { requiresAuth: true, breadcrumb: '補件' }
            },
            {
                path: '/rejection-reason',
                name: 'RejectionReason',
                component: () => import('../views/RejectionReason.vue'),
                meta: { requiresAuth: true, breadcrumb: '退件說明' }
            },
            {
                path: '/revoke-application',
                name: 'RevokeApplication',
                component: () => import('../views/RevokeApplication.vue'),
                meta: { requiresAuth: true, breadcrumb: '撤銷申請' }
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
                meta: {breadcrumb: '申請進度查詢'},
                children: [
                    {
                        path: 'progress/:caseNo',
                        name: 'ApplicationProgressDetail',
                        component: () => import('../views/ApplicationProgressDetail.vue'),
                        meta: { requiresAuth: true, breadcrumb: '申請進度詳情' },
                        children: [
                            {
                                path: 'supplement',
                                name: 'ApplicationProgressSupplement',
                                component: () => import('../views/SupplementDocument.vue'),
                                meta: { requiresAuth: true, breadcrumb: '補件' }
                            },
                            {
                                path: 'revoke',
                                name: 'ApplicationProgressRevoke',
                                component: () => import('../views/RevokeApplication.vue'),
                                meta: { requiresAuth: true, breadcrumb: '撤銷申請' }
                            }
                        ]
                    }
                ]
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
    {
        path: '/admin',
        name: 'AdminHome',
        component: () => import('../views/AdminHome.vue'),
        meta: { requiresAuth: true, requiresAdmin: true, breadcrumb: '後台首頁' },
        children: [
            {
                path: 'citizen',
                name: 'AdminCitizenAccount',
                component: () => import('../views/AdminCitizenAccount.vue'),
                meta: { breadcrumb: '民眾帳號' }
            },
            {
                path: 'detail/:id',
                name: 'AdminAnnouncementDetail',
                component: () => import('../views/AdminAnnouncementDetail.vue'),
                meta: { breadcrumb: '公告詳情' }
            },
            {
                path: 'backend',
                name: 'AdminBackendAccount',
                component: () => import('../views/AdminBackendAccount.vue'),
                meta: { breadcrumb: '後台帳號' },
                children: [
                    {
                        path: 'new',
                        name: 'AdminBackendNew',
                        component: () => import('../views/AdminBackendEdit.vue'),
                        meta: { requiresAuth: true, requiresAdmin: true, breadcrumb: '新增後台帳號' }
                    },
                    {
                        path: ':id/edit',
                        name: 'AdminBackendEdit',
                        component: () => import('../views/AdminBackendEdit.vue'),
                        meta: { requiresAuth: true, requiresAdmin: true, breadcrumb: '編輯後台帳號' }
                    }
                ]
            },
            {
                path: 'banner',
                name: 'AdminBannerManager',
                component: () => import('../views/AdminBannerManager.vue'),
                meta: { breadcrumb: '首頁海報' },
                children: [
                    {
                        path: 'new',
                        name: 'AdminBannerNew',
                        component: () => import('../views/AdminBannerEdit.vue'),
                        meta: { requiresAuth: true, requiresAdmin: true, breadcrumb: '新增海報' }
                    },
                    {
                        path: ':id/edit',
                        name: 'AdminBannerEdit',
                        component: () => import('../views/AdminBannerEdit.vue'),
                        meta: { requiresAuth: true, requiresAdmin: true, breadcrumb: '編輯海報' }
                    }
                ]
            },
            {
                path: 'announcement',
                name: 'AdminAnnouncement',
                component: () => import('../views/AdminAnnouncement.vue'),
                meta: { breadcrumb: '系統公告' },
                children: [
                    {
                        path: 'create',
                        name: 'AdminAnnouncementCreate',
                        component: () => import('../views/AdminAnnouncementEdit.vue'),
                        meta: { breadcrumb: '新增公告' }
                    },
                    {
                        path: 'edit/:id',
                        name: 'AdminAnnouncementEdit',
                        component: () => import('../views/AdminAnnouncementEdit.vue'),
                        meta: { breadcrumb: '編輯公告' }
                    }
                ]
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
                meta: { breadcrumb: '機構管理' },
                children: [
                    {
                        path: 'new',
                        name: 'AdminInstitutionNew',
                        component: () => import('../views/AdminInstitutionEdit.vue'),
                        meta: { breadcrumb: '新增機構' }
                    },
                    {
                        path: ':institutionID/edit',
                        name: 'AdminInstitutionEdit',
                        component: () => import('../views/AdminInstitutionEdit.vue'),
                        meta: { breadcrumb: '編輯機構' }
                    }
                ]
            },
            {
                path: 'application-review',
                name: 'AdminApplicationReview',
                component: () => import('../views/AdminApplicationReview.vue'),
                meta: { breadcrumb: '審核申請' }
            },
            {
                path: 'application-review/:id/edit',
                name: 'AdminApplicationReviewEdit',
                component: () => import('../views/AdminApplicationReviewEdit.vue'),
                meta: { breadcrumb: '審核申請編輯' }
            },
            {
                path: 'case-management',
                name: 'AdminCaseManagement',
                component: () => import('../views/AdminCaseManagement.vue'),
                meta: { breadcrumb: '個案管理' },
                children: [
                    {
                        path: ':childNationalId/edit',
                        name: 'AdminCaseManagementEdit',
                        component: () => import('../views/AdminCaseManagementEdit.vue'),
                        meta: { breadcrumb: '個案管理編輯' }
                    }
                ]
            },
            {
                path: 'application-revoke',
                name: 'AdminApplicationRevoke',
                component: () => import('../views/AdminApplicationRevoke.vue'),
                meta: { breadcrumb: '撤銷審核' },
                children: [
                    {
                        path: ':id/edit',
                        name: 'AdminApplicationRevokeEdit',
                        component: () => import('../views/AdminApplicationRevokeEdit.vue'),
                        meta: { breadcrumb: '撤銷審核編輯' }
                    }
                ]
            },
            {
                path: 'class',
                name: 'AdminClassManager',
                component: () => import('../views/AdminClassManager.vue'),
                meta: { breadcrumb: '班級管理' },
                children: [
                    {   path: 'new',
                        name: 'AdminClassNew',
                        component: () => import('../views/AdminClassEdit.vue'),
                        meta: { breadcrumb: '新增班級' }
                    },
                    {
                        path: ':institutionId',
                        name: 'AdminClassList',
                        component: () => import('../views/AdminClassList.vue'),
                        meta: {
                            breadcrumb: (route) => {
                                // 動態獲取機構名稱
                                const institutions = [
                                    { id: 1, name: '快樂幼兒園' },
                                    { id: 2, name: '幸福幼兒園' },
                                    { id: 3, name: '希望幼兒園' }
                                ]
                                const institutionId = Number(route.params.institutionId)
                                const institution = institutions.find(i => i.id === institutionId)
                                return institution?.name || '班級列表'
                            }
                        },
                        children: [

                            {
                                path: ':id/edit',
                                name: 'AdminClassEdit',
                                component: () => import('../views/AdminClassEdit.vue'),
                                meta: { breadcrumb: '編輯班級' }
                            }
                        ]
                    }
                ]
            },
            {
                path: 'lottery-draw',
                name: 'AdminLotteryDraw',
                component: () => import('../views/AdminLotteryDraw.vue'),
                meta: { breadcrumb: '補位抽籤' }
            },
            {
                path: 'waitlist',
                name: 'AdminWaitlist',
                component: () => import('../views/AdminWaitlist.vue'),
                meta: { breadcrumb: '候補清冊' }
            }
        ]
    },
    {
        path: '/AdminLogin',
        name: 'AdminLogin',
        component: () => import('../views/AdminLogin.vue'),
        meta: { requiresAdminLogin: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        // 若有儲存的滾動位置（如瀏覽器返回），則回到該位置
        if (savedPosition) {
            return savedPosition;
        } else {
            // 否則每次切換都回到頂部
            return { left: 0, top: 35 };
        }
    }
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
    if (to.meta.requiresAdmin && !['admin', 'super_admin'].includes(authStore.user?.role)) {
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