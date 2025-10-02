import http from './http.js'

// 獲取所有公告
export const getAllAnnouncements = () => {
  return http.get('/announcements')
}

// 公告 API 服務
export const announcementsService = {
  // 獲取所有公告
  getAll: () => getAllAnnouncements()
}
