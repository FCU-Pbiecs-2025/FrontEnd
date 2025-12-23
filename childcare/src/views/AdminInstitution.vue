<template>
  <div class="institution-page">
    <!-- 加載中提示 -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>正在加載機構資料...</p>
    </div>

    <div v-else class="institution-card">
      <div v-if="!isEditPage">
        <div class="title-row">
          <img src="https://img.icons8.com/ios/48/2e6fb7/organization.png" class="icon" alt="icon" />
          <span class="main-title">機構管理</span>
        </div>
        <div class="query-card">
          <div class="query-row">
            <div class="search-area">
              <label class="search-label" for="queryInstitution">查詢條件：</label>
              <input id="queryInstitution" type="text" v-model="searchKeyword" placeholder="請輸入機構名稱" class="search-input" :disabled="!isSuperAdmin" />
            </div>
            <div class="btn-query">
             <button class="btn primary" @click="addNew" :disabled="!isSuperAdmin">新增</button>
             <button class="btn query" @click="doQuery" :disabled="!isSuperAdmin">查詢</button>
            </div>
          </div>
        </div>
        <div class="table-section">
          <table class="institution-table">
            <thead>
              <tr>
                <th>機構名稱</th>
                <th>聯絡人</th>
                <th>聯絡電話</th>
                <th>地址</th>
                <th>機構類型</th>
                <th>帳號狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in displayList" :key="item.institutionID">
                <td class="name-cell">{{ item.institutionName }}</td>
                <td class="director-cell">{{ item.contactPerson }}</td>
                <td class="phone-cell">{{ item.phoneNumber }}</td>
                <td class="address-cell">{{ item.address }}</td>
                <td class="type-cell">{{ item.institutionsType ? '公托' : '準公托' }}</td>
                <td class="status-cell">
                  <span :class="['status-badge', getStatusClass(item.accountStatus)]">
                    {{ getStatusText(item.accountStatus) }}
                  </span>
                </td>
                <td class="action-cell">
                  <div style="display: flex; gap: 8px;">
                    <button class="btn small" style="min-width: 60px; height: 36px;" @click="edit(item)">編輯</button>
                  </div>
                </td>
              </tr>
              <tr v-if="displayList.length === 0">
                <td colspan="7" class="empty-tip">查無資料</td>
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
          size="md"
          @prev="prevPage"
          @next="nextPage"
          @goToPage="goToPageComponent"
        />

        <div class="bottom-row">
          <button class="btn primary" v-show="hasQueried" @click="goBack">返回</button>
        </div>
      </div>
      <router-view v-else />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getInstitutionsWithOffset, getInstitutionsWithNameSearch } from '@/api/Institution.js'
import Pagination from '@/components/Pagination.vue'
import { useAuthStore } from '@/store/auth.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 判斷是否為 super_admin
const isSuperAdmin = computed(() => authStore.user?.role === 'super_admin')
// 取得當前使用者的機構 ID（admin 角色使用）
const institutionId = computed(() => authStore.user?.InstitutionID || null)

const STORAGE_KEY = 'institutionData'
const searchKeyword = ref('')
const allInstitutions = ref([])
const isLoading = ref(false)
const hasQueried = ref(false)
const currentPage = ref(0) // 0-based
const pageSize = ref(10)
const totalPages = ref(0)
const totalElements = ref(0)
const hasNext = ref(false)

// 顯示的機構列表（直接使用後端分頁結果，不再進行前端過濾）
const displayList = computed(() => {
  return allInstitutions.value
})

// 分頁按鈕頁碼（1-based 顯示）
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

// 載入機構資料
const loadInstitutions = async (offset = 0, search = null) => {
  try {
    isLoading.value = true

    // Debug: 檢查使用者資訊
    console.log('===== AdminInstitution Debug =====')
    console.log('authStore.user:', authStore.user)
    console.log('isSuperAdmin:', isSuperAdmin.value)
    console.log('institutionId:', institutionId.value)
    console.log('user role:', authStore.user?.role)
    console.log('user InstitutionID:', authStore.user?.InstitutionID)
    console.log('search keyword:', search)

    // 根據角色決定是否帶機構 ID：super_admin 看全部，admin 只看自己機構
    const institutionIdParam = isSuperAdmin.value ? null : institutionId.value
    console.log('institutionIdParam to API:', institutionIdParam)
    console.log('==================================')

    // 使用新的機構名稱專用搜尋API
    const response = await getInstitutionsWithNameSearch(offset, pageSize.value, institutionIdParam, search)

    // 轉換資料格式
    allInstitutions.value = response.content || []

    // Debug: 檢查 accountStatus
    console.log('===== 機構資料 accountStatus 檢查 =====')
    console.log('總共載入機構數:', allInstitutions.value.length)
    console.log('後端原始回應 (第一個機構):', response.content?.[0])
    allInstitutions.value.forEach((inst, index) => {
      console.log(`機構 ${index + 1}: ${inst.institutionName}`)
      console.log(`  - accountStatus:`, inst.accountStatus, `(type: ${typeof inst.accountStatus})`)
    })
    console.log('========================================')

    // 更新分頁資訊（後端為 0-based page）
    currentPage.value = Math.floor(offset / pageSize.value)
    totalElements.value = Number(response.totalElements ?? allInstitutions.value.length) || 0
    const apiTotalPages = Number(response.totalPages)
    totalPages.value = apiTotalPages > 0 ? apiTotalPages : Math.max(1, Math.ceil(totalElements.value / pageSize.value))
    hasNext.value = Boolean(response.hasNext)
  } catch (error) {
    console.error('載入機構資料失敗:', error)
    alert('載入機構資料失敗，請稍後再試')
    loadListFromLocalStorage()
    // 本地資料的分頁回退
    totalElements.value = allInstitutions.value.length
    totalPages.value = Math.max(1, Math.ceil(totalElements.value / pageSize.value))
    currentPage.value = Math.floor(offset / pageSize.value)
    hasNext.value = currentPage.value + 1 < totalPages.value
  } finally {
    isLoading.value = false
  }
}

