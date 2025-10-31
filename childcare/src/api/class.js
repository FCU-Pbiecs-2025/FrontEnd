import http from './http.js'

// 根據機構ID獲取班級詳細資訊
export const getClassByInstitutionId = async (id) => {
    try {
        const response = await http.get(`/classes/institution/${id}`)
        return response
    } catch (error) {
        console.error('獲取托育機構詳細資訊失敗:', error)
        throw error
    }
}
