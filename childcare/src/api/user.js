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
 * 更新使用者資料
 *
 * HTTP 方法: PUT
 * 端點路徑: /users/{id}
 * 內容類型: application/json
 *
 * 功能描述: 根據使用者 ID 更新使用者的詳細資料。可更新包括帳號、密碼、姓名、聯絡方式等所有使用者資訊。
 *
 * 路徑參數:
 *   - id (UUID): 要更新的使用者 ID [必需]
 *
 * 請求參數 (Body):
 *   - userID (UUID): 使用者唯一識別碼
 *   - account (String): 帳號
 *   - password (String): 密碼（已加密）
 *   - accountStatus (Integer): 帳號狀態（1=啟用, 0=停用）
 *   - permissionType (Integer): 權限類型（1=機構, 2=管理員, 3=一般使用者）
 *   - name (String): 姓名
 *   - gender (Boolean): 性別（true=男, false=女）
 *   - phoneNumber (String): 電話號碼
 *   - mailingAddress (String): 通訊地址
 *   - email (String): 電子郵件
 *   - birthDate (LocalDate): 出生日期（格式：yyyy-MM-dd）
 *   - familyInfoID (UUID): 家庭資訊ID（外鍵參照）
 *   - institutionID (UUID): 機構ID（外鍵參照）
 *   - nationalID (String): 身分證號
 *
 * 範例資料:
 * {
 *     "userID": "86c23732-ce0d-4ec7-93d5-048faee27d4b",
 *     "account": "inst001",
 *     "password": "$2a$10$xYzHashedPasswordExample2234567890",
 *     "accountStatus": 1,
 *     "permissionType": 1,
 *     "name": "王小明",
 *     "gender": true,
 *     "phoneNumber": "0923456789",
 *     "mailingAddress": "台北市中正區重慶南路一段100號",
 *     "email": "wang@institution.com",
 *     "birthDate": "1985-03-20",
 *     "familyInfoID": "6659e1bc-a2ea-4bd2-854f-4141ba6ad924",
 *     "institutionID": "e09f1689-17a4-46f7-ae95-160a368147af",
 *     "nationalID": "B234567890"
 * }
 *
 * 成功回應 (200 OK): 返回更新後的完整 Users 物件
 *
 * 錯誤回應:
 *   - 400 Bad Request: 請求格式不正確或必需欄位缺失
 *   - 404 Not Found: 使用者 ID 不存在
 *   - 500 Internal Server Error: 資料庫錯誤
 *
 * @param {string} id - 要更新的使用者 ID（UUID 格式）[必需]
 * @param {Object} userData - 使用者資料物件
 * @returns {Promise<Object>} 返回更新後的使用者資料
 * @throws {Error} 如果請求失敗，拋出錯誤
 */
export const updateUser = async (id, userData) => {
    if (!id) {
        throw new Error('缺少必需參數：id');
    }
    if (!userData) {
        throw new Error('缺少使用者資料');
    }

    // 驗證 id 格式（基本的 UUID 驗證）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        throw new Error('無效的使用者 ID 格式（必須是 UUID）');
    }

    try {
        console.log('========== 👤 [API] 開始更新使用者資訊 ==========');
        console.log('使用者 ID:', id);
        console.log('更新資訊:', JSON.stringify(userData, null, 2));

        // 強制將 userID 設定為路徑參數中的 id
        const updateData = {
            ...userData,
            userID: id
        };

        const response = await http.put(`/users/${encodeURIComponent(id)}`, updateData);

        console.log('========== ✅ 更新成功 ==========');
        console.log('回應:', response.data);

        return response;
    } catch (error) {
        console.error('========== ❌ 更新失敗 ==========');
        console.error('錯誤:', error.message);

        if (error.response) {
            console.error('HTTP 狀態碼:', error.response.status);
            console.error('回應頭:', error.response.headers);
            console.error('錯誤數據:', error.response.data);

            // 提供診斷信息
            if (error.response.status === 400) {
                throw new Error(`❌ 請求格式不正確或必需欄位缺失：${error.response.data?.message || ''}`);
            } else if (error.response.status === 404) {
                throw new Error(`❌ 使用者 ID 不存在`);
            } else if (error.response.status === 500) {
                throw new Error(`❌ 伺服器內部錯誤：${error.response.data?.message || ''}`);
            }
        }

        throw error;
    }
}

