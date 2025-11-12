<template>
  <div class="class-page">
    <div class="class-card">
      <div v-if="!isChildRoute && !showClassList">

        <div class="title-row">
          <img src="https://img.icons8.com/ios/48/2e6fb7/classroom.png" class="icon" alt="icon" />
          <span class="main-title">班級管理</span>
        </div>
        <!-- 機構列表 -->
        <div>
          <div class="query-card">
            <div class="query-row">
              <div class="search-area">
                <label class="search-label" for="queryInstitution">查詢條件：</label>
                <input id="queryInstitution" type="text" v-model="searchKeyword" placeholder="機構名稱" class="search-input" />
              </div>
              <div class="btn-query">
                <button class="btn primary" @click="goToAdminClassEdit">新增</button>
                <button class="btn query" @click="() => doQueryInstitution(1)">查詢</button>
              </div>
            </div>
          </div>
          <div class="table-section">
            <table class="class-table">
              <thead>
              <tr>
                <th>機構名稱</th>
                <th>班級名稱</th>
                <th>收托年紀起</th>
                <th>收托年紀迄</th>
                <th>收托人數</th>
                <th>操作</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="cls in filteredClasses" :key="cls.classID">
                <td>{{ cls.institutionName }}</td>
                <td>{{ cls.className }}</td>
                <td>{{ cls.minAgeDescription }}</td>
                <td>{{ cls.maxAgeDescription }}</td>
                <td>{{ cls.capacity }}</td>
                <td class="action-cell">
                  <button class="btn small" @click="editClass(cls)">編輯</button>
                  <button class="btn small danger" @click="deleteClass(cls)">刪除</button>
                </td>
              </tr>
              <tr v-if="filteredClasses.length === 0">
                <td colspan="6" class="empty-tip">目前沒有班級資料</td>
              </tr>
              </tbody>
            </table>
          </div>
          <div class="bottom-row">
            <button class="btn primary" v-show="showBack" @click="goBack">返回</button>
          </div>
          <!-- 分頁控制區域（列表） -->
          <div class="pagination-row">
            <div class="pagination-info">
              共 {{ totalElements }} 筆資料，第 {{ currentPage }} / {{ totalPages }} 頁
            </div>
            <div class="pagination-controls">
              <button class="btn small pagination-btn" :disabled="currentPage === 1 || totalPages <= 1" @click="prevPage">上一頁</button>
              <button v-for="page in pageNumbers" :key="page" class="btn small pagination-btn" :class="{ 'btn-active': page === currentPage }" :disabled="totalPages <= 1" @click="goToPage(page)">{{ page }}</button>
              <button class="btn small pagination-btn" :disabled="currentPage === totalPages || totalPages <= 1" @click="nextPage">下一頁</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="showClassList">
        <!-- 整合自 AdminClassList.vue 的班級列表區塊 -->
        <div class="title-row">
          <img src="https://img.icons8.com/ios/48/2e6fb7/classroom.png" class="icon" alt="icon" />
          <span class="main-title">{{ selectedInstitution?.name }} 班級列表</span>
        </div>
        <div class="table-section">
          <table class="class-table">
            <thead>
            <tr>
              <th>班級名稱</th>
              <th>收托人數</th>
              <th>在園人數</th>
              <th>收托年齡</th>
              <th>備註</th>
              <th>操作</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="cls in filteredClasses" :key="cls.classID">
              <td>{{ cls.institutionName }}</td>
              <td>{{ cls.className }}</td>
              <td>{{ cls.capacity }}</td>
              <td>{{ cls.minAgeDescription }}</td>
              <td>{{ cls.maxAgeDescription }}</td>
              <td class="action-cell">
                <button class="btn small" @click="editClass(cls)">編輯</button>
                <button class="btn small danger" @click="deleteClass(cls)">刪除</button>
              </td>
            </tr>
            <tr v-if="filteredClasses.length === 0">
              <td colspan="6" class="empty-tip">目前沒有班級資料</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="bottom-row">
          <button class="btn ghost" @click="closeClassList">返回機構列表</button>
        </div>
        <!-- 分頁控制區域（子列表） -->
        <div class="pagination-row">
          <div class="pagination-info">
            共 {{ totalElements }} 筆資料，第 {{ currentPage }} / {{ totalPages }} 頁
          </div>
          <div class="pagination-controls">
            <button class="btn small pagination-btn" :disabled="currentPage === 1 || totalPages <= 1" @click="prevPage">上一頁</button>
            <button v-for="page in pageNumbers" :key="page" class="btn small pagination-btn" :class="{ 'btn-active': page === currentPage }" :disabled="totalPages <= 1" @click="goToPage(page)">{{ page }}</button>
            <button class="btn small pagination-btn" :disabled="currentPage === totalPages || totalPages <= 1" @click="nextPage">下一頁</button>
          </div>
        </div>
      </div>
      <router-view v-else-if="isChildRoute" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const classes = ref([])
