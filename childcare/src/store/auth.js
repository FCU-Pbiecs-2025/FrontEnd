import { defineStore } from 'pinia'
import { login, logout } from '../api/auth.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null, // JWT or session token
    user: {
      UserID: null, // 對應 users 資料表的 UserID
      PermissionType: null, // 權限類型
      Name: '', // 使用者名稱
    },
    isAuthenticated: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && state.isAuthenticated
  },

  actions: {
    async loginUser(account, password, captcha) {
      try {
        const response = await login(account, password, captcha)
        if (response.success) {
          const { user } = response

          // 根據 permissionType 設定對應的 role
          let role = 'general'
          if (user.PermissionType === 1) {
            role = 'super_admin'
          } else if (user.PermissionType === 2) {
            role = 'admin'
          }

          // 設定 token 與 user 資訊
          this.token = response.token || 'user-token'
          this.user = {
            UserID: user.UserID,
            PermissionType: user.PermissionType,
            Name: user.Name,
            role: role // 供路由守衛使用
          }
          this.isAuthenticated = true
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
        this.user = {
          UserID: null,
          PermissionType: null,
          Name: '',
        }
        this.isAuthenticated = false
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
      if (!this.user || !this.user.UserID) {
        throw new Error('找不到使用者帳號')
      }
      try {
        const response = await import('../api/auth.js').then(m => m.changePassword(this.user.UserID, '', newPassword))
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
