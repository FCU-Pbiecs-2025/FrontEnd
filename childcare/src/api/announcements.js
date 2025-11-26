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

// 刪除公告
export const deleteAnnouncement = (id) => {
  return http.delete(`/announcements/${id}`)
}

// 新增公告
export const createAnnouncement = (data) => {
  return http.post('/announcements', data)
}

// 更新公告
export const updateAnnouncement = (id, data) => {
  return http.put(`/announcements/${id}`, data)
}
