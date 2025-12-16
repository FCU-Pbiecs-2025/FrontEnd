import { defineStore } from 'pinia'
import { login, logout } from '../api/auth.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null, // JWT or session token
    user: {
      UserID: null, // 對應 users 資料表的 UserID
      PermissionType: null, // 權限類型
      name: '', // 使用者名稱 (小寫 key 統一)
      account: '', // 帳號
      email: '', // 電子郵件
      phone: '', // 電話
      role: '', // 角色
      InstitutionID: null, // 機構ID (不顯示在UI中)
      FamilyInfoID: null, // 家庭資料ID
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
        // axios 回傳的物件為 { data, status, headers, ... }
        const payload = response?.data || response

        // 後端回傳沒有 success 欄位時，視為成功（有 data 即成功）；若有 success 則依之
        const isSuccess = payload?.success !== undefined ? payload.success : !!payload
        if (isSuccess) {
          const user = payload.user || payload // 有些 API 直接把使用者欄位放在 data 根層

          // 根據 permissionType 設定對應的 role
          console.log('Debug: user object from API:', user)
          console.log('Debug: PermissionType value:', user.PermissionType)
          console.log('Debug: permissionType (lowercase):', user.permissionType)

          // 取出 permissionType（後端提供為小寫），並轉成 number
          const rawPermission = user.PermissionType ?? user.permissionType
          const permissionType = rawPermission != null ? Number(rawPermission) : 3
          console.log('Debug: Final permissionType value:', permissionType)
          console.log('Debug: Final permissionType type:', typeof permissionType)

          let role = 'general'
          if (permissionType === 1) {
            role = 'super_admin'
          } else if (permissionType === 2) {
            role = 'admin'
          }
          console.log('Debug: Final role assigned:', role)

          // 設定 token 與 user 資訊（從 localStorage 讀取或使用 payload 中的 token）
          this.token = payload.token || localStorage.getItem('token') || null
          // 如果 payload 有 token，確保也儲存到 localStorage
          if (payload.token) {
            localStorage.setItem('token', payload.token)
          }

          // 🔍 調試：檢查 API 返回的 FamilyInfoID
          console.log('🔍 [auth.js] user.FamilyInfoID:', user.FamilyInfoID)
          console.log('🔍 [auth.js] user.familyInfoID:', user.familyInfoID)
          console.log('🔍 [auth.js] user.familyinfoid:', user.familyinfoid)
          console.log('🔍 [auth.js] user 的所有 key:', Object.keys(user))

          // 使用小寫 key (name, email, phone) 以符合元件的讀取邏輯
          const familyInfoID = user.FamilyInfoID || user.familyInfoID  || null
          const institutionID = user.InstitutionID || user.institutionID || user.institutionId || null

          console.log('📝 [auth.js] 解析出的 FamilyInfoID:', familyInfoID)
          console.log('📝 [auth.js] 解析出的 InstitutionID:', institutionID)

          this.user = {
            UserID: user.UserID || user.userID || user.userId || null,
            PermissionType: permissionType,
            name: user.Name || user.name || '',
            account: user.account || user.Account || '',
            email: user.email || user.Email || '',
            phone: user.phoneNumber || user.PhoneNumber || user.phone || '',
            role: role, // 供路由守衛使用
            InstitutionID: institutionID, // 機構ID
            FamilyInfoID: familyInfoID // 家庭資料ID
          }
          this.isAuthenticated = true

          // ✅ 驗證：確認設置後的值
          console.log('✅ [auth.js] this.user 設置完成')
          console.log('✅ [auth.js] this.user.FamilyInfoID:', this.user.FamilyInfoID)
          console.log('✅ [auth.js] this.user 的所有 key:', Object.keys(this.user))
          console.log('✅ [auth.js] this.user 完整內容:', JSON.stringify(this.user, null, 2))

          return { success: true }
        } else {
          return {
            success: false,
            message: payload?.message || '登入失敗'
          }
        }
      } catch (error) {
        console.error('Login failed:', error)
        // axios 錯誤時可能有 response.data
        const errMsg = error.response?.data?.message || '登入失敗'
        return { success: false, message: errMsg }
      }
    },

    async logoutUser() {
      try {
        await logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // 清除 localStorage 中的 token
        try {
          localStorage.removeItem('token')
          console.log('JWT Token 已從 localStorage 清除')
        } catch (error) {
          console.error('清除 token 失敗:', error)
        }

        this.token = null
        this.user = {
          UserID: null,
          PermissionType: null,
          name: '',
          account: '',
          email: '',
          phone: '',
          role: '',
          InstitutionID: null,
          FamilyInfoID: null,
        }
        this.isAuthenticated = false
      }
    },

    async initializeAuth() {
      // 從 localStorage 讀取 token
      const token = localStorage.getItem('token')

      if (token) {
        this.token = token
        // 注意：不從 localStorage 讀取 user，因為需要從後端驗證 token 並獲取最新資料
        // 如果需要驗證 token 是否仍有效，可以呼叫 getUserInfo()

        // 暫時標記為已驗證，實際驗證邏輯可以在路由守衛中進行
        this.isAuthenticated = true

        // 可選：驗證 token 是否仍有效
        // try {
        //   await getUserInfo()
        // } catch (error) {
        //   console.error('Token validation failed:', error)
        //   this.logoutUser()
        // }
      }
    },

    async changePassword(newPassword) {
      if (!this.user || !this.user.UserID) {
        throw new Error('找不到使用者帳號')
      }
      try {
        // 調用新的後端 API
        const response = await fetch(`http://localhost:8080/users/${this.user.UserID}/password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ newPassword })
        })

        const result = await response.json()

        if (result.success) {
          return { success: true, message: result.message }
        } else {
          throw new Error(result.message || '密碼修改失敗')
        }
      } catch (error) {
        console.error('Password change failed:', error)
        throw new Error(error.message || '密碼修改失敗')
      }
    }
  }
})
