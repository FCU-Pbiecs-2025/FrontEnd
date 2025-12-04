<template>
  <div class="announcement-page">
    <div class="announcement-card" v-if="!isEditing">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/treatment-plan.png" class="icon" alt="icon" />
        <span class="main-title">個案管理</span>
      </div>

      <!-- Search Filters -->
      <div class="query-card">
        <div class="query-row">
          <div class="search-area">
            <label class="date-label">公托機構：</label>
            <select v-model="qAgency" class="date-input">
              <option value="">全部</option>
              <option v-for="a in agencyOptions" :key="a" :value="a">{{ a }}</option>
            </select>
          </div>
          <div class="search-area">
            <label class="date-label">班級名稱：</label>
            <select v-model="qClassName" class="date-input" :disabled="!qAgency">
              <option value="">{{ qAgency ? '全部' : '請先選擇機構' }}</option>
              <option v-for="cn in classOptions" :key="cn" :value="cn">{{ cn }}</option>
            </select>
          </div>
        </div>
        <div class="query-row">
          <div class="search-area">
            <label class="date-label">申請案號：</label>
            <input type="text" v-model="qCaseId" class="date-input" placeholder="請輸入案件編號" />
          </div>
          <div class="search-area">
            <label class="date-label">幼兒身分證：</label>
            <input type="text" v-model="qApplicantId" class="date-input" placeholder="請輸入身分證字號" />
          </div>
        </div>
        <div class="query-row">
          <div class="search-area">
            <label class="date-label">身分別：</label>
            <select v-model="qIdentity" class="date-input">
              <option value="">全部</option>
              <option v-for="i in identityOptions" :key="i" :value="i">{{ i }}</option>
            </select>
          </div>
          <div class="search-area">
            <label class="date-label">案件狀態：</label>
            <select v-model="qStatus" class="date-input">
              <option value="">全部</option>
              <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>
        <div class="btn-query">
          <button class="btn query" @click="doQuery">查詢</button>
        </div>
      </div>

      <div class="table-section" >
        <table class="announcement-table">
          <thead>
            <tr>
              <th>案件編號</th>
              <th>申請日期</th>
              <th>機構</th>
              <th>申請幼兒資訊</th>
              <th>幼兒年齡</th>
              <th>候補序號</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in resultItems" :key="item.id">
              <td class="date-cell">{{ item.id }}</td>
              <td class="date-cell">{{ item.applyDate }}</td>
              <td class="title-cell">
                <div>{{ item.institution }}</div>
                <div>{{item.className}}</div>
              </td>
              <td>
                <div class="user-col">
                  <div class="user-row"><span>{{ item.childName || '-' }}</span></div>
                  <div class="user-row"><span>{{ item.childNationalId || '-' }}</span></div>
                </div>
              </td>
              <td>
                <div class="child-col">
                  <div class="child-row"><span>{{ ageInYearsMonths(item.childBirth) }}</span></div>
                </div>
              </td>
              <td class="title-cell">{{ item.queueNo ?? '—' }}</td>
              <td class="title-cell">{{ item.status }}</td>
              <td class="action-cell">
                <button class="btn small" @click="goToEditPage(item)" :disabled="!item.participantID">管理</button>
              </td>
            </tr>
            <tr v-if="resultItems.length === 0">
              <td colspan="7" class="empty-tip">目前沒有個案</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁元件 -->
      <Pagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        :totalElements="totalElements"
        :pageNumbers="pageNumbers"
        @prev="prevPage"
        @next="nextPage"
        @goToPage="goToPage"
      />

      <div class="bottom-row">
        <button class="btn primary" v-show="showBack" @click="goBack">返回</button>
      </div>

    </div>

      <router-view />

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getInstitutionsSimpleAll } from '@/api/Institution'
import { getClassNamesByInstitutionId } from '@/api/class'
import { getApplicationsCasesList, IDENTITY_TYPE_MAP, CASE_STATUS_MAP } from '@/api/application'
import Pagination from '@/components/Pagination.vue'

