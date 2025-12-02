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

/**
 * 根據 ParticipantID 查詢案件詳情
 *
 * 功能說明：
 * 使用 ParticipantID（參與者ID）直接查詢特定幼兒在某案件中的詳細信息
 * 此方法精確可靠，可以區分同一幼兒的多筆申請
 *
 * 端點: GET /applications/case?participantID=xxx
 *
 * 參數說明:
 * - participantID: 參與者ID（UUID 格式，必需）
 *
 * 功能流程:
 * 1. 根據 ParticipantID 查詢應用程序參與者信息
 * 2. 取得關聯的 ApplicationID
 * 3. 自動讀取該應用的所有附件文件
 * 4. 查詢該案件的所有參與者（家長和幼兒）
 * 5. 申請人資料從 users 表取得
 *
 * 回傳值:
 * - 200 OK - 返回 CaseEditUpdateDTO 包含案件全部信息和所有參與者
 * - 400 Bad Request - 缺少或無效的 participantID 參數
 * - 404 Not Found - 找不到該 participantID 對應的案件
 * - 500 Internal Server Error - 伺服器錯誤
 *
 * 成功回應 (200 OK):
 * {
 *   "caseNumber": 1764427242183,
 *   "applyDate": "2025-11-29",
 *   "identityType": 2,
 *   "institutionId": "e09f1689-17a4-46f7-ae95-160a368147af",
 *   "institutionName": "新竹縣東正社區公共托育家園",
 *   "selectedClass": "小班",
 *   "currentOrder": 1,
 *   "reviewDate": null,
 *   "applicationID": "4286bfa6-fcfd-40d4-afb2-2c16e4dd5eec",
 *   "participantID": "550e8400-e29b-41d4-a716-446655440001",
 *   "user": {
 *     "userID": "4B051688-5751-45EB-A63E-CF6ADE991332",
 *     "name": "李小寶",
 *     "gender": "M",
 *     "nationalID": "E567890123",
 *     "birthDate": "2021-03-15",
 *     "mailingAddress": "台北市大安區仁愛路200號",
 *     "email": null,
 *     "phoneNumber": null
 *   },
 *   "parents": [
 *     {
 *       "participantID": "550e8400-e29b-41d4-a716-446655440002",
 *       "participantType": "家長",
 *       "nationalID": "C345678901",
 *       "name": "李美玲",
 *       "gender": "女",
 *       "relationShip": "母親",
 *       "occupation": "教師",
 *       "phoneNumber": "0934567890",
 *       "householdAddress": "台北市大安區仁愛路200號",
 *       "mailingAddress": "台北市大安區仁愛路200號",
 *       "email": "li@parent.com",
 *       "birthDate": "1990-05-10",
 *       "isSuspended": false,
 *       "suspendEnd": null,
 *       "currentOrder": null,
 *       "status": null,
 *       "reason": null,
 *       "classID": null,
 *       "reviewDate": null
 *     }
 *   ],
 *   "children": [
 *     {
 *       "participantID": "550e8400-e29b-41d4-a716-446655440001",
 *       "participantType": "幼兒",
 *       "nationalID": "E567890123",
 *       "name": "李小寶",
 *       "gender": "男",
 *       "relationShip": null,
 *       "occupation": null,
 *       "phoneNumber": null,
 *       "householdAddress": "台北市大安區仁愛路200號",
 *       "mailingAddress": "台北市大安區仁愛路200號",
 *       "email": null,
 *       "birthDate": "2021-03-15",
 *       "isSuspended": false,
 *       "suspendEnd": null,
 *       "currentOrder": 1,
 *       "status": "審核中",
 *       "reason": null,
 *       "classID": "3A384085-F1A5-4DAC-901A-B8EA1A4A9B72",
 *       "reviewDate": null
 *     }
 *   ],
 *   "attachmentPath": "450b4b86-e5aa-4acd-92de-28d43811fe62_螢幕擷取畫面.png",
 *   "attachmentPath1": null,
 *   "attachmentPath2": null,
 *   "attachmentPath3": null
 * }
 *
 * 使用範例:
 * GET /applications/case?participantID=550e8400-e29b-41d4-a716-446655440001
 */
export const getApplicationCaseByParticipantID = async (participantID) => {
    if (!participantID) {
        throw new Error('缺少參與者ID (ParticipantID)');
    }

    try {
        const url = `/applications/case`;
        const config = {
            params: {
                participantID: participantID
            }
        };

        console.log('[API] getApplicationCaseByParticipantID request url:', url, 'params:', config.params);

        const response = await http.get(url, config);

        console.log('[API] getApplicationCaseByParticipantID response.data:', response.data);
        return response.data;
    } catch (error) {
        console.error(`根據 ParticipantID 查詢案件信息失敗 (participantID: ${participantID}):`, error);
        throw error;
    }
};
