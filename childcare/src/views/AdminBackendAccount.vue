<template>
  <div class="account-page">
    <div v-if="!isEditPage" class="account-card">
      <div class="title-row">
        <span class="icon">🛡️</span>
        <span class="main-title">後台帳號管理</span>
      </div>



      <div class="query-card">
        <div class="query-row">
          <div class="search-area">
            <label class="search-label" for="queryAdmin">查詢帳號：</label>
            <input id="queryAdmin" v-model="query" type="text" placeholder="請輸入管理者帳號或名稱" class="search-input" />
          </div>
          <button class="btn query" @click="handleQuery">查詢</button>
        </div>
      </div>

      <div class="table-section">
        <table class="account-table">
          <thead>
            <tr>
              <th>帳號ID</th>
              <th>機構名稱</th>
              <th>角色</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in resultAdmins" :key="item.id">
              <td class="id-cell">{{ item.id }}</td>
              <td class="name-cell">{{ item.org }}</td>
              <td class="role-cell">{{ item.role }}</td>
              <td class="status-cell">{{ item.role === 'suspended' ? '停權' : '啟用' }}</td>
              <td class="action-cell">
                <button class="btn small" @click="manageAdmin(item.id)">編輯</button>
                <button class="btn small danger" @click="removeAdmin(item.id)">刪除</button>
              </td>
            </tr>
            <tr v-if="resultAdmins.length === 0">
              <td colspan="5" class="empty-tip">查無資料</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bottom-row">
        <button class="btn primary" @click="addNew">新增</button>
        <button class="btn primary" v-show="showBack" @click="goBack">返回</button>
      </div>
    </div>
    <router-view v-if="isEditPage" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const STORAGE_KEY = 'backendAccounts'
const query = ref('')
const admins = ref({})
const resultAdmins = ref([])
const showBack = ref(false)

const loadList = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      admins.value = JSON.parse(raw)
    } else {
      // 初始範例資料（使用物件格式，key 是帳號 ID）
      admins.value = {
        'admin01': { id: 'admin01', org: '市政府', role: 'superadmin', password: 'pass123' },
        'admin02': { id: 'admin02', org: '托育中心A', role: 'admin', password: 'pass456' },
        'admin03': { id: 'admin03', org: '托育中心B', role: 'general', password: 'pass789' }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(admins.value))
    }
  } catch (e) {
    console.error('loadList error', e)
  }
}

const saveList = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(admins.value))
}

const convertToArray = (obj) => {
  return Object.values(obj)
}

onMounted(() => {
  loadList()
  resultAdmins.value = convertToArray(admins.value)
})

// 監聽路由變化，從編輯頁面返回時重新載入資料
watch(() => route.name, (newName, oldName) => {
  if (newName === 'AdminBackendAccount' && (oldName === 'AdminBackendNew' || oldName === 'AdminBackendEdit')) {
    loadList()
    resultAdmins.value = convertToArray(admins.value)
    // 重置查詢條件
    query.value = ''
    showBack.value = false
  }
})

const handleQuery = () => {
  loadList()
  const keyword = (query.value || '').toLowerCase().trim()
  const allAdmins = convertToArray(admins.value)

  resultAdmins.value = allAdmins.filter(item => {
    if (!keyword) return true
    return (
      (item.id || '').toLowerCase().includes(keyword) ||
      (item.org || '').toLowerCase().includes(keyword) ||
      (item.role || '').toLowerCase().includes(keyword)
    )
  })
  showBack.value = true
}

const manageAdmin = (id) => {
  // 使用新的路由跳轉到編輯頁面
  router.push({ name: 'AdminBackendEdit', params: { id: id } })
}

const removeAdmin = (id) => {
  if (!confirm('確定要刪除這個後台帳號嗎？')) return

  loadList()
  delete admins.value[id]
  saveList()

  // 重新執行查詢以更新顯示列表
  if (showBack.value) {
    handleQuery()
  } else {
    resultAdmins.value = convertToArray(admins.value)
  }
}

const goBack = () => {
  query.value = ''
  loadList()
  resultAdmins.value = convertToArray(admins.value)
  showBack.value = false
}

const addNew = () => {
  // 跳轉到新增頁面
  router.push({ name: 'AdminBackendNew' })
}

const isEditPage = computed(() => {
  // 判斷是否在新增/編輯子路由
  return route.name === 'AdminBackendNew' || route.name === 'AdminBackendEdit'
})
</script>

<style scoped>
.account-page{display: flex ; justify-content: center; }
.account-card { max-width:820px;min-width: 85%}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:8px;margin-top: 60px }
.icon { font-size:20px }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700 }
.tab-row { display:flex; justify-content:center; margin-bottom:16px ;flex-direction: column}
.tab-title { margin:20px auto 0 auto; color: #e35d6a; font-weight:700; font-size:1.05rem; padding:6px 28px; border-radius:18px; background: #f9dada; }
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:14px 18px; margin-bottom:50px; box-shadow:0 2px 8px rgba(16,24,40,0.04);margin-top:50px;  }
.query-row { display:flex; align-items:center; gap:12px ;flex-direction: column}
.search-area{gap: 30px; display: flex; align-items: center; margin-bottom: 8px;}
.search-label { font-weight:600; color:#2e6fb7 }
.search-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; width:300px }
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600 }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6; margin-right:6px; }
.btn.danger { background:#ff7b8a; color:#fff }
.table-section {  }
.account-table { width:100%; border-collapse:collapse }
.account-table thead th { background: #cfe8ff; color: #2e6fb7; padding: 10px; text-align: left; font-weight: 700; }
.account-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; }
.id-cell { font-weight:600; color:#334e5c }
.name-cell { color:#334e5c }
.role-cell { color:#6b6f76 }
.status-cell { color:#6b6f76 }
.action-cell { text-align:left }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.bottom-row { display: flex; justify-content:center; margin-top: 10vh; gap: 12px; margin-bottom: 20px}
@media (max-width:900px){ .account-card{ width:100%; padding:16px } .search-input{ width:100% } }
</style>
