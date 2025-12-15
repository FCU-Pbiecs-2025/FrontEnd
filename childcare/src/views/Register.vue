<template>
  <div class="register-container">
    <h2>註冊新帳號</h2>
    <form @submit.prevent="submitRegister">
      <div class="form-group">
        <label for="account">帳號</label>
        <input
          id="account"
          v-model="form.account"
          type="text"
          required
          placeholder="請輸入帳號"
          :class="{ 'password-invalid': accountError }"
          @blur="handleAccountBlur"
        />
        <div v-if="checkingAccount" style="text-align:left; margin-top:0.25rem; font-size:0.85em; color:#6c757d;">檢查中...</div>
        <div v-if="accountError" class="error-msg" style="text-align:left; margin-top:0.25rem; font-size:0.85em;">{{ accountError }}</div>
      </div>
      <div class="form-group">
        <label for="password">密碼</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          placeholder="請輸入密碼 (至少6位數)"
          :class="{ 'password-invalid': form.password && form.password.length < 6 }"
          @input="validatePasswordInput"
          @blur="passwordTouched = true"
        />
        <div v-if="passwordTouched && form.password && form.password.length < 6" class="error-msg" style="text-align:left; margin-top:0.25rem; font-size:0.85em;">密碼長度不得小於六位數</div>
      </div>
      <div class="form-group">
        <label for="confirm">確認密碼</label>
        <input
          id="confirm"
          v-model="form.confirm"
          type="password"
          required
          placeholder="請再次輸入密碼"
          :class="{ 'password-invalid': form.confirm && (form.password !== form.confirm || form.password.length < 6) }"
          @input="validateConfirmInput"
          @blur="confirmTouched = true"
        />
        <div v-if="confirmTouched && form.confirm && form.password !== form.confirm" class="error-msg" style="text-align:left; margin-top:0.25rem; font-size:0.85em;">兩次密碼輸入不一致</div>
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
        <label for="address">通訊地址</label>
        <input id="address" v-model="form.address" type="text" required placeholder="請輸入戶籍地址" />
      </div>
      <div class="form-group">
        <label for="email">電子信箱</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          placeholder="請輸入電子信箱"
          :class="{ 'password-invalid': emailError }"
          @blur="handleEmailBlur"
        />
        <div v-if="checkingEmail" style="text-align:left; margin-top:0.25rem; font-size:0.85em; color:#6c757d;">檢查中...</div>
        <div v-if="emailError" class="error-msg" style="text-align:left; margin-top:0.25rem; font-size:0.85em;">{{ emailError }}</div>
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
import { register, checkAccountExists, checkEmailExists } from '../api/register.js'

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
const passwordTouched = ref(false)
const confirmTouched = ref(false)

// 帳號檢查相關
const accountError = ref('')
const checkingAccount = ref(false)
const accountTouched = ref(false)

// 信箱檢查相關
const emailError = ref('')
const checkingEmail = ref(false)
const emailTouched = ref(false)

// 密碼輸入即時驗證函數
function validatePasswordInput() {
  if (passwordTouched.value && form.password.length >= 6) passwordTouched.value = false
}

// 確認密碼輸入即時驗證函數
function validateConfirmInput() {
  if (confirmTouched.value && form.password === form.confirm) confirmTouched.value = false
}

// 檢查帳號是否已存在
async function handleAccountBlur() {
  accountTouched.value = true
  if (!form.account || form.account.trim() === '') {
    accountError.value = ''
    return
  }

  checkingAccount.value = true
  accountError.value = ''

  try {
    const response = await checkAccountExists(form.account)
    console.log('帳號檢查結果:', response)

    // 根據後端回應判斷帳號是否已存在
    if (response.data === true || response.data?.exists === true) {
      accountError.value = '此帳號已被註冊'
    } else {
      accountError.value = ''
    }
  } catch (error) {
    console.error('檢查帳號時發生錯誤:', error)
    // 如果後端回傳 404 或其他錯誤，表示帳號可用
    accountError.value = ''
  } finally {
    checkingAccount.value = false
  }
}

