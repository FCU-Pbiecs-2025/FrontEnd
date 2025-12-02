import http from './http.js';


/**
 * 建立新家長資訊記錄
 *
 * HTTP 方法: POST
 * 端點路徑: /parent-info
 * 內容類型: application/json
 *
 * 功能描述: 建立一筆新的家長資訊記錄。系統會將提交的 ParentInfo 物件儲存到資料庫。
 *
 * 請求參數:
 *   - parentID (UUID): 家長唯一識別碼 [必需]
 *   - nationalID (String): 身分證號（最長20字） [必需]
 *   - name (String): 姓名（最長50字） [必需]
 *   - gender (Boolean): 性別（true=男, false=女）
 *   - relationship (String): 與幼兒關係（最長15字）
 *   - occupation (String): 職業（最長15字）
 *   - phoneNumber (String): 電話號碼（最長15字）
 *   - householdAddress (String): 戶籍地址（最長200字）
 *   - mailingAddress (String): 通訊地址（最長200字）
 *   - email (String): 電子郵件（最長100字）
 *   - birthDate (LocalDate): 出生日期（格式：yyyy-MM-dd）
 *   - isSuspended (Boolean): 是否停權
 *   - suspendEnd (LocalDate): 停權結束日期（格式：yyyy-MM-dd）
 *   - familyInfoID (UUID): 家庭資訊ID（外鍵參照）
 *
 * 成功回應 (200 OK): 返回建立成功的 ParentInfo 物件，包含所有欄位。
 *
 * 錯誤回應:
 *   - 400 Bad Request: 請求格式不正確或必需欄位缺失
 *   - 409 Conflict: ParentID 已存在（主鍵衝突）
 *   - 500 Internal Server Error: 資料庫錯誤
 *
 * @param {Object} parentInfo - ParentInfo 物件，包含所有家長資訊
 * @param {string} familyInfoId - (可選) 家庭資訊ID，若不提供則需在 parentInfo 中提供
 * @returns {Promise<Object>} 返回建立成功的 ParentInfo 物件
 * @throws {Error} 如果請求失敗，拋出錯誤
 */
export const createParentInfo = async (parentInfo, familyInfoId = null) => {
    if (!parentInfo) {
        throw new Error('缺少家長資訊資料');
    }

    // 驗證必需欄位
    if (!parentInfo.parentID) {
        throw new Error('缺少必需欄位：parentID');
    }
    if (!parentInfo.nationalID) {
        throw new Error('缺少必需欄位：nationalID');
    }
    if (!parentInfo.name) {
        throw new Error('缺少必需欄位：name');
    }

    try {
        console.log('========== 📝 [API] 開始建立家長資訊 ==========');
        console.log('家長資訊:', JSON.stringify(parentInfo, null, 2));
        console.log('📥 接收到的 familyInfoId 參數:', familyInfoId);

        // 如果提供了 familyInfoId 參數，則自動添加到 parentInfo 中
        const parentInfoWithFamily = {
            ...parentInfo,
            familyInfoID: familyInfoId || parentInfo.familyInfoID
        };

        console.log('🔑 最終的 familyInfoID:', parentInfoWithFamily.familyInfoID);
        console.log('✅ 最終送出的家長資訊:', JSON.stringify(parentInfoWithFamily, null, 2));

        const response = await http.post('/parent-info', parentInfoWithFamily);

        console.log('========== ✅ 建立成功 ==========');
        console.log('回應:', response.data);

        return response.data;
    } catch (error) {
        console.error('========== ❌ 建立失敗 ==========');
        console.error('錯誤:', error.message);

        if (error.response) {
            console.error('HTTP 狀態碼:', error.response.status);
            console.error('回應頭:', error.response.headers);
            console.error('錯誤數據:', error.response.data);

            // 提供診斷信息
            if (error.response.status === 400) {
                throw new Error(`❌ 請求格式不正確或必需欄位缺失：${error.response.data?.message || ''}`);
            } else if (error.response.status === 409) {
                throw new Error(`❌ ParentID 已存在（主鍵衝突）`);
            } else if (error.response.status === 500) {
                throw new Error(`❌ 伺服器內部錯誤：${error.response.data?.message || ''}`);
            }
        }

        throw error;
    }
};

