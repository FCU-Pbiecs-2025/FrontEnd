<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <h2 class="title">忘記密碼</h2>

      <!-- 步驟 1: 輸入信箱 -->
      <div v-if="currentStep === 1" class="step-content">
        <p class="description">請輸入您註冊時使用的信箱地址，我們將發送重置密碼的連結給您。</p>

        <form @submit.prevent="sendResetEmail">
          <div class="form-group">
            <label for="email">信箱地址</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="請輸入您的信箱"
              required
              :disabled="loading"
            >
          </div>

          <!-- reCAPTCHA v2 容器 -->
          <div v-if="useReCaptchaV2" class="form-group">
            <div id="recaptcha-container" class="recaptcha-container"></div>
          </div>

          <button
            type="submit"
            class="submit-btn"
            :disabled="loading || !email || !isRecaptchaValid"
          >
            <span v-if="loading">發送中...</span>
            <span v-else>發送重置連結</span>
          </button>
        </form>

        <div class="back-to-login">
          <router-link to="/login" class="link">返回登入</router-link>
        </div>
      </div>

      <!-- 步驟 2: 郵件已發送提示 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="success-icon">✉️</div>
        <h3>郵件已發送</h3>
        <p class="description">
          我們已將重置密碼的連結發送到：<br>
          <strong>{{ email }}</strong>
        </p>
        <p class="note">請檢查您的信箱（包含垃圾郵件匣），並點擊連結重置密碼。連結將在 15 分鐘後失效。</p>

        <div class="actions">
          <button @click="resendEmail" class="resend-btn" :disabled="loading">
            <span v-if="loading">重新發送中...</span>
            <span v-else>重新發送郵件</span>
          </button>
          <router-link to="/login" class="link">返回登入</router-link>
        </div>
      </div>

      <!-- 步驟 3: 重置密碼 -->
      <div v-if="currentStep === 3" class="step-content">
        <h3>設定新密碼</h3>
        <p class="description">請為您的帳號設定新密碼。</p>

        <form @submit.prevent="submitNewPassword">
          <div class="form-group">
            <label for="newPassword">新密碼</label>
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              class="form-input"
              placeholder="請輸入新密碼"
              required
              minlength="6"
              :disabled="loading"
            >
            <small class="help-text">密碼至少需要 6 個字元</small>
          </div>

          <div class="form-group">
            <label for="confirmPassword">確認新密碼</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              class="form-input"
              placeholder="請再次輸入新密碼"
              required
              :disabled="loading"
            >
          </div>

          <button
            type="submit"
            class="submit-btn"
            :disabled="loading || !newPassword || !confirmPassword || newPassword !== confirmPassword"
          >
            <span v-if="loading">設定中...</span>
            <span v-else>設定新密碼</span>
          </button>
        </form>

        <div v-if="newPassword !== confirmPassword && confirmPassword" class="error-text">
          密碼確認不一致
        </div>
      </div>

      <!-- 步驟 4: 重置成功 -->
      <div v-if="currentStep === 4" class="step-content">
        <div class="success-icon">✅</div>
        <h3>密碼重置成功</h3>
        <p class="description">您的密碼已成功重置，請使用新密碼登入。</p>

        <router-link to="/login" class="submit-btn">前往登入</router-link>
      </div>

      <!-- 錯誤訊息 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { forgotPassword, resetPassword, verifyResetToken } from '@/api/auth'
import { renderReCaptchaV2, executeReCaptchaV3, resetReCaptchaV2 } from '@/api/recaptcha'

const router = useRouter()
const route = useRoute()

// 響應式數據
const currentStep = ref(1)
const loading = ref(false)
const errorMessage = ref('')

// 步驟 1: 輸入信箱
const email = ref('')

// 步驟 2: 郵件發送結果
const resetToken = ref('')

// 步驟 3: 重置密碼
const newPassword = ref('')
const confirmPassword = ref('')

// reCAPTCHA 配置
const reCaptchaVersion = import.meta.env.VITE_RECAPTCHA_VERSION || 'v2'
const useReCaptchaV2 = ref(reCaptchaVersion === 'v2')
const useReCaptchaV3 = ref(reCaptchaVersion === 'v3')
const isRecaptchaValid = ref(reCaptchaVersion === 'v3') // v3 預設為有效，v2 需要用戶互動
const recaptchaWidgetId = ref(null)
const recaptchaToken = ref('')

// 組件掛載時初始化 reCAPTCHA 並檢查網址中的 token
onMounted(async () => {
  if (useReCaptchaV2.value) {
    await initReCaptchaV2()
  }

  // 如果 URL 包含 token 和 email，直接驗證並進入重置步驟
  const query = route.query
  if (query && query.token && query.email) {
    email.value = decodeURIComponent(query.email)
    const token = query.token
    loading.value = true
    errorMessage.value = ''
    try {
      const resp = await verifyResetToken(email.value, token)
      if (resp && resp.success) {
        resetToken.value = token
        currentStep.value = 3
      } else {
        errorMessage.value = resp.message || '驗證失敗或連結已失效'
      }
    } catch (err) {
      console.error('Verify token error:', err)
      errorMessage.value = '驗證連結時發生錯誤'
    } finally {
      loading.value = false
    }
  }
})

