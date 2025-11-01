import axios from 'axios'

const http = axios.create({
    baseURL: '/api',//專案Proxy 轉到後端多一個/api的路由
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 請求攔截器 - 原本自動添加 JWT token，先註解掉以停用 JWT 功能
http.interceptors.request.use(
    (config) => {
        // // 暫時停用：從 localStorage 讀取 token 並附加到 Authorization header
        // try {
        //     const token = localStorage.getItem('token')
        //     if (token) {
        //         config.headers['Authorization'] = `Bearer ${token}`
        //     }
        // } catch (e) {
        //     console.debug('http interceptor: unable to read token from localStorage', e)
        // }


        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 響應攔截器 - 原本處理 401 清除 token 並導向登入，先註解掉
http.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        // const status = error?.response?.status
        // if (status === 401) {
        //     // Token 過期或無效，清除本地存儲並導向登入頁
        //     try {
        //         localStorage.removeItem('token')
        //         localStorage.removeItem('user')
        //     } catch (e) {
        //         console.debug('http interceptor: unable to clear localStorage', e)
        //     }

        //     // Prevent redirect loop if already on /login
        //     if (typeof window !== 'undefined' && window.location && window.location.pathname !== '/login') {
        //         window.location.href = '/login'
        //     }
        // }

        return Promise.reject(error)
    }
)

export default http
