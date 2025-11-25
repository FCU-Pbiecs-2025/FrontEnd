import http from './http';

// 獲取所有機構簡要信息（ID 和名稱）
export const getInstitutionsSimpleAll = async () => {
    try {
        const url = '/institutions/simple/all';
        console.log('[API] getInstitutionsSimpleAll request url:', url);
        const response = await http.get(url);
        console.log('[API] getInstitutionsSimpleAll response.data:', response.data);
        return response.data;
    } catch (error) {
        console.error('獲取機構簡要信息失敗:', error);
        throw error;
    }
};

