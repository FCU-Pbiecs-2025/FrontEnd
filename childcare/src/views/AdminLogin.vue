<template>
  <div class="admin-login-container">
    <h2>後台管理員登入</h2>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="username">帳號：</label>
        <input id="username" v-model="username" required />
      </div>
      <div>
        <label for="password">密碼：</label>
        <input id="password" type="password" v-model="password" required />
      </div>
      <button type="submit">登入</button>
      <button type="button" @click="testAdminLogin" style="margin-left:10px">測試管理員登入</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import { useAuthStore } from '../store/auth.js'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

export default {
  setup() {
    const username = ref('')
    const password = ref('')
    const error = ref('')
    const authStore = useAuthStore()
    const router = useRouter()

    const handleLogin = async () => {
      error.value = ''
      // 呼叫 loginUser 方法
      const result = await authStore.loginUser(username.value, password.value)
      if (result.success && ['admin', 'super_admin'].includes(authStore.user?.role)) {
        router.replace('/admin')
      } else {
        error.value = result.message || '帳號或密碼錯誤，或非管理員身分'
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
.admin-login-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 24px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>
