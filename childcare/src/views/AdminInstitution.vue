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
              <input id="queryInstitution" type="text" v-model="searchKeyword" placeholder="機構名稱" class="search-input" />
            </div>
            <div class="btn-query">
             <button class="btn primary" @click="addNew">新增</button>
             <button class="btn query" @click="doQuery">查詢</button>
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
                <td class="action-cell">
                  <div style="display: flex; gap: 8px;">
                    <button class="btn small" style="min-width: 60px; height: 36px;" @click="edit(item)">編輯</button>
                  </div>
                </td>
              </tr>
              <tr v-if="displayList.length === 0">
                <td colspan="6" class="empty-tip">查無資料</td>
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
import { getInstitutionsWithOffset } from '@/api/Institution.js'

const router = useRouter()
const route = useRoute()

const STORAGE_KEY = 'institutionData'
const searchKeyword = ref('')
const searchQuery = ref('') // 實際執行搜尋的關鍵字
const allInstitutions = ref([]) // 所有機構資料
const isLoading = ref(false)
const hasQueried = ref(false) // 是否已執行過查詢
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)
const totalElements = ref(0)
const hasNext = ref(false)

// 顯示的機構列表（考慮搜尋過濾）
const displayList = computed(() => {
  if (!searchQuery.value.trim()) {
    return allInstitutions.value
  }
  return allInstitutions.value.filter(item =>

    (item.institutionName || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (item.contactPerson || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (item.phoneNumber || '').toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 載入機構資料
const loadInstitutions = async (offset = 0) => {
  try {
    isLoading.value = true
    const response = await getInstitutionsWithOffset(offset, pageSize.value)

    console.log('API 回應:', response)

    // 轉換資料格式
    allInstitutions.value = response.content || []

    // 更新分頁資訊
    currentPage.value = Math.floor(offset / pageSize.value)
    totalPages.value = response.totalPages || 0
    totalElements.value = response.totalElements || 0
    hasNext.value = response.hasNext || false

  } catch (error) {
    console.error('載入機構資料失敗:', error)
    alert('載入機構資料失敗，請稍後再試')
    // 載入失敗時使用 localStorage 備援
    loadListFromLocalStorage()
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
onMounted(() => {
  loadInstitutions(0)
})

// 監聽路由變化，從編輯頁面返回時重新載入資料
watch(() => route.name, (newName, oldName) => {
  if (newName === 'AdminInstitution' && (oldName === 'AdminInstitutionNew' || oldName === 'AdminInstitutionEdit')) {
    loadInstitutions(0)
    // 重置查詢條件
    searchKeyword.value = ''
    searchQuery.value = ''
    hasQueried.value = false
  }
})

// 查詢功能
const doQuery = () => {
  // 更新搜尋關鍵字，觸發 displayList 重新計算
  searchQuery.value = searchKeyword.value
  hasQueried.value = true
}

// 分頁切換
const goToPage = async (page) => {
  if (page < 0 || page >= totalPages.value) return
  const offset = page * pageSize.value
  await loadInstitutions(offset)
}

const addNew = () => {
  router.push({ name: 'AdminInstitutionNew' })
}

const edit = (item) => {
  console.log('========== 編輯機構 ==========')
  console.log('選擇的機構 ID:', item.institutionID)
  console.log('機構名稱:', item.institutionName)
  console.log('========== 開始跳轉 ==========')

  router.push({
    name: 'AdminInstitutionEdit',
    params: { institutionID: item.institutionID }
  }).catch(error => {
    console.error('路由跳轉失敗:', error)
  })
}

const remove = async (item) => {
  if (confirm(`確定要刪除「${item.institutionName}」嗎？`)) {
    // TODO: 實作刪除 API
    // await deleteInstitution(item.institutionID)

    // 目前先從列表中移除
    allInstitutions.value = allInstitutions.value.filter(i => i.institutionID !== item.institutionID)
    saveList()

    alert('刪除成功')
  }
}

const goBack = () => {
  searchKeyword.value = ''
  searchQuery.value = ''
  hasQueried.value = false
}

const isEditPage = computed(() => {
  return route.name === 'AdminInstitutionNew' || route.name === 'AdminInstitutionEdit'
})
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
.btn.danger { background:#ff7b8a; color:#fff }
.btn.page-btn { background:#f3f4f6; color:#334e5c; padding:6px 14px; }
.btn.page-btn:hover:not(:disabled) { background:#e6f2ff; color:#2e6fb7; }
.institution-table { width:100%; border-collapse:collapse }
.institution-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight:700; font-size:1rem; }
.institution-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; font-size:1rem; }
.name-cell { font-weight:600; color:#334e5c }
.director-cell { color:#334e5c }
.phone-cell { color:#6b6f76 }
.address-cell { color:#6b6f76 }
.type-cell { color:#2e6fb7; font-weight: 500; }
.action-cell { text-align:left }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.pagination-row { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 20px; padding: 16px; }
.page-info { color: #6b6f76; font-size: 0.95rem; font-weight: 600; }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:10vh; margin-bottom: 20px}
@media (max-width:900px){ .institution-card{ width:100%; padding:16px } .search-input{ width:100% } }
</style>
