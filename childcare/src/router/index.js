import { createRouter, createWebHistory } from 'vue-router'

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
        component: () => import('../views/MemberCenter.vue')
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
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})//createWebHistory()是用HTML5的歷史模式 以免網址出現#


export default router