// 組件卸載時清理 reCAPTCHA
onUnmounted(() => {
  if (recaptchaWidgetId.value !== null) {
    resetReCaptchaV2(recaptchaWidgetId.value)
  }
})

// 初始化 reCAPTCHA v2
const initReCaptchaV2 = async () => {
  try {
    recaptchaWidgetId.value = await renderReCaptchaV2(
      'recaptcha-container',
      onRecaptchaV2Success,
      'light',
      'normal'
    )
  } catch (error) {
    console.error('Failed to initialize reCAPTCHA v2:', error)
    errorMessage.value = 'reCAPTCHA 載入失敗，請重新整理頁面'
  }
}

// reCAPTCHA v2 驗證成功回調
const onRecaptchaV2Success = (token) => {
  recaptchaToken.value = token
  isRecaptchaValid.value = true
  errorMessage.value = '' // 清除錯誤訊息
}

// 執行 reCAPTCHA v3 驗證
const executeReCaptchaV3Verification = async () => {
  if (!useReCaptchaV3.value) return true

  try {
    recaptchaToken.value = await executeReCaptchaV3('forgot_password')
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
  }
}

// 發送重置郵件
const sendResetEmail = async () => {
  if (!email.value) return

  // 檢查 reCAPTCHA 驗證
  if (useReCaptchaV2.value && !isRecaptchaValid.value) {
    errorMessage.value = '請完成 reCAPTCHA 驗證'
    return
  }

  // 執行 reCAPTCHA v3 驗證
  if (useReCaptchaV3.value) {
    const v3Valid = await executeReCaptchaV3Verification()
    if (!v3Valid) return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    // 包含 reCAPTCHA token 發送請求
    const result = await forgotPassword(email.value, recaptchaToken.value)

    if (result.success) {
      resetToken.value = result.resetToken
      currentStep.value = 2
      // 重置 reCAPTCHA 以供下次使用
      resetRecaptcha()
    } else {
      errorMessage.value = result.message || '發送失敗，請稍後再試'
      // 重置 reCAPTCHA
      resetRecaptcha()
    }
  } catch (error) {
    errorMessage.value = '網路錯誤，請稍後再試'
    console.error('Forgot password error:', error)
    // 重置 reCAPTCHA
    resetRecaptcha()
  } finally {
    loading.value = false
  }
}

// 重新發送郵件
const resendEmail = async () => {
  // 返回步驟 1 重新驗證
  currentStep.value = 1
  if (useReCaptchaV2.value) {
    // 重新初始化 reCAPTCHA v2
    setTimeout(async () => {
      await initReCaptchaV2()
    }, 100)
  }
}

// 提交新密碼
const submitNewPassword = async () => {
  if (!newPassword.value || !confirmPassword.value) return

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = '密碼確認不一致'
    return
  }

  if (newPassword.value.length < 6) {
    errorMessage.value = '密碼至少需要 6 個字元'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const result = await resetPassword(email.value, resetToken.value, newPassword.value)

    if (result.success) {
      currentStep.value = 4
    } else {
      errorMessage.value = result.message || '密碼重置失敗'
    }
  } catch (error) {
    errorMessage.value = '重置失敗，請稍後再試'
    console.error('Reset password error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #FFF8F6;
  padding: 20px;
}

.forgot-password-card {
  max-width: 480px;
  width: 100%;
  background: #fff;
  padding: 2.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  text-align: center;
}

.title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #111;
  margin-bottom: 1.5rem;
  letter-spacing: 1px;
}

.step-content {
  width: 100%;
}

.description {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 1.2rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #1976d2;
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.help-text {
  display: block;
  margin-top: 0.3rem;
  color: #888;
  font-size: 0.9rem;
}

.submit-btn {
  width: 100%;
  padding: 0.8rem 1.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  color: #fff;
  background: #1976d2;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
  display: inline-block;
  box-sizing: border-box;
}

.submit-btn:hover:not(:disabled) {
  background: #1256a3;
}

.submit-btn:disabled {
  background: #b0c4de;
  cursor: not-allowed;
}

.back-to-login {
  margin-top: 1.5rem;
}

.link {
  color: #1976d2;
  text-decoration: none;
  font-size: 0.95rem;
}

.link:hover {
  text-decoration: underline;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.note {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.resend-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.resend-btn:hover:not(:disabled) {
  background: #545b62;
}

.resend-btn:disabled {
  background: #adb5bd;
  cursor: not-allowed;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 0.8rem;
  border-radius: 6px;
  margin-top: 1rem;
  border-left: 4px solid #c62828;
}

.error-text {
  color: #c62828;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: left;
}

.recaptcha-container {
  margin-top: 1rem;
}

@media (max-width: 480px) {
  .forgot-password-card {
    padding: 2rem 1.5rem;
  }

  .title {
    font-size: 1.5rem;
  }
}
</style>
