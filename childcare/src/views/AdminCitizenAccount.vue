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

      <!-- 分頁控制 -->
      <div class="pagination-row" v-if="totalPages > 1">
        <button class="btn page-btn" :disabled="currentPage === 0" @click="goToPage(currentPage - 1)">上一頁</button>
        <span class="page-info">第 {{ currentPage + 1 }} / {{ totalPages }} 頁（共 {{ totalElements }} 筆）</span>
        <button class="btn page-btn" :disabled="!hasNext" @click="goToPage(currentPage + 1)">下一頁</button>
      </div>

      <div class="bottom-row" v-if="hasQueried">
        <button class="btn primary" @click="goBack">返回</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUsersWithOffset, getAccountStatusName } from '@/api/account.js'

const router = useRouter()
const query = ref('')
const searchQuery = ref('') // 實際執行搜尋的關鍵字
const isLoading = ref(false)
const allAccounts = ref([]) // 所有一般使用者帳號
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

// 載入帳號資料
const loadAccounts = async (offset = 0) => {
  try {
    isLoading.value = true
    const response = await getUsersWithOffset(offset, pageSize.value)

    // 過濾只顯示 permissionType=3 的一般使用者
    // 從多個可能的欄位名稱讀取權限，並轉成 number 再比較
    const citizenAccounts = response.content.filter(user => {
      const raw = user.PermissionType ?? user.permissionType ?? null
      const p = raw != null && raw !== '' ? Number(raw) : null
      return p === 3
    })

    // 轉換資料格式並添加狀態文字
    allAccounts.value = citizenAccounts.map(user => ({
      ...user,
      statusText: getAccountStatusName(user.accountStatus)
    }))

    // 更新分頁資訊
    currentPage.value = Math.floor(offset / pageSize.value)
    totalPages.value = response.totalPages
    totalElements.value = response.totalElements
    hasNext.value = response.hasNext
  } catch (error) {
    console.error('載入帳號資料失敗:', error)
    alert('載入帳號資料失敗，請稍後再試')
  } finally {
    isLoading.value = false
  }
}

// 查詢功能
const handleQuery = () => {
  // 更新搜尋關鍵字，觸發 displayAccounts 重新計算
  searchQuery.value = query.value
  hasQueried.value = true
}

// 分頁切換
const goToPage = async (page) => {
  if (page < 0 || page >= totalPages.value) return
  const offset = page * pageSize.value
  await loadAccounts(offset)
}

// 管理帳號
const manageAccount = (userID) => {
  if (!userID) return
  const guid = String(userID).toUpperCase()
  router.push({ name: 'ApplicationStatus', query: { userID: guid, refresh: Date.now() } })
}

// 返回
const goBack = () => {
  // 清空搜尋
  query.value = ''
  searchQuery.value = ''
  hasQueried.value = false
  // 不需要導航，留在當前頁面即可
}

// 初始化載入資料
onMounted(() => {
  loadAccounts(0)
})
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
