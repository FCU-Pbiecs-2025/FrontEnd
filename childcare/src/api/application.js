import http from './http.js';

// ===== 代碼映射表 =====

// 身分別代碼映射表
export const IDENTITY_TYPE_MAP = {
  0: '一般民眾',
  1: '低收入戶',
  2: '中低收入戶'
};

// 案件狀態代碼映射表
export const CASE_STATUS_MAP = {
  '1': '審核中',
  '2': '需要補件',
  '3': '已退件',
  '4': '錄取候補中',
  '5': '撤銷申請審核中',
  '6': '撤銷申請通過',
  '7': '已退托',
  '8': '已錄取'
};

// ===== API 函數 =====

// 獲取分頁申請資料
export const getApplicationsByOffset = async (offset = 0, size = 10) => {
    try {
        const url = `/applications/offset?offset=${offset}&size=${size}`;
        const response = await http.get(url);
        return response.data;
    } catch (error) {
        console.error('獲取申請資料失敗:', error);
        throw error;
    }
};

// 獲取申請資料（帶查詢條件）
export const searchApplications = async (params) => {
    try {
        const query = new URLSearchParams(params).toString();
        const url = `/applications/search?${query}`;
        const response = await http.get(url);
        return response.data;
    } catch (error) {
        console.error('查詢申請資料失敗:', error);
        throw error;
    }
};

// 透過申請編號取得單一申請資料
// GET /applications/{id}，可選 query `nationalID`
export const getApplicationById = async (id, nationalID) => {
    if (!id && id !== 0) {
        throw new Error('缺少 application id');
    }
    const url = `/applications/${encodeURIComponent(id)}`;
    const config = nationalID ? { params: { NationalID: nationalID, nationalID: nationalID } } : undefined;
    try {
        const response = await http.get(url, config);
        return response.data;
    } catch (error) {
        console.error(`獲取申請 ${id} 失敗:`, error);
        throw error;
    }
};

// 更新申請案件的審核狀態和備註
// PUT /applications/{id}/case?NationalID={nationalID}&status={statusCode}&reason={reason}
export const updateApplicationCase = async (id, { nationalID, status, reason, children } = {}) => {
    if (!id && id !== 0) {
        throw new Error('缺少 application id');
    }
    const url = `/applications/${encodeURIComponent(id)}/case`;
    const params = {};
    if (nationalID) params.NationalID = nationalID;
    if (status) params.status = status;
    if (reason) params.reason = reason;
    const config = Object.keys(params).length ? { params } : undefined;

    try {
        const body = { children: Array.isArray(children) ? children : [] };
        const response = await http.put(url, body, config);
        return response.data;
    } catch (error) {
        console.error(`更新申請案件 ${id} 失敗:`, error);
        throw error;
    }
};

// 取得使用者申請詳細資訊
// GET /applications/user/{userID}/details
// @param {string} userID - 使用者身分證字號
// @returns {Promise<Object>} 使用者申請詳細資訊
export const getUserApplicationDetails = async (userID) => {
    if (!userID) {
        throw new Error('缺少 userID');
    }
    try {
        const url = `/applications/user/${encodeURIComponent(userID)}/details`;
        const response = await http.get(url);
        return response.data;
    } catch (error) {
        console.error(`獲取使用者 ${userID} 申請詳細資訊失敗:`, error);
        throw error;
    }
};

// 取得特定案件的詳細資料
// GET /user/{userID}/details
// @param {string} userID - 使用者ID
// @param {string} caseNo - 案件編號 (可選)
// @returns {Promise<Object>} 案件詳細資訊
export const getCaseDetails = async (userID, caseNo) => {
    if (!userID) {
        throw new Error('缺少 userID');
    }
    try {
        const url = `/user/${encodeURIComponent(userID)}/details`;
        const params = caseNo ? { caseNo } : {};
        const response = await http.get(url, { params });
        return response.data;
    } catch (error) {
        console.error(`獲取案件詳細資訊失敗:`, error);
        throw error;
    }
};

// 取得案件列表（分頁查詢）
// GET /applications/cases/list
// 根據條件查詢多個案件的摘要信息，支持分頁、狀態篩選、機構篩選
// @param {Object} options - 查詢選項
// @param {number} options.offset - 分頁起始位置（0-based），預設值：0
// @param {number} options.size - 每頁筆數，最大不超過 100，預設值：10
// @param {string} options.status - 審核狀態篩選
// @param {string} options.institutionId - 機構UUID篩選
// @param {string} options.applicationId - 案件ID篩選
// @param {string} options.classId - 班級ID篩選
// @param {string} options.applicantNationalId - 申請人身分證字號篩選
// @param {number} options.caseNumber - 案件流水號篩選
// @param {string} options.identityType - 身分別篩選（0=一般戶、1=低收入戶、2=中低收入戶）
// @returns {Promise<Object>} 回應數據，包含 content、offset、size、totalElements、totalPages、hasNext
export const getApplicationsCasesList = async (options = {}) => {
    try {
        const params = {};

        // 設定分頁參數，使用預設值
        const offset = options.offset !== undefined && options.offset !== null ? options.offset : 0;
        const size = options.size !== undefined && options.size !== null ? options.size : 10;

        // 驗證 size 不超過 100
        if (size > 100) {
            console.warn('[API] getApplicationsCasesList: size 超過最大值 100，自動調整為 100');
        }

        params.offset = offset;
        params.size = Math.min(size, 100);

        // 設定篩選參數（非必填，僅在有值時才加入）
        if (options.status) {
            params.status = options.status;
        }
        if (options.institutionId) {
            params.institutionId = options.institutionId;
        }
        if (options.applicationId) {
            params.applicationId = options.applicationId;
        }
        if (options.classId) {
            params.classId = options.classId;
        }
        if (options.applicantNationalId) {
            params.applicantNationalId = options.applicantNationalId;
        }
        if (options.caseNumber) {
            params.caseNumber = options.caseNumber;
        }
        if (options.identityType) {
            params.identityType = options.identityType;
        }

        const query = new URLSearchParams(params).toString();
        const url = query ? `/applications/cases/list?${query}` : '/applications/cases/list';

        console.log('[API] getApplicationsCasesList request url:', url);
        const response = await http.get(url);
        console.log('[API] getApplicationsCasesList response.data:', response.data);
        return response.data;
    } catch (error) {
        console.error('獲取案件列表失敗:', error);
        throw error;
    }
};

