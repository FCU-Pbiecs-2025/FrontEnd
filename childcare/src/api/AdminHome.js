// 使用既有 axios 實例來呼叫後端 Admin Home 相關 API
// 透過 Vite proxy，baseURL '/api' 會被轉發至後端 http://localhost:8080，並移除 /api 前綴
import http from './http'

/**
 * 取得待辦事項數量
 * @returns {Promise<{pending: number, revoke: number}>} 待審核與撤銷申請數量
 */
export function getTodoCounts() {
  return http.get('/adminhome/todo-counts').then(res => res.data)
}

/**
 * 取得後台公告清單
 * @returns {Promise<Array<AnnouncementSummaryDTO>>} 公告陣列
 * @typedef {Object} AnnouncementSummaryDTO - 後台公告摘要 DTO（對應資料庫 Announcement 資料表）
 * @property {string} announcementID - 公告 ID (PK, uniqueidentifier, UUID 格式)
 * @property {string} title - 公告標題 (nvarchar(100), Null)
 * @property {string} content - 公告內容 (nvarchar(max), Null)
 * @property {string} type - 公告類型 (tinyint, Null)
 * @property {string} startDate - 開始日期 (date, Null, ISO format: "YYYY-MM-DD")
 * @property {string} endDate - 結束日期 (date, Null, ISO format: "YYYY-MM-DD")
 * @property {number} status - 公告狀態 (tinyint, Null)
 * @property {string} createdUser - 建立者 (nvarchar(50), Null)
 * @property {string} createdTime - 建立時間 (datetime2(7), Null)
 * @property {string} updatedUser - 更新者 (nvarchar(50), Null)
 * @property {string} updatedTime - 更新時間 (datetime2(7), Null)
 * @property {string} attachmentPath - 附件路徑 (nvarchar(max), Null)
 */
export function getAdminAnnouncements() {
  return http.get('/adminhome/announcements').then(res => res.data)
}

