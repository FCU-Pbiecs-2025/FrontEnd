<template>
  <div class="institution-page">
    <div class="institution-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/organization.png" class="icon" alt="icon" />
        <span class="main-title">機構管理</span>
      </div>
      <div class="tab-row">
        <span class="tab-title">機構查詢</span>
      </div>
      <div class="query-card">
        <div class="query-row">
          <label class="search-label">查詢條件：</label>
          <input type="text" v-model="searchKeyword" placeholder="機構名稱" class="search-input" />
        </div>
        <div class="query-row">
          <button class="btn query" @click="doQuery">查詢</button>
        </div>
      </div>
      <div class="table-section">
        <table class="institution-table">
          <thead>
            <tr>
              <th>機構名稱</th>
              <th>負責人姓名</th>
              <th>聯絡電話</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredList" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.director }}</td>
              <td>{{ item.phone }}</td>
              <td>
                <button class="btn small" @click="edit(item)">編輯</button>
                <button class="btn small danger" @click="remove(item)">刪除</button>
              </td>
            </tr>
            <tr v-if="filteredList.length === 0">
              <td colspan="4" class="empty-tip">目前沒有機構資料</td>
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
const searchKeyword = ref('')

// 機構列表（可串接API或localStorage）
const list = ref([
  // 範例資料
  { id: 1, name: '愛心托育中心', director: '張美玉', phone: '03-1234567' },
  { id: 2, name: '快樂兒童之家', director: '李志明', phone: '03-2345678' },
  { id: 3, name: '陽光幼兒園', director: '王小華', phone: '03-3456789' }
])

const filteredList = computed(() => {
  if (!searchKeyword.value) return list.value
  const keyword = searchKeyword.value.toLowerCase()
  return list.value.filter(item => {
    return (
      (item.name || '').toLowerCase().includes(keyword) ||
      (item.director || '').toLowerCase().includes(keyword) ||
      (item.phone || '').toLowerCase().includes(keyword)
    )
  })
})

const doQuery = () => {
  // 實際查詢可串API，這裡直接用 computed
}
const addNew = () => {
  router.push({ name: 'AdminInstitutionNew' })
}
const edit = (item) => {
  router.push({ name: 'AdminInstitutionEdit', params: { id: item.id } })
}
const remove = (item) => {
  if (confirm('確定要刪除這個機構嗎？')) {
    list.value = list.value.filter(i => i.id !== item.id)
  }
}
const goBack = () => {
  router.replace({ path: '/admin' })
}
</script>

<style scoped>
.institution-page { display:flex; justify-content:center; padding:32px 0; }
.institution-card { width:820px; background: #fff; border:1.5px solid #e6e6ea; border-radius:16px; padding:28px 32px; box-shadow:0 8px 24px rgba(16,24,40,0.04); }
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
.icon { width:32px; height:32px; }
.main-title { font-size:1.45rem; color:#2e6fb7; font-weight:700; letter-spacing:1px; }
.tab-row { display:flex; justify-content:center; margin-bottom:18px; }
.tab-title { background: #f9dada; color:#e35d6a; font-weight:700; font-size:1.15rem; padding:6px 38px; border-radius:18px; letter-spacing:2px; }
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:18px 24px; margin-bottom:22px; box-shadow:0 2px 8px rgba(16,24,40,0.04); }
.query-row { display:flex; align-items:center; gap:18px; margin-bottom:12px; }
.search-label { font-weight:600; color:#2e6fb7; margin-right:6px; }
.search-input { width:300px; max-width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; }
.btn { padding:7px 18px; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:1rem; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc; }
.btn.small { padding:5px 12px; font-size:0.95rem; margin-right:6px; background:#f3f4f6; }
.btn.danger { background:#ff7b8a; color:#fff }
.table-section { margin-bottom:18px; }
.institution-table { width:100%; border-collapse:collapse; background:transparent; border-radius:10px; overflow:hidden; }
.institution-table th { background:#cfe8ff; color:#2e6fb7; font-weight:700; padding:10px; text-align:left; }
.institution-table td { padding:10px; border-bottom:1px solid #f3f4f6; }
.empty-tip { color: #aaa; text-align: center; padding: 24px 0; }
.bottom-row { display:flex; justify-content:flex-end; gap:12px; margin-top:8px; }
@media (max-width:900px){ .institution-card{ width:100%; padding:16px } .search-input{ width:100% } }
</style>
