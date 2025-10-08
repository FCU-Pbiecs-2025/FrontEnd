<template>
  <div class="register-container">
    <h2>註冊新帳號</h2>
    <form @submit.prevent="goToTerms">
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
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" required placeholder="請輸入Email" />
      </div>
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      <button type="submit" class="register-btn">註冊</button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = reactive({
  account: '',
  password: '',
  confirm: '',
  email: ''
})
const errorMsg = ref('')

function goToTerms() {
  errorMsg.value = ''
  if (!form.account || !form.password || !form.confirm || !form.email) {
    errorMsg.value = '請填寫所有欄位'
    return
  }
  if (form.password !== form.confirm) {
    errorMsg.value = '兩次密碼輸入不一致'
    return
  }
  // 跳轉到規範說明頁
  router.push({ name: 'RegisterTerms', query: { ...form } })
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 80px auto;
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  text-align: center;
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
.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}
.error-msg {
  color: #dc3545;
  margin-bottom: 1rem;
  text-align: center;
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
}
.register-btn:hover {
  background-color: #0056b3;
}
</style>