/**
 * 更新家長資訊記錄
 *
 * HTTP 方法: PUT
 * 端點路徑: /parent-info/{id}
 * 內容類型: application/json
 *
 * 功能描述: 根據 parentID 更新既有的家長資訊記錄。若 ParentID 不存在，系統會建立新記錄；若存在，則覆蓋所有欄位。
 *
 * 路徑參數:
 *   - id (UUID): 要更新的家長 ID [必需]
 *
 * 請求參數 (Body):
 *   同 CREATE API，詳見 createParentInfo 的參數說明。
 *
 * 特殊行為:
 *   - 系統會強制將 parentID 設定為路徑參數中的 id，覆蓋 Body 中的 parentID 值
 *   - 請求 Body 中的所有欄位都會被更新，包括設為 null 的欄位
 *   - 若 ParentID 不存在，會建立新記錄（Upsert 行為）
 *
 * 成功回應 (200 OK): 返回更新後的 ParentInfo 物件，包含所有欄位。
 *
 * 錯誤回應:
 *   - 400 Bad Request: 請求格式不正確或 id 無效
 *   - 500 Internal Server Error: 資料庫錯誤
 *
 * @param {string} id - 要更新的家長 ID（UUID 格式）[必需]
 * @param {Object} parentInfo - 更新後的 ParentInfo 物件
 * @returns {Promise<Object>} 返回更新後的 ParentInfo 物件
 * @throws {Error} 如果請求失敗，拋出錯誤
 */
export const updateParentInfo = async (id, parentInfo) => {
    if (!id) {
        throw new Error('缺少必需參數：id');
    }
    if (!parentInfo) {
        throw new Error('缺少家長資訊資料');
    }

    // 驗證 id 格式（基本的 UUID 驗證）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        throw new Error('無效的家長 ID 格式（必須是 UUID）');
    }

    try {
        console.log('========== 📝 [API] 開始更新家長資訊 ==========');
        console.log('家長 ID:', id);
        console.log('更新資訊:', JSON.stringify(parentInfo, null, 2));

        // 強制將 parentID 設定為路徑參數中的 id
        const updateData = {
            ...parentInfo,
            parentID: id
        };

        const response = await http.put(`/parent-info/${encodeURIComponent(id)}`, updateData);

        console.log('========== ✅ 更新成功 ==========');
        console.log('回應:', response.data);

        return response.data;
    } catch (error) {
        console.error('========== ❌ 更新失敗 ==========');
        console.error('錯誤:', error.message);

        if (error.response) {
            console.error('HTTP 狀態碼:', error.response.status);
            console.error('回應頭:', error.response.headers);
            console.error('錯誤數據:', error.response.data);

            // 提供診斷信息
            if (error.response.status === 400) {
                throw new Error(`❌ 請求格式不正確或 id 無效：${error.response.data?.message || ''}`);
            } else if (error.response.status === 500) {
                throw new Error(`❌ 伺服器內部錯誤：${error.response.data?.message || ''}`);
            }
        }

        throw error;
    }
};

/**
 * 刪除家長資訊記錄
 *
 * HTTP 方法: DELETE
 * 端點路徑: /parent-info/{id}
 * 內容類型: 無（不需要 Request Body）
 *
 * 功能描述: 根據 parentID 刪除指定的家長資訊記錄。刪除後，該家長的所有資訊將從資料庫中永久移除。
 *
 * 路徑參數:
 *   - id (UUID): 要刪除的家長 ID [必需]
 *
 * 特殊行為:
 *   - 刪除操作是不可逆的，記錄刪除後無法恢復
 *   - 若 parentID 不存在，系統不會返回錯誤，仍然返回 204 No Content
 *   - 如果該家長被其他表（如 ApplicationParticipants）作為外鍵參照，刪除可能因為外鍵約束而失敗
 *
 * 成功回應 (204 No Content): 記錄刪除成功，不返回任何內容。
 *
 * 錯誤回應:
 *   - 400 Bad Request: id 無效或格式不正確（非有效的 UUID 格式）
 *   - 500 Internal Server Error: 資料庫刪除操作失敗
 *
 * 注意事項:
 *   - 權限控制: 建議在實際部署中添加認證和授權機制，限制只有管理員或相關人員可進行刪除操作
 *   - 軟刪除考慮: 若需要保留歷史記錄，建議改為軟刪除（添加 isDeleted 標記） 而不是物理刪除
 *   - 審計日誌: 建議記錄所有刪除操作以便日後追蹤和審計
 *   - 外鍵約束: 確保刪除不會違反資料庫的外鍵約束
 *
 * @param {string} id - 要刪除的家長 ID（UUID 格式）[必需]
 * @returns {Promise<void>} 刪除成功無返回值
 * @throws {Error} 如果請求失敗，拋出錯誤
 */
