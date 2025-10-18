<template>
  <div class="class-page">
    <div class="class-card">
      <div v-if="!isEditPage">

        <div class="title-row">
          <img src="https://img.icons8.com/ios/48/2e6fb7/classroom.png" class="icon" alt="icon" />
          <span class="main-title">機構管理</span>
        </div>
        <!-- 機構列表 -->
        <div>
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
                  <th>收托年紀起</th>
                  <th>收托年紀迄</th>
                  <th>剩餘名額</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="inst in filteredInstitutions" :key="inst.id">
                  <td>{{ inst.name }}</td>
                  <td>{{ inst.age_from }}</td>
                  <td>{{ inst.age_to }}</td>
                  <td>{{ inst.capacity - inst.enrolled }}</td>
                  <td class="action-cell">
                    <button class="btn small" @click="editInstitution(inst)">編輯</button>
                    <button class="btn small danger" @click="deleteInstitution(inst)">刪除</button>
                  </td>
                </tr>
                <tr v-if="filteredInstitutions.length === 0">
                  <td colspan="5" class="empty-tip">目前沒有機構資料</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <router-view v-else />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

// 機構假資料
const institutions = ref([
  { id: 1, name: '快樂幼兒園', age_from: 2, age_to: 6, capacity: 60, enrolled: 48 },
  { id: 2, name: '幸福幼兒園', age_from: 3, age_to: 5, capacity: 40, enrolled: 35 },
  { id: 3, name: '希望幼兒園', age_from: 2, age_to: 4, capacity: 30, enrolled: 20 }
])

// 如果專案仍保留班級 localStorage 資料，保留 classes 資料與儲存函式以便刪除機構時同步移除
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultClasses))
      return [...defaultClasses]
    }
    const parsed = JSON.parse(raw)
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
const filteredInstitutions = ref([])

// 當進入班級相關子路由時（班級列表/新增/編輯），顯示子路由畫面
const isEditPage = computed(() => {
  return route.name === 'AdminClassList' || route.name === 'AdminClassNew' || route.name === 'AdminClassEdit'
})

// 查詢機構
const doQueryInstitution = () => {
  const kw = (searchKeyword.value || '').toLowerCase().trim()
  filteredInstitutions.value = institutions.value.filter(inst => {
    if (!kw) return true
    return (inst.name || '').toLowerCase().includes(kw)
  })
}

// 新增：編輯/刪除機構
function editInstitution(inst) {
  // 導向該機構的班級列表，以便在班級列表中編輯單一班級
  router.push({ name: 'AdminClassList', params: { institutionId: inst.id } })
}

function deleteInstitution(inst) {
  if (!confirm('確定要刪除這個機構嗎？\n刪除後將移除其所有班級資料。')) return
  // 移除機構
  const idx = institutions.value.findIndex(i => i.id === inst.id)
  if (idx !== -1) {
    institutions.value.splice(idx, 1)
  }
  // 同步移除該機構的班級資料
  classes.value = classes.value.filter(c => c.institutionId !== inst.id)
  saveClasses(classes.value)
  doQueryInstitution()
}

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
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6; margin-right:6px; }
.btn.danger { background:#ff7b8a; color:#fff }
.class-table { width:100%; border-collapse:collapse }
.class-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight:700; }
.class-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; }
.action-cell { text-align:left }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
/* removed unused bottom-row and primary styles */
</style>


