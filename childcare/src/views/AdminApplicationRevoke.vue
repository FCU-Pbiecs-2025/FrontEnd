<template>
  <div class="announcement-page">
    <!-- 主要列表內容 - 當沒有子路由時顯示 -->
    <div class="announcement-card" v-show="!route.params.id">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/delete-sign.png" class="icon" alt="icon" />
        <span class="main-title">撤銷審核</span>
      </div>

      <div class="query-card">
        <div class="query-container">
          <div class="query-row">
            <div class="search-area">
              <label class="type-label">流水案號：</label>
              <input v-model="filters.revokeId" placeholder="請輸入流水案號" class="date-input" style="width:200px" />
            </div>
          </div>
          <div class="query-row">
            <div class="search-area">
              <label class="type-label">幼兒身分證：</label>
              <input v-model="filters.applicant" placeholder="幼兒身分證字號" class="date-input" style="width:200px" />
            </div>
          </div>
        </div>
        <div class="btn-query">
          <button class="btn query" @click="search">查詢</button>
        </div>
      </div>
      <div class="table-section">
        <table class="announcement-table">
          <thead>
            <tr>
              <th>流水案號</th>
              <th>申請日期</th>
              <th>申請人</th>
              <th>幼兒身分證</th>
              <th>機構</th>
              <th>撤銷原因</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td class="date-cell">{{ item.caseNumber || item.id }}</td>
              <td class="date-cell">{{ item.Date }}</td>
              <td class="title-cell">{{ item.applicant }}</td>
              <td class="title-cell">{{ item.nationalID }}</td>
              <td class="title-cell">{{ item.institution }}</td>
              <td class="title-cell">{{ item.reason || item.status }}</td>
              <td class="action-cell">
                <button class="btn small danger" @click="openDetail(item)">撤銷</button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="7" class="empty-tip">{{ isLoading ? '載入中…' : '目前沒有需要撤銷的案件' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁控制：改用 Pagination 元件 -->
      <Pagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        :totalElements="totalElements"
        :pageNumbers="pageNumbers"
        size="md"
        @prev="prevPage"
        @next="nextPage"
        @goToPage="goToPage"
      />

      <div class="bottom-row" v-show="showBack">
        <button class="btn primary" @click="goBack">返回</button>
      </div>
    </div>

    <!-- 子路由視圖 - 當有子路由時顯示 -->
    <router-view v-if="route.params.id" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchRevokedApplications, searchRevokedApplications } from '@/api/revokes'
import { useAuthStore } from '@/store/auth.js'
import Pagination from '@/components/Pagination.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const filters = ref({ type: '', revokeId: '', applicant: '' })

// 原始完整資料列表（當前分頁的資料，由後端載入）
const fullList = ref([])

// 顯示的資料列表
const items = ref([])
const showBack = ref(false)

// 分頁狀態（採 1-based，與其他頁一致）
const PAGE_SIZE = 10
const currentPage = ref(1)
const totalPages = ref(1)
const totalElements = ref(0)
const isLoading = ref(false)
const isSearching = ref(false)

function filterList(list) {
  const qId = filters.value.revokeId.trim() // 現在代表 caseNumber
  const qApplicant = filters.value.applicant.trim() // 幼兒身分證
  const qType = filters.value.type
  return list.filter(item => {
    if (qType && item.type !== qType) return false
    if (qId) {
      const cn = String(item.caseNumber || item.id || '').toLowerCase()
      if (!cn.includes(qId.toLowerCase())) return false
    }
    if (qApplicant && !String(item.nationalID || '').includes(qApplicant)) return false
    return true
  })
}

async function loadData() {
  try {
    isLoading.value = true
    isSearching.value = false

    // 判斷使用者角色，如果是 admin 則只查詢該機構的資料
    const userRole = authStore.user?.role
    const institutionID = authStore.user?.InstitutionID

    console.log('🔍 [AdminApplicationRevoke] loadData - authStore.user:', authStore.user)
    console.log('🔍 [AdminApplicationRevoke] loadData - userRole:', userRole)
    console.log('🔍 [AdminApplicationRevoke] loadData - institutionID:', institutionID)

    // admin 使用者：傳入 institutionID 過濾
    // super_admin：不傳 institutionID，查看所有機構資料
    const filterInstitutionID = (userRole === 'admin' && institutionID) ? institutionID : null

    const result = await fetchRevokedApplications(currentPage.value - 1, PAGE_SIZE, filterInstitutionID)

    const { items: list, totalPages: tp, totalElements: te } = result

    fullList.value = list
    totalPages.value = tp
    totalElements.value = te

    // 若目前為查詢狀態，維持查詢結果；否則顯示全部
    items.value = showBack.value ? filterList(fullList.value) : [...fullList.value]
  } catch (e) {
    console.error('載入撤銷申請清單失敗：', e)
    fullList.value = []
    items.value = []
    totalPages.value = 1
    totalElements.value = 0
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})

watch(() => route.query.refresh, (val) => {
  if (val === '1') {
    loadData()
    // 清除參數避免重複刷新
    router.replace({ query: { ...route.query, refresh: undefined } })
  }
})

async function search(page = 1) {
  // 如果沒有任何搜尋條件，回到列表模式
  const hasCase = filters.value.revokeId.trim() !== ''
  const hasChildNid = filters.value.applicant.trim() !== ''
  if (!hasCase && !hasChildNid) {
    currentPage.value = 1
    await loadData()
    showBack.value = false
    return
  }

  // 保證 page 為有效數字
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;

  try {
    isLoading.value = true
    isSearching.value = true

    const userRole = authStore.user?.role
    const userInstitutionID = authStore.user?.InstitutionID

    console.log('🔍 [AdminApplicationRevoke] search - authStore.user:', authStore.user)
    console.log('🔍 [AdminApplicationRevoke] search - userRole:', userRole)
    console.log('🔍 [AdminApplicationRevoke] search - userInstitutionID:', userInstitutionID)

    // 後端期望 cancellationID 與 nationalID；為相容，caseNumber 也同時帶 cancellationID
    const caseNumber = filters.value.revokeId.trim()
    const nationalID = filters.value.applicant.trim() // 幼兒身分證

    const institutionID = (userRole === 'admin' && userInstitutionID) ? userInstitutionID : null

    const { items: list, totalPages: tp, totalElements: te } = await searchRevokedApplications(
      caseNumber,
      nationalID,
      safePage - 1,
      PAGE_SIZE,
      institutionID
    )

    items.value = list
    totalPages.value = tp
    totalElements.value = te
    currentPage.value = safePage
    showBack.value = true
  } catch (e) {
    console.error('搜尋撤銷申請失敗：', e)
    items.value = []
    totalPages.value = 1
    totalElements.value = 0
  } finally {
    isLoading.value = false
  }
}

function openDetail(item) {
  if (!item) {
    console.error('item 為空或未定義')
    alert('無效的撤銷項目資料：項目為空')
    return
  }

  if (!item.id) {
    console.error('item.id 為空或未定義，item:', item)
    alert('無效的撤銷項目資料：缺少ID')
    return
  }

  const targetRoute = {
    name: 'AdminApplicationRevokeEdit',
    params: { id: String(item.id) },
    query: {
      nationalID: (item.nationalID || '').toUpperCase(),
      caseNumber: String(item.caseNumber || '')
    }
  }

  router.push(targetRoute).then(() => {
    console.log('導航成功完成，帶入 cancellationID、caseNumber 與 nationalID:', targetRoute)
  }).catch(err => {
    console.error('導航失敗:', err)
    console.error('錯誤詳情:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    })
    alert('導航失敗：' + err.message)
  })
}

function goBack() {
  filters.value = { type: '', revokeId: '', applicant: '' }
  items.value = [...fullList.value]
  showBack.value = false
  // 回到第一頁清單
  currentPage.value = 1
}

async function goToPage(page) {
  if (page < 1 || page > totalPages.value || page === currentPage.value || isLoading.value) return
  currentPage.value = page
  if (isSearching.value) {
    await search(page)
  } else {
    await loadData()
  }
}

async function nextPage() {
  if (currentPage.value >= totalPages.value || isLoading.value) return
  const next = currentPage.value + 1
  currentPage.value = next
  if (isSearching.value) {
    await search(next)
  } else {
    await loadData()
  }
}

async function prevPage() {
  if (currentPage.value <= 1 || isLoading.value) return
  const prev = currentPage.value - 1
  currentPage.value = prev
  if (isSearching.value) {
    await search(prev)
  } else {
    await loadData()
  }
}

// 頁碼按鈕（最多5個）
const pageNumbers = computed(() => {
  const tp = Number(totalPages.value) || 1
  const cp = Number(currentPage.value) || 1
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
</script>

<style scoped>
.announcement-page {
  display: flex;
  justify-content: center;
}
.announcement-card {
  max-width:820px;min-width: 85%
}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px;margin-top: 60px }
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700 }
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:14px 18px; margin-bottom:50px; box-shadow:0 2px 8px rgba(16,24,40,0.04); margin-top:50px; }
.query-container { display: flex; flex-wrap: wrap; gap: 12px; }
.query-row { display:flex; width: 50%; flex: 0 0 calc(50% - 6px); margin-bottom:12px; }
.search-area { gap:30px; display:flex; align-items:center; width: 100%; }
.type-label { font-weight:600; color:#2e6fb7; min-width: 100px; }
.date-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; flex: 1; max-width:200px; }
.btn-query { display: flex;justify-content: center;margin-top: 30px; }
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6; margin-right:6px; }
.btn.danger { background:#ff7b8a; color:#fff }
.announcement-table { width:100%; border-collapse:collapse ;margin-bottom:12px; }
.announcement-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight:700; }
.announcement-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; }
.date-cell { font-weight:600; color:#334e5c }
.title-cell { color:#334e5c }
.action-cell { text-align:left }
.empty-tip { color:#999; text-align:center; padding:18px 0 }

/* 與其他頁面一致的分頁樣式 */
.pagination-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 24px 0 12px;
  padding: 16px;
  background: #fff;
  border: 1px solid #e6f3ff;
  border-radius: 10px;
}
.pagination-info { font-size: 0.95rem; color: #2e6fb7; font-weight: 600; }
.pagination-controls { display: flex; gap: 8px; align-items: center; }
.pagination-btn { min-width: 40px; height: 40px; display:flex; align-items:center; justify-content:center; border:1px solid #d0d7de; border-radius:8px; background:#fff; color:#2e6fb7; font-weight:600; }
.pagination-btn:disabled { background:#f6f8fa; color:#8b949e; border-color:#d0d7de; cursor:not-allowed }
.btn-active { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff; border-color:#2563eb }

.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:10vh; }
@media (max-width:900px){ .announcement-card{ width:100%; padding:16px } .date-input{ width:100px } .query-row{ width:100%; flex: 0 0 100%; } }
</style>
