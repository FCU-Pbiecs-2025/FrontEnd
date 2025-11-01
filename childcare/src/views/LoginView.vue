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

        <!-- Google reCAPTCHA v2 容器 -->
        <div v-if="useReCaptchaV2" class="form-group">
          <div id="login-recaptcha-container" class="recaptcha-container"></div>
        </div>

        <!-- 傳統驗證碼（備用） -->
        <div v-if="!useReCaptchaV2 && !useReCaptchaV3" class="form-group captcha-group">
          <label for="captcha">驗證碼</label>
          <div class="captcha-row">
            <input
              id="captcha"
              v-model="loginForm.captcha"
              type="text"
              placeholder="請輸入驗證碼"
              maxlength="4"
              required
              class="captcha-input"
            />
            <img :src="captchaImg" alt="驗證碼" class="captcha-img" @click="refreshCaptcha" title="點擊刷新驗證碼" />
            <button type="button" class="refresh-captcha-btn" @click="refreshCaptcha" title="刷新驗證碼">⟳</button>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="isLoading || (useReCaptchaV2 && !isRecaptchaValid)" class="login-btn">
          {{ isLoading ? '登入中...' : '登入' }}
        </button>

        <!-- 測試登入按鈕 -->
        <button type="button" class="test-login-btn" @click="handleTestLogin">
          測試登入
        </button>
        <!-- 後台帳號測試登入按鈕 -->
        <button type="button" class="admin-test-login-btn" @click="handleAdminTestLogin">
          後台帳號測試登入
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
import { renderReCaptchaV2, executeReCaptchaV3, resetReCaptchaV2 } from '../api/recaptcha.js'

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

// reCAPTCHA 配置
const reCaptchaVersion = import.meta.env.VITE_RECAPTCHA_VERSION || 'v2'
const useReCaptchaV2 = ref(reCaptchaVersion === 'v2')
const useReCaptchaV3 = ref(reCaptchaVersion === 'v3')
const isRecaptchaValid = ref(reCaptchaVersion === 'v3') // v3 預設為有效
const recaptchaWidgetId = ref(null)
const recaptchaToken = ref('')

// 組件掛載時初始化驗證碼或 reCAPTCHA
onMounted(async () => {
  if (useReCaptchaV2.value) {
    await initReCaptchaV2()
  } else if (!useReCaptchaV3.value) {
    // 使用傳統驗證碼
    refreshCaptcha()
  }
})

// 組件卸載時清理
onUnmounted(() => {
  if (recaptchaWidgetId.value !== null) {
    resetReCaptchaV2(recaptchaWidgetId.value)
  }
})

// 初始化 reCAPTCHA v2
const initReCaptchaV2 = async () => {
  try {
    const widgetId = await renderReCaptchaV2(
      'login-recaptcha-container',
      onRecaptchaV2Success,
      'light',
      'normal'
    )
    recaptchaWidgetId.value = widgetId
  } catch (error) {
    console.error('Failed to initialize reCAPTCHA v2:', error)
    errorMessage.value = 'reCAPTCHA 載入失敗，請重新整理頁面'
  }
}

// reCAPTCHA v2 驗證成功回調
const onRecaptchaV2Success = (token) => {
  recaptchaToken.value = token
  isRecaptchaValid.value = true
  loginForm.captcha = token // 將 token 存入表單
  errorMessage.value = ''
}

// 執行 reCAPTCHA v3 驗證
const executeReCaptchaV3Verification = async () => {
  if (!useReCaptchaV3.value) return true

  try {
    const token = await executeReCaptchaV3('login')
    recaptchaToken.value = token
    loginForm.captcha = token // 將 token 存入表單
    return true
  } catch (error) {
    console.error('reCAPTCHA v3 execution failed:', error)
    errorMessage.value = 'reCAPTCHA 驗證失敗，請稍後再試'
    return false
  }
}

// 重置 reCAPTCHA
const resetRecaptcha = () => {
  if (useReCaptchaV2.value && recaptchaWidgetId.value !== null) {
    resetReCaptchaV2(recaptchaWidgetId.value)
    isRecaptchaValid.value = false
    recaptchaToken.value = ''
    loginForm.captcha = ''
  }
}

