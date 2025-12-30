<template>
  <div class="announcement-page">
    <div class="announcement-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/approval.png" class="icon" alt="icon" />
        <span class="main-title">審核申請</span>
      </div>

      <div class="query-card">
        <div class="query-container">
          <!-- 只有 super_admin 才顯示機構篩選 -->
          <div class="query-row" v-if="authStore.user?.role === 'super_admin'">
            <div class="search-area">
              <label class="type-label">機構名稱：</label>
              <select v-model="filters.institution" class="date-input" style="width:180px">
                <option value="">全部</option>
                <option v-for="name in institutionOptions" :key="name" :value="name">{{ name }}</option>
              </select>
            </div>
          </div>
          <div class="query-row">
            <div class="search-area">
              <label class="type-label">流水案號：</label>
              <input v-model="filters.applicationId" placeholder="請輸入流水案號" class="date-input" style="width:200px" />
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
              <th>幼兒姓名</th>
              <th>機構</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedItems" :key="item.id">
              <td class="date-cell">{{ item.caseNumber }}</td>
              <td class="date-cell">{{ item.Date }}</td>
              <td class="title-cell">{{ item.applicant }}</td>
              <td class="title-cell">
                <!-- 讓幼兒姓名可點擊，並且會帶入 nationalID 作為 query 去 edit 頁面 -->
                <a href="#" @click.prevent="openDetailWithChild(item)">{{ item.childName }}</a>
              </td>
              <td class="title-cell">{{ item.institution }}</td>
              <td class="title-cell">{{ item.status }}</td>
              <td class="action-cell">
                <button class="btn small" @click="openDetailWithChild(item)">審核</button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="7" class="empty-tip">目前沒有符合條件的申請</td>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getApplicationsByOffset, searchApplications, getApplicationById } from '@/api/application.js';
import { getInstitutionsSimpleAll } from '@/api/Institution.js';
import { useAuthStore } from '@/store/auth.js';
import Pagination from '@/components/Pagination.vue'

const router = useRouter()
const authStore = useAuthStore()
const filters = ref({ institution: '', applicationId: '', applicant: '' })

// 分頁設定
const PAGE_SIZE = 10;
const currentPage = ref(1);
const totalPages = ref(1);
const totalElements = ref(0);

