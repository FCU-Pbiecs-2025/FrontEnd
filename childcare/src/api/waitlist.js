import http from './http';

/**
 * 候補名單與抽籤 API
 */

/**
 * 執行抽籤
 * POST /waitlist/lottery
 * @param {string} institutionId - 機構 ID（UUID 字串）
 * @param {boolean} isLotteryPeriod - 是否為抽籤期間
 * @returns {Promise} 抽籤結果
 */
export const performLottery = async (institutionId, isLotteryPeriod = true) => {
  try {
    console.log('[API] performLottery 請求參數:', { institutionId, isLotteryPeriod });
    const response = await http.post('/waitlist/lottery', {
      institutionId: institutionId, // 後端需要 UUID 格式的字串
      isLotteryPeriod: isLotteryPeriod
    });
    console.log('[API] performLottery 回應:', response.data);
    return response.data;
  } catch (error) {
    console.error('執行抽籤失敗:', error);
    console.error('錯誤詳情:', error.response?.data);
    throw error;
  }
};

/**
 * 查詢候補名單
 * GET /waitlist/by-institution
 * @param {string} institutionId - 機構 ID
 * @param {string} name - 搜尋名稱（可選）
 * @returns {Promise} 候補名單
 */
export const getWaitlistByInstitution = async (institutionId, name = '') => {
  try {
    const params = { institutionId };
    if (name) {
      params.name = name;
    }
    const response = await http.get('/waitlist/by-institution', { params });
    return response.data;
  } catch (error) {
    console.error('查詢候補名單失敗:', error);
    throw error;
  }
};

/**
 * 查詢統計資訊
 * GET /waitlist/statistics
 * @param {string} institutionId - 機構 ID
 * @returns {Promise} 統計資訊
 */
export const getWaitlistStatistics = async (institutionId) => {
  try {
    const response = await http.get('/waitlist/statistics', {
      params: { institutionId }
    });
    return response.data;
  } catch (error) {
    console.error('查詢統計資訊失敗:', error);
    throw error;
  }
};

/**
 * 重置抽籤（每年 7/31 執行）
 * POST /waitlist/reset-lottery
 * @param {string} institutionId - 機構 ID
 * @returns {Promise} 重置結果
 */
export const resetLottery = async (institutionId) => {
  try {
    const response = await http.post('/waitlist/reset-lottery', null, {
      params: { institutionId }
    });
    return response.data;
  } catch (error) {
    console.error('重置抽籤失敗:', error);
    throw error;
  }
};

