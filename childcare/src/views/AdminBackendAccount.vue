<template>
  <div class="account-page">
    <!-- 加載中提示 -->
    <div v-if="isLoading && !isEditPage" class="loading-container">
      <div class="spinner"></div>
      <p>正在加載帳號資料...</p>
    </div>

    <div v-else-if="!isEditPage" class="account-card">
      <div class="title-row">
        <span class="icon">🛡️</span>
        <span class="main-title">後台帳號管理</span>
      </div>

      <div class="query-card">
        <div class="query-row">
          <div class="search-area">
            <label class="search-label" for="queryAdmin">查詢帳號：</label>
            <input id="queryAdmin" v-model="query" type="text" placeholder="請輸入帳號" class="search-input" />
          </div>
          <div class="btn-query">
            <button class="btn primary" @click="addNew">新增</button>
            <button class="btn query" @click="handleQuery">查詢</button>
          </div>
        </div>
      </div>

      <div class="table-section">
        <table class="account-table">
          <thead>
            <tr>
              <th>帳號ID</th>
              <th>機構名稱</th>
              <th>角色</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in displayAdmins" :key="item.userID">
              <td class="id-cell">{{ item.account }}</td>
              <td class="name-cell">{{ item.institutionName || '—' }}</td>
              <td class="role-cell">{{ item.roleText }}</td>
              <td class="status-cell">{{ item.statusText }}</td>
              <td class="action-cell">
                <button class="btn small" @click="manageAdmin(item.userID)">編輯</button>
              </td>
            </tr>
            <tr v-if="displayAdmins.length === 0">
              <td colspan="5" class="empty-tip">查無資料</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁控制：改用 Pagination 元件 -->
      <Pagination
        :currentPage="currentPage + 1"
        :totalPages="computedTotalPages"
        :totalElements="totalElements"
        :pageNumbers="pageNumbers"
        :displayCount="searchQuery ? displayAdmins.length : null"
        size="md"
        @prev="prevPage"
        @next="nextPage"
        @goToPage="goToPageComponent"
      />

      <div class="bottom-row">
        <button class="btn primary" v-if="hasQueried" @click="goBack">返回</button>
      </div>
    </div>
    <router-view v-if="isEditPage" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getUsersWithOffset, searchUsersByAccount, getPermissionTypeName, getAccountStatusName } from '@/api/account.js'
import Pagination from '@/components/Pagination.vue'

const router = useRouter()
const route = useRoute()
const STORAGE_KEY = 'backendAccounts'
const query = ref('')
const searchQuery = ref('') // 實際執行搜尋的關鍵字
const admins = ref({})
const allAdmins = ref([]) // 當前頁顯示的管理員帳號
const allBackendAccounts = ref([]) // 儲存所有後台帳號（未分頁）
const isLoading = ref(false)
const hasQueried = ref(false) // 是否已執行過查詢
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)
const totalElements = ref(0)
const hasNext = ref(false)

// 顯示的帳號列表（搜尋已在後端完成，直接顯示當前頁資料）
const displayAdmins = computed(() => {
  return allAdmins.value
})

// 兼容舊資料，補齊 right 欄位
const loadList = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      Object.values(parsed).forEach(acc => {
        if (!acc.right) acc.right = 'enable'
        if (acc.status) {
          acc.right = acc.status
          delete acc.status
        }
        if (acc.role === 'enable' || acc.role === 'suspended') {
          acc.right = acc.role
          acc.role = 'admin'
        }
      })
      admins.value = parsed
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
    } else {
      admins.value = {
        'admin01': { id: 'admin01', org: '市政府', role: 'super_admin', right: 'enable', password: 'pass123' },
        'admin02': { id: 'admin02', org: '托育中心A', role: 'admin', right: 'enable', password: 'pass456' },
        'admin03': { id: 'admin03', org: '托育中心B', role: 'admin', right: 'suspended', password: 'pass789' }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(admins.value))
    }
  } catch (e) {
    console.error('loadList error', e)
  }
}

// 載入所有後台帳號資料（從 API 一次性加載）
const loadAllBackendAccounts = async () => {
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

    // 過濾只顯示 permissionType=1 或 2 的管理員和機構人員
    const backendAccounts = allUsers.filter(user => {
      const raw = user.PermissionType ?? user.permissionType ?? null
      const p = raw != null && raw !== '' ? Number(raw) : null
      return p === 1 || p === 2
    })

    // 轉換資料格式並添加文字
    allBackendAccounts.value = backendAccounts.map(user => ({
      ...user,
      roleText: getPermissionTypeName(user.PermissionType ?? user.permissionType ?? null),
      statusText: getAccountStatusName(user.accountStatus)
    }))

    // 設定為第一頁
    currentPage.value = 0
    updatePaginationInfo()
  } catch (error) {
    console.error('載入後台帳號資料失敗:', error)
    alert('載入後台帳號資料失敗，請稍後再試')
  } finally {
    isLoading.value = false
  }
}

// 更新分頁資訊
const updatePaginationInfo = () => {
  totalElements.value = allBackendAccounts.value.length
  totalPages.value = Math.max(1, Math.ceil(totalElements.value / pageSize.value))
  hasNext.value = (currentPage.value + 1) < totalPages.value

  // 更新當前頁顯示的數據
  const start = currentPage.value * pageSize.value
  const end = start + pageSize.value
  allAdmins.value = allBackendAccounts.value.slice(start, end)
}

// 初始化
loadList()
loadAllBackendAccounts()

