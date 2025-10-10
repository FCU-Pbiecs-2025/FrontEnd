<template>
  <div class="backend-account-page">
    <div class="account-title">
      <span class="icon">🛡️</span>
      後台帳號管理
    </div>
    <div class="account-query-box">
      <label for="queryAdmin">查詢帳號</label>
      <input id="queryAdmin" v-model="query" type="text" placeholder="請輸入管理者帳號或名稱" />
      <button class="query-btn" @click="handleQuery">查詢</button>
    </div>
    <div class="account-table-box">
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
            <td class="action-cell"><button class="manage-btn" @click="manageAdmin(item.id)">管理</button></td>
          </tr>
          <tr v-if="filteredAdmins.length === 0">
            <td colspan="5" class="empty-tip">查無資料</td>
          </tr>
        </tbody>
      </table>
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
</script>

<style scoped>
.backend-account-page {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.08);
  padding: 28px;
  margin: 24px auto;
  max-width: 880px;
}
.account-title {
  font-size: 1.4rem;
  color: #e35d6a;
  font-weight: 700;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.account-query-box {
  background: linear-gradient(180deg,#fbfbfe,#f7f7fa);
  border: 1px solid #eef2f5;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.account-query-box input {
  border: 1.5px solid #e5e5e5;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 1rem;
  width: 260px;
}
.query-btn {
  background: #e35d6a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 0.95rem;
  cursor: pointer;
  font-weight: 700;
}
.account-table-box { margin-top: 12px; overflow: auto; }
.account-table { width:100%; border-collapse: collapse; min-width: 700px; }
.account-table thead th { background:#e35d6a; color:#fff; padding:12px 16px; text-align:left; }
.account-table tbody tr { background:#fff; border-bottom:1px solid #f0f0f2; }
.account-table tbody tr:hover { background:#fff8f6; }
.account-table td { padding:12px 16px; vertical-align:middle; }
.id-cell { font-weight:600; color:#334e5c; }
.action-cell { text-align:right; }
.manage-btn { background: linear-gradient(90deg,#ff7b8a,#e35d6a); color:#fff; border:none; border-radius:8px; padding:8px 14px; cursor:pointer; font-weight:700; }
.empty-tip { color:#999; text-align:center; padding:18px 0; }
@media (max-width:720px){
  .account-table thead{display:none;}
  .account-table tbody td{display:block;}
  .account-query-box{flex-direction:column;align-items:stretch;}
}
</style>
