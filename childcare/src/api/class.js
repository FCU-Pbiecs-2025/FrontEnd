import http from './http.js'

// 根據機構ID獲取班級詳細資訊
export const getClassByInstitutionId = async (id) => {
    try {
        return await http.get(`/classes/institution/${id}`)
    } catch (error) {
        console.error('獲取托育機構詳細資訊失敗:', error)
        throw error
    }
}

// 獲取分頁班級資料
export const getClassesByOffset = async (offset = 0, size = 10, institutionId = null) => {
    try {
        let url = `/classes/offset?offset=${offset}&size=${size}`
        if (institutionId) {
            url += `&institutionId=${institutionId}`
        }
        const response = await http.get(url)
        return response.data
    } catch (error) {
        console.error('獲取班級資料失敗:', error)
        throw error
    }
}

// 依機構名稱模糊搜尋 (返回分頁格式)
export const searchInstitutionsByName = async (name) => {
    try {
        const response = await http.get(`/classes/search/institution?name=${encodeURIComponent(name)}`)
        return response.data
    } catch (error) {
        console.error('搜尋機構失敗:', error)
        throw error
    }
}

// 刪除班級
export const deleteClassById = async (classId) => {
    try {
        const response = await http.delete(`/classes/${classId}`)
        return response.data
    } catch (error) {
        console.error('刪除班級失敗:', error)
        throw error
    }
}
// 根據機構ID獲取班級名稱列表
export const getClassNamesByInstitutionId = async (id) => {
    try {
        const url = `/classes/institution/${id}/names`
        console.log('[API] getClassNamesByInstitutionId request url:', url)
        const response = await http.get(url)
        console.log('[API] getClassNamesByInstitutionId response.data:', response.data)
        return response.data
    } catch (error) {
        console.error('獲取班級名稱列表失敗:', error)
        throw error
    }
}

