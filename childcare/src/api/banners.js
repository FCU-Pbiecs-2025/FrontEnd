import http from './http'

export default {
  list() {
    return http.get('/banners')
  },
    active() {
        return http.get('/banners/active')
    },
  // List with offset pagination: GET /banners/offset?offset=0&size=10
  listPaged(offset = 0, size) {
    const params = {}
    if (typeof offset !== 'undefined' && offset !== null) params.offset = offset
    if (typeof size !== 'undefined' && size !== null) params.size = size
    return http.get('/banners/offset', { params })
  },
  // Query with date range and pagination: GET /banners/query?startDate=2024-01-01&endDate=2024-12-31&offset=0&size=10
  queryByDateRange(startDate, endDate, offset = 0, size = 10) {
    const params = { offset, size }
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return http.get('/banners/query', { params })
  },
  get(id) {
    return http.get(`/banners/${id}`)
  },
  // Create using JSON body (no file)
  create(meta) {
    return http.post('/banners', meta)
  },
  // Upload file + optional meta using multipart/form-data
  upload(formData) {
    // Do NOT set Content-Type manually for multipart/form-data; let the browser add the correct boundary
    return http.post('/banners/upload', formData)
  },
  // Update: accept either a plain object (JSON) or FormData (for file replacement)
  update(id, payload) {
    if (payload instanceof FormData) {
      // Let browser set Content-Type for FormData
      return http.put(`/banners/${id}`, payload)
    }
    return http.put(`/banners/${id}`, payload)
  },
  remove(id) {
    return http.delete(`/banners/${id}`)
  },
  // helper to build image URL using axios baseURL and backend static path
  imageUrl(imageName) {
    if (!imageName) return ''
    const build = (base) => `${base.replace(/\/$/, '')}/BannerResource/${imageName}`
    const base = (http && http.defaults && http.defaults.baseURL) ? http.defaults.baseURL : ''
    // If base is '/api' (dev proxy), return proxied path '/api/BannerResource/{name}'
    if (base === '/api' || base === '/api/') return `/api/BannerResource/${imageName}`
    // If base is absolute URL
    if (/^https?:\/\//i.test(base)) return build(base)
    // If base is relative but not empty
    if (base) return build(base)
    // Fallback to root (no proxy)
    return `/BannerResource/${imageName}`
  }
}
