// 模擬後端 API 的響應
export const mockAuth = {
  // 模擬用戶資料庫
  users: [
    {
      id: 1,
      account: 'test@example.com',
      password: '123456',
      name: '王小明',
      email: 'test@example.com',
      phone: '0912-345-678',
      address: '新竹縣竹北市中正東路123號'
    },
    {
      id: 2,
      account: 'user123',
      password: 'password',
      name: '李小華',
      email: 'user123@example.com',
      phone: '0987-654-321',
      address: '新竹市東區建功路456號'
    }
  ],

  // 模擬登入 API
  login: (account, password, captcha) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 先檢查驗證碼
        const correctCaptcha = sessionStorage.getItem('mock_captcha') || ''
        if (!captcha || captcha.toUpperCase() !== correctCaptcha.toUpperCase()) {
          resolve({ success: false, message: '驗證碼錯誤' })
          return
        }
        const user = mockAuth.users.find(u => u.account === account)
        if (!user) {
          resolve({ success: false, message: '帳號不存在' })
          return
        }
        if (user.password !== password) {
          resolve({ success: false, message: '密碼錯誤' })
          return
        }
        // 生成模擬 JWT token
        const token = `mock_jwt_token_${user.id}_${Date.now()}`
        // 模擬 user 欄位格式
        const userData = {
          userId: user.id,
          account: user.account,
          password: user.password,
          accountStatus: 1,
          permissionType: 1,
          familyInfoId: null,
          institutionId: null,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address
        }
        resolve({
          success: true,
          token,
          user: userData
        })
      }, 1000) // 模擬網路延遲
    })
  },

  // 模擬登出 API
  logout: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            message: '登出成功'
          }
        })
      }, 500)
    })
  },

  // 模擬獲取用戶資訊 API
  getUserInfo: (token) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (token && token.startsWith('mock_jwt_token_')) {
          const userId = token.split('_')[3]
          const user = mockAuth.users.find(u => u.id.toString() === userId)

          if (user) {
            resolve({
              data: {
                id: user.id,
                account: user.account,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address
              }
            })
          } else {
            reject({
              response: {
                status: 401,
                data: {
                  message: 'Token 無效'
                }
              }
            })
          }
        } else {
          reject({
            response: {
              status: 401,
              data: {
                message: 'Token 缺失或無效'
              }
            }
          })
        }
      }, 500)
    })
  },

  // 模擬忘記密碼 - 發送重置密碼郵件
  forgotPassword: (email) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockAuth.users.find(u => u.email === email)
        if (!user) {
          resolve({ success: false, message: '此信箱未註冊' })
          return
        }

        // 生成重置 token (實際應用中會發送到用戶信箱)
        const resetToken = `reset_token_${user.id}_${Date.now()}`

        // 模擬將 token 存儲 (實際應用中會存在資料庫並設置過期時間)
        sessionStorage.setItem(`reset_token_${user.email}`, resetToken)
        sessionStorage.setItem(`reset_token_expiry_${user.email}`, Date.now() + 15 * 60 * 1000) // 15分鐘過期

        resolve({
          success: true,
          message: '重置密碼郵件已發送，請檢查您的信箱',
          resetToken // 僅用於模擬，實際不應返回
        })
      }, 1500) // 模擬發送郵件的延遲
    })
  },

  // 模擬重置密碼
  resetPassword: (email, resetToken, newPassword) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockAuth.users.find(u => u.email === email)
        if (!user) {
          resolve({ success: false, message: '用戶不存在' })
          return
        }

        const storedToken = sessionStorage.getItem(`reset_token_${email}`)
        const tokenExpiry = sessionStorage.getItem(`reset_token_expiry_${email}`)

        if (!storedToken || storedToken !== resetToken) {
          resolve({ success: false, message: '重置 token 無效' })
          return
        }

        if (!tokenExpiry || Date.now() > parseInt(tokenExpiry)) {
          sessionStorage.removeItem(`reset_token_${email}`)
          sessionStorage.removeItem(`reset_token_expiry_${email}`)
          resolve({ success: false, message: '重置 token 已過期，請重新申請' })
          return
        }

        // 更新密碼
        user.password = newPassword

        // 清除重置 token
        sessionStorage.removeItem(`reset_token_${email}`)
        sessionStorage.removeItem(`reset_token_expiry_${email}`)

        resolve({
          success: true,
          message: '密碼重置成功，請使用新密碼登入'
        })
      }, 1000)
    })
  },

  // 模擬驗證重置 token
  verifyResetToken: (email, resetToken) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedToken = sessionStorage.getItem(`reset_token_${email}`)
        const tokenExpiry = sessionStorage.getItem(`reset_token_expiry_${email}`)

        if (!storedToken || storedToken !== resetToken) {
          resolve({ success: false, message: '重置 token 無效' })
          return
        }

        if (!tokenExpiry || Date.now() > parseInt(tokenExpiry)) {
          sessionStorage.removeItem(`reset_token_${email}`)
          sessionStorage.removeItem(`reset_token_expiry_${email}`)
          resolve({ success: false, message: '重置 token 已過期' })
          return
        }

        resolve({ success: true, message: 'Token 有效' })
      }, 500)
    })
  }
}
