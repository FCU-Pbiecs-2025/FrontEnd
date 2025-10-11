<template>
  <div class="account-page">
    <div class="account-card">
      <div class="title-row">
        <span class="icon">🔷</span>
        <span class="main-title">民眾帳號</span>
      </div>



      <div class="query-card">
        <div class="query-row">
          <div class="search-area">
            <label class="search-label" for="queryAccount">查詢帳號：</label>
            <input id="queryAccount" v-model="query" type="text" placeholder="請輸入帳號" class="search-input" />
          </div>
          <button class="btn query" @click="handleQuery">查詢</button>
        </div>
      </div>



      <div class="table-section">
        <table class="account-table">
          <thead>
            <tr>
              <th>帳號ID</th>
              <th>帳號狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in resultAccounts" :key="item.id">
              <td class="id-cell">{{ item.id }}</td>
              <td class="status-cell">{{ item.status }}</td>
              <td class="action-cell">
                <button class="btn small" @click="manageAccount(item.id)">管理</button>
              </td>
            </tr>
            <tr v-if="resultAccounts.length === 0">
              <td colspan="3" class="empty-tip">查無資料</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bottom-row" v-show="showBack">
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
const accounts = ref([
  { id: 'user001', status: '啟用' },
  { id: 'user002', status: '停用' },
  { id: 'user003', status: '啟用' }
])
const resultAccounts = ref([...accounts.value])
const showBack = ref(false)

const handleQuery = () => {
  if (!query.value) {
    resultAccounts.value = [...accounts.value]
  } else {
    resultAccounts.value = accounts.value.filter(a => a.id.includes(query.value))
  }
  showBack.value = true
  router.push({ path: '/admin/citizen' })
}

const manageAccount = (id) => {
  // 導到會員中心並帶上 accountId 作為 query
  router.push({ path: '/member-center', query: { accountId: id } })
}

const goBack = () => {
  query.value = ''
  resultAccounts.value = [...accounts.value]
  showBack.value = false
  router.replace({ path: '/admin/citizen' })
}
</script>

<style scoped>
.account-page{display: flex ; justify-content: center; }
.account-card { width:820px;}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:8px;margin-top: 60px }
.icon { font-size:20px }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700 }
.tab-row { display:flex; justify-content:center; margin-bottom:16px ;flex-direction: column}
.tab-title { margin:20px auto 0 auto; color: #2e6db5; font-weight:700; font-size:1.05rem; padding:6px 28px; border-radius:18px; }
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:14px 18px; margin-bottom:50px; box-shadow:0 2px 8px rgba(16,24,40,0.04);margin-top:50px;  }
.query-row { display:flex; align-items:center; gap:12px ;flex-direction: column}
.search-area{gap: 30px; display: flex; align-items: center; margin-bottom: 8px;}
.search-label { font-weight:600; color:#2e6fb7 }
.search-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; width:300px }
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600 }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6 }
.table-section {  }
.account-table { width:100%; border-collapse:collapse }
.account-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight: 700; }
.account-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; }
.id-cell { font-weight:600; color:#334e5c }
.status-cell { color:#6b6f76 }
.action-cell { text-align:right }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.bottom-row { display: flex; justify-content:center;margin-top: 10vh; }
@media (max-width:900px){ .account-card{ width:100%; padding:16px } .search-input{ width:100% } }
</style>
