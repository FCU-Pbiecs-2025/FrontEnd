<template>
  <div class="class-page">
    <div class="class-card">
      <div v-if="!isEditPage">

        <div class="title-row">
          <img src="https://img.icons8.com/ios/48/2e6fb7/classroom.png" class="icon" alt="icon" />
          <span class="main-title">班級管理</span>
        </div>
        <!-- 機構列表 -->
        <div v-if="!selectedInstitution">
          <div class="query-card">
            <div class="query-row">
              <div class="search-area">
                <label class="search-label" for="queryInstitution">查詢條件：</label>
                <input id="queryInstitution" type="text" v-model="searchKeyword" placeholder="機構名稱" class="search-input" />
              </div>
              <button class="btn query" @click="doQueryInstitution">查詢</button>
            </div>
          </div>
          <div class="table-section">
            <table class="class-table">
              <thead>
                <tr>
                  <th>機構名稱</th>
                  <th>收托年紀</th>
                  <th>剩餘名額</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="inst in filteredInstitutions" :key="inst.id">
                  <td>{{ inst.name }}</td>
                  <td>{{ inst.age_from }} - {{ inst.age_to }}</td>
                  <td>{{ inst.capacity - inst.enrolled }}</td>
                  <td class="action-cell">
                    <button class="btn primary" @click="selectInstitution(inst)">查看班級</button>
                  </td>
                </tr>
                <tr v-if="filteredInstitutions.length === 0">
                  <td colspan="4" class="empty-tip">目前沒有機構資料</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- 班級列表 -->
        <div v-else>
          <div class="title-row">
            <span class="main-title">{{ selectedInstitution.name }} - 班級列表</span>
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
                <tr v-for="cls in filteredClasses" :key="cls.id">
                  <td>{{ cls.unit }}</td>
                  <td>{{ cls.capacity }}</td>
                  <td>{{ cls.enrolled }}</td>
                  <td>{{ cls.age_from }} - {{ cls.age_to }}</td>
                  <td>{{ cls.notes }}</td>
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
            <button class="btn primary" @click="showAddClass">新增班級</button>
            <button class="btn primary" @click="clearInstitution">返回機構列表</button>
          </div>
        </div>
      </div>
      <router-view v-else />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

// 機構假資料
const institutions = ref([
  { id: 1, name: '快樂幼兒園', age_from: 2, age_to: 6, capacity: 60, enrolled: 48 },
  { id: 2, name: '幸福幼兒園', age_from: 3, age_to: 5, capacity: 40, enrolled: 35 },
  { id: 3, name: '希望幼兒園', age_from: 2, age_to: 4, capacity: 30, enrolled: 20 }
])

// 班級資料改為 localStorage 來源
const STORAGE_KEY = 'admin_classes'
const defaultClasses = [
  { id: 1, institutionId: 1, unit: 'A班', capacity: 20, enrolled: 18, age_from: 2, age_to: 4, notes: '' },
  { id: 2, institutionId: 1, unit: 'B班', capacity: 20, enrolled: 15, age_from: 4, age_to: 6, notes: '' },
  { id: 3, institutionId: 2, unit: 'C班', capacity: 20, enrolled: 17, age_from: 3, age_to: 5, notes: '' },
  { id: 4, institutionId: 2, unit: 'D班', capacity: 20, enrolled: 18, age_from: 3, age_to: 5, notes: '' },
  { id: 5, institutionId: 3, unit: 'E班', capacity: 15, enrolled: 10, age_from: 2, age_to: 3, notes: '' },
  { id: 6, institutionId: 3, unit: 'F班', capacity: 15, enrolled: 10, age_from: 3, age_to: 4, notes: '' }
]

const loadClasses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      // 第一次進入，寫入假資料
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultClasses))
      return [...defaultClasses]
    }
    const parsed = JSON.parse(raw)
    // 如果 localStorage 有資料但是空陣列，也重新寫入假資料
    if (!parsed || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultClasses))
      return [...defaultClasses]
    }
    return parsed
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultClasses))
    return [...defaultClasses]
  }
}

const saveClasses = (list) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

const classes = ref(loadClasses())

const searchKeyword = ref('')
const selectedInstitution = ref(null)
const filteredInstitutions = ref([])
const filteredClasses = computed(() => {
  if (!selectedInstitution.value) return []
  return classes.value.filter(cls => cls.institutionId === selectedInstitution.value.id)
})

// 麵包屑跳轉
const goHome = () => router.push('/')
const goAdmin = () => router.push('/admin')

// 查詢機構
const doQueryInstitution = () => {
  const kw = (searchKeyword.value || '').toLowerCase().trim()
  filteredInstitutions.value = institutions.value.filter(inst => {
    if (!kw) return true
    return (inst.name || '').toLowerCase().includes(kw)
  })
}
const selectInstitution = (inst) => {
  router.push({
    name: 'AdminClassList',
    params: { institutionId: inst.id }
  })
}
const clearInstitution = () => {
  selectedInstitution.value = null
  searchKeyword.value = ''
  doQueryInstitution()
}

// 新增/編輯班級
function showAddClass() {
  // 傳遞當前選中的機構 ID
  router.push({
    name: 'AdminClassNew',
    query: { institutionId: selectedInstitution.value?.id }
  })
}
function editClass(cls) {
  router.push({ name: 'AdminClassEdit', params: { id: cls.id } })
}

// 刪除班級
function deleteClass(cls) {
  if (confirm('確定要刪除這個班級嗎？')) {
    const idx = classes.value.findIndex(c => c.id === cls.id)
    if (idx !== -1) {
      classes.value.splice(idx, 1)
      saveClasses(classes.value)
    }
  }
}

// 判斷是否為編輯頁面
const isEditPage = computed(() => {
  return route.name === 'AdminClassList' || route.name === 'AdminClassNew' || route.name === 'AdminClassEdit'
})

// 監聽路由變化，當從編輯頁面返回時重新載入班級資料
watch(() => route.name, (newName, oldName) => {
  // 從編輯頁面返回到班級管理頁面時，重新載入資料
  if ((oldName === 'AdminClassNew' || oldName === 'AdminClassEdit') && newName === 'AdminClassManager') {
    classes.value = loadClasses()
  }
})

onMounted(() => {
  filteredInstitutions.value = institutions.value
  classes.value = loadClasses()
})
</script>

<style scoped>
.class-page {
  display: flex;

  justify-content: center;
}
.class-card {
  width: 820px;
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
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6; margin-right:6px; }
.btn.danger { background:#ff7b8a; color:#fff }
.class-table { width:100%; border-collapse:collapse }
.class-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight:700; }
.class-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; }
.action-cell { text-align:left }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:10vh; }
.admin-breadcrumb { font-size: 0.9rem; color: #666; margin-bottom: 20px; }
.breadcrumb-link { color: #2e6fb7; cursor: pointer; }
.breadcrumb-link:hover { text-decoration: underline; }
</style>
