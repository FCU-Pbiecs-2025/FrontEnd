<template>
  <div class="institution-page">
    <div class="institution-card">
      <div v-if="!isEditPage">
        <div class="title-row">
          <img src="https://img.icons8.com/ios/48/2e6fb7/organization.png" class="icon" alt="icon" />
          <span class="main-title">機構管理</span>
        </div>
        <div class="query-card">
          <div class="query-row">
            <div class="search-area">
              <label class="search-label" for="queryInstitution">查詢條件：</label>
              <input id="queryInstitution" type="text" v-model="searchKeyword" placeholder="機構名稱" class="search-input" />
            </div>
            <div class="btn-query">
             <button class="btn primary" @click="addNew">新增</button>
             <button class="btn query" @click="doQuery">查詢</button>
            </div>
          </div>
        </div>
        <div class="table-section">
          <table class="institution-table">
            <thead>
              <tr>
                <th>機構名稱</th>
                <th>聯絡人</th>
                <th>聯絡電話</th>
                <th>地址</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in resultList" :key="item.id">
                <td class="name-cell">{{ item.name }}</td>
                <td class="director-cell">{{ item.contact }}</td>
                <td class="phone-cell">{{ item.phone }}</td>
                <td class="address-cell">{{ item.address }}</td>
                <td class="action-cell">
                  <div style="display: flex; gap: 8px;">
                    <button class="btn small" style="min-width: 60px; height: 36px;" @click="edit(item)">編輯</button>
                    <button class="btn small danger" style="min-width: 60px; height: 36px;" @click="remove(item)">刪除</button>
                  </div>
                </td>
              </tr>
              <tr v-if="resultList.length === 0">
                <td colspan="4" class="empty-tip">目前沒有機構資料</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="bottom-row">
          <button class="btn primary" v-show="showBack" @click="goBack">返回</button>
        </div>
      </div>
      <router-view v-else />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

const STORAGE_KEY = 'institutionData'
const searchKeyword = ref('')
const list = ref([])
const resultList = ref([])
const showBack = ref(false)

const loadList = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      list.value = JSON.parse(raw)
    } else {
      list.value = [
        { id: 1, name: '愛心托育中心', director: '張美玉', phone: '03-1234567', city: '台中市', contact: '張美玉', fax: '03-1234568', address: '台中市西屯區XX路XX號', attachment: '', license: '' },
        { id: 2, name: '快樂兒童之家', director: '李志明', phone: '03-2345678', city: '台北市', contact: '李志明', fax: '03-2345679', address: '台北市大安區XX路XX號', attachment: '', license: '' },
        { id: 3, name: '陽光幼兒園', director: '王小華', phone: '03-3456789', city: '新竹市', contact: '王小華', fax: '03-3456790', address: '新竹市東區XX路XX號', attachment: '', license: '' }
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
  if (newName === 'AdminInstitution' && (oldName === 'AdminInstitutionNew' || oldName === 'AdminInstitutionEdit')) {
    loadList()
    resultList.value = [...list.value]
    // 重置查詢條件
    searchKeyword.value = ''
    showBack.value = false
  }
})
const doQuery = () => {
  loadList() // 確保查詢前先重新載入最新資料
  const keyword = (searchKeyword.value || '').toLowerCase().trim()
  resultList.value = list.value.filter(item => {
    return (
      (item.name || '').toLowerCase().includes(keyword) ||
      (item.director || '').toLowerCase().includes(keyword) ||
      (item.phone || '').toLowerCase().includes(keyword)
    )
  })
  showBack.value = true
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
    saveList()
    doQuery()
  }
}
const goBack = () => {
  searchKeyword.value = ''
  loadList()
  resultList.value = [...list.value]
  showBack.value = false
}
const isEditPage = computed(() => {
  return route.name === 'AdminInstitutionNew' || route.name === 'AdminInstitutionEdit'
})
</script>

<style scoped>
.btn-query { display: flex; justify-content: center; margin-top: 30px; }
.institution-page {
  display: flex;

  justify-content: center;
}
.institution-card {
  max-width:820px;min-width: 85%
}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px;margin-top: 60px }
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700 }
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:14px 18px; margin-bottom:50px; box-shadow:0 2px 8px rgba(16,24,40,0.04); margin-top:50px; }
.query-row { display:flex; align-items:center; gap:12px; flex-direction: column; }
.search-area{gap: 30px; display: flex; align-items: center; margin-bottom: 8px;}
.search-label { font-weight:600; color:#2e6fb7 }
.search-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; width:300px }
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600 }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff ;margin-right: 12px; }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6; margin-right:6px; }
.btn.danger { background:#ff7b8a; color:#fff }
.institution-table { width:100%; border-collapse:collapse }
.institution-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight:700; font-size:1rem; }
.institution-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; font-size:1rem; }
.name-cell { font-weight:600; color:#334e5c }
.director-cell { color:#334e5c }
.phone-cell { color:#6b6f76 }
.action-cell { text-align:left }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:10vh; margin-bottom: 20px}
@media (max-width:900px){ .institution-card{ width:100%; padding:16px } .search-input{ width:100% } }
</style>
