<template>
  <div class="announcement-page">
    <div class="announcement-card">
      <div v-if="!isEditPage">
        <div class="title-row">
          <img src="https://img.icons8.com/ios/48/2e6fb7/megaphone.png" class="icon" alt="icon" />
          <span class="main-title">系統公告管理</span>
        </div>
        <div class="query-card">
          <div class="query-row">
            <div class="search-area">
              <label class="type-label">權限類型：</label>
              <div class="checkbox-group">
                <label><input type="checkbox" v-model="type.front" /> 前台公告</label>
                <label><input type="checkbox" v-model="type.back" /> 後台公告</label>
              </div>
            </div>
          </div>
          <div class="query-row">
            <div class="search-area">
              <label class="date-label">發佈日期：</label>
              <div class="date-range">
                <input type="date" v-model="dateStart" class="date-input" />
                <span class="to-label">至</span>
                <input type="date" v-model="dateEnd" class="date-input" />
              </div>
            </div>
          </div>
          <div class="btn-query">
            <button class="btn query" @click="doQuery">查詢</button>
          </div>
        </div>
        <div class="table-section">
          <table class="announcement-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>標題</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in resultList" :key="item.id">
                <td class="date-cell">{{ item.date }}</td>
                <td class="title-cell">{{ item.title }}</td>
                <td class="action-cell">
                  <button class="btn small" @click="edit(item)">編輯</button>
                  <button class="btn small danger" @click="remove(item)">刪除</button>
                </td>
              </tr>
              <tr v-if="resultList.length === 0">
                <td colspan="3" class="empty-tip">目前沒有公告</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="bottom-row">
          <button class="btn primary" @click="addNew">新增</button>
          <button class="btn primary" v-show="showBack" @click="goBack">返回</button>
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

const STORAGE_KEY = 'announcementData'

// 查詢條件
const type = ref({ front: true, back: true })
const dateStart = ref('')
const dateEnd = ref('')

// 公告列表
const list = ref([])
const resultList = ref([])
const showBack = ref(false)

const loadList = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      list.value = JSON.parse(raw)
    } else {
      // 初始範例資料
      list.value = [
        { id: 1, date: '2025-10-01', title: '系統維護公告', content: '維護內容...', type: 'front' },
        { id: 2, date: '2025-10-05', title: '後台功能更新', content: '更新內容...', type: 'back' }
      ]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.value))
    }
  } catch (e) {
    console.error('loadList error', e)
  }
}

const saveList = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.value))
}

onMounted(() => {
  loadList()
  resultList.value = [...list.value]
})

// 監聽路由變化，從編輯頁面返回時重新載入資料
watch(() => route.name, (newName, oldName) => {
  if (newName === 'AdminAnnouncement' && (oldName === 'AdminAnnouncementCreate' || oldName === 'AdminAnnouncementEdit')) {
    loadList()
    resultList.value = [...list.value]
    // 重置查詢條件
    type.value = { front: true, back: true }
    dateStart.value = ''
    dateEnd.value = ''
    showBack.value = false
  }
})

const doQuery = () => {
  loadList() // 確保查詢前先重新載入最新資料
  resultList.value = list.value.filter(item => {
    // 類型篩選
    if (item.type === 'front' && !type.value.front) return false
    if (item.type === 'back' && !type.value.back) return false
    // 日期篩選
    if (dateStart.value && item.date < dateStart.value) return false
    if (dateEnd.value && item.date > dateEnd.value) return false
    return true
  })
  showBack.value = true
}

const addNew = () => {
  router.push({ name: 'AdminAnnouncementCreate' })
}

const edit = (item) => {
  router.push({ name: 'AdminAnnouncementEdit', params: { id: item.id } })
}

const remove = (item) => {
  if (confirm('確定要刪除這則公告嗎？')) {
    loadList()
    list.value = list.value.filter(i => i.id !== item.id)
    saveList()
    // 重新執行查詢以更新顯示列表
    if (showBack.value) {
      doQuery()
    } else {
      resultList.value = [...list.value]
    }
  }
}

const goBack = () => {
  type.value = { front: true, back: true }
  dateStart.value = ''
  dateEnd.value = ''
  loadList()
  resultList.value = [...list.value]
  showBack.value = false
}

const isEditPage = computed(() => {
  return route.name === 'AdminAnnouncementCreate' || route.name === 'AdminAnnouncementEdit'
})
</script>

<style scoped>
.announcement-page {
  display: flex;
  justify-content: center;
}
.announcement-card {
  width:820px;
}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px;margin-top: 60px }
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700 }
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:14px 150px; margin-bottom:50px; box-shadow:0 2px 8px rgba(16,24,40,0.04); margin-top:50px; }
.query-row { display:flex; gap:12px; margin-bottom:12px; }
.search-area { gap:30px; display:flex; align-items:center; margin-bottom:8px; }
.type-label, .date-label { font-weight:600; color:#2e6fb7 }
.checkbox-group { display:flex; gap:20px; align-items:center; }
.checkbox-group label { display:flex; align-items:center; gap:5px; color:#334e5c; }
.date-range { display:flex; align-items:center; gap:10px; }
.date-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; width:150px; }
.to-label { color:#888; margin:0 8px; }
.btn-query { display: flex;justify-content: center;margin-top: 30px; }
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6; margin-right:6px; }
.btn.danger { background:#ff7b8a; color:#fff }
.table-section { }
.announcement-table { width:100%; border-collapse:collapse }
.announcement-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight:700; }
.announcement-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; }
.date-cell { font-weight:600; color:#334e5c }
.title-cell { color:#334e5c }
.action-cell { text-align:left }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:10vh; }
@media (max-width:900px){ .announcement-card{ width:100%; padding:16px } .date-input{ width:100px } }
</style>