// 檢查電子信箱是否已存在
async function handleEmailBlur() {
  emailTouched.value = true
  if (!form.email || form.email.trim() === '') {
    emailError.value = ''
    return
  }

  // 先驗證 email 格式
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(form.email)) {
    emailError.value = '請輸入正確的電子信箱格式'
    return
  }

  checkingEmail.value = true
  emailError.value = ''

  try {
    const response = await checkEmailExists(form.email)
    console.log('信箱檢查結果:', response)

    // 根據後端回應判斷信箱是否已存在
    if (response.data === true || response.data?.exists === true) {
      emailError.value = '此電子信箱已被註冊'
    } else {
      emailError.value = ''
    }
  } catch (error) {
    console.error('檢查信箱時發生錯誤:', error)
    // 如果後端回傳 404 或其他錯誤，表示信箱可用
    emailError.value = ''
  } finally {
    checkingEmail.value = false
  }
}

async function submitRegister() {
  errorMsg.value = ''
  successMsg.value = ''

  // 檢查所有必填欄位
  if (!form.account || !form.password || !form.confirm || !form.name ||
      !form.gender || !form.phone || !form.address || !form.email || !form.birthday) {
    errorMsg.value = '請填寫所有欄位'
    return
  }

  // 檢查帳號或信箱是否已存在
  if (accountError.value) {
    errorMsg.value = accountError.value
    return
  }

  if (emailError.value) {
    errorMsg.value = emailError.value
    return
  }

  if (form.password !== form.confirm) {
    errorMsg.value = '兩次密碼輸入不一致'
    return
  }

  // 驗證密碼長度（不得小於六位數）
  if (form.password.length < 6) {
    errorMsg.value = '密碼長度不得小於六位數'
    return
  }

  // 驗證 email 格式
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(form.email)) {
    errorMsg.value = '請輸入正確的電子信箱格式'
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
    gender: form.gender === 'male',
    phoneNumber: form.phone,
    mailingAddress: form.address,
    email: form.email,
    birthDate: form.birthday,
    accountStatus: 1,
    permissionType: 3
  }

  // 新增：顯示userData於CONSOLE
  console.log('submitRegister userData:', userData)

  isLoading.value = true

  try {
    const response = await register(userData)

    // 詳細檢查回應內容
    console.log('=== 完整註冊回應 ===')
    console.log('response:', response)
    console.log('response.status:', response.status)
    console.log('response.data:', response.data)
    console.log('response.data type:', typeof response.data)
    console.log('response.data 內容:', JSON.stringify(response.data, null, 2))

    // 更寬鬆的成功判斷條件
    const resData = response.data || response
    const isSuccess = response.status === 200 || response.status === 201 ||
                      resData.success === true ||
                      resData.status === 'success' ||
                      resData.code === 200

    console.log('判斷結果 isSuccess:', isSuccess)

    if (isSuccess) {
      successMsg.value = '註冊成功！即將跳轉至會員中心'
      setTimeout(() => {
        router.push('/member-center')
      }, 2000)
    } else {
      errorMsg.value = resData.message || '註冊失敗，請稍後再試'
    }
  } catch (error) {
    console.error('Registration error:', error)

    // 更詳細的錯誤處理
    if (error.response && error.response.data) {
      const errorData = error.response.data
      if (errorData.message) {
        errorMsg.value = errorData.message
      } else if (errorData.error) {
        errorMsg.value = errorData.error
      } else {
        errorMsg.value = `註冊失敗: ${JSON.stringify(errorData)}`
      }
    } else if (error.message) {
      errorMsg.value = `註冊失敗: ${error.message}`
    } else {
      errorMsg.value = '註冊失敗，請檢查網路連線或稍後再試'
    }
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

.password-invalid {
  border-color: #dc3545 !important;
  background-color: #fff5f5;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25) !important;
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
