import http from './http.js'

/**
 * GET /users-familyInfo/{userID}
 * 根據使用者 ID 取得使用者資料、家庭資訊、父母資訊和子女資訊
 *
 * 範例回應:
 * {
 *     "userID": "b8b2c453-9604-4b2e-b435-c097d141d5c2",
 *     "accountStatus": 1,
 *     "permissionType": 3,
 *     "name": "李美玲",
 *     "gender": false,
 *     "phoneNumber": "0934567890",
 *     "mailingAddress": "台北市大安區仁愛路200號",
 *     "email": "li@parent.com",
 *     "birthDate": "1990-05-10",
 *     "familyInfoID": "47a46f77-b9f4-4454-bf26-35a9ac358a97",
 *     "institutionID": null,
 *     "nationalID": "C345678901",
 *     "children": [
 *         {
 *             "childID": "0e833d77-59f5-47ac-b1ca-cf04fd294407",
 *             "nationalID": "E567890123",
 *             "name": "李小寶",
 *             "gender": true,
 *             "birthDate": "2021-03-15",
 *             "familyInfoID": "47a46f77-b9f4-4454-bf26-35a9ac358a97",
 *             "householdAddress": "台北市大安區仁愛路200號"
 *         }
 *     ],
 *     "parents": [
 *         {
 *             "parentID": "0003ad75-a8de-4ac2-a921-1d3fd5421f37",
 *             "nationalID": "C345678901",
 *             "name": "李美玲",
 *             "gender": false,
 *             "relationship": "母親",
 *             "occupation": "教師",
 *             "phoneNumber": "0934567890",
 *             "householdAddress": "台北市大安區仁愛路200號",
 *             "mailingAddress": "台北市大安區仁愛路200號",
 *             "email": "li@parent.com",
 *             "birthDate": "1990-05-10",
 *             "isSuspended": false,
 *             "suspendEnd": null,
 *             "familyInfoID": "47a46f77-b9f4-4454-bf26-35a9ac358a97"
 *         }
 *     ]
 * }
 * @param userID 使用者 ID
 * @return UserFamilyInfoDTO 包含使用者資料及其家庭成員資訊
 */
export const getUserFamilyInfo = async (userID) => {
    try {
        const response = await http.get(`/users/users-familyInfo/${userID}`)
        return response
    } catch (error) {
        console.error('獲取使用者家庭資訊失敗:', error)
        throw error
    }
}

/**
 * GET /users/{userID}
 * 根據使用者 ID 取得使用者基本資料
 *
 * @param userID 使用者 ID
 * @return 使用者基本資訊
 */
export const getUserById = async (userID) => {
    try {
        const response = await http.get(`/users/${userID}`)
        return response
    } catch (error) {
        console.error('獲取使用者資訊失敗:', error)
        throw error
    }
}

/**
 * GET /users/offset
 * 取得分頁使用者列表
 *
 * @param offset 起始位置
 * @param size 頁面大小
 * @return 分頁使用者列表及分頁資訊
 */
export const getUsersByPage = async (offset = 0, size = 10) => {
    try {
        const response = await http.get('/users/offset', {
            params: {
                offset,
                size
            }
        })
        return response
    } catch (error) {
        console.error('獲取使用者列表失敗:', error)
        throw error
    }
}

/**
 * PUT /users/{userID}
 * 更新使用者資料
 *
 * @param userID 使用者 ID
 * @param userData 使用者資料
 * @return 更新後的使用者資訊
 */
export const updateUser = async (userID, userData) => {
    try {
        const response = await http.put(`/users/${userID}`, userData)
        return response
    } catch (error) {
        console.error('更新使用者資訊失敗:', error)
        throw error
    }
}

/**
 * POST /users/new-member
 * 建立新使用者
 *
 * @param userData 使用者資料
 * @return 建立結果
 */
export const createUser = async (userData) => {
    try {
        const response = await http.post('/users/new-member', userData)
        return response
    } catch (error) {
        console.error('建立使用者失敗:', error)
        throw error
    }
}

/**
 * GET /users/search
 * 搜尋使用者
 *
 * @param params 搜尋參數 (如: account, name, email 等)
 * @return 搜尋結果
 */
export const searchUsers = async (params = {}) => {
    try {
        const response = await http.get('/users/search', {
            params
        })
        return response
    } catch (error) {
        console.error('搜尋使用者失敗:', error)
        throw error
    }
}