// 監聽路由變化，從編輯頁面返回時重新載入資料
watch(() => route.name, (newName, oldName) => {
  if (newName === 'AdminBackendAccount' && (oldName === 'AdminBackendNew' || oldName === 'AdminBackendEdit')) {
    loadList()
    loadAllBackendAccounts()
    // 重置查詢條件
    query.value = ''
    searchQuery.value = ''
    hasQueried.value = false
  }
})

const handleQuery = async () => {
  // 如果沒有輸入查詢關鍵字，載入所有資料
  if (!query.value.trim()) {
    searchQuery.value = ''
    hasQueried.value = false
    currentPage.value = 0
    await loadAllBackendAccounts()
    return
  }

  // 呼叫後端 API 進行搜尋
  try {
    isLoading.value = true
    searchQuery.value = query.value
    hasQueried.value = true
    currentPage.value = 0

    // 先載入第一頁，取得總筆數
    const firstResponse = await searchUsersByAccount(searchQuery.value, 0, 100)

    // 計算需要載入多少頁
    const totalElementsFromAPI = firstResponse.totalElements || 0
    const needPages = Math.ceil(totalElementsFromAPI / 100)

    let allUsers = [...firstResponse.content]

    // 如果還有更多頁，繼續載入
    if (needPages > 1) {
      const promises = []
      for (let i = 1; i < needPages; i++) {
        promises.push(searchUsersByAccount(searchQuery.value, i * 100, 100))
      }
      const responses = await Promise.all(promises)
      responses.forEach(res => {
        allUsers = allUsers.concat(res.content)
      })
    }

    // 過濾只顯示 permissionType=1 或 2 的管理員和機構人員
    const backendAccounts = allUsers.filter(user => {
      const raw = user.PermissionType ?? user.permissionType ?? null
      const p = raw != null && raw !== '' ? Number(raw) : null
      return p === 1 || p === 2
    })

    // 轉換資料格式並添加文字
    allBackendAccounts.value = backendAccounts.map(user => ({
      ...user,
      roleText: getPermissionTypeName(user.PermissionType ?? user.permissionType ?? null),
      statusText: getAccountStatusName(user.accountStatus)
    }))

    // 設定為第一頁
    updatePaginationInfo()
  } catch (error) {
    console.error('搜尋失敗:', error)
    alert('搜尋失敗，請稍後再試')
  } finally {
    isLoading.value = false
  }
}

// 分頁切換（前端分頁）
const goToPage = (page) => {
  if (page < 0 || page >= computedTotalPages.value) return
  currentPage.value = page
  updatePaginationInfo()
}

// 計算總頁數（確保至少為 1）
const computedTotalPages = computed(() => {
  if (totalPages.value > 0) return totalPages.value
  if (totalElements.value > 0) return Math.ceil(totalElements.value / pageSize.value)
  return 1
})

// 分頁頁碼（1-based 顯示，最多 5 顆按鈕）
const pageNumbers = computed(() => {
  const tp = computedTotalPages.value
  const cp = currentPage.value + 1
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

// Pagination 元件事件：跳至指定頁（1-based -> 0-based）
const goToPageComponent = (pageOneBased) => { goToPage(pageOneBased - 1) }
const prevPage = () => { if (currentPage.value > 0) goToPage(currentPage.value - 1) }
const nextPage = () => { if (hasNext.value && currentPage.value + 1 < computedTotalPages.value) goToPage(currentPage.value + 1) }

const manageAdmin = (userID) => {
  // 使用新的路由跳轉到編輯頁面
  router.push({ name: 'AdminBackendEdit', params: { id: userID } })
}

const goBack = () => {
  query.value = ''
  searchQuery.value = ''
  hasQueried.value = false
}

const addNew = () => {
  // 跳轉到新增頁面
  router.push({ name: 'AdminBackendNew' })
}

const isEditPage = computed(() => {
  // 判斷是否在新增/編輯子路由
  return route.name === 'AdminBackendNew' || route.name === 'AdminBackendEdit'
})
</script>

<style scoped>
.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; min-height: 400px; }
.spinner { width: 40px; height: 40px; border: 4px solid #e6f2ff; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 20px; }
@keyframes spin { to { transform: rotate(360deg); } }

.btn-query { display: flex; justify-content: center; margin-top: 30px; }

.account-page{display: flex ; justify-content: center; }
.account-card { max-width:820px;min-width: 85%}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:8px;margin-top: 60px }
.icon { font-size:20px }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700 }
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:14px 18px; margin-bottom:50px; box-shadow:0 2px 8px rgba(16,24,40,0.04);margin-top:50px;  }
.query-row { display:flex; align-items:center; gap:12px ;flex-direction: column}
.search-area{gap: 30px; display: flex; align-items: center; margin-bottom: 8px;}
.search-label { font-weight:600; color:#2e6fb7 }
.search-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; width:300px }
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600; transition: all 0.2s; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff ;margin-right: 12px;}
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6; margin-right:6px; }
.table-section { margin-bottom: 18px; }
.account-table { width:100%; border-collapse:collapse }
.account-table thead th { background: #cfe8ff; color: #2e6fb7; padding: 10px; text-align: left; font-weight: 700; }
.account-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; }
.id-cell { font-weight:600; color:#334e5c }
.name-cell { color:#334e5c }
.role-cell { color:#6b6f76 }
.status-cell { color:#6b6f76 }
.action-cell { text-align:left }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.bottom-row { display: flex; justify-content:center; margin-top: 10vh; gap: 12px; margin-bottom: 20px}
@media (max-width:900px){ .account-card{ width:100%; padding:16px } .search-input{ width:100% } }
</style>