const route = useRoute()
const router = useRouter()
const isEditing = computed(() => route.name === 'AdminCaseManagementEdit')

// Base list - 從 API 加載
const items = ref([])

// Result list (shown in table)
const resultItems = ref([])

// 分頁狀態
const PAGE_SIZE = 10
const currentPage = ref(1)
const totalPages = ref(1)
const totalElements = ref(0)

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

// Query fields
const qAgency = ref('')
const qClassName = ref('')
const qCaseId = ref('')
const qApplicantId = ref('')
const qIdentity = ref('')
const qStatus = ref('')

// Options
const agencyList = ref([]) // 從 API 載入的機構列表
const agencyOptions = computed(() => agencyList.value.map(a => a.institutionName))

// 建立機構名稱 -> ID 的映射
const getInstitutionIdByName = (name) => {
  const institution = agencyList.value.find(a => a.institutionName === name)
  return institution ? institution.institutionID : null
}

// 建立班級名稱 -> ID 的映射
const getClassIdByName = (name) => {
  const classItem = classList.value.find(c => c.className === name)
  if (classItem) {
    return classItem.classId || classItem.id
  }
  return null
}

// 班級列表 - 從 API 動態加載
const classList = ref([])
const classOptions = computed(() => classList.value.map(c => c.className))

const identityOptions = ref(Object.values(IDENTITY_TYPE_MAP))
const statusOptions = ref(Object.values(CASE_STATUS_MAP))

const showBack = ref(false)

// 載入機構資料和初始案件列表
onMounted(async () => {
  try {
    agencyList.value = await getInstitutionsSimpleAll()
    await loadCasesList({ page: 1, size: PAGE_SIZE })
  } catch (error) {
    console.error('載入資料失敗:', error)
  }
})

// 載入案件列表（支援分頁與查詢）
const loadCasesList = async (options = {}) => {
  try {
    const response = await getApplicationsCasesList(options)

    // 更新分頁資訊（若後端提供）
    totalElements.value = Number(response.totalElements ?? response.total ?? 0)
    if (totalElements.value && options.size) {
      totalPages.value = Number(response.totalPages ?? Math.ceil(totalElements.value / options.size))
    } else {
      // 後端未提供總數，使用目前頁面的內容長度做退化處理
      totalPages.value = Number(response.totalPages ?? 1)
    }
    currentPage.value = Number(options.page ?? 1)

    // 將後端資料對應到前端欄位
    items.value = (response.content || []).map(item => ({
      id: item.caseNumber,
      applyDate: item.applicationDate,
      institution: item.institutionName,
      status: item.reviewStatus,
      identityType: IDENTITY_TYPE_MAP[item.identityType] || item.identityType,
      className: item.className,
      applicantName: item.applicantNationalName,
      applicantId: item.applicantNationalId,
      childName: item.childName,
      childBirth: item.childBirthDate,
      childNationalId: item.childNationalId,
      participantID: item.participantID,
      queueNo: item.currentOrder
    }))

    resultItems.value = [...items.value]
  } catch (error) {
    console.error('載入案件列表失敗:', error)
    items.value = []
    resultItems.value = []
    totalElements.value = 0
    totalPages.value = 1
    currentPage.value = 1
  }
}

watch(qAgency, async () => {
  qClassName.value = ''
  classList.value = []

  if (!qAgency.value) return

  try {
    const institutionId = getInstitutionIdByName(qAgency.value)
    if (institutionId) {
      classList.value = await getClassNamesByInstitutionId(institutionId)
    }
  } catch (error) {
    console.error('載入班級列表失敗:', error)
  }
})

// 計算歲月齡（以 2025/10/27 為基準）
const ageInYearsMonths = (dateStr) => {
  if (!dateStr) return '-'
  const birth = new Date(dateStr)
  if (isNaN(birth)) return '-'
  const now = new Date('2025-10-27')
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) months -= 1
  if (months < 0) months = 0
  const years = Math.floor(months / 12)
  const remainMonths = months % 12
  return `${years}歲${remainMonths}月`
}

