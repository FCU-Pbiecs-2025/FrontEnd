import http from './http'

export function getRules() {
  return http.get('/rules')
}

export function updateRule(id, data) {
  return http.put(`/rules/${id}`, data)
}

