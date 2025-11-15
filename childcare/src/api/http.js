import axios from 'axios'

const http = axios.create({
    baseURL: '/api', // 專案 Proxy 轉到後端多一個 /api 的路由
    timeout: 10000
    // 不要在這裡固定設定 Content-Type，避免影響 FormData 上傳
})

// 請求攔截器 - 依據 payload 類型決定 Content-Type
http.interceptors.request.use(
    (config) => {
        // 偵測是否為 FormData，上傳檔案必須由瀏覽器自動帶入 multipart/form-data 與 boundary
        const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData

        // 先移除之前可能殘留的 Content-Type，避免覆寫 axios 對 FormData 的自動設定
        if (isFormData) {
            if (config.headers) {
                delete config.headers['Content-Type']
            }
        } else {
            // 針對一般 JSON 物件才設定 Content-Type: application/json
            const method = (config.method || 'get').toLowerCase()
            const hasBodyMethod = ['post', 'put', 'patch', 'delete'].includes(method)
            const isPlainObject = config.data && Object.prototype.toString.call(config.data) === '[object Object]'
            if (hasBodyMethod && isPlainObject) {
                config.headers = config.headers || {}
                config.headers['Content-Type'] = 'application/json'
            } else {
                // 其他情況不強制設置，交由 axios/瀏覽器處理（例如 URLSearchParams、ArrayBuffer...）
                if (config.headers) {
                    delete config.headers['Content-Type']
                }
            }
        }

        // 這裡可選擇性加入 JWT Token（目前停用）
        // try {
        //   const token = localStorage.getItem('token')
        //   if (token) { config.headers = config.headers || {}; config.headers['Authorization'] = `Bearer ${token}` }
        // } catch {}

        return config
    },
    (error) => Promise.reject(error)
)

// 響應攔截器 - 目前僅傳回錯誤
http.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error)
    }
)

export default http
