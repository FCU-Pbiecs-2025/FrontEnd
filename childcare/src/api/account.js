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
 *   2 = 停用
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
 * GET /users/search2
 * 依帳號關鍵字搜尋使用者（支援 offset 分頁）
 *
 * @param account 帳號關鍵字
 * @param offset 起始位置
 * @param size 頁面大小
 * @return 分頁使用者列表及分頁資訊
 */
export const searchUsersByAccount = async (account, offset = 0, size = 10) => {
  try {
    const response = await http.get('/users/search2', {
      params: {
        account,
        offset,
        size
      }
    });
    return response.data;
  } catch (error) {
    console.error('搜尋使用者失敗:', error);
    throw error;
  }
};

/**
 * GET /users/SEARCH3
 * 依帳號關鍵字搜尋民眾帳號 (permissionType = 3)（支援 offset 分頁）
 *
 * @param account 帳號關鍵字（可選，為空時查詢所有民眾帳號）
 * @param offset 起始位置
 * @param size 頁面大小
 * @return 分頁民眾帳號列表及分頁資訊
 *
 * 範例回應:
 * {
 *   "offset": 0,
 *   "size": 10,
 *   "totalPages": 1,
 *   "hasNext": false,
 *   "content": [
 *     {
 *       "userID": "c6948f8d-de54-40ba-9bb8-18dec3880c5b",
 *       "account": "citizen001",
 *       "institutionName": null,
 *       "permissionType": 3,
 *       "accountStatus": 1
 *     }
 *   ],
 *   "totalElements": 1
 * }
 */
export const searchCitizenUsersByAccount = async (account = '', offset = 0, size = 10) => {
  try {
    const response = await http.get('/users/SEARCH3', {
      params: {
        account,
        offset,
        size
      }
    });
    return response.data;
  } catch (error) {
    console.error('搜尋民眾帳號失敗:', error);
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
 * GET /users/search
 * 模糊查詢使用者，支援分頁
 * 搜尋帳號、姓名、信箱、機構名稱
 *
 * @param searchTerm 搜尋關鍵字（可選，為空時返回一般分頁結果）
 * @param offset 起始位置
 * @param size 頁面大小
 * @return 搜尋結果及分頁資訊
 *
 * 範例回應:
 * {
 *   "offset": 0,
 *   "size": 10,
 *   "totalPages": 1,
 *   "hasNext": false,
 *   "searchTerm": "王",
 *   "content": [
 *     {
 *       "userID": "86c23732-ce0d-4ec7-93d5-048faee27d4b",
 *       "account": "wang001",
 *       "institutionName": "小天使托嬰中心",
 *       "permissionType": 2,
 *       "accountStatus": 1
 *     }
 *   ],
 *   "totalElements": 1
 * }
 */
export const searchUsers = async (searchTerm = '', offset = 0, size = 10) => {
  try {
    const params = { offset, size };
    if (searchTerm && searchTerm.trim()) {
      params.searchTerm = searchTerm.trim();
    }

    const response = await http.get('/users/search', { params });
    return response.data;
  } catch (error) {
    console.error('搜尋使用者失敗:', error);
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
    1: '啟用',
    2: '停用'
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

