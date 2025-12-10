import http from './http.js';

/**
 * GET /users/offset
 * 後台帳號管理頁面使用
 * 以 offset 分頁方式取得使用者列表
 *
 * @param offset 起始位置
 * @param size 頁面大小
 * @return 分頁使用者列表及分頁資訊
 *
 * permissionType:
 *   1 = 管理員
 *   2 = 機構人員
 *   3 = 一般使用者
 *
 * accountStatus:
 *   1 = 啟用
 *   0 = 停用
 *
 * 範例回應:
 * {
 *   "offset": 0,
 *   "size": 10,
 *   "totalPages": 1,
 *   "hasNext": false,
 *   "content": [
 *     {
 *       "userID": "86c23732-ce0d-4ec7-93d5-048faee27d4b",
 *       "account": "inst001",
 *       "institutionName": "小天使托嬰中心",
 *       "permissionType": 2,
 *       "accountStatus": 1
 *     },
 *     {
 *       "userID": "c6948f8d-de54-40ba-9bb8-18dec3880c5b",
 *       "account": "parent002",
 *       "institutionName": null,
 *       "permissionType": 3,
 *       "accountStatus": 1
 *     }
 *   ],
 *   "totalElements": 4
 * }
 */
export const getUsersWithOffset = async (offset = 0, size = 10) => {
  try {
    const response = await http.get('/users/offset', {
      params: {
        offset,
        size
      }
    });
    return response.data;
  } catch (error) {
    console.error('獲取使用者列表失敗:', error);
    throw error;
  }
};

/**
 * GET /users/{id}
 * 依使用者 ID 取得使用者資料
 *
 * @param id 使用者ID
 * @return 使用者資料
 *
 * 範例回應:
 * {
 *   "userID": "86c23732-ce0d-4ec7-93d5-048faee27d4b",
 *   "account": "inst001",
 *   "password": "$2a$10$xYzHashedPasswordExample2234567890",
 *   "accountStatus": 1,
 *   "permissionType": 2,
 *   "name": "王小明",
 *   "gender": true,
 *   "phoneNumber": "0923456789",
 *   "mailingAddress": "台北市中正區重慶南路一段100號",
 *   "email": "wang@institution.com",
 *   "birthDate": "1985-03-20",
 *   "familyInfoID": "6659e1bc-a2ea-4bd2-854f-4141ba6ad924",
 *   "institutionID": "e09f1689-17a4-46f7-ae95-160a368147af",
 *   "nationalID": "B234567890"
 * }
 */
export const getUserById = async (id) => {
  if (!id) {
    throw new Error('缺少使用者 ID');
  }

  try {
    const response = await http.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('獲取使用者資料失敗:', error);
    throw error;
  }
};

/**
 * PUT /users/{id}
 * 更新使用者資料
 *
 * @param id 使用者ID
 * @param user 使用者資料
 * @return 更新後的使用者資料
 *
 * body 範例:
 * {
 *   "userID": "86c23732-ce0d-4ec7-93d5-048faee27d4b",
 *   "account": "inst001",
 *   "password": "$2a$10$xYzHashedPasswordExample2234567890",
 *   "accountStatus": 1,
 *   "permissionType": 1,
 *   "name": "王小明",
 *   "gender": true,
 *   "phoneNumber": "0923456789",
 *   "mailingAddress": "台北市中正區重慶南路一段100號",
 *   "email": "wang@institution.com",
 *   "birthDate": "1985-03-20",
 *   "familyInfoID": "6659e1bc-a2ea-4bd2-854f-4141ba6ad924",
 *   "institutionID": "e09f1689-17a4-46f7-ae95-160a368147af",
 *   "nationalID": "B234567890"
 * }
 */
export const updateUser = async (id, user) => {
  if (!id) {
    throw new Error('缺少使用者 ID');
  }

  if (!user) {
    throw new Error('缺少使用者資料');
  }

  try {
    const response = await http.put(`/users/${id}`, user);
    return response.data;
  } catch (error) {
    console.error('更新使用者資料失敗:', error);
    throw error;
  }
};

/**
 * POST /users/new-member
 * 註冊新使用者
 *
 * @param user 使用者資料
 * @return 註冊結果
 *
 * body 範例:
 * {
 *   "account": "inst001",
 *   "password": "$2a$10$xYzHashedPasswordExample2234567890",
 *   "accountStatus": 1,
 *   "permissionType": 1,
 *   "name": "王小明",
 *   "gender": true,
 *   "phoneNumber": "0923456789",
 *   "mailingAddress": "台北市中正區重慶南路一段100號",
 *   "email": "wang@institution.com",
 *   "birthDate": "1985-03-20",
 *   "familyInfoID": "6659e1bc-a2ea-4bd2-854f-4141ba6ad924",
 *   "institutionID": "e09f1689-17a4-46f7-ae95-160a368147af",
 *   "nationalID": "B234567890"
 * }
 */
export const createUser = async (user) => {
  if (!user) {
    throw new Error('缺少使用者資料');
  }

  if (!user.account) {
    throw new Error('缺少帳號');
  }

  if (!user.password) {
    throw new Error('缺少密碼');
  }

  try {
    const response = await http.post('/users/new-member', user);
    return response.data;
  } catch (error) {
    console.error('註冊使用者失敗:', error);
    throw error;
  }
};

/**
 * 輔助函數：取得權限類型的中文名稱
 * @param permissionType 權限類型代碼
 * @return 權限類型中文名稱
 */
export const getPermissionTypeName = (permissionType) => {
  const permissionMap = {
    1: '管理員',
    2: '機構人員',
    3: '一般使用者'
  };
  return permissionMap[permissionType] || '未知';
};

/**
 * 輔助函數：取得帳號狀態的中文名稱
 * @param accountStatus 帳號狀態代碼
 * @return 帳號狀態中文名稱
 */
export const getAccountStatusName = (accountStatus) => {
  const statusMap = {
    2: '停用',
    1: '啟用'
  };
  return statusMap[accountStatus] || '未知';
};

/**
 * 輔助函數：取得性別的中文名稱
 * @param gender 性別（true=男, false=女）
 * @return 性別中文名稱
 */
export const getGenderName = (gender) => {
  if (gender === true || gender === 1 || gender === '男') return '男';
  if (gender === false || gender === 0 || gender === '女') return '女';
  return '未知';
};

