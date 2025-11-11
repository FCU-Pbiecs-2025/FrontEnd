import http from './http.js'

// 獲取所有公告
export const getAllAnnouncements = () => {
  return http.get('/announcements/summary')
}

// 獲取分頁公告
export const getAnnouncementsByOffset = (offset = 0) => {
  return http.get(`/announcements/offset?offset=${offset}`)
}

export const getAnnouncementDetail = (id) => {
    return http.get(`/announcements/${id}`)
}