import http from './http.js'

// 獲取所有公告
export const getAllAnnouncements = () => {
  return http.get('/announcements/summary').then(res => res.data)
}

// 獲取分頁公告
export const getAnnouncementsByOffset = (offset = 0) => {
  return http.get(`/announcements/offset?offset=${offset}`).then(res => res.data)
}

export const getAnnouncementDetail = (id) => {
    return http.get(`/announcements/${id}`).then(res => res.data)
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

// 獲取後台公告
export const getBackendAnnouncements = () => {
    return http.get('/announcements/active/backend').then(res => res.data)
}

// 下載公告附件
export const downloadAnnouncementAttachment = async (announcementId) => {
    return http.get(`/announcements/${announcementId}/attachment`, {
        responseType: 'blob'
    })
}

