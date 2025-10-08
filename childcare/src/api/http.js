import axios from 'axios'

const http = axios.create({
    baseURL: '/api',//專案Proxy 轉到後端多一個/api的路由
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 請求攔截器 - 自動添加 JWT token
http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 響應攔截器 - 處理 token 過期
http.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token 過期或無效，清除本地存儲並導向登入頁
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default http