// 從 localStorage 載入資料（備援）
const loadListFromLocalStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      allInstitutions.value = JSON.parse(raw)
    }
  } catch (e) {
    console.error('loadList error', e)
  }
}

// 儲存到 localStorage（相容性）
const saveList = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allInstitutions.value))
}

// 初始化載入資料
onMounted(() => { loadInstitutions(0) })

// 監聽路由變化，從編輯頁面返回時重新載入資料
watch(() => route.name, (newName, oldName) => {
  if (newName === 'AdminInstitution' && (oldName === 'AdminInstitutionNew' || oldName === 'AdminInstitutionEdit')) {
    loadInstitutions(0)
    searchKeyword.value = ''
    hasQueried.value = false
  }
})

// 查詢功能 - 重置分頁並使用後端搜尋（僅搜尋機構名稱）
const doQuery = async () => {
  hasQueried.value = true
  currentPage.value = 0 // 重置到第一頁
  const searchTerm = searchKeyword.value.trim()
  await loadInstitutions(0, searchTerm || null)
}

// 分頁切換（底層，0-based page）
const goToPage = async (page) => {
  if (page < 0 || page >= totalPages.value) return
  const offset = page * pageSize.value
  const searchTerm = hasQueried.value ? searchKeyword.value.trim() : null
  await loadInstitutions(offset, searchTerm || null)
}

// Pagination 元件事件包裝（1-based 轉 0-based）
const goToPageComponent = (pageOneBased) => { goToPage(pageOneBased - 1) }
const prevPage = () => { if (currentPage.value > 0) goToPage(currentPage.value - 1) }
const nextPage = () => { if (hasNext.value && currentPage.value + 1 < totalPages.value) goToPage(currentPage.value + 1) }

const addNew = () => { router.push({ name: 'AdminInstitutionNew' }) }

const edit = (item) => {
  router.push({
    name: 'AdminInstitutionEdit',
    params: { institutionID: item.institutionID }
  }).catch(error => { console.error('路由跳轉失敗:', error) })
}

const goBack = () => {
  searchKeyword.value = ''
  hasQueried.value = false
  loadInstitutions(0) // 重新載入所有資料
}

// 取得帳號狀態文字
const getStatusText = (status) => {
  console.log('[AdminInstitution] getStatusText - status:', status, 'type:', typeof status)

  // 處理 undefined 和 null
  if (status === undefined || status === null) {
    console.warn('[AdminInstitution] status 為 undefined 或 null')
    return '未知'
  }

  // 轉換為數字進行比較
  const statusNum = Number(status)
  console.log('[AdminInstitution] statusNum:', statusNum)

  switch(statusNum) {
    case 0: return '停用'
    case 1: return '啟用'
    default: return '未知'
  }
}

// 取得帳號狀態樣式類別
const getStatusClass = (status) => {
  // 處理 undefined 和 null
  if (status === undefined || status === null) {
    return 'status-unknown'
  }

  // 轉換為數字進行比較
  const statusNum = Number(status)

  switch(statusNum) {
    case 0: return 'status-inactive'
    case 1: return 'status-active'
    default: return 'status-unknown'
  }
}

const isEditPage = computed(() => route.name === 'AdminInstitutionNew' || route.name === 'AdminInstitutionEdit')
</script>

<style scoped>
.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; min-height: 400px; }
.spinner { width: 40px; height: 40px; border: 4px solid #e6f2ff; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 20px; }
@keyframes spin { to { transform: rotate(360deg); } }

.btn-query { display: flex; justify-content: center; margin-top: 30px; }
.institution-page {
  display: flex;
  justify-content: center;
}
.institution-card {
  max-width:820px;min-width: 85%
}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px;margin-top: 60px }
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700 }
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:14px 18px; margin-bottom:50px; box-shadow:0 2px 8px rgba(16,24,40,0.04); margin-top:50px; }
.query-row { display:flex; align-items:center; gap:12px; flex-direction: column; }
.search-area{gap: 30px; display: flex; align-items: center; margin-bottom: 8px;}
.search-label { font-weight:600; color:#2e6fb7 }
.search-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; width:300px }
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600; transition: all 0.2s; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff ;margin-right: 12px; }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6; margin-right:6px; }
.institution-table { width:100%; border-collapse:collapse }
.institution-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight:700; font-size:1rem; }
.institution-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; font-size:1rem; }
.name-cell { font-weight:600; color:#334e5c }
.director-cell { color:#334e5c }
.phone-cell { color:#6b6f76 }
.address-cell { color:#6b6f76 }
.type-cell { color:#2e6fb7; font-weight: 500; }
.status-cell { text-align: center; }
.status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 0.9rem; font-weight: 600; }
.status-active { background: #d1fae5; color: #065f46; }
.status-inactive { background: #fee2e2; color: #991b1b; }
.status-unknown { background: #f3f4f6; color: #6b7280; }
.action-cell { text-align:left }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:10vh; margin-bottom: 20px}
@media (max-width:900px){ .institution-card{ width:100%; padding:16px } .search-input{ width:100% } }
</style>
