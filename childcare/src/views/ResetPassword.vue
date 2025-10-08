<template>
  <div class="reset-password-container">
    <div class="reset-password-card">
      <h2 class="title">重置密碼</h2>

      <!-- 載入中狀態 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>正在驗證重置連結...</p>
      </div>

      <!-- Token 無效或過期 -->
      <div v-else-if="!tokenValid" class="error-state">
        <div class="error-icon">❌</div>
        <h3>重置連結無效</h3>
        <p class="description">{{ errorMessage }}</p>
        <router-link to="/forgot-password" class="submit-btn">重新申請重置</router-link>
      </div>

      <!-- 重置密碼表單 -->
      <div v-else-if="!resetSuccess" class="form-content">
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
              :disabled="submitting"
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
              :disabled="submitting"
            >
          </div>

          <button
            type="submit"
            class="submit-btn"
            :disabled="submitting || !newPassword || !confirmPassword || newPassword !== confirmPassword"
          >
            <span v-if="submitting">設定中...</span>
            <span v-else>設定新密碼</span>
          </button>
        </form>

        <div v-if="newPassword !== confirmPassword && confirmPassword" class="error-text">
          密碼確認不一致
        </div>

        <div v-if="submitError" class="error-message">
          {{ submitError }}
        </div>
      </div>

      <!-- 重置成功 -->
      <div v-else class="success-state">
        <div class="success-icon">✅</div>
        <h3>密碼重置成功</h3>
        <p class="description">您的密碼已成功重置，請使用新密碼登入。</p>
        <router-link to="/login" class="submit-btn">前往登入</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { verifyResetToken, resetPassword } from '@/api/auth'

const route = useRoute()
const router = useRouter()

// 響應式數據
const loading = ref(true)
const tokenValid = ref(false)
const resetSuccess = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const submitError = ref('')

const email = ref('')
const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// 頁面載入時驗證 token
onMounted(async () => {
  // 從 URL 參數獲取 email 和 token
  email.value = route.query.email || ''
  token.value = route.query.token || ''

  if (!email.value || !token.value) {
    errorMessage.value = '重置連結格式錯誤'
    loading.value = false
    return
  }

  try {
    const result = await verifyResetToken(email.value, token.value)

    if (result.success) {
      tokenValid.value = true
    } else {
      errorMessage.value = result.message || 'Token 驗證失敗'
    }
  } catch (error) {
    errorMessage.value = '驗證失敗，請重新申請'
    console.error('Token verification error:', error)
  } finally {
    loading.value = false
  }
})

// 提交新密碼
const submitNewPassword = async () => {
  if (!newPassword.value || !confirmPassword.value) return

  if (newPassword.value !== confirmPassword.value) {
    submitError.value = '密碼確認不一致'
    return
  }

  if (newPassword.value.length < 6) {
    submitError.value = '密碼至少需要 6 個字元'
    return
  }

  submitting.value = true
  submitError.value = ''

  try {
    const result = await resetPassword(email.value, token.value, newPassword.value)

    if (result.success) {
      resetSuccess.value = true
    } else {
      submitError.value = result.message || '密碼重置失敗'
    }
  } catch (error) {
    submitError.value = '重置失敗，請稍後再試'
    console.error('Reset password error:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #FFF8F6;
  padding: 20px;
}

.reset-password-card {
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

.loading-state, .error-state, .form-content, .success-state {
  width: 100%;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon, .success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
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

.error-text {
  color: #c62828;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: left;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 0.8rem;
  border-radius: 6px;
  margin-top: 1rem;
  border-left: 4px solid #c62828;
}

@media (max-width: 480px) {
  .reset-password-card {
    padding: 2rem 1.5rem;
  }

  .title {
    font-size: 1.5rem;
  }
}
</style>