const searchKeyword = ref('')
const filteredClasses = computed(() => classes.value.slice(0, PAGE_SIZE))
const showClassList = ref(false)
const selectedInstitution = ref(null)

// 分頁資料（顯示用）
const PAGE_SIZE = 10 // 每頁顯示筆數改回 10
const currentPage = ref(1)
const totalPages = ref(1)
const totalElements = ref(0)

// 舊的分頁資料物件（保留，但不直接用於畫面）
const paginationData = ref({
  offset: 0,
  size: PAGE_SIZE,
  totalPages: 0,
  hasNext: false,
  totalElements: 0
})

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

// 取得 API 班級資料（分頁）
const fetchClasses = async (page = 1) => {
  try {
    const offset = (page - 1) * PAGE_SIZE
    const res = await fetch(`http://localhost:8080/classes/offset?offset=${offset}&size=${PAGE_SIZE}`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()

    // 更新分頁資料
    totalElements.value = Number(data.totalElements) || 0
    totalPages.value = Number(data.totalPages) || Math.max(1, Math.ceil(totalElements.value / PAGE_SIZE))
    currentPage.value = page

    paginationData.value = {
      offset: data.offset ?? offset,
      size: data.size ?? PAGE_SIZE,
      totalPages: totalPages.value,
      hasNext: Boolean(data.hasNext),
      totalElements: totalElements.value
    }

    classes.value = Array.isArray(data.content) ? data.content : []
    console.log('班級資料載入成功:', { page, classes: classes.value.length, totalPages: totalPages.value })
  } catch (e) {
    console.error('載入班級資料失敗:', e)
    classes.value = []
    totalPages.value = 1
    totalElements.value = 0
  }
}

// 查詢班級（依機構名稱關鍵字，支援分頁）
const doQueryInstitution = async (page = 1) => {
  const kw = (searchKeyword.value || '').trim()

  if (!kw) {
    await fetchClasses(1)
    return
  }

  try {
    const offset = (page - 1) * PAGE_SIZE
    const res = await fetch(`http://localhost:8080/classes/search/institution?name=${encodeURIComponent(kw)}&offset=${offset}&size=${PAGE_SIZE}`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()

    // 更新分頁資料
    totalElements.value = Number(data.totalElements) || 0
    totalPages.value = Number(data.totalPages) || Math.max(1, Math.ceil(totalElements.value / PAGE_SIZE))
    currentPage.value = page

    paginationData.value = {
      offset: data.offset ?? offset,
      size: data.size ?? PAGE_SIZE,
      totalPages: totalPages.value,
      hasNext: Boolean(data.hasNext),
      totalElements: totalElements.value
    }

    // 使用content陣列
    classes.value = Array.isArray(data.content) ? data.content : []
    console.log('搜索結果:', { kw, page, count: classes.value.length })
  } catch (e) {
    console.error('搜索失敗:', e)
    alert('搜索失敗，請稍後再試')
  }
}

// 返回：重置查詢
const goBack = async () => {
  searchKeyword.value = ''
  await fetchClasses(1)
}

const goToAdminClassEdit = () => {
  router.push({ name: 'AdminClassNew' })
}

// 關閉班級列表
const closeClassList = () => {
  showClassList.value = false
  selectedInstitution.value = null
}

// 編輯班級
const editClass = (cls) => {
  router.push({
    name: 'AdminClassEdit',
    params: {
      institutionId: cls.institutionName,
      id: cls.classID
    }
  })
}

// 刪除班級
const deleteClass = async (cls) => {
  if (!cls || !cls.classID) {
    alert('找不到要刪除的班級 ID')
    return
  }
  if (!confirm(`確定要刪除班級「${cls.className}」嗎？此動作無法復原。`)) return

  try {
    const res = await fetch(`http://localhost:8080/classes/${encodeURIComponent(cls.classID)}`, {
      method: 'DELETE'
    })

    if (res.ok || res.status === 204) {
      // 後端刪除成功，從前端列表移除該筆
      const idx = classes.value.findIndex(c => c.classID === cls.classID)
      if (idx !== -1) classes.value.splice(idx, 1)
      alert('刪除成功')
    } else {
      const txt = await res.text()
      alert(`刪除失敗：${res.status} - ${txt}`)
    }
  } catch (e) {
    console.error('刪除班級失敗:', e)
    alert('刪除失敗，請檢查網路或伺服器狀態')
  }
}

// 是否顯示返回按鈕
const showBack = computed(() => searchKeyword.value.trim() !== '')


const isChildRoute = computed(() => route.name === 'AdminClassNew' || route.name === 'AdminClassEdit' || route.name === 'AdminClassList')

// 分頁控制：根據是否在搜尋模式呼叫對應 API
const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  if (searchKeyword.value.trim()) doQueryInstitution(page)
  else fetchClasses(page)
}
const prevPage = () => goToPage(currentPage.value - 1)
const nextPage = () => goToPage(currentPage.value + 1)

onMounted(() => {
  fetchClasses(1)
})
</script>

<style scoped>
.btn-query { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 30px; }

.class-page {
  display: flex;

  justify-content: center;
}
.class-card {
  max-width:820px;min-width: 85%
}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; margin-top: 60px}
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700 }
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:14px 18px; margin-bottom:50px; box-shadow:0 2px 8px rgba(16,24,40,0.04); margin-top:50px; }
.query-row { display:flex; align-items:center; gap:12px; flex-direction: column; }
.search-area{gap: 30px; display: flex; align-items: center; margin-bottom: 8px;}
.search-label { font-weight:600; color:#2e6fb7 }
.search-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; width:300px }
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600 }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }
.btn.primary {
  background: linear-gradient(90deg,#3b82f6,#2563eb);
  color: #fff;
  margin-right: 12px;
}
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6; margin-right:6px; }
.btn.danger { background:#ff7b8a; color:#fff }
.class-table { width:100%; border-collapse:collapse }
.class-table thead th {
  background: #cfe8ff;
  color: #2e6fb7;
  padding: 10px;
  text-align: left;
  font-weight: 700;
}
.class-table td {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}
.action-cell {
  text-align: left;
}
.empty-tip {
  color: #999;
  text-align: center;
  padding: 18px 0;
}
.btn {
  padding: 7px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.btn.primary {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  color: #fff;
}
.btn.ghost {
  background: transparent;
  border: 1px solid #3b82f6;
  color: #2563eb;
}
.btn.small {
  padding: 6px 12px;
  font-size: 0.95rem;
  background: #f3f4f6;
  margin-right: 6px;
}
.btn.danger {
  background: #ff7b8a;
  color: #fff;
}
.bottom-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}
/* 分頁樣式 */
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
</style>