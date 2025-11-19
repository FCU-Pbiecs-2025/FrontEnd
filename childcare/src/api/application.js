import http from './http.js';

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

// 新增：透過申請編號取得單一申請資料
// 透過申請編號與身分證取得單一申請資料（POST，參數放在 body，API url 改為 /applications/search）
export const getApplicationById = async (id, nationalID) => {
    if (!id && id !== 0) {
        throw new Error('缺少 application id');
    }
    const url = '/applications/search';
    const body = { applicationId: id, nationalID };
    try {
        const response = await http.post(url, body);
        return response.data;
    } catch (error) {
        console.error(`獲取申請 ${id} 失敗:`, error);
        throw error;
    }
};
