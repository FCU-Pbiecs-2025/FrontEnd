<template>
  <div class="class-list-page">
    <div class="class-card">
      <div v-if="!isChildRoute">
        <div class="title-row">
          <img src="https://img.icons8.com/ios/48/2e6fb7/classroom.png" class="icon" alt="icon" />
          <span class="main-title">{{ institution?.name || '全部班級' }} </span>
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
            <tr v-if="filteredClasses.length > 0" v-for="cls in filteredClasses" :key="cls.id">
              <td>{{ cls.unit }}</td>
              <td>{{ cls.capacity }}</td>
              <td>{{ cls.enrolled }}</td>
              <td>{{ formatAge(cls.age_from) }} - {{ formatAge(cls.age_to) }}</td>
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
          <button class="btn ghost" @click="goBack">返回機構列表</button>
        </div>
        <!-- 分頁控制區域 -->
        <div class="pagination-row">
          <div class="pagination-info">
            共 {{ totalElements }} 筆資料，第 {{ currentPage }} / {{ totalPages }} 頁
          </div>
          <div class="pagination-controls">
            <button class="btn small pagination-btn" :disabled="currentPage === 1 || totalPages <= 1" @click="prevPage">上一頁</button>
            <button
                v-for="page in pageNumbers"
                :key="page"
                class="btn small pagination-btn"
                :class="{ 'btn-active': page === currentPage }"
                :disabled="totalPages <= 1"
                @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <button class="btn small pagination-btn" :disabled="currentPage === totalPages || totalPages <= 1" @click="nextPage">下一頁</button>
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

const STORAGE_KEY = 'admin_classes'
const classes = ref([])
const institution = ref(null)

// 分頁相關的變數
const PAGE_SIZE = 8
const currentPage = ref(1)
const totalPages = ref(1)
const totalElements = ref(0)

// 分頁按鈕數字計算
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

// 以 offset API 取得班級清單（支援分頁）
const fetchClasses = async (page = 1) => {
  try {
    const offset = (page - 1) * PAGE_SIZE
    const url = `http://localhost:8080/classes/offset?offset=${offset}&size=${PAGE_SIZE}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()

    // 更新分頁資訊
    totalElements.value = Number(data.totalElements) || 0
    totalPages.value = Number(data.totalPages) || Math.max(1, Math.ceil(totalElements.value / PAGE_SIZE))
    currentPage.value = page

    // 轉換列表資料
    const list = Array.isArray(data.content) ? data.content : []
    classes.value = list.map(cls => ({
      id: cls.classID,
      classID: cls.classID,
      unit: cls.className,
      capacity: cls.capacity,
      enrolled: cls.currentStudents ?? cls.enrolled ?? 0,
      age_from: cls.minAgeDescription ?? 0,
      age_to: cls.maxAgeDescription ?? 0,
      notes: cls.additionalInfo ?? cls.notes ?? '',
      institutionId: cls.institutionName,
    }))

    // 標題
    institution.value = { name: '全部班級' }
  } catch (e) {
    console.error('載入班級清單失敗:', e)
    classes.value = []
    totalPages.value = 1
    totalElements.value = 0
    institution.value = { name: '全部班級' }
  }
}

// 覆蓋 filteredClasses：固定顯示 8 筆
const filteredClasses = computed(() => classes.value.slice(0, PAGE_SIZE))

// 是否為子路由
const isChildRoute = computed(() => route.name === 'AdminClassNew' || route.name === 'AdminClassEdit')

// 導覽
const goBack = () => { router.push({ name: 'AdminClassManager' }) }

// 編輯班級
const editClass = (cls) => {
  router.push({
    name: 'AdminClassEdit',
    params: { id: cls.classID }
  })
}

// 刪除班級
const deleteClass = async (cls) => {
  if (!confirm(`確定要刪除班級「${cls.unit}」嗎？`)) {
    return
  }

  try {
    const response = await fetch(`http://localhost:8080/classes/${cls.classID}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      alert('班級刪除成功！')
      // 重新載入當前頁面的資料
      fetchClasses(currentPage.value)
    } else {
      alert('刪除失敗，請稍後再試')
    }
  } catch (error) {
    console.error('刪除班級失敗:', error)
    alert('刪除失敗，請檢查網路連線')
  }
}

// 分頁控制：呼叫 fetchClasses
const goToPage = (page) => { if (page >= 1 && page <= totalPages.value) fetchClasses(page) }
const prevPage = () => { if (currentPage.value > 1) fetchClasses(currentPage.value - 1) }
const nextPage = () => { if (currentPage.value < totalPages.value) fetchClasses(currentPage.value + 1) }

// 監聽路由，回到列表時重新讀取第一頁
watch(() => route.name, (newName) => { if (newName === 'AdminClassList') fetchClasses(1) })

// 掛載時讀取第一頁
onMounted(() => { fetchClasses(1) })

// 將月數轉換為「X歲Y月」格式
function formatAge(months) {
  const y = Math.floor(months / 12)
  const m = months % 12
  if (y > 0 && m > 0) return `${y}歲${m}月`
  if (y > 0) return `${y}歲`
  return `${m}月`
}
</script>

<style scoped>
.class-list-page {
  display: flex;
  justify-content: center;

}
.class-card {
  min-width: 100%
}
.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 60px;
  margin-top: 60px;
}
.icon {
  width: 32px;
  height: 32px;
}
.main-title {
  font-size: 1.35rem;
  color: #2e6fb7;
  font-weight: 700;
}
.table-section {
  margin-bottom: 50px;
}
.class-table {
  width: 100%;
  border-collapse: collapse;
}
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
.pagination-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 30px 0;
  padding: 20px;
  background: #fff;
  border: 2px solid #e6f3ff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.pagination-info {
  font-size: 1rem;
  color: #2e6fb7;
  font-weight: 600;
}
.pagination-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}
.pagination-btn {
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  background: #fff;
  color: #2e6fb7;
  font-weight: 600;
  transition: all 0.2s;
}
.pagination-btn:hover:not(:disabled) {
  background: #f6f8fa;
  border-color: #2e6fb7;
}
.pagination-btn:disabled {
  background: #f6f8fa;
  color: #8b949e;
  cursor: not-allowed;
  border-color: #d0d7de;
}
.btn-active {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  color: #fff;
  border-color: #2563eb;
}
.btn-active:hover {
  background: linear-gradient(90deg, #2563eb, #1d4ed8);
}
</style>