// 分頁頁碼（1-based 顯示，最多 5 顆按鈕）
const pageNumbers = computed(() => {
  const tp = totalPages.value || 1
  const cp = currentPage.value || 1
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

// 原始完整資料列表
const items = ref([]);
const allInstitutions = ref([])
// 追蹤查詢序號，避免過期回應覆蓋最新結果
const activeRequestId = ref(0)

async function fetchApplications() {
  try {
    // 開始新請求前清空列表，避免殘留
    items.value = []
    totalElements.value = 0
    totalPages.value = 1

    const reqId = ++activeRequestId.value
    const offset = (currentPage.value - 1) * PAGE_SIZE;

    // 判斷使用者角色，如果是 admin 則只查詢該機構的資料
    const userRole = authStore.user?.role;
    const institutionID = authStore.user?.InstitutionID;

    let data;
    if (userRole === 'admin' && institutionID) {
      // admin 使用者：使用 searchApplications 並帶入 institutionID
      const searchParams = {
        institutionID: institutionID,
        institutionName: '',
        CaseNumber: ''
      };
      data = await searchApplications(searchParams);
    } else {
      // super_admin 或其他：使用原本的 getApplicationsByOffset
      data = await getApplicationsByOffset(offset, PAGE_SIZE);
    }

    let contentArray = [];
    let backendTotalElements = 0;

    // 判斷回傳的資料格式
    if (Array.isArray(data)) {
      // 直接是陣列
      contentArray = data;
      backendTotalElements = data.length;
    } else if (data && data.content && Array.isArray(data.content)) {
      // 包含 content 屬性的物件 - 使用後端返回的 totalElements
      contentArray = data.content;
      backendTotalElements = data.totalElements || data.content.length;
    }

    if (contentArray.length > 0) {
      // 只保留 participantType === '0' 且狀態為 '審核中' 的所有資料
      const filtered = contentArray.filter(item => String(item.participantType) === '0' && item.status === '審核中');
      const mapped = filtered.map(item => ({
        id: item.applicationID,
        caseNumber: item.caseNumber || item.CaseNumber || '未提供',
        Date: item.applicationDate,
        applicant: item.name || '未提供',
        childName: item.pname || '未提供',
        nationalID: item.nationalID || item.NationalID || null,
        institution: item.institutionName || '未提供',
        status: item.status || '未提供'
      }))

      // 忽略過期回應
      if (reqId !== activeRequestId.value) return

      items.value = mapped
      // 使用過濾後的資料數量作為 totalElements，只計算狀態為 '審核中' 的案件
      totalElements.value = filtered.length
      totalPages.value = Math.max(1, Math.ceil(totalElements.value / PAGE_SIZE))
    } else {
      // 忽略過期回應
      if (reqId !== activeRequestId.value) return
      items.value = []
      totalElements.value = 0
      totalPages.value = 1
    }
  } catch (e) {
    // 忽略過期回應
    // 仍以清空狀態顯示，避免殘留
    items.value = []
    totalElements.value = 0
    totalPages.value = 1
  }
}

async function searchApplicationsByFilters() {
  try {
    // 開始新查詢前清空，避免殘留
    items.value = []
    totalElements.value = 0
    totalPages.value = 1

    const reqId = ++activeRequestId.value
    const userRole = authStore.user?.role;
    const userInstitutionID = authStore.user?.InstitutionID;

    const params = {
      institutionID: '',
      institutionName: filters.value.institution,
      CaseNumber: filters.value.applicationId,
      NationalID: filters.value.applicant
    };
    console.log('搜尋:', filters.value.institution);
    console.log('搜尋:', filters.value.applicationId);
    console.log('搜尋:', filters.value.applicant);


    // 只有 admin 使用者才會受機構限制，super_admin 不受限制
    if (userRole === 'admin' && userInstitutionID) {
      // admin 用戶強制使用自己的機構ID，清空機構名稱避免衝突
      params.institutionID = userInstitutionID;
      params.institutionName = '';  // 清空機構名稱，使用 institutionID 查詢
    }

    const data = await searchApplications(params);
    console.log('searchApplications 回傳的 data:', data);

    let contentArray = [];
    let backendTotalElements = 0;

    // 判斷回傳的資料格式
    if (Array.isArray(data)) {
      // 直接是陣列
      contentArray = data;
      backendTotalElements = data.length;
      console.log('data 是直接的陣列:', contentArray);
    } else if (data && data.content && Array.isArray(data.content)) {
      // 包含 content 屬性的物件
      contentArray = data.content;
      backendTotalElements = data.totalElements || data.content.length;
      console.log('data.content:', contentArray);
    }

    if (contentArray.length > 0) {
      console.log('處理前的 contentArray:', contentArray);
      const filtered = contentArray.filter(item => String(item.participantType) === '0' && item.status === '審核中');
      console.log('過濾後的 filtered:', filtered);

      // 清空之前的查詢結果，避免堆積
      const searchResults = filtered.map(item => ({
        id: item.applicationID,  // 保留 ApplicationID 作為唯一識別
        caseNumber: item.caseNumber || item.CaseNumber || '未提供', // 流水案號
        Date: item.applicationDate,
        applicant: item.name || '未提供',
        childName: item.pname || '未提供',
        nationalID: item.nationalID || item.NationalID || null,
        institution: item.institutionName || '未提供',
        status: item.status || '未提供'
      }));

      // 忽略過期回應
      if (reqId !== activeRequestId.value) return

      // 使用搜尋結果
      items.value = searchResults
      totalElements.value = filtered.length
      totalPages.value = Math.max(1, Math.ceil(totalElements.value / PAGE_SIZE))
    } else {
      if (reqId !== activeRequestId.value) return
      items.value = []
      totalElements.value = 0
      totalPages.value = 1
    }
  } catch (e) {
    items.value = []
    totalElements.value = 0
    totalPages.value = 1
  }
}

async function searchByCaseNumber() {
  const caseNumber = filters.value.applicationId.trim();
  if (!caseNumber) {
    alert('請輸入流水案號');
    return;
  }

  try {
    // 清空舊資料，避免殘留
    items.value = []
    totalElements.value = 0
    totalPages.value = 1

    const reqId = ++activeRequestId.value
    const userRole = authStore.user?.role;
    const userInstitutionID = authStore.user?.InstitutionID;

    const params = { institutionID: '', institutionName: '', CaseNumber: caseNumber };
    if (userRole === 'admin' && userInstitutionID) {
      params.institutionID = userInstitutionID;
      params.institutionName = '';
    } else if (filters.value.institution && filters.value.institution.trim()) {
      params.institutionName = filters.value.institution.trim();
    }

    const data = await searchApplications(params);
    console.log('根據流水案號查詢結果:', data);

    let contentArray = [];
    let backendTotalElements = 0;

    if (Array.isArray(data)) {
      contentArray = data;
      backendTotalElements = data.length;
    } else if (data && data.content && Array.isArray(data.content)) {
      contentArray = data.content;
      backendTotalElements = data.totalElements || data.content.length;
    }

    if (contentArray.length > 0) {
      const filtered = contentArray.filter(item => String(item.participantType) === '0' && item.status === '審核中');
      const searchResults = filtered.map(item => ({
        id: item.applicationID,
        caseNumber: item.caseNumber || item.CaseNumber || caseNumber,
        Date: item.applicationDate,
        applicant: item.name || '未提供',
        childName: item.pname || '未提供',
        nationalID: item.nationalID || item.NationalID || null,
        institution: item.institutionName || '未提供',
        status: item.status || '未提供'
      }));

      // 忽略過期回應
      if (reqId !== activeRequestId.value) return

      items.value = searchResults
      totalElements.value = filtered.length
      totalPages.value = Math.max(1, Math.ceil(totalElements.value / PAGE_SIZE))
    } else {
      if (reqId !== activeRequestId.value) return
      items.value = []
      totalElements.value = 0
      totalPages.value = 1
      alert('查無此流水案號的申請資料');
    }
  } catch (e) {
    alert('查詢失敗，請確認流水案號是否正確');
    items.value = []
    totalElements.value = 0
    totalPages.value = 1
  }
}

async function openDetailWithChild(item) {
  // minimal logging only on unexpected conditions

  const appId = item && item.id
  const nid = item && (item.nationalID || item.NationalID)
  const childNameFromList = item && (item.childName || item.name || '')

  if (!appId) {
    console.warn('openDetailWithChild: missing application id on item', item)
    return
  }

  // If we already have nationalID on the list item, save and navigate immediately
  if (nid) {
    const payload = { applicationId: appId, nationalID: nid, childName: childNameFromList }
    try { sessionStorage.setItem('applicationReviewSelection', JSON.stringify(payload)) } catch (e) { console.warn('sessionStorage set failed', e) }
    try { localStorage.setItem('applicationReviewSelection', JSON.stringify(payload)) } catch (e) { console.warn('localStorage set failed', e) }
    router.push({ path: `/admin/application-review/${appId}/edit`, state: { applicationReviewSelection: payload } })
    return
  }

  // Otherwise fetch full application, build payload, then navigate (single push)
  try {
    const data = await getApplicationById(appId)

    // prepare payload with full applicationData
    const payload = { applicationId: appId, nationalID: null, childName: childNameFromList || '', applicationData: data }

    // merge candidates
    let candidates = []
    if (Array.isArray(data.children)) candidates = candidates.concat(data.children)
    if (Array.isArray(data.participants)) candidates = candidates.concat(data.participants)

    const normalize = s => (s || '').toString().replace(/\s+/g, '').trim().toUpperCase()
    const tn = normalize(payload.childName)

    let found = null
    if (tn) {
      // exact match
      found = candidates.find(c => [c.pname, c.name, c.childName, c.cname].some(n => normalize(n) === tn)) || null
      // partial match
      if (!found) {
        found = candidates.find(c => [c.pname, c.name, c.childName, c.cname].some(n => {
          const nn = normalize(n)
          return nn && (nn.includes(tn) || tn.includes(nn))
        })) || null
      }
    }

    // fallback: prefer participantType indicating child or single candidate
    if (!found && candidates.length > 0) {
      found = candidates.find(c => (c.participantType && c.participantType.toString().includes('幼')) || c.participantType === '0' || c.participantType === 0) || null
    }
    if (!found && candidates.length === 1) found = candidates[0]

    if (found && (found.nationalID || found.NationalID)) {
      payload.nationalID = found.nationalID || found.NationalID
    }

    // persist payload and then navigate once
    try { sessionStorage.setItem('applicationReviewSelection', JSON.stringify(payload)) } catch (e) { console.warn('sessionStorage set failed', e) }
    try { localStorage.setItem('applicationReviewSelection', JSON.stringify(payload)) } catch (e) { console.warn('localStorage set failed', e) }
    router.push({ path: `/admin/application-review/${appId}/edit`, state: { applicationReviewSelection: payload } })
    return
  } catch (err) {
    console.error('[openDetailWithChild] failed to fetch application details:', err)
    try { sessionStorage.removeItem('applicationReviewSelection') } catch (e) {}
    try { localStorage.removeItem('applicationReviewSelection') } catch (e) {}
    router.push({ path: `/admin/application-review/${appId}/edit` })
    return
  }
}

async function openDetail(item) {
  // 先嘗試呼叫後端取得 application 詳細資料並存到 sessionStorage，讓 edit 頁可以直接使用
  try {
    const data = await getApplicationById(item.id)
    const payload = { applicationId: item.id, nationalID: null, childName: '', applicationData: data }
    try { sessionStorage.setItem('applicationReviewSelection', JSON.stringify(payload)) } catch (e) { console.warn('sessionStorage set failed', e) }
    try { localStorage.setItem('applicationReviewSelection', JSON.stringify(payload)) } catch (e) { console.warn('localStorage set failed', e) }
    // navigate with state
    router.push({ path: `/admin/application-review/${item.id}/edit`, state: { applicationReviewSelection: payload } })
    return
  } catch (err) {
    console.warn('[openDetail] failed to fetch application data, navigating without session payload', err)
    // ensure no stale selection
    try { sessionStorage.removeItem('applicationReviewSelection') } catch (e) {}
    try { localStorage.removeItem('applicationReviewSelection') } catch (e) {}
    router.push({ path: `/admin/application-review/${item.id}/edit` })
    return
  }
}

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;

  // 當切換頁面時，重新呼叫 fetchApplications 來載入新頁面的資料
  fetchApplications();
}

function prevPage() {
  goToPage(currentPage.value - 1);
}

function nextPage() {
  goToPage(currentPage.value + 1);
}

const paginatedItems = computed(() => {
  return items.value;
});

// 機構名稱選項（去重）
const institutionOptions = computed(() => {
  // 直接用 allInstitutions，確保不會因查詢而消失
  return allInstitutions.value
})

const showBack = ref(false)

async function searchAllApplications() {
  try {
    const offset = (currentPage.value - 1) * PAGE_SIZE;
    const data = await getApplicationsByOffset(offset, PAGE_SIZE);

    if (data && data.content && Array.isArray(data.content)) {
      // 只保留 participantType === '0' 且狀態為 '審核中' 的所有資料
      const filtered = data.content.filter(item => String(item.participantType) === '0' && item.status === '審核中');
      items.value = filtered.map(item => ({
        id: item.applicationID,  // 保留 ApplicationID 作為唯一識別
        caseNumber: item.caseNumber || item.CaseNumber || '未提供', // 流水案號
        Date: item.applicationDate,
        applicant: item.name || '未提供',
        childName: item.pname || '未提供',
        nationalID: item.nationalID || item.NationalID || null,
        institution: item.institutionName || '未提供',
        status: item.status || '未提供'
      }));

      // 更新分頁資訊 - 使用過濾後的資料數量
      totalElements.value = filtered.length;
      totalPages.value = Math.max(1, Math.ceil(totalElements.value / PAGE_SIZE));
    } else {
      items.value = [];
      totalElements.value = 0;
      totalPages.value = 1;
    }
  } catch (e) {
    console.error('Failed to fetch all applications:', e);
    items.value = [];
    totalElements.value = 0;
    totalPages.value = 1;
  }
}

function search() {
  currentPage.value = 1; // 重置到第一頁
  showBack.value = true; // 顯示返回按鈕

  // 如果有輸入流水案號，使用流水案號精確查詢
  if (filters.value.applicationId && filters.value.applicationId.trim()) {
    console.error('使用流水查詢');
    searchByCaseNumber();
  } else {
    // 否則使用一般篩選查詢
    console.error('使用一般查詢');
    searchApplicationsByFilters();
  }
}

function goBack() {
  // 重置所有查詢條件
  filters.value = { institution: '', applicationId: '', applicant: '' }
  // 重置到第一頁
  currentPage.value = 1;
  // 隱藏返回按鈕
  showBack.value = false
  // 重新載入原始資料
  fetchApplications();
}

onMounted(async () => {
  // 先載入所有機構名稱
  try {
    const res = await getInstitutionsSimpleAll();
    console.log('機構API回應:', res);
    // getInstitutionsSimpleAll 回傳格式應為陣列 [{ institutionID, institutionName }, ...]
    if (Array.isArray(res)) {
      allInstitutions.value = res.map(i => i.institutionName || i.name || i.label || i)
    } else if (res && Array.isArray(res.content)) {
      allInstitutions.value = res.content.map(i => i.institutionName || i.name || i.label || i)
    } else if (res && res.data && Array.isArray(res.data)) {
      allInstitutions.value = res.data.map(i => i.institutionName || i.name || i.label || i)
    }
    console.log('解析後的機構清單:', allInstitutions.value);
  } catch (e) {
    console.error('載入機構清單失敗:', e);
    allInstitutions.value = []
  }
  await fetchApplications();
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
.announcement-table { width:100%; border-collapse:collapse ;margin-bottom:40px; }
.announcement-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight:700; }
.announcement-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; }
.date-cell { font-weight:600; color:#334e5c }
.title-cell { color:#334e5c }
.action-cell { text-align:left }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:10vh; }
@media (max-width:900px){ .announcement-card{ width:100%; padding:16px } .date-input{ width:100px } .query-row{ width:100%; flex: 0 0 100%; } }
</style>