const doQuery = async () => {
  try {
    const params = {}

    if (qAgency.value) {
      const institutionId = getInstitutionIdByName(qAgency.value)
      if (institutionId) params.institutionId = institutionId
    }
    if (qClassName.value) {
      const classId = getClassIdByName(qClassName.value)
      if (classId) params.classId = classId
    }
    if (qCaseId.value) params.caseNumber = qCaseId.value
    if (qApplicantId.value) params.childNationalId = qApplicantId.value
    if (qIdentity.value) {
      for (const [code, label] of Object.entries(IDENTITY_TYPE_MAP)) {
        if (label === qIdentity.value) { params.identityType = code; break }
      }
    }
    if (qStatus.value) params.status = qStatus.value

    // 查詢從第一頁開始
    params.page = 1
    params.size = PAGE_SIZE

    const response = await getApplicationsCasesList(params)

    // 更新分頁資訊
    totalElements.value = Number(response.totalElements ?? response.total ?? 0)
    totalPages.value = Number(response.totalPages ?? (totalElements.value ? Math.ceil(totalElements.value / PAGE_SIZE) : 1))
    currentPage.value = 1

    resultItems.value = (response.content || []).map(item => ({
      id: item.caseNumber,
      applyDate: item.applicationDate,
      institution: item.institutionName,
      status: item.reviewStatus,
      identityType: IDENTITY_TYPE_MAP[item.identityType] || item.identityType,
      className: item.className,
      applicantName: item.applicantNationalName,
      applicantId: item.applicantNationalId,
      childName: item.childName,
      childBirth: item.childBirthDate,
      childNationalId: item.childNationalId,
      participantID: item.participantID,
      queueNo: item.currentOrder
    }))

    showBack.value = true
  } catch (error) {
    console.error('查詢失敗:', error)
  }
}

const resetQuery = async () => {
  qAgency.value = ''
  qClassName.value = ''
  qCaseId.value = ''
  qApplicantId.value = ''
  qIdentity.value = ''
  qStatus.value = ''
  showBack.value = false

  await loadCasesList({ page: 1, size: PAGE_SIZE })
}

const openCaseDetail = async (item) => {
  console.log('[openCaseDetail] Called with item:', item)
  console.log('[openCaseDetail] Item childNationalId:', item.childNationalId)

  // 首先嘗試從後端獲取完整的案件數據
  let apiData = null
  let useApiData = false

  if (item.childNationalId) {
    try {
      console.log('[openCaseDetail] Fetching API data with childNationalId:', item.childNationalId)
      apiData = await getApplicationCaseByChildrenId(item.childNationalId)
      console.log('[openCaseDetail] API data received:', apiData)

      // 檢查 API 是否返回有效的數據
      if (apiData && (apiData.caseNumber || apiData.id)) {
        useApiData = true
        console.log('[openCaseDetail] API data is valid, will use API data')
      } else {
        console.warn('[openCaseDetail] API returned empty data, using list item instead')
        useApiData = false
      }
    } catch (error) {
      console.warn('[openCaseDetail] API call failed:', error.message || error)
      useApiData = false
    }
  } else {
    console.log('[openCaseDetail] No childNationalId available, will use list item data')
  }

  // 構建案件數據物件
  let caseData = useApiData && apiData ? apiData : item

  const payload = {
    caseId: item.id,
    childNationalId: item.childNationalId || '',
    caseData: caseData,
    fromApi: useApiData,
    itemData: item
  }

  console.log('[openCaseDetail] Payload to save, fromApi:', useApiData)

  try {
    const payloadJson = JSON.stringify(payload)
    sessionStorage.setItem('caseManagementSelection', payloadJson)
    console.log('[openCaseDetail] Saved to sessionStorage')
  } catch (e) {
    console.error('sessionStorage set failed:', e)
  }

  try {
    const payloadJson = JSON.stringify(payload)
    localStorage.setItem('caseManagementSelection', payloadJson)
    console.log('[openCaseDetail] Saved to localStorage')
  } catch (e) {
    console.error('localStorage set failed:', e)
  }

  // 導航到編輯頁面
  router.push({
    path: `/admin/case-management/${item.participantID}/edit`,
    state: { caseManagementSelection: payload }
  })
}

