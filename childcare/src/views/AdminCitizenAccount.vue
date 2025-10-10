<template>
  <div class="citizen-account-page">
    <div class="account-title">
      <span class="icon">🔷</span>
      民眾帳號
    </div>
    <div class="account-query-box">
      <label for="queryAccount">查詢帳號</label>
      <input id="queryAccount" v-model="query" type="text" placeholder="請輸入帳號" />
      <button class="query-btn" @click="handleQuery">查詢</button>
    </div>
    <div class="account-table-box">
      <table class="account-table">
        <thead>
          <tr>
            <th>帳號ID</th>
            <th>帳號狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredAccounts" :key="item.id">
            <td class="id-cell">{{ item.id }}</td>
            <td class="status-cell">{{ item.status }}</td>
            <td class="action-cell"><button class="manage-btn" @click="manageAccount(item.id)">管理</button></td>
          </tr>
          <tr v-if="filteredAccounts.length === 0">
            <td colspan="3" class="empty-tip">查無資料</td>
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
const accounts = ref([
  { id: 'user001', status: '啟用' },
  { id: 'user002', status: '停用' },
  { id: 'user003', status: '啟用' }
])

const handleQuery = () => {
  // 目前使用 computed filteredAccounts，按查詢保留目前行為（可加入回到第一頁等）
}

const filteredAccounts = computed(() => {
  if (!query.value) return accounts.value
  return accounts.value.filter(a => a.id.includes(query.value))
})

const manageAccount = (id) => {
  // 導到會員中心並帶上 accountId 作為 query
  router.push({ path: '/member-center', query: { accountId: id } })
}
</script>

<style scoped>
.citizen-account-page {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.08);
  padding: 28px 28px;
  margin: 24px auto;
  max-width: 880px;
}
.account-title {
  font-size: 1.4rem;
  color: #5f8ba8;
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
  padding: 14px 16px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.account-query-box label {
  color: #5f8ba8;
  font-weight: 700;
  margin-right: 6px;
}
.account-query-box input {
  border: 1.5px solid #e5e5e5;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 1rem;
  width: 240px;
}
.query-btn {
  background: #5f8ba8;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 0.95rem;
  cursor: pointer;
  font-weight: 700;
}
.account-table-box {
  margin-top: 12px;
  overflow: auto;
}
.account-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
  min-width: 640px;
}
.account-table thead th {
  background: #5f8ba8;
  color: #fff;
  font-weight: 700;
  padding: 12px 16px;
  text-align: left;
}
.account-table tbody tr {
  background: #fff;
  border-bottom: 1px solid #f0f0f2;
}
.account-table tbody tr:hover {
  background: #fff8f6;
}
.account-table td {
  padding: 14px 16px;
  font-size: 1rem;
  color: #333;
  vertical-align: middle;
}
.id-cell { font-weight: 600; color: #334e5c; }
.status-cell { color: #6b6f76; }
.action-cell { text-align: right; }
.manage-btn {
  background: linear-gradient(90deg,#ff7b8a,#e35d6a);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.95rem;
  cursor: pointer;
  font-weight: 700;
}
.empty-tip {
  color: #999;
  text-align: center;
  padding: 18px 0;
}

@media (max-width: 720px) {
  .account-query-box { flex-direction: column; align-items: stretch; }
  .account-query-box input { width: 100%; }
  .account-table { min-width: 0; }
  .account-table thead { display: none; }
  .account-table tbody td { display: block; padding: 10px 12px; }
  .action-cell { text-align: left; }
}
</style>
