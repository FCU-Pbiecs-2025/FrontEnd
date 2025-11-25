import http from './http.js';


// / /**
// *
// * 個案管理編輯頁面使用
// * GET - 根據幼兒身分證字號查詢案件並自動讀取檔案列表
// * 個案管理編輯.vue使用
// * 端點: GET /applications/case?childrenNationalID=xxx
//     *
//     * @param childrenNationalID 幼兒身分證字號（查詢參數，增加隱私性）
// * @return CaseEditUpdateDTO（包含檔案列表）或 404 Not Found
// *
// * 功能流程:
// * 1. 根據幼兒身分證字號查詢案件信息
// * 2. 使用查詢到的 applicationId 掃描 IdentityResource/{applicationId}/ 文件夾
// * 3. 如果文件夾不存在 → files 返回空陣列 []
// * 4. 如果文件夾存在 → 讀取所有檔案名稱到 files 陣列
// *
// * 成功回應 (200 OK):
// * {
// *   "caseNumber": 1,
// *   "applyDate": "2025-01-15",
// *   "identityType": 1,
// *   "institutionId": "550e8400-e29b-41d4-a716-446655440000",
// *   "institutionName": "台北市立幼兒園",
// *   "selectedClass": "小班A",
// *   "currentOrder": 5,
// *   "reviewDate": "2025-01-20T10:00:00",
// *   "applicationID": "550e8400-e29b-41d4-a716-446655440001",
// *   "User": { ... },
// *   "parents": [ ... ],
// *   "children": [ ... ],
// *   "files": ["證明文件1.pdf", "身份證掃描.jpg"]
//     * }
// *
// * 錯誤回應:
//     * - 400 Bad Request - 缺少或無效的 childrenNationalID 參數
// * - 404 Not Found - 找不到該幼兒身分證字號對應的案件
// *
// * 使用範例:
// * GET /applications/case?childrenNationalID=H123456789
//     */
export const getApplicationCaseByChildrenId = async (childrenNationalID) => {
    if (!childrenNationalID) {
        throw new Error('缺少幼兒身分證字號');
    }

    try {
        // 使用查詢參數方式調用 API
        const url = `/applications/case`;
        const config = {
            params: {
                childrenNationalID: childrenNationalID
            }
        };

        console.log('[API] getApplicationCaseByChildrenId request url:', url, 'params:', config.params);

        const response = await http.get(url, config);

        console.log('[API] getApplicationCaseByChildrenId response.data:', response.data);
        return response.data;
    } catch (error) {
        console.error(`查詢案件信息失敗 (childrenNationalID: ${childrenNationalID}):`, error);
        throw error;
    }
};

