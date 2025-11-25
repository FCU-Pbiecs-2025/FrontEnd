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

/**
 * GET /institutions/offset
 * 取得機構分頁資料
 *
 * @param offset 起始項目索引
 * @param size 每頁大小
 * @return 分頁機構列表及分頁資訊
 *
 * 範例回應:
 * {
 *   "offset": 0,
 *   "size": 10,
 *   "totalPages": 1,
 *   "hasNext": false,
 *   "content": [
 *     {
 *       "institutionID": "e09f1689-17a4-46f7-ae95-160a368147af",
 *       "institutionName": "小天使托嬰中心",
 *       "contactPerson": "陳淑芬",
 *       "address": "台中市西區公益路100號",
 *       "phoneNumber": "04-23456789",
 *       "fax": "04-23456780",
 *       "email": "angel@daycare.com",
 *       "relatedLinks": "https://angel-daycare.com",
 *       "description": "溫馨的托育環境",
 *       "responsiblePerson": "陳建國",
 *       "imagePath": "/images/institution4.jpg",
 *       "createdUser": "admin",
 *       "createdTime": "2025-11-20T22:06:47.46",
 *       "updatedUser": "admin",
 *       "updatedTime": "2025-11-20T22:06:47.46",
 *       "latitude": 24.148000,
 *       "longitude": 120.664000,
 *       "institutionsType": true
 *     }
 *   ],
 *   "totalElements": 4
 * }
 */
export const getInstitutionsWithOffset = async (offset = 0, size = 10) => {
    try {
        const url = '/institutions/offset';
        console.log('[API] getInstitutionsWithOffset request url:', url);
        console.log('[API] getInstitutionsWithOffset params:', { offset, size });

        const response = await http.get(url, {
            params: {
                offset,
                size
            }
        });

        console.log('[API] getInstitutionsWithOffset response.data:', response.data);
        return response.data;
    } catch (error) {
        console.error('獲取機構分頁資料失敗:', error);
        throw error;
    }
};

/**
 * GET /institutions/{id}
 * 根據機構ID獲取機構資料
 *
 * @param id 機構ID
 * @return 機構詳細資訊
 *
 * 範例回應:
 * {
 *   "institutionID": "e09f1689-17a4-46f7-ae95-160a368147af",
 *   "institutionName": "小天使托嬰中心",
 *   "contactPerson": "陳淑芬",
 *   "address": "台中市西區公益路100號",
 *   "phoneNumber": "04-23456789",
 *   "fax": "04-23456780",
 *   "email": "angel@daycare.com",
 *   "relatedLinks": "https://angel-daycare.com",
 *   "description": "溫馨的托育環境",
 *   "responsiblePerson": "陳建國",
 *   "imagePath": "/images/institution4.jpg",
 *   "createdUser": "admin",
 *   "createdTime": "2025-11-20T22:06:47.46",
 *   "updatedUser": "admin",
 *   "updatedTime": "2025-11-20T22:06:47.46",
 *   "latitude": 24.148000,
 *   "longitude": 120.664000,
 *   "institutionsType": true
 * }
 */
export const getInstitutionById = async (id) => {
    if (!id) {
        throw new Error('缺少機構 ID');
    }

    try {
        const url = `/institutions/${id}`;
        console.log('[API] getInstitutionById request url:', url);

        const response = await http.get(url);

        console.log('[API] getInstitutionById response.data:', response.data);
        return response.data;
    } catch (error) {
        console.error('獲取機構資料失敗:', error);
        throw error;
    }
};


/**
 * 更新機構資料（支援圖片上傳）
 *
 * 使用方式1 - 純 JSON 更新（Content-Type: application/json）:
 * PUT /institutions/{id}
 * {
 *   "institutionID": "e09f1689-17a4-46f7-ae95-160a368147af",
 *   "institutionName": "小天使托嬰中心",
 *   "contactPerson": "陳淑芬",
 *   "address": "台中市西區公益路100號",
 *   "phoneNumber": "04-23456789",
 *   "fax": "04-23456780",
 *   "email": "angel@daycare.com",
 *   "description": "溫馨的托育環境",
 *   "responsiblePerson": "陳建國",
 *   "imagePath": "/InstitutionResource/uuid_image.jpg",
 *   "createdUser": "admin",
 *   "createdTime": "2025-11-20T22:06:47.46",
 *   "updatedUser": "admin",
 *   "latitude": 24.148000,
 *   "longitude": 120.664000,
 *   "institutionsType": true
 * }
 *
 * 使用方式2 - 同時上傳圖片（Content-Type: multipart/form-data）:
 * PUT /institutions/{id}
 * - data: 上述 JSON 資料（application/json）
 * - image: 圖片檔案
 *
 * @param id 機構ID
 * @param data 機構 JSON 資料
 * @param image 圖片檔案（可選，File 物件）
 * @return 更新後的機構資訊
 */

export const updateInstitution = async (id, data, image = null) => {
    if (!id) {
        throw new Error('缺少機構 ID');
    }

    if (!data) {
        throw new Error('缺少機構資料');
    }

    try {
        const url = `/institutions/${id}`;
        console.log('[API] updateInstitution request url:', url);
        console.log('[API] updateInstitution data:', data);
        console.log('[API] updateInstitution image:', image);

        let response;

        // 判断是否有图片
        if (image && image instanceof File) {
            // 使用方式2：同时上传图片（Content-Type: multipart/form-data）
            console.log('[API] updateInstitution 使用方式2：multipart/form-data（包含图片）');
            console.log('[API] updateInstitution 包含圖片:', image.name);

            const formData = new FormData();
            formData.append('data', JSON.stringify(data));
            formData.append('image', image);

            response = await http.put(url, formData);
        } else {
            // 使用方式1：纯 JSON 更新（Content-Type: application/json）
            console.log('[API] updateInstitution 使用方式1：application/json（纯JSON）');

            response = await http.put(url, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        console.log('[API] updateInstitution HTTP status:', response.status);
        console.log('[API] updateInstitution response.data:', response.data);
        console.log('[API] updateInstitution 完整回應:', response);
        return response.data;
    } catch (error) {
        console.error('更新機構資料失敗:', error);
        throw error;
    }
};


