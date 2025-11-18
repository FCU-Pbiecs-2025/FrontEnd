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
