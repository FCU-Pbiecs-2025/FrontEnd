<template>
  <div class="account-page">
    <div class="account-card">
      <div class="title-row">
        <span class="icon">🛡️</span>
        <span class="main-title">後台帳號管理</span>
      </div>

      <div class="tab-row">
        <span class="tab-title">帳號查詢</span>
      </div>

      <div class="query-card">
        <div class="query-row">
          <label class="search-label" for="queryAdmin">查詢帳號：</label>
          <input id="queryAdmin" v-model="query" type="text" placeholder="請輸入管理者帳號或名稱" class="search-input" />
          <button class="btn query" @click="handleQuery">查詢</button>
        </div>
      </div>

      <div class="table-section">
        <table class="account-table">
          <thead>
            <tr>
              <th>帳號ID</th>
              <th>名稱</th>
              <th>角色</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredAdmins" :key="item.id">
              <td class="id-cell">{{ item.id }}</td>
              <td class="name-cell">{{ item.name }}</td>
              <td class="role-cell">{{ item.role }}</td>
              <td class="status-cell">{{ item.status }}</td>
              <td class="action-cell"><button class="btn small" @click="manageAdmin(item.id)">管理</button></td>
            </tr>
            <tr v-if="filteredAdmins.length === 0">
              <td colspan="5" class="empty-tip">查無資料</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bottom-row">
        <button class="btn primary" @click="goBack">返回</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const query = ref('')
const admins = ref([
  { id: 'admin01', name: '系統管理員', role: 'superadmin', status: '啟用' },
  { id: 'admin02', name: '編輯人員', role: 'editor', status: '啟用' },
  { id: 'admin03', name: '審核人員', role: 'reviewer', status: '停用' }
])

const handleQuery = () => {
  // placeholder: filteredAdmins computed will handle filtering
}

const filteredAdmins = computed(() => {
  if (!query.value) return admins.value
  return admins.value.filter(a => a.id.includes(query.value) || (a.name && a.name.includes(query.value)))
})

const manageAdmin = (id) => {
  // Navigate to admin page with adminAccountId query to open the backend edit page
  router.push({ path: '/admin', query: { adminAccountId: id } })
}

const goBack = () => {
  router.replace({ path: '/admin' })
}
</script>

<style scoped>
.account-page { display:flex; justify-content:center; padding:32px 0; }
.account-card { width:820px; background: #fff; border:1.5px solid #e6e6ea; border-radius:16px; padding:24px 28px; box-shadow:0 8px 24px rgba(16,24,40,0.04); }
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:8px; }
.icon { font-size:20px }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700 }
.tab-row { display:flex; justify-content:center; margin-bottom:16px }
.tab-title { background: #f9dada; color:#e35d6a; font-weight:700; font-size:1.05rem; padding:6px 28px; border-radius:18px; }
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:14px 18px; margin-bottom:18px; box-shadow:0 2px 8px rgba(16,24,40,0.04); }
.query-row { display:flex; align-items:center; gap:12px }
.search-label { font-weight:600; color:#2e6fb7 }
.search-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; width:260px }
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600 }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6 }
.table-section { margin-bottom:12px }
.account-table { width:100%; border-collapse:collapse }
.account-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left }
.account-table td { padding:12px; border-bottom:1px solid #f3f4f6 }
.id-cell { font-weight:600; color:#334e5c }
.action-cell { text-align:right }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.bottom-row { display:flex; justify-content:flex-end; margin-top:8px }
@media (max-width:900px){ .account-card{ width:100%; padding:16px } .search-input{ width:100% } }
</style>