const goBack = () => { resetQuery() }

const goToEditPage = (item) => {
  // 保存案件信息到 sessionStorage，供 AdminCaseManagementEdit 使用
  try {
    sessionStorage.setItem('caseManagementItem', JSON.stringify(item))
    console.log('[goToEditPage] Saved item to sessionStorage:', item)
  } catch (e) {
    console.error('sessionStorage set failed:', e)
  }

  // 導航到編輯頁面
  router.push({
    name: 'AdminCaseManagementEdit',
    params: { participantID: item.participantID }
  })
}

// 分頁事件處理
const goToPage = async (page) => {
  if (page < 1 || page > totalPages.value) return
  const baseParams = {}
  if (qAgency.value) {
    const institutionId = getInstitutionIdByName(qAgency.value)
    if (institutionId) baseParams.institutionId = institutionId
  }
  if (qClassName.value) {
    const classId = getClassIdByName(qClassName.value)
    if (classId) baseParams.classId = classId
  }
  if (qCaseId.value) baseParams.caseNumber = qCaseId.value
  if (qApplicantId.value) baseParams.childNationalId = qApplicantId.value
  if (qIdentity.value) {
    for (const [code, label] of Object.entries(IDENTITY_TYPE_MAP)) {
      if (label === qIdentity.value) { baseParams.identityType = code; break }
    }
  }
  if (qStatus.value) baseParams.status = qStatus.value

  baseParams.page = page
  baseParams.size = PAGE_SIZE

  await loadCasesList(baseParams)
}
const prevPage = () => { if (currentPage.value > 1) goToPage(currentPage.value - 1) }
const nextPage = () => { if (currentPage.value < totalPages.value) goToPage(currentPage.value + 1) }
</script>

<style scoped>
.announcement-page { display:flex; justify-content:center; }
.announcement-card { max-width: 85%}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; margin-top: 60px }
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700 }

/* Query styles borrowed from AdminBannerManager */
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:14px 18px; margin-bottom:50px; box-shadow:0 2px 8px rgba(16,24,40,0.04); margin-top:50px; display: flex; flex-direction: column; align-items: center; }
.query-row { display:flex; gap:12px; margin-bottom:12px; justify-content: space-between; flex-wrap: wrap; width: 100%; }
.search-area { gap:30px; display:flex; align-items:center; margin-bottom:0; width: calc(50% - 6px); }
.date-label { font-weight:600; color:#2e6fb7; min-width: 100px; text-align: right; }
.date-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; width:150px; }
.btn-query { display: flex; justify-content: center; margin-top: 30px; }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }

.table-section { margin-top: 20px; }
.announcement-table { width:100%; border-collapse:collapse; margin-bottom:40px; }
.announcement-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight:700; }
.announcement-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; }
.date-cell { font-weight:600; color:#334e5c }
.title-cell { color:#334e5c }
.action-cell { text-align:left }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600; }
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }

.bottom-row { display: flex; justify-content: center; gap: 12px; margin-top: 10vh; }

.child-col { display: flex; flex-direction: column; gap: 4px; }
.child-row { display: flex; gap: 6px; align-items: center; }

.user-col { display: flex; flex-direction: column; gap: 4px; }
.user-row { display: flex; gap: 6px; align-items: center; }

/* 分頁樣式 */
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding-bottom: 20px;
}

.pagination-info {
  font-size: 0.95rem;
  color: #666;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.pagination-btn {
  background: #f3f4f6;
  color: #2e6fb7;
  border: 1px solid #d8dbe0;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #e6f2ff;
  border-color: #b3d4fc;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.page-btn {
  background: #f3f4f6;
  color: #2e6fb7;
  border: 1px solid #d8dbe0;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  min-width: 32px;
  text-align: center;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #e6f2ff;
  border-color: #b3d4fc;
}

.page-btn.active {
  background: #2e6fb7;
  color: white;
  border-color: #2e6fb7;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .search-area { width: 100%; }
}
</style>