/**
 * 更新使用者基本資料（僅更新姓名、信箱、電話、地址）
 *
 * HTTP 方法: PUT
 * 端點路徑: /users/{id}/profile
 * 內容類型: application/json
 *
 * 功能描述: 根據使用者 ID 更新使用者的基本資料，僅更新姓名、信箱、電話、地址四個欄位。
 *          使用 JDBC 方式更新，只更新有提供的欄位。
 *
 * 路徑參數:
 *   - id (UUID): 要更新的使用者 ID [必需]
 *
 * 請求參數 (Body):
 *   - name (String): 姓名（選填）
 *   - email (String): 電子郵件（選填）
 *   - phoneNumber (String): 電話號碼（選填）
 *   - mailingAddress (String): 通訊地址（選填）
 *
 * 範例資料:
 * {
 *     "name": "王小明",
 *     "email": "wang@example.com",
 *     "phoneNumber": "0923456789",
 *     "mailingAddress": "台北市中正區重慶南路一段100號"
 * }
 *
 * 成功回應 (200 OK):
 * {
 *     "success": true,
 *     "message": "資料更新成功",
 *     "user": { ...更新後的使用者資料 },
 *     "rowsUpdated": 1
 * }
 *
 * 錯誤回應:
 *   - 404 Not Found: 使用者 ID 不存在
 *   - 500 Internal Server Error: 資料庫錯誤
 *
 * @param {string} id - 要更新的使用者 ID（UUID 格式）[必需]
 * @param {Object} profileData - 要更新的基本資料（name, email, phoneNumber, mailingAddress）
 * @returns {Promise<Object>} 返回更新結果，包含 success、message、user 和 rowsUpdated
 * @throws {Error} 如果請求失敗，拋出錯誤
 */
export const updateUserProfile = async (id, profileData) => {
    if (!id) {
        throw new Error('缺少必需參數：id');
    }
    if (!profileData) {
        throw new Error('缺少要更新的資料');
    }

    // 驗證 id 格式（基本的 UUID 驗證）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        throw new Error('無效的使用者 ID 格式（必須是 UUID）');
    }

    try {
        console.log('========== 👤 [API] 開始更新使用者基本資料 ==========');
        console.log('使用者 ID:', id);
        console.log('更新資料:', JSON.stringify(profileData, null, 2));

        const response = await http.put(`/users/${encodeURIComponent(id)}/profile`, profileData);

        console.log('========== ✅ 更新成功 ==========');
        console.log('回應:', response.data);

        return response;
    } catch (error) {
        console.error('========== ❌ 更新失敗 ==========');
        console.error('錯誤:', error.message);

        if (error.response) {
            console.error('HTTP 狀態碼:', error.response.status);
            console.error('回應頭:', error.response.headers);
            console.error('錯誤數據:', error.response.data);

            // 提供診斷信息
            if (error.response.status === 404) {
                throw new Error(`❌ 使用者 ID 不存在`);
            } else if (error.response.status === 500) {
                throw new Error(`❌ 伺服器內部錯誤：${error.response.data?.message || ''}`);
            }
        }

        throw error;
    }
}

/**
 * PUT /users/{id}/status
 * 只更新 accountStatus 欄位（0 或 1）
 * @param {string} id 用戶 UUID
 * @param {number} accountStatus 0|1
 */
export const updateAccountStatus = async (id, accountStatus) => {
    if (!id) throw new Error('缺少使用者 id')
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) throw new Error('無效的使用者 ID 格式（必須是 UUID）')
    if (accountStatus !== 1 && accountStatus !== 2) throw new Error('accountStatus 必須為 1 (啟用) 或 2 (停用)')

    try {
        console.log('[API] PUT /users/%s/status payload:', id, { accountStatus })
        const response = await http.put(`/users/${encodeURIComponent(id)}/status`, { accountStatus })
        console.log('[API] Response for /users/%s/status:', id, response?.status, response?.data)
        return response.data || response
    } catch (err) {
        console.error('[API] 更新帳號狀態失敗:', err?.message || err)
        if (err?.response) {
            console.error('[API] Error status:', err.response.status)
            console.error('[API] Error data:', err.response.data)
        }
        throw err
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
