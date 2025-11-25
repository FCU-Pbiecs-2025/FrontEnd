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
                <button class="btn small danger" @click="removeAdmin(item.userID)">刪除</button>
              </td>
            </tr>
            <tr v-if="displayAdmins.length === 0">
              <td colspan="5" class="empty-tip">查無資料</td>
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

      <div class="bottom-row">
        <button class="btn primary" v-if="hasQueried" @click="goBack">返回</button>
      </div>
    </div>
    <router-view v-if="isEditPage" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getUsersWithOffset, getPermissionTypeName, getAccountStatusName } from '@/api/account.js'

const router = useRouter()
const route = useRoute()
const STORAGE_KEY = 'backendAccounts'
const query = ref('')
const searchQuery = ref('') // 實際執行搜尋的關鍵字
const admins = ref({})
const allAdmins = ref([]) // 從 API 載入的管理員帳號
const isLoading = ref(false)
const hasQueried = ref(false) // 是否已執行過查詢
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)
const totalElements = ref(0)
const hasNext = ref(false)

// 顯示的帳號列表（考慮搜尋過濾）
const displayAdmins = computed(() => {
  if (!searchQuery.value.trim()) {
    return allAdmins.value
  }
  return allAdmins.value.filter(a =>
    a.account.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (a.institutionName && a.institutionName.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

// 兼容舊資料，補齊 right 欄位
const loadList = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // 兼容舊資料：若無 right，預設為 enable
      Object.values(parsed).forEach(acc => {
        if (!acc.right) acc.right = 'enable'
        // 若 status 欄位存在，則同步到 right
        if (acc.status) {
          acc.right = acc.status
          delete acc.status
        }
        // 若 role 欄位是 enable/suspended，則自動修正為 admin 並將原值放到 right
        if (acc.role === 'enable' || acc.role === 'suspended') {
          acc.right = acc.role
          acc.role = 'admin'
        }
      })
      admins.value = parsed
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
    } else {
      // 初始範例資料
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

const saveList = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(admins.value))
}

const convertToArray = (obj) => {
  return Object.values(obj)
}

// 載入後台帳號資料（從 API）
const loadBackendAccounts = async (offset = 0) => {
  try {
    isLoading.value = true
    const response = await getUsersWithOffset(offset, pageSize.value)

    // 過濾只顯示 permissionType=1 或 2 的管理員和機構人員
    const backendAccounts = response.content.filter(user =>
      user.permissionType === 1 || user.permissionType === 2
    )

    // 轉換資料格式並添加文字
    allAdmins.value = backendAccounts.map(user => ({
      ...user,
      roleText: getPermissionTypeName(user.permissionType),
      statusText: getAccountStatusName(user.accountStatus)
    }))

    // 更新分頁資訊
    currentPage.value = Math.floor(offset / pageSize.value)
    totalPages.value = response.totalPages
    totalElements.value = response.totalElements
    hasNext.value = response.hasNext
  } catch (error) {
    console.error('載入後台帳號資料失敗:', error)
    alert('載入後台帳號資料失敗，請稍後再試')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadList()
  loadBackendAccounts(0)
})

// 監聽路由變化，從編輯頁面返回時重新載入資料
watch(() => route.name, (newName, oldName) => {
  if (newName === 'AdminBackendAccount' && (oldName === 'AdminBackendNew' || oldName === 'AdminBackendEdit')) {
    loadList()
    loadBackendAccounts(0)
    // 重置查詢條件
    query.value = ''
    searchQuery.value = ''
    hasQueried.value = false
  }
})

const handleQuery = () => {
  // 更新搜尋關鍵字，觸發 displayAdmins 重新計算
  searchQuery.value = query.value
  hasQueried.value = true
}

// 分頁切換
const goToPage = async (page) => {
  if (page < 0 || page >= totalPages.value) return
  const offset = page * pageSize.value
  await loadBackendAccounts(offset)
}

const manageAdmin = (userID) => {
  // 使用新的路由跳轉到編輯頁面
  router.push({ name: 'AdminBackendEdit', params: { id: userID } })
}

const removeAdmin = async (userID) => {
  if (!confirm('確定要刪除這個後台帳號嗎？')) return

  // TODO: 這裡應該呼叫刪除 API
  // 目前先從 localStorage 刪除（兼容舊邏輯）
  loadList()
  delete admins.value[userID]
  saveList()

  // 重新載入 API 資料
  await loadBackendAccounts(currentPage.value * pageSize.value)
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
.tab-row { display:flex; justify-content:center; margin-bottom:16px ;flex-direction: column}
.tab-title { margin:20px auto 0 auto; color: #e35d6a; font-weight:700; font-size:1.05rem; padding:6px 28px; border-radius:18px; background: #f9dada; }
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
.btn.danger { background:#ff7b8a; color:#fff }
.btn.page-btn { background:#f3f4f6; color:#334e5c; padding:6px 14px; }
.btn.page-btn:hover:not(:disabled) { background:#e6f2ff; color:#2e6fb7; }
.table-section {  }
.account-table { width:100%; border-collapse:collapse }
.account-table thead th { background: #cfe8ff; color: #2e6fb7; padding: 10px; text-align: left; font-weight: 700; }
.account-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; }
.id-cell { font-weight:600; color:#334e5c }
.name-cell { color:#334e5c }
.role-cell { color:#6b6f76 }
.status-cell { color:#6b6f76 }
.action-cell { text-align:left }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.pagination-row { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 20px; padding: 16px; }
.page-info { color: #6b6f76; font-size: 0.95rem; font-weight: 600; }
.bottom-row { display: flex; justify-content:center; margin-top: 10vh; gap: 12px; margin-bottom: 20px}
@media (max-width:900px){ .account-card{ width:100%; padding:16px } .search-input{ width:100% } }
</style>
