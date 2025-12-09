<template>
  <div class="account-page">
    <!-- 加載中提示 -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>正在加載帳號資料...</p>
    </div>

    <!-- 帳號列表 -->
    <div v-else class="account-card">
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
            <tr v-for="item in displayAccounts" :key="item.userID">
              <td class="id-cell">{{ item.account }}</td>
              <td class="status-cell">{{ item.statusText }}</td>
              <td class="action-cell">
                <button class="btn small" @click="manageAccount(item.userID)">管理</button>
              </td>
            </tr>
            <tr v-if="displayAccounts.length === 0">
              <td colspan="3" class="empty-tip">查無資料</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁控制：改用 Pagination 元件 -->
      <Pagination
        :currentPage="currentPage + 1"
        :totalPages="totalPages"
        :totalElements="totalElements"
        :pageNumbers="pageNumbers"
        :displayCount="searchQuery ? displayAccounts.length : null"
        size="md"
        @prev="prevPage"
        @next="nextPage"
        @goToPage="goToPageComponent"
      />

      <div class="bottom-row" v-if="hasQueried">
        <button class="btn primary" @click="goBack">返回</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getUsersWithOffset, getAccountStatusName } from '@/api/account.js'
import Pagination from '@/components/Pagination.vue'

const router = useRouter()
const query = ref('')
const searchQuery = ref('') // 實際執行搜尋的關鍵字
const isLoading = ref(false)
const allAccounts = ref([]) // 當前頁顯示的民眾帳號
const allCitizenAccounts = ref([]) // 儲存所有民眾帳號（未分頁）
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)
const totalElements = ref(0)
const hasNext = ref(false)
const hasQueried = ref(false) // 是否已執行過查詢

// 顯示的帳號列表（考慮搜尋過濾）
const displayAccounts = computed(() => {
  if (!searchQuery.value.trim()) {
    return allAccounts.value
  }
  return allAccounts.value.filter(a =>
    a.account.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 分頁頁碼（1-based 顯示）
const pageNumbers = computed(() => {
  const tpRaw = Number(totalPages.value)
  const tp = tpRaw > 0 ? tpRaw : 1
  const cpRaw = Number(currentPage.value + 1)
  const cp = cpRaw > 0 ? cpRaw : 1
  const maxButtons = 5
  if (tp <= maxButtons) return Array.from({ length: tp }, (_, i) => i + 1)
  const half = Math.floor(maxButtons / 2)
  let start = Math.max(1, cp - half)
  let end = Math.min(tp, start + maxButtons - 1)
  if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1)
  const arr = []
  for (let i = start; i <= end; i++) arr.push(i)
  return arr
})

// 載入所有民眾帳號資料（從 API 一次性加載）
const loadAllAccounts = async () => {
  try {
    isLoading.value = true
    // 先獲取第一頁，取得總筆數
    const firstResponse = await getUsersWithOffset(0, 100) // 使用較大的 size

    // 計算需要載入多少頁
    const totalElementsFromAPI = firstResponse.totalElements || 0
    const needPages = Math.ceil(totalElementsFromAPI / 100)

    let allUsers = [...firstResponse.content]

    // 如果還有更多頁，繼續載入
    if (needPages > 1) {
      const promises = []
      for (let i = 1; i < needPages; i++) {
        promises.push(getUsersWithOffset(i * 100, 100))
      }
      const responses = await Promise.all(promises)
      responses.forEach(res => {
        allUsers = allUsers.concat(res.content)
      })
    }

    // 過濾只顯示 permissionType=3 的一般使用者
    const citizenAccounts = allUsers.filter(user => {
      const raw = user.PermissionType ?? user.permissionType ?? null
      const p = raw != null && raw !== '' ? Number(raw) : null
      return p === 3
    })

    // 轉換資料格式並添加狀態文字
    allCitizenAccounts.value = citizenAccounts.map(user => ({
      ...user,
      statusText: getAccountStatusName(user.accountStatus)
    }))

    // 設定為第一頁
    currentPage.value = 0
    updatePaginationInfo()
  } catch (error) {
    console.error('載入帳號資料失敗:', error)
    alert('載入帳號資料失敗，請稍後再試')
    // 回退：使用空列表
    allCitizenAccounts.value = []
    totalElements.value = 0
    totalPages.value = 1
    hasNext.value = false
  } finally {
    isLoading.value = false
  }
}

// 更新分頁資訊
const updatePaginationInfo = () => {
  totalElements.value = allCitizenAccounts.value.length
  totalPages.value = Math.max(1, Math.ceil(totalElements.value / pageSize.value))
  hasNext.value = (currentPage.value + 1) < totalPages.value

  // 更新當前頁顯示的數據
  const start = currentPage.value * pageSize.value
  const end = start + pageSize.value
  allAccounts.value = allCitizenAccounts.value.slice(start, end)
}

// 初始化
loadAllAccounts()

// 查詢功能
const handleQuery = () => {
  // 更新搜尋關鍵字，觸發 displayAccounts 重新計算
  searchQuery.value = query.value
  hasQueried.value = true
}

// 分頁切換（前端分頁）
const goToPage = (page) => {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  updatePaginationInfo()
}

// Pagination 事件包裝（1-based -> 0-based）
const goToPageComponent = (pageOneBased) => { goToPage(pageOneBased - 1) }
const prevPage = () => { if (currentPage.value > 0) goToPage(currentPage.value - 1) }
const nextPage = () => { if (hasNext.value && currentPage.value + 1 < totalPages.value) goToPage(currentPage.value + 1) }

// 管理帳號
const manageAccount = (userID) => {
  router.push({ path: '/member-center', query: { accountId: userID } })
}

// 返回
const goBack = () => {
  // 清空搜尋
  query.value = ''
  searchQuery.value = ''
  hasQueried.value = false
}
</script>

<style scoped>
.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; min-height: 400px; }
.spinner { width: 40px; height: 40px; border: 4px solid #e6f2ff; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 20px; }
@keyframes spin { to { transform: rotate(360deg); } }

.account-page{display: flex ; justify-content: center; }
.account-card { max-width:820px;min-width: 85%}
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
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600; transition: all 0.2s; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6 }
.btn.page-btn { background:#f3f4f6; color:#334e5c; padding:6px 14px; }
.btn.page-btn:hover:not(:disabled) { background:#e6f2ff; color:#2e6fb7; }
.table-section {  }
.account-table { width:100%; border-collapse:collapse }
.account-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight: 700; }
.account-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; }
.id-cell { font-weight:600; color:#334e5c }
.status-cell { color:#6b6f76 }
.action-cell { text-align:left }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.pagination-row { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 20px; padding: 16px; }
.page-info { color: #6b6f76; font-size: 0.95rem; font-weight: 600; }
.bottom-row { display: flex; justify-content:center;margin-top: 10vh; }
@media (max-width:900px){ .account-card{ width:100%; padding:16px } .search-input{ width:100% } }
</style>
