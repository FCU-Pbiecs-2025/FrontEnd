<template>
  <div class="admin-login-page">
    <div class="title-container">
      <h1>新竹縣政府社會處社區公共托育家園後台登入頁面</h1>
    </div>
    <div class="login-box">
      <h2>後台系統登入</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">管理員帳號</label>
          <input id="username" v-model="username" type="text" placeholder="請輸入帳號" required />
        </div>
        <div class="form-group">
          <label for="password">密碼</label>
          <input id="password" type="password" v-model="password" placeholder="請輸入密碼" required />
        </div>
        <p v-if="error" class="error-message">{{ error }}</p>
        <button type="submit" class="login-btn">登入</button>
        <button type="button" @click="testAdminLogin" class="test-login-btn">測試登入</button>
      </form>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../store/auth.js'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { loginUser } from '../api/auth.js' // 直接引入 API

export default {
  setup() {
    const username = ref('')
    const password = ref('')
    const error = ref('')
    const authStore = useAuthStore()
    const router = useRouter()

    const handleLogin = async () => {
      error.value = ''
      try {
        const result = await loginUser(username.value, password.value)
        console.log('Login API result:', result); // 登入日誌

        if (result.success) {
          console.log('User data from API:', result.user); // 使用者資料日誌
          console.log('PermissionType from API:', result.user?.PermissionType); // 權限類型日誌

          // 根據 PermissionType 設定角色
          let role = 'general'
          if (result.user.PermissionType === 1) {
            role = 'super_admin'
          } else if (result.user.PermissionType === 2) {
            role = 'admin'
          }

          // 檢查是否為管理員角色
          if (role === 'admin' || role === 'super_admin') {
            // 手動更新 Pinia store
            authStore.token = 'user-token' // 假設 token 由 cookie/session 管理
            authStore.user = {
              ...result.user,
              role: role
            }
            authStore.isAuthenticated = true
            router.replace('/admin')
          } else {
            console.log(`Role determined as '${role}'. Access denied.`); // 角色判斷日誌
            error.value = '您沒有管理員權限'
          }
        } else {
          error.value = result.message || '帳號或密碼錯誤'
        }
      } catch (err) {
        console.error('Admin login error:', err)
        error.value = '登入時發生錯誤，請稍後再試'
      }
    }

    const testAdminLogin = () => {
      authStore.user = { role: 'admin', name: '測試管理員' }
      authStore.token = 'test-token'
      authStore.isAuthenticated = true
      router.replace('/admin')
    }

    return { username, password, error, handleLogin, testAdminLogin }
  }
}
</script>

<style scoped>
.admin-login-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #fdf6f6; /* 淡粉色背景 */
  padding-top: 120px; /* 增加上邊距以容納標題 */
}

.title-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2rem 0;
  background-color: #fff;
  z-index: 10;
  text-align: center;
}

.title-container h1 {
  letter-spacing: 15px;
  font-size: 2.5rem;
  color: #333;
  margin: 0;
  padding-left: 20px; /* 補償字元間距 */
}

.login-box {
  width: 100%;
  max-width: 420px;
  padding: 40px 30px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  font-size: 1.75rem;
  color: #e35d6a; /* 主題紅色 */
  font-weight: bold;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #5f8ba8; /* 主題藍色 */
  font-weight: 600;
  font-size: 1rem;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  outline: none;
  border-color: #f9afae; /* 主題粉色 */
  box-shadow: 0 0 0 3px rgba(249, 175, 174, 0.3);
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #e35d6a; /* 主題紅色 */
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  margin-top: 1rem;
}

.login-btn:hover {
  background-color: #d64552;
}

.login-btn:active {
  transform: scale(0.98);
}

.error-message {
  color: #dc3545;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.test-login-btn {
  width: 100%;
  padding: 12px;
  background-color: #5f8ba8; /* 主題藍色 */
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  margin-top: 0.5rem;
}

.test-login-btn:hover {
  background-color: #4d708a;
}

.test-login-btn:active {
  transform: scale(0.98);
}
</style>