const handleLogin = async () => {
  // 表單驗證
  if (!loginForm.account || !loginForm.password) {
    errorMessage.value = '請填寫帳號和密碼'
    return
  }

  // reCAPTCHA 驗證
  if (useReCaptchaV2.value && !isRecaptchaValid.value) {
    errorMessage.value = '請完成 reCAPTCHA 驗證'
    return
  }



  // 執行 reCAPTCHA v3 驗證
  if (useReCaptchaV3.value) {
    const v3Valid = await executeReCaptchaV3Verification()
    if (!v3Valid) return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await authStore.loginUser(
      loginForm.account,
      loginForm.password,
      loginForm.captcha
    )

    if (result.success) {
      // 根據 redirect 參數返回原頁面，若無則依角色給預設頁
      const redirect = router.currentRoute.value.query.redirect
      if (authStore.user?.role === 'admin') {
        router.push(redirect || '/admin')
      } else {
        router.push(redirect || '/')
      }
    } else {
      errorMessage.value = result.message
      // 重置驗證
      if (useReCaptchaV2.value) {
        resetRecaptcha()
      } else if (!useReCaptchaV3.value) {
        refreshCaptcha()
        loginForm.captcha = ''
      }
    }
  } catch (error) {
    errorMessage.value = '登入失敗，請稍後再試'
    // 重置驗證
    if (useReCaptchaV2.value) {
      resetRecaptcha()
    } else if (!useReCaptchaV3.value) {
      refreshCaptcha()
      loginForm.captcha = ''
    }
  } finally {
    isLoading.value = false
  }
}

// 測試登入處理函數
const handleTestLogin = async () => {
  // 設定假的登入狀態以通過路由守衛
  authStore.token = 'test-token'
  authStore.user = {
    id: 'test-user',
    name: '測試用戶',
    email: 'test@example.com',
    role: 'test'
  }
  authStore.isAuthenticated = true

  // 將資訊存到 localStorage - disabled
  // localStorage.setItem('token', 'test-token')
  // localStorage.setItem('user', JSON.stringify({
  //   id: 'test-user',
  //   name: '測試用戶',
  //   email: 'test@example.com',
  //   role: 'test'
  // }))

  // 只有有 redirect 參數才跳轉，否則停留原頁
  const redirect = router.currentRoute.value.query.redirect
  if (redirect) {
    router.push(redirect)
  }
}

// 後台帳號測試登入處理函數
const handleAdminTestLogin = async () => {
  // 設定假的 admin 登入狀態
  authStore.token = 'admin-test-token'
  authStore.user = {
    id: 'admin-test',
    name: '後台管理員',
    email: 'admin@example.com',
    role: 'admin'
  }
  authStore.isAuthenticated = true
  // localStorage.setItem('token', 'admin-test-token')
  // localStorage.setItem('user', JSON.stringify(authStore.user))
  // 回到原始頁面（若有），否則到後台首頁
  const redirect = router.currentRoute.value.query.redirect
  router.push(redirect || '/admin')
}

const refreshCaptcha = () => {
  captchaImg.value = generateCaptcha()
  loginForm.captcha = ''
}

const goToForgotPassword = () => {
  router.push({ name: 'ForgotPassword' })
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
  margin-top: 60px;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-form h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.login-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.test-login-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
}

.test-login-btn:hover:not(:disabled) {
  background-color: #218838;
}

.test-login-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.admin-test-login-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
}

.admin-test-login-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.admin-test-login-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.login-links {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}
.link-btn {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: underline;
  padding: 0;
}
.link-btn:hover {
  color: #0056b3;
}

.captcha-group {
  margin-bottom: 1.5rem;
}
.captcha-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.captcha-input {
  flex: 1;
  height: 48px;
  font-size: 1.25rem;
  padding: 0 12px;
}
.captcha-img {
  width: 120px;
  height: 48px;
  border-radius: 6px;
  border: 1.5px solid #bbb;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 1px 4px #0001;
  object-fit: contain;
}
.refresh-captcha-btn {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 2rem;
  padding: 0 8px;
  margin-left: 0;
  height: 48px;
  display: flex;
  align-items: center;
}
.refresh-captcha-btn:hover {
  color: #0056b3;
}

/* reCAPTCHA v2 容器樣式 */
.recaptcha-container {
  display: inline-block;
  width: 100%;
  max-width: 304px;
  margin: 0 auto;
}
</style>
