<template>
  <div class="register-container">
    <h2>註冊新帳號</h2>
    <form @submit.prevent="submitRegister">
      <div class="form-group">
        <label for="account">帳號</label>
        <input id="account" v-model="form.account" type="text" required placeholder="請輸入帳號" />
      </div>
      <div class="form-group">
        <label for="password">密碼</label>
        <input id="password" v-model="form.password" type="password" required placeholder="請輸入密碼" />
      </div>
      <div class="form-group">
        <label for="confirm">確認密碼</label>
        <input id="confirm" v-model="form.confirm" type="password" required placeholder="請再次輸入密碼" />
      </div>
      <div class="form-group">
        <label for="name">姓名</label>
        <input id="name" v-model="form.name" type="text" required placeholder="請輸入姓名" />
      </div>
      <div class="form-group">
        <label for="gender">性別</label>
        <select id="gender" v-model="form.gender" required>
          <option value="">請選擇性別</option>
          <option value="male">男</option>
          <option value="female">女</option>
        </select>
      </div>
      <div class="form-group">
        <label for="phone">電話</label>
        <input id="phone" v-model="form.phone" type="tel" required placeholder="請輸入電話號碼" />
      </div>
      <div class="form-group">
        <label for="address">戶籍地址</label>
        <input id="address" v-model="form.address" type="text" required placeholder="請輸入戶籍地址" />
      </div>
      <div class="form-group">
        <label for="email">電子信箱</label>
        <input id="email" v-model="form.email" type="email" required placeholder="請輸入電子信箱" />
      </div>
      <div class="form-group">
        <label for="birthday">出生年月日</label>
        <input id="birthday" v-model="form.birthday" type="date" required />
      </div>
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>
      <button type="submit" class="register-btn" :disabled="isLoading">
        <span v-if="isLoading" class="loading-spinner"></span>
        註冊
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/register.js'

const router = useRouter()
const form = reactive({
  account: '',
  password: '',
  confirm: '',
  name: '',
  gender: '',
  phone: '',
  address: '',
  email: '',
  birthday: ''
})
const errorMsg = ref('')
const isLoading = ref(false)
const successMsg = ref('')

async function submitRegister() {
  errorMsg.value = ''
  successMsg.value = ''

  // 檢查所有必填欄位
  if (!form.account || !form.password || !form.confirm || !form.name ||
      !form.gender || !form.phone || !form.address || !form.email || !form.birthday) {
    errorMsg.value = '請填寫所有欄位'
    return
  }

  if (form.password !== form.confirm) {
    errorMsg.value = '兩次密碼輸入不一致'
    return
  }

  // 驗證電話格式（基本驗證）
  const phoneRegex = /^[0-9-+()]{8,15}$/
  if (!phoneRegex.test(form.phone)) {
    errorMsg.value = '請輸入正確的電話號碼格式'
    return
  }

  // 準備發送到後端的資料
  const userData = {
    account: form.account,
    password: form.password,
    name: form.name,
    gender: form.gender,
    phone: form.phone,
    address: form.address,
    email: form.email,
    birthday: form.birthday
  }

  isLoading.value = true

  try {
    const response = await register(userData)

    // 調試：查看實際回應
    console.log('註冊回應:', response)

    // 更寬鬆的成功判斷條件，適應不同的回應格式
    if (response.success || response.status === 'success' || response.code === 200) {
      successMsg.value = '註冊成功！即將跳轉至會員中心'
      // 縮短等待時間到2秒，並改用路徑跳轉
      setTimeout(() => {
        router.push('/member-center')
      }, 2000)
    } else {
      errorMsg.value = response.message || '註冊失敗，請稍後再試'
    }
  } catch (error) {
    console.error('Registration error:', error)
    errorMsg.value = '註冊失敗，請檢查網路連線或稍後再試'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-container {
  max-width: 500px;
  margin: 40px auto;
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  text-align: center;
}

h2 {
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-group select {
  cursor: pointer;
}

.error-msg {
  color: #dc3545;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.875rem;
}

.success-msg {
  color: #28a745;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.875rem;
}

.register-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.register-btn:disabled {
  background-color: #007bff;
  opacity: 0.7;
  cursor: not-allowed;
}

.register-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.loading-spinner {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  animation: spin 0.6s linear infinite;
  display: inline-block;
  margin-right: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .register-container {
    margin: 20px;
    padding: 1.5rem;
  }
}
</style>
