<template>
  <div class="backend-edit-page">
    <div class="backend-edit-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/admin-settings-male.png" class="icon" alt="icon" />
        <span class="main-title">後台帳號管理</span>
      </div>
      <div class="tab-row">
        <span class="tab-title">{{ isNew ? '新增後台帳號' : '編輯後台帳號' }}</span>
      </div>
      <div class="edit-form-card">
        <div class="form-row">
          <label class="form-label">帳號 ID：</label>
          <input v-model="account.id" class="form-input" :readonly="!isNew" />
        </div>
        <div class="form-row">
          <label class="form-label">密碼：</label>
          <input v-model="account.password" type="password" class="form-input" :placeholder="isNew ? '請輸入密碼' : '若不修改可留空'" />
        </div>
        <div class="form-row">
          <label class="form-label">機構名稱：</label>
          <select v-model="account.org" class="form-input">
            <option value="">請選擇機構</option>
            <option value="市政府">市政府</option>
            <option value="托育中心A">托育中心A</option>
            <option value="托育中心B">托育中心B</option>
          </select>
        </div>
        <div class="form-row">
          <label class="form-label">權限設定：</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" value="superadmin" v-model="account.role" />
              <span>最高權限</span>
            </label>
            <label class="radio-label">
              <input type="radio" value="admin" v-model="account.role" />
              <span>管理員</span>
            </label>
          </div>
        </div>
        <div class="form-row">
          <label class="form-label">帳號狀態：</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" value="enable" v-model="account.right" />
              <span>啟用</span>
            </label>
            <label class="radio-label">
              <input type="radio" value="suspended" v-model="account.right" />
              <span>停用</span>
            </label>
          </div>



        </div>
      </div>
      <div class="bottom-row">
        <button class="btn ghost" @click="cancel">返回</button>
        <button class="btn primary" @click="save">儲存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 從路由參數獲取帳號 ID，如果是新增頁面則生成新 ID
const accountId = computed(() => {
  if (route.name === 'AdminBackendNew') {
    return 'admin' + Date.now()
  }
  return route.params.id || ''
})

const account = ref({ id: '', password: '', org: '', role: 'admin' })

const isNew = computed(() => route.name === 'AdminBackendNew')

// load stored backend accounts from localStorage (key: backendAccounts)
const loadAccount = (id) => {
  const stored = JSON.parse(localStorage.getItem('backendAccounts') || '{}')
  if (stored[id]) {
    account.value = { ...stored[id], password: '' }
  } else {
    // 如果找不到，初始化為新帳號
    account.value = { id: id, password: '', org: '', role: 'admin' }
  }
}

onMounted(() => {
  if (accountId.value) {
    account.value.id = accountId.value
    if (!isNew.value) {
      loadAccount(accountId.value)
    }
  }
})

const save = () => {
  if (!account.value.id) return alert('帳號 ID 缺失')
  if (!account.value.org) return alert('請輸入機構名稱')

  const stored = JSON.parse(localStorage.getItem('backendAccounts') || '{}')

  // 準備要儲存的資料
  const toSave = { id: account.value.id, org: account.value.org, role: account.value.role, right: account.value.right }

  // 如果有輸入密碼則更新，否則保留原密碼
  if (account.value.password) {
    toSave.password = account.value.password
  } else if (stored[account.value.id] && stored[account.value.id].password) {
    // 保留原密碼
    toSave.password = stored[account.value.id].password
  } else if (isNew.value) {
    // 新增時必須有密碼
    return alert('新增帳號時必須設定密碼')
  }

  stored[account.value.id] = toSave
  localStorage.setItem('backendAccounts', JSON.stringify(stored))
  alert('儲存完成')

  // 返回列表頁
  router.push({ name: 'AdminBackendAccount' })
}

const cancel = () => {
  // 返回後台帳號列表頁
  router.push({ name: 'AdminBackendAccount' })
}

</script>

<style scoped>
.backend-edit-page {  width: 100% ;}
.backend-edit-card {max-width: 85%; display: flex; flex-direction: column; margin: 0 auto;}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px;margin-top: 60px}
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; font-weight:700;color:#2e6fb7; }
.tab-row { display:flex; justify-content:center; margin-bottom:18px; margin-top: 50px}
.tab-title { background: #f9dada; color:#e35d6a; font-weight:700; font-size:1.15rem; padding:6px 38px; border-radius:18px; letter-spacing:2px; }
.edit-form-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:18px 24px; margin-bottom:22px; box-shadow:0 2px 8px rgba(16,24,40,0.04); }
.form-row { display:flex; align-items:flex-start; gap:18px; margin-bottom:16px; justify-content: center; }
.form-label { font-weight:600; color:#2e6fb7; min-width:120px; margin-top:8px; }
.form-input { width:420px; max-width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; }
.form-input:read-only { background-color:#f3f4f6; cursor:not-allowed; }
.radio-group { display:flex; gap:30px; align-items:center; flex-wrap:wrap; padding-top:8px; width: 420px}
.radio-label { display:flex; align-items:center; gap:8px; cursor:pointer; color:#333; font-weight:500; }
.radio-label input[type="radio"] { cursor:pointer; width:16px; height:16px; }
.radio-label span { user-select:none; }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:8px; }
.btn { padding:7px 18px; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:1rem; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
.btn.danger { background:#ff7b8a; color:#fff }
@media (max-width:900px){
  .backend-edit-card{ width:100%; padding:16px }
  .form-row{ flex-direction:column; align-items:flex-start; }
  .form-label{ width:100%; }
  .form-input{ width:100%; }
}
</style>
