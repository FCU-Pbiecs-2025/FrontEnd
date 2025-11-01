import { defineStore } from 'pinia'
import { login, logout } from '../api/auth.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // token: localStorage.getItem('token') || null,
    token: null, // disabled JWT persistence
    user: null,
    isAuthenticated: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && state.isAuthenticated
  },

  actions: {
    async loginUser(account, password, captcha) {
      try {
        const response = await login(account, password, captcha)
        // 根據後端格式直接回傳
        if (response.success) {
          const { user } = response

          // 根據 permissionType 設定對應的 role
          let role = 'general'
          if (user.permissionType === 1) {
            role = 'super_admin'
          } else if (user.permissionType === 2) {
            role = 'admin'
          }

          // temporarily disable token persistence (do not store token)
          this.token = 'user-token'
          this.user = {
            ...user,
            role: role // 設定 role 供路由守衛使用
          }
          this.isAuthenticated = true
          // localStorage.setItem('token', token)
          // localStorage.setItem('user', JSON.stringify(user))
          return { success: true }
        } else {
          return {
            success: false,
            message: response.message || '登入失敗'
          }
        }
      } catch (error) {
        console.error('Login failed:', error)
        return {
          success: false,
          message: error.response?.data?.message || '登入失敗'
        }
      }
    },

    async logoutUser() {
      try {
        await logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.token = null
        this.user = null
        this.isAuthenticated = false

        // 清除 localStorage - disabled
        // localStorage.removeItem('token')
        // localStorage.removeItem('user')
      }
    },

    async initializeAuth() {
      // Disabled: do not read token from localStorage
      // const token = localStorage.getItem('token')
      // const user = localStorage.getItem('user')

      // if (token && user) {
      //   this.token = token
      //   this.user = JSON.parse(user)
      //   this.isAuthenticated = true

      //   // 驗證 token 是否仍有效
      //   try {
      //     await getUserInfo()
      //   } catch (error) {
      //     console.error('Token validation failed:', error)
      //     this.logoutUser()
      //   }
      // }
    },

    async changePassword(newPassword) {
      if (!this.user || !this.user.account) {
        throw new Error('找不到使用者帳號')
      }
      // 若有舊密碼需求可擴充
      try {
        const response = await import('../api/auth.js').then(m => m.changePassword(this.user.account, '', newPassword))
        if (response.success) {
          return { success: true }
        } else {
          throw new Error(response.message || '密碼修改失敗')
        }
      } catch (error) {
        throw error
      }
    }
  }
})
