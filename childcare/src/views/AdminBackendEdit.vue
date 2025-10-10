<template>
  <div class="backend-edit-page">
    <div class="edit-card">
      <h2>後台帳號管理</h2>
      <div class="edit-form">
        <label>帳號 ID：<input v-model="account.id" readonly /></label>
        <label>密碼：<input v-model="account.password" type="password" placeholder="若不修改可留空" /></label>
        <label>機構名稱：<input v-model="account.org" /></label>
        <div class="perm-row">
          <span class="perm-label">權限設定：</span>
          <label><input type="radio" value="superadmin" v-model="account.role" /> 最高權限</label>
          <label><input type="radio" value="admin" v-model="account.role" /> 管理員</label>
          <label><input type="radio" value="general" v-model="account.role" /> 一般</label>
          <label><input type="radio" value="suspended" v-model="account.role" /> 停權</label>
        </div>
        <div class="actions-row">
          <button class="btn ghost" @click="cancel">返回</button>
          <button class="btn primary" @click="save">儲存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const accountId = route.query.adminAccountId || route.query.accountId || ''

const account = ref({ id: accountId, password: '', org: '', role: 'admin' })

// load stored backend accounts from localStorage (key: backendAccounts)
const loadAccount = (id) => {
  const stored = JSON.parse(localStorage.getItem('backendAccounts') || '{}')
  if (stored[id]) {
    account.value = { ...stored[id], password: '' }
  }
}

onMounted(() => {
  if (accountId) loadAccount(accountId)
})

const save = () => {
  if (!account.value.id) return alert('帳號 ID 缺失')
  const stored = JSON.parse(localStorage.getItem('backendAccounts') || '{}')
  // don't store empty password if left blank
  const toSave = { id: account.value.id, org: account.value.org, role: account.value.role }
  if (account.value.password) toSave.password = account.value.password
  stored[account.value.id] = toSave
  localStorage.setItem('backendAccounts', JSON.stringify(stored))
  alert('儲存完成')
}

const cancel = () => {
  // remove query and return to admin home list
  router.replace({ path: '/admin' })
}
</script>

<style scoped>
.backend-edit-page { display:flex; justify-content:center; padding:24px 0; }
/* container card */
.edit-card { width:760px; background: #fff; border:1px solid #e6e6ea; border-radius:12px; padding:18px 22px; box-shadow:0 8px 24px rgba(16,24,40,0.04); }

/* pill header */
.edit-card h2 { background: linear-gradient(90deg,#f0f6ff,#f7fbff); display:inline-block; padding:8px 14px; border-radius:20px; color:#2e6fb7; margin-bottom:14px; font-weight:700 }

.edit-form { padding:12px 4px }
.edit-form label { display:block; margin-bottom:12px; color:#333 }
.edit-form input { width:420px; max-width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; box-shadow:inset 0 1px 0 rgba(255,255,255,0.7) }

.perm-row { display:flex; align-items:center; gap:18px; margin-top:8px }
.perm-label { font-weight:700; margin-right:6px; color:#444 }

.actions-row { display:flex; justify-content:flex-end; gap:12px; margin-top:18px }

.btn { padding:8px 18px; border-radius:8px; border:none; cursor:pointer; font-weight:600 }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }

@media (max-width:720px){ .edit-card{ width:100%; padding:16px } .edit-form input{ width:100% } }
</style>
