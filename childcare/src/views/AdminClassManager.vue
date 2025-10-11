<template>
  <div class="class-page">
    <div class="class-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/classroom.png" class="icon" alt="icon" />
        <span class="main-title">班級管理</span>
      </div>

      <div class="query-card">
        <div class="query-row">
          <div class="search-area">
            <label class="search-label" for="queryClass">查詢條件：</label>
            <input id="queryClass" type="text" v-model="searchKeyword" placeholder="班級或單位名稱" class="search-input" />
          </div>
          <button class="btn query" @click="doQuery">查詢</button>
        </div>
      </div>

      <div class="table-section">
        <table class="class-table">
          <thead>
            <tr>
              <th>單位名稱</th>
              <th>委辦單位</th>
              <th>聯絡人</th>
              <th>招收人數</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredList" :key="item.id">
              <td>{{ item.unit }}</td>
              <td>{{ item.contractor }}</td>
              <td>{{ item.contact }}</td>
              <td>{{ item.capacity }}</td>
              <td class="action-cell">
                <button class="btn small" @click="edit(item)">編輯</button>
                <button class="btn small danger" @click="remove(item)">刪除</button>
              </td>
            </tr>
            <tr v-if="filteredList.length === 0">
              <td colspan="5" class="empty-tip">目前沒有班級資料</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bottom-row">
        <button class="btn primary" @click="addNew">新增</button>
        <button class="btn primary" v-show="showBack" @click="goBack">返回</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const STORAGE_KEY = 'admin_classes'
const searchKeyword = ref('')
const list = ref([])
const filteredList = ref([])
const showBack = ref(false)

const loadList = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) list.value = JSON.parse(raw)
    else {
      // initial sample data (only if nothing in storage)
      list.value = [
        { id: 1, unit: '快樂幼兒園 A 班', contractor: '市政府', contact: '王小姐', capacity: 20, enrolled: 12, age_from: 2, age_to: 4, notes: '' },
        { id: 2, unit: '快樂幼兒園 B 班', contractor: '市政府', contact: '林先生', capacity: 18, enrolled: 10, age_from: 3, age_to: 5, notes: '' }
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
  filteredList.value = [...list.value]
})

const doQuery = () => {
  const kw = (searchKeyword.value || '').toLowerCase().trim()
  filteredList.value = list.value.filter(item => {
    if (!kw) return true
    return (
      (item.unit || '').toLowerCase().includes(kw) ||
      (item.contractor || '').toLowerCase().includes(kw) ||
      (item.contact || '').toLowerCase().includes(kw)
    )
  })
  showBack.value = true
}
const addNew = () => {
  router.push({ name: 'AdminClassNew' })
}
const edit = (item) => {
  router.push({ name: 'AdminClassEdit', params: { id: item.id } })
}
const remove = (item) => {
  if (confirm('確定要刪除這個班級嗎？')) {
    list.value = list.value.filter(i => i.id !== item.id)
    saveList()
  }
}
const goBack = () => {
  searchKeyword.value = ''
  filteredList.value = [...list.value]
  showBack.value = false
  router.replace({ path: '/admin/class' })
}
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
.action-cell { text-align:right }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:10vh; }
@media (max-width:900px){ .class-card{ width:100%; padding:16px } .search-input{ width:100% } }
</style>
