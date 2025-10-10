<template>
  <div class="announcement-page">
    <div class="announcement-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/megaphone.png" class="icon" alt="icon" />
        <span class="main-title">系統公告管理</span>
      </div>
      <div class="tab-row">
        <span class="tab-title">公告查詢</span>
      </div>
      <div class="query-card">
        <div class="query-row">
          <label class="type-label">權限類型：</label>
          <label><input type="checkbox" v-model="type.front" /> 前台公告</label>
          <label><input type="checkbox" v-model="type.back" /> 後台公告</label>
        </div>
        <div class="query-row">
          <label class="date-label">發佈日期：</label>
          <input type="date" v-model="dateStart" />
          <span class="to-label">至</span>
          <input type="date" v-model="dateEnd" />
        </div>
        <div class="query-row">
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
            <tr v-for="item in filteredList" :key="item.id">
              <td>{{ item.date }}</td>
              <td>{{ item.title }}</td>
              <td>
                <button class="btn small" @click="edit(item)">編輯</button>
                <button class="btn small danger" @click="remove(item)">刪除</button>
              </td>
            </tr>
            <tr v-if="filteredList.length === 0">
              <td colspan="3" class="empty-tip">目前沒有公告</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="bottom-row">
        <button class="btn primary" @click="addNew">新增</button>
        <button class="btn ghost" @click="goBack">返回</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

// 查詢條件
const type = ref({ front: true, back: true })
const dateStart = ref('')
const dateEnd = ref('')

// 公告列表（可串接API或localStorage）
const list = ref([
  // 範例資料
  { id: 1, date: '2025-10-01', title: '系統維護公告', type: 'front' },
  { id: 2, date: '2025-10-05', title: '後台功能更新', type: 'back' }
])

const filteredList = computed(() => {
  return list.value.filter(item => {
    // 類型篩選
    if (item.type === 'front' && !type.value.front) return false
    if (item.type === 'back' && !type.value.back) return false
    // 日期篩選
    if (dateStart.value && item.date < dateStart.value) return false
    if (dateEnd.value && item.date > dateEnd.value) return false
    return true
  })
})

const doQuery = () => {
  // 實際查詢可串API，這裡直接用 computed
}
const addNew = () => {
  // 跳轉新增公告頁
  // router.push({ name: 'AdminAnnouncementNew' })
  alert('新增公告功能可串接')
}
const edit = (item) => {
  router.push({ name: 'AdminAnnouncementEdit', params: { id: item.id } })
}
const remove = (item) => {
  if (confirm('確定要刪除這則公告嗎？')) {
    list.value = list.value.filter(i => i.id !== item.id)
  }
}
const goBack = () => {
  router.replace({ path: '/admin' })
}
</script>

<style scoped>
.announcement-page { display:flex; justify-content:center; padding:32px 0; background: transparent; }
.announcement-card { width:820px; background: #fff; border:1.5px solid #e6e6ea; border-radius:16px; padding:28px 32px; box-shadow:0 8px 24px rgba(16,24,40,0.04); }
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
.icon { width:32px; height:32px; }
.main-title { font-size:1.45rem; color:#2e6fb7; font-weight:700; letter-spacing:1px; }
.tab-row { display:flex; justify-content:center; margin-bottom:18px; }
.tab-title { background: #f9dada; color:#e35d6a; font-weight:700; font-size:1.15rem; padding:6px 38px; border-radius:18px; letter-spacing:2px; }
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:18px 24px; margin-bottom:22px; box-shadow:0 2px 8px rgba(16,24,40,0.04); }
.query-row { display:flex; align-items:center; gap:18px; margin-bottom:12px; }
.type-label, .date-label { font-weight:600; color:#2e6fb7; margin-right:6px; }
.to-label { color:#888; margin:0 8px; }
.btn { padding:7px 18px; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:1rem; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc; }
.btn.small { padding:5px 12px; font-size:0.95rem; margin-right:6px; background:#f3f4f6; }
.btn.danger { background:#ff7b8a; color:#fff }
.table-section { margin-bottom:18px; }
.announcement-table { width:100%; border-collapse:collapse; background:transparent; border-radius:10px; overflow:hidden; }
.announcement-table th { background:#cfe8ff; color:#2e6fb7; font-weight:700; padding:10px; text-align:left; }
.announcement-table td { padding:10px; border-bottom:1px solid #f3f4f6; }
.empty-tip { color: #aaa; text-align: center; padding: 24px 0; }
.bottom-row { display:flex; justify-content:flex-end; gap:12px; margin-top:8px; }
@media (max-width:900px){ .announcement-card{ width:100%; padding:16px } }
</style>
