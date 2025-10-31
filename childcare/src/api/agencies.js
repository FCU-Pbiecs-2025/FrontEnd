import http from './http.js'

// 獲取所有托育機構列表
export const getAllAgencies = async () => {
    try {
        const response = await http.get('/institutions')
        return response
    } catch (error) {
        console.error('獲取托育機構列表失敗:', error)
        throw error
    }
}

// 根據條件搜尋托育機構
export const searchAgencies = async (searchParams = {}) => {
    try {
        const response = await http.get('/agencies/search', {
            params: searchParams
        })
        return response
    } catch (error) {
        console.error('搜尋托育機構失敗:', error)
        throw error
    }
}

// 根據ID獲取托育機構詳細資訊
export const getAgencyById = async (id) => {
    try {
        const response = await http.get(`/institutions/${id}`)
        return response
    } catch (error) {
        console.error('獲取托育機構詳細資訊失敗:', error)
        throw error
    }
}
