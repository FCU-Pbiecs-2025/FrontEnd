import http from './http.js';

// ===== 代碼映射表 =====

// 身分別代碼映射表
export const IDENTITY_TYPE_MAP = {
  1: '第一序位',
  2: '第二序位',
  3: '第三序位'
};

// 案件狀態代碼映射表
export const CASE_STATUS_MAP = {
  '1': '審核中',
  '2': '需要補件',
  '3': '已退件',
  '4': '候補中',
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

/**
 * 取得案件列表（分頁）
 *個案管理列表 以及 其查詢卡片使用
 * @param offset 分頁起始位置（預設: 0）
 * @param size 每頁筆數（預設: 10）
 * @param status 審核狀態篩選（可選）
 * @param institutionId 機構ID篩選（可選）
 * @param applicationId 案件ID篩選（可選）
 * @param classId 班級ID篩選（可選）
 * @param childNationalId 申請之幼兒身分證字號篩選（可選）
 * @param caseNumber 案件流水號篩選（可選）
 * @param identityType 身分別篩選（可選）
 * @return 包含分頁資訊和案件列表的回應
 */
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
        if (options.childNationalId) {
            params.childNationalId = options.childNationalId;
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

// 提交新的申請案件（包含案件資訊和附件檔案）
// POST /applications/case/submit
//
// 功能說明：
// 1. 接收 CaseEditUpdateDTO 格式的申請資料（JSON）
// 2. 支持上傳最多 4 個附件檔案
// 3. 建立案件資訊並將檔案儲存到 IdentityResource/{applicationID}/ 目錄
// 4. 驗證每個幼兒的 nationalID 總案件數不得超過 2 件
// 5. 返回建立成功的完整案件資訊
//
// 驗證規則：
//  - 每個幼兒的身分證字號（nationalID）在系統中的總申請案件數不得超過 2 件
//  - 若超過限制，將返回 400 Bad Request 並說明錯誤訊息
//
// 回傳值：
//  - 200 OK + 完整的 CaseEditUpdateDTO（包含自動設置的 applicationID、attachmentPath 等）
//  - 400 Bad Request + 錯誤訊息（當幼兒申請案件數超過限制時）
//  - 500 Internal Server Error + 錯誤訊息（當發生系統錯誤時）
//
// @param {Object} caseData - 案件資訊 (CaseEditUpdateDTO)
// @param {string} caseData.caseNumber - 案件編號
// @param {string} caseData.applyDate - 申請日期 (YYYY-MM-DD)
// @param {number} caseData.identityType - 身分別 (0=一般民眾, 1=低收入戶, 2=中低收入戶)
// @param {string} caseData.institutionId - 機構 UUID
// @param {string} caseData.institutionName - 機構名稱
// @param {string} caseData.selectedClass - 選擇的班級 ID
// @param {number} caseData.currentOrder - 序號
// @param {Object} caseData.User - 申請人信息 (UserSimpleDTO)
// @param {Array} caseData.parents - 家長列表
// @param {Array} caseData.children - 幼兒列表
// @param {File} file - 第一個附件檔案 (可選)
// @param {File} file1 - 第二個附件檔案 (可選)
// @param {File} file2 - 第三個附件檔案 (可選)
// @param {File} file3 - 第四個附件檔案 (可選)
// @returns {Promise<Object>} 返回建立成功的完整案件資訊
export const submitApplicationCase = async (caseData, files = {}) => {
    if (!caseData) {
        throw new Error('缺少案件資料');
    }

    try {
        console.log('========== 📋 [API] 開始提交申請案件 ==========');
        console.log('原始 caseData:', JSON.stringify(caseData, null, 2));

        // 轉換 caseData 格式，將前端格式轉換為後端期望的格式
        const transformedCaseData = {
            caseNumber: caseData.caseNumber,
            applyDate: caseData.applyDate,
            identityType: caseData.identityType,
            institutionId: caseData.institutionId,
            institutionName: caseData.institutionName,
            selectedClass: caseData.selectedClass || null,
            currentOrder: caseData.currentOrder || null,
            reviewDate: caseData.reviewDate || null,
            applicationID: caseData.applicationID || null,
            // 轉換 User 為 user，並統一使用小寫駝峰命名
            user: {
                userID: caseData.User?.userID || caseData.User?.UserID || caseData.userID,
                name: caseData.User?.Name,
                gender: caseData.User?.Gender === 'F' ? true : false,
                nationalID: caseData.User?.NationalID,
                birthDate: caseData.User?.BirthDate,
                mailingAddress: caseData.User?.MailingAddress,
                email: caseData.User?.email,
                phoneNumber: caseData.User?.PhoneNumber
            },
            // 轉換 parents 格式
            parents: caseData.parents.map(parent => ({
                participantType: parent.participantType,
                nationalID: parent.nationalID,
                name: parent.name,
                gender: parent.gender === 'F' ? true : false,
                relationShip: parent.relationShip,
                occupation: parent.occupation,
                phoneNumber: parent.phoneNumber,
                householdAddress: parent.householdAddress,
                mailingAddress: parent.mailingAddress,
                email: parent.email,
                birthDate: parent.birthDate,
                isSuspended: parent.isSuspended || false,
                suspendEnd: parent.suspendEnd || null
            })),
            // 轉換 children 格式
            children: caseData.children.map(child => ({
                participantType: child.participantType,
                nationalID: child.nationalID,
                name: child.name,
                gender: child.gender === 'F' ? true : false,
                relationShip: child.relationShip,
                occupation: child.occupation,
                phoneNumber: child.phoneNumber,
                householdAddress: child.householdAddress,
                mailingAddress: child.mailingAddress,
                email: child.email,
                birthDate: child.birthDate,
                isSuspended: child.isSuspended || false,
                suspendEnd: child.suspendEnd || null,
                status: child.status,
                reason: child.reason,
                classID: child.classID,
                reviewDate: child.reviewDate
            })),
            attachmentPath: caseData.attachmentPath,
            attachmentPath1: caseData.attachmentPath1,
            attachmentPath2: caseData.attachmentPath2,
            attachmentPath3: caseData.attachmentPath3
        };

        console.log('轉換後 caseData:', JSON.stringify(transformedCaseData, null, 2));

        // 建立 FormData 對象
        const formData = new FormData();

        // 添加 JSON 案件資訊（作為 Blob，設置正確的 Content-Type）
        const caseDataJson = JSON.stringify(transformedCaseData);
        const caseDataBlob = new Blob([caseDataJson], { type: 'application/json' });
        // ✅ 關鍵修改：後端期望參數名稱為 'caseDto' 而不是 'caseData'
        formData.append('caseDto', caseDataBlob, 'caseDto.json');

        // 添加附件檔案（最多 4 個）
        const fileKeys = ['file', 'file1', 'file2', 'file3'];
        let fileCount = 0;
        fileKeys.forEach(key => {
            if (files[key]) {
                formData.append(key, files[key], files[key].name);
                fileCount++;
                console.log(`📎 附件 ${key}:`, files[key].name, `(${(files[key].size / 1024).toFixed(2)}KB)`);
            }
        });

        console.log('📊 FormData 內容:');
        console.log('  - caseDto: JSON Blob (' + caseDataBlob.size + ' bytes)');
        console.log('  - 附件數:', fileCount);
        console.log('  - userID:', transformedCaseData.user.userID);

        console.log('🚀 發送 POST 到: http://localhost:8080/applications/case/submit');
        console.log('   (透過 Vite proxy: /api/applications/case/submit)');

        const response = await http.post('/applications/case/submit', formData);

        console.log('========== ✅ 提交成功 ==========');
        console.log('回應:', response.data);

        // 返回響應數據
        return response.data;

    } catch (error) {
        console.error('========== ❌ 提交失敗 ==========');
        console.error('錯誤:', error.message);

        if (error.response) {
            console.error('HTTP 狀態碼:', error.response.status);
            console.error('回應頭:', error.response.headers);
            console.error('錯誤數據:', error.response.data);

            // 提供診斷信息
            if (error.response.status === 400) {
                // 400 Bad Request - 通常是驗證失敗（例如幼兒申請案件超過限制）
                const errorMessage = typeof error.response.data === 'string'
                    ? error.response.data
                    : JSON.stringify(error.response.data);
                console.error('❌ 驗證失敗:', errorMessage);
                alert('❌ 提交失敗\n\n' + errorMessage);
            } else if (error.response.status === 500) {
                alert('❌ 提交失敗 (500 Server Error)\n\n' + (error.response.data || '伺服器內部錯誤'));
            } else {
                alert('❌ 提交失敗 (HTTP ' + error.response.status + ')\n\n' + (error.response.data || error.message));
            }
        } else {
            alert('❌ 提交失敗\n\n' + error.message);
        }

        throw error;
    }
};

// 上傳申請附件（最多4個）
// POST /api/applications/:id/attachments
export const uploadApplicationAttachments = async (applicationId, files) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('attachments', file);
    });
    const url = `/api/applications/${encodeURIComponent(applicationId)}/attachments`;
    try {
        const response = await http.post(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error('上傳附件失敗:', error);
        throw error;
    }
};

