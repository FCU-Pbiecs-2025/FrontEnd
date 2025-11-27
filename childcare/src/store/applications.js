import { defineStore } from 'pinia'

export const useApplicationsStore = defineStore('applications', {
  state: () => ({
    // 所有申請資料
    applications: [],
    // 當前選中的申請資料（用於跳轉到詳情頁）
    selectedApplication: null,
    // 載入狀態
    loading: false,
    // 錯誤訊息
    error: null
  }),

  getters: {
    // 根據 applicationID 查找特定申請
    getApplicationById: (state) => (id) => {
      return state.applications.find(app => app.applicationID === id)
    },

    // 取得所有申請的數量
    applicationsCount: (state) => state.applications.length,

    // 檢查是否有選中的申請
    hasSelectedApplication: (state) => !!state.selectedApplication
  },

  actions: {
    // 設定所有申請資料
    setApplications(applications) {
      this.applications = applications
      this.error = null
    },

    // 設定當前選中的申請（跳轉前呼叫）
    setSelectedApplication(application) {
      this.selectedApplication = application
    },

    // 清除選中的申請
    clearSelectedApplication() {
      this.selectedApplication = null
    },

    // 設定載入狀態
    setLoading(loading) {
      this.loading = loading
    },

    // 設定錯誤訊息
    setError(error) {
      this.error = error
    },

    // 清除錯誤訊息
    clearError() {
      this.error = null
    },

    // 重置整個 store
    reset() {
      this.applications = []
      this.selectedApplication = null
      this.loading = false
      this.error = null
    }
  }
})
