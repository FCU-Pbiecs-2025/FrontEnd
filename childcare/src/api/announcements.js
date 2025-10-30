import http from './http.js'

// 獲取所有公告
export const getAllAnnouncements = () => {
  return http.get('/announcements/summary')
}

export const getAnnouncementDetail = (id) => {
    return http.get(`/announcements/${id}`)
}