export const deleteParentInfo = async (id) => {
    if (!id) {
        throw new Error('缺少必需參數：id');
    }

    // 驗證 id 格式（基本的 UUID 驗證）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        throw new Error('無效的家長 ID 格式（必須是 UUID）');
    }

    try {
        console.log('========== 🗑️ [API] 開始刪除家長資訊 ==========');
        console.log('家長 ID:', id);

        const response = await http.delete(`/parent-info/${encodeURIComponent(id)}`);

        console.log('========== ✅ 刪除成功 ==========');
        console.log('HTTP 狀態碼:', response.status);

        return response.data;
    } catch (error) {
        console.error('========== ❌ 刪除失敗 ==========');
        console.error('錯誤:', error.message);

        if (error.response) {
            console.error('HTTP 狀態碼:', error.response.status);
            console.error('回應頭:', error.response.headers);
            console.error('錯誤數據:', error.response.data);

            // 提供診斷信息
            if (error.response.status === 400) {
                throw new Error(`❌ id 無效或格式不正確：${error.response.data?.message || ''}`);
            } else if (error.response.status === 500) {
                throw new Error(`❌ 伺服器內部錯誤：${error.response.data?.message || ''}`);
            }
        }

        throw error;
    }
};

/**
 * 根據家庭資訊ID取得所有家長記錄
 *
 * HTTP 方法: GET
 * 端點路徑: /parent-info/family/{familyInfoId}
 * 內容類型: 無（不需要 Request Body）
 *
 * 功能描述: 根據家庭資訊 ID（familyInfoID），查詢該家庭下的所有家長資訊記錄。返回一個包含符合條件的所有 ParentInfo 物件的列表。
 *
 * 路徑參數:
 *   - familyInfoId (UUID): 家庭資訊 ID（外鍵） [必需]
 *
 * 查詢邏輯:
 *   - 系統會查詢 parent_info 表中所有 FamilyInfoID 欄位匹配的記錄
 *   - 返回結果為一個列表，包含所有符合該 familyInfoID 的家長記錄
 *   - 若沒有符合的記錄，返回空列表（不返回 404）
 *
 * 特殊行為:
 *   - 即使沒有查詢到任何記錄，也返回 200 OK，而不是 404 Not Found
 *   - 返回的列表包含該家庭下的所有家長記錄（可能包含多位家長）
 *   - 返回結果不會進行排序，順序由資料庫決定
 *
 * 成功回應 (200 OK): 返回包含所有符合該 familyInfoID 的家長資訊記錄的列表。若無符合記錄，返回空列表 []。
 *
 * 錯誤回應:
 *   - 400 Bad Request: familyInfoId 無效或格式不正確（非有效的 UUID 格式）
 *   - 500 Internal Server Error: 資料庫讀取錯誤
 *
 * 使用場景:
 *   - 查詢特定家庭下的所有家長資訊
 *   - 家庭成員管理系統
 *   - 家庭档案查詢
 *
 * @param {string} familyInfoId - 家庭資訊 ID（UUID 格式）[必需]
 * @returns {Promise<Array>} 返回包含所有符合該 familyInfoID 的 ParentInfo 物件的列表
 * @throws {Error} 如果請求失敗，拋出錯誤
 */
export const getParentsByFamilyId = async (familyInfoId) => {
    if (!familyInfoId) {
        throw new Error('缺少必需參數：familyInfoId');
    }

    // 驗證 familyInfoId 格式（基本的 UUID 驗證）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(familyInfoId)) {
        throw new Error('無效的家庭資訊 ID 格式（必須是 UUID）');
    }

    try {
        console.log('========== 🔍 [API] 開始查詢家長資訊 ==========');
        console.log('家庭資訊 ID:', familyInfoId);

        const response = await http.get(`/parent-info/family/${encodeURIComponent(familyInfoId)}`);

        console.log('========== ✅ 查詢成功 ==========');
        console.log('查詢結果數量:', Array.isArray(response.data) ? response.data.length : 0);
        console.log('回應:', response.data);

        return response.data || [];
    } catch (error) {
        console.error('========== ❌ 查詢失敗 ==========');
        console.error('錯誤:', error.message);

        if (error.response) {
            console.error('HTTP 狀態碼:', error.response.status);
            console.error('回應頭:', error.response.headers);
            console.error('錯誤數據:', error.response.data);

            // 提供診斷信息
            if (error.response.status === 400) {
                throw new Error(`❌ familyInfoId 無效或格式不正確：${error.response.data?.message || ''}`);
            } else if (error.response.status === 500) {
                throw new Error(`❌ 伺服器內部錯誤：${error.response.data?.message || ''}`);
            }
        }

        throw error;
    }
};
