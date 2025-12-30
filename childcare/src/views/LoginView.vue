<template>
  <div class="login-container">
    <div class="login-form">
      <h2>會員登入</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="account">帳號</label>
          <input
              id="account"
              v-model="loginForm.account"
              type="text"
              placeholder="請輸入帳號"
              required
          />
        </div>

        <div class="form-group">
          <label for="password">密碼</label>
          <input
              id="password"
              v-model="loginForm.password"
              type="password"
              placeholder="請輸入密碼"
              required
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="isLoading" class="login-btn">
          {{ isLoading ? '登入中...' : '登入' }}
        </button>
      </form>
      <div class="login-links">
        <button class="link-btn" @click="goToForgotPassword">忘記密碼？</button>
        <button class="link-btn" @click="goToRegister">註冊</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth.js'
import { generateCaptcha } from '../api/captcha.js'
import recaptchaService from '../api/recaptcha.js'
import { loginUser } from '../api/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const loginForm = reactive({
  account: '',
  password: '',
  captcha: ''
})

const isLoading = ref(false)
const errorMessage = ref('')
const captchaImg = ref('')

// reCAPTCHA v3 token
const recaptchaToken = ref('')

// 組件掛載時初始化 reCAPTCHA
onMounted(async () => {
  try {
    await recaptchaService.load()
    console.log('reCAPTCHA v3 loaded')
  } catch (error) {
    console.error('Failed to load reCAPTCHA:', error)
  }
})

// 組件卸載時清理
onUnmounted(() => {
  // No cleanup needed
})

const handleLogin = async () => {
  // 表單驗證
  if (!loginForm.account || !loginForm.password) {
    errorMessage.value = '請填寫帳號和密碼'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    // 執行 reCAPTCHA v3 驗證
    const token = await recaptchaService.execute('login')
    recaptchaToken.value = token
    loginForm.captcha = token // 將 token 存入表單

    // 改為呼叫 loginUser
    console.log('發送登入請求:', loginForm.account)
    const result = await loginUser(loginForm.account, loginForm.password, recaptchaToken.value)
    console.log('登入結果:', result)

    if (result.success) {
      console.log('登入成功，用戶資料:', result.user)

      // 根據 permissionType 設定對應的 role
      // 從多個可能的位置取得後端回傳的權限欄位，支援大小寫與放在 root 層或 user 層
      const rawPerm = result.user?.PermissionType ?? result.user?.permissionType ?? result.PermissionType ?? result.permissionType
      const permissionTypeNum = rawPerm != null && rawPerm !== '' ? Number(rawPerm) : null
      console.log('解析到的 raw permission:', rawPerm, '轉換後:', permissionTypeNum)

      let role = 'general'
      if (permissionTypeNum === 1) {
        role = 'super_admin'
      } else if (permissionTypeNum === 2) {
        role = 'admin'
      }

      // 登入成功都存入 Pinia
      authStore.token = 'user-token'
      // 保留後端回傳的原始欄位並將權限欄位統一為 PermissionType (number)
      // Normalize user keys to lowercase (name, email, phone) to match App.vue usage
      const apiUser = result.user || result || {}
      authStore.user = {
        UserID: apiUser.UserID || apiUser.userID || apiUser.userId || apiUser.id || null,
        PermissionType: permissionTypeNum,
        name: apiUser.Name || apiUser.name || apiUser.accountName || apiUser.displayName || '',
        account: apiUser.account || apiUser.Account || apiUser.userAccount || '',
        email: apiUser.email || apiUser.Email || apiUser.mail || '',
        phone: apiUser.phoneNumber || apiUser.PhoneNumber || apiUser.phone || apiUser.mobile || '',
        role: role,
        InstitutionID: apiUser.InstitutionID || apiUser.institutionID || apiUser.institutionId || null, // 機構ID
        FamilyInfoID: apiUser.FamilyInfoID || apiUser.familyInfoID || apiUser.familyinfoid || null // 家庭資料ID
      }
      authStore.isAuthenticated = true
      console.log('Pinia 狀態已更新，用戶角色:', role)
      console.log('InstitutionID 已儲存:', authStore.user.InstitutionID) // Debug 確認

      // 權限判斷跳轉
      const permissionType = permissionTypeNum
      console.log('權限類型:', permissionType)
      const redirect = router.currentRoute.value.query.redirect
      console.log('重定向參數:', redirect)

      if (permissionType === 1 || permissionType === 2) {
        // super_admin 和 admin 登入成功後跳轉到後台首頁，忽略 redirect 參數
        console.log('跳轉到後台首頁: /admin')
        await router.push('/admin')
      } else {
        // general 用戶進入前台首頁，忽略 redirect 參數
        console.log('跳轉到前台首頁: /')
        await router.push('/')
      }
    } else {
      console.log('登入失敗:', result.message)
      errorMessage.value = result.message
      // v3 不需要手動重置
    }
  } catch (error) {
    console.error('登入發生錯誤:', error)
    errorMessage.value = '登入失敗，請稍後再試'
    // v3 不需要手動重置
  } finally {
    isLoading.value = false
  }
}

const refreshCaptcha = () => {
  captchaImg.value = generateCaptcha()
  loginForm.captcha = ''
}

const goToForgotPassword = () => {
  console.log('前往忘記密碼頁面')
  router.push({ name: 'ForgotPassword' }).catch(err => {
    console.error('路由跳轉失敗:', err)
    // 嘗試使用路徑跳轉作為備案
    router.push('/forgot-password')
  })
}

const goToRegister = () => {
  router.push({ name: 'RegisterTerms' })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: rgba(255, 248, 246, 0.8); /* 輕微的背景覆蓋，使其更易讀 */
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--primary-color, #fdd2d2);
}

h2 {
  text-align: center;
  color: var(--primary-text-color, #3a1f1f);
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: var(--primary-text-color, #3a1f1f);
  font-weight: 500;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input[type="text"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: var(--secondary-color, #e28790);
  box-shadow: 0 0 5px rgba(226, 135, 144, 0.5);
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: var(--front-btn, #F5A1A1);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover:not(:disabled) {
  background-color: var(--secondary-color, #e28790);
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #e15c69;
  text-align: center;
  margin-bottom: 15px;
}

.login-links {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.link-btn {
  background: none;
  border: none;
  color: var(--secondary-text-color, #666);
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
  padding: 0;
}

.link-btn:hover {
  color: var(--secondary-color, #e28790);
}

/* RWD */
@media (max-width: 480px) {
  .login-form {
    padding: 20px;
  }

  h2 {
    font-size: 22px;
  }
}
</style>