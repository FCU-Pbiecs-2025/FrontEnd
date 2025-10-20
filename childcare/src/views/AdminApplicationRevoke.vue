<template>
  <div class="announcement-page">
    <div class="announcement-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/delete-sign.png" class="icon" alt="icon" />
        <span class="main-title">撤銷審核</span>
      </div>

      <div class="query-card">
        <div class="query-container">
          <div class="query-row">
            <div class="search-area">
              <label class="type-label">撤銷類型：</label>
              <select v-model="filters.type" class="date-input" style="width:120px">
                <option value="">全部</option>
                <option value="qualification">資格不符</option>
                <option value="document">文件不全</option>
                <option value="other">其他原因</option>
              </select>
            </div>
          </div>
          <div class="query-row">
            <div class="search-area">
              <label class="type-label">撤銷編號：</label>
              <input v-model="filters.revokeId" placeholder="請輸入撤銷編號" class="date-input" style="width:200px" />
            </div>
          </div>
          <div class="query-row">
            <div class="search-area">
              <label class="type-label">申請人身分證：</label>
              <input v-model="filters.applicant" placeholder="身分證" class="date-input" style="width:200px" />
            </div>
          </div>
        </div>
        <div class="btn-query">
          <button class="btn query" @click="search">查詢</button>
        </div>
      </div>
      <div class="table-section">
        <table class="announcement-table">
          <thead>
            <tr>
              <th>撤銷編號</th>
              <th>申請日期</th>
              <th>申請人</th>
              <th>機構</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td class="date-cell">{{ item.id }}</td>
              <td class="date-cell">{{ item.Date }}</td>
              <td class="title-cell">{{ item.applicant }}</td>
              <td class="title-cell">{{ item.institution }}</td>
              <td class="title-cell">{{ item.status }}</td>
              <td class="action-cell">
                <button class="btn small danger" @click="openDetail(item)">撤銷</button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="6" class="empty-tip">目前沒有需要撤銷的案件</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bottom-row" v-show="showBack">
        <button class="btn primary" @click="goBack">返回</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const filters = ref({ type: '', revokeId: '', applicant: '' })

// 原始完整資料列表
const fullList = ref([
  { id: 'R2001', Date:'2025/01/01', applicant: '張麗麗', institution: '快樂托育', status: '待審核', type: 'qualification' },
  { id: 'R2002', Date:'2025/01/01', applicant: '王小明', institution: '幸福幼兒園', status: '待審核', type: 'document' },
  { id: 'R2003', Date:'2025/01/01', applicant: '李小華', institution: '陽光托育所', status: '待審核', type: 'other' },
  { id: 'R2004', Date:'2025/01/01', applicant: '陳大同', institution: '愛心幼兒園', status: '待審核', type: 'qualification' },
  { id: 'R2005', Date:'2025/01/02', applicant: '林小美', institution: '愛心托育中心', status: '待審核', type: 'document' },
  { id: 'R2006', Date:'2025/01/02', applicant: '黃大明', institution: '溫馨幼兒園', status: '待審核', type: 'other' }
])

// 顯示的資料列表（初始顯示全部）
const items = ref([...fullList.value])
const showBack = ref(false)

function search() {
  const qId = filters.value.revokeId.trim()
  const qApplicant = filters.value.applicant.trim()
  const qType = filters.value.type

  // 根據條件過濾資料
  items.value = fullList.value.filter(item => {
    // 撤銷類型篩選
    if (qType && item.type !== qType) return false

    // 撤銷編號篩選（完全匹配或包含）
    if (qId && !item.id.toLowerCase().includes(qId.toLowerCase())) return false

    // 申請戶姓名篩選（包含匹配）
    if (qApplicant && !item.applicant.includes(qApplicant)) return false

    return true
  })

  // 顯示返回按鈕
  showBack.value = true
}

function openDetail(item) {
  // 導航到編輯頁面
  router.push(`/admin/application-revoke/${item.id}/edit`)
}

function goBack() {
  // 重置所有查詢條件
  filters.value = { type: '', revokeId: '', applicant: '' }
  // 恢復顯示全部資料
  items.value = [...fullList.value]
  // 隱藏返回按鈕
  showBack.value = false
}
</script>

<style scoped>
.announcement-page {
  display: flex;
  justify-content: center;
}
.announcement-card {
  max-width:820px;min-width: 85%
}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px;margin-top: 60px }
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700 }
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:14px 18px; margin-bottom:50px; box-shadow:0 2px 8px rgba(16,24,40,0.04); margin-top:50px; }
.query-container { display: flex; flex-wrap: wrap; gap: 12px; }
.query-row { display:flex; width: 50%; flex: 0 0 calc(50% - 6px); margin-bottom:12px; }
.search-area { gap:30px; display:flex; align-items:center; width: 100%; }
.type-label { font-weight:600; color:#2e6fb7; min-width: 100px; }
.date-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; flex: 1; max-width:200px; }
.btn-query { display: flex;justify-content: center;margin-top: 30px; }
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6; margin-right:6px; }
.btn.danger { background:#ff7b8a; color:#fff }
.announcement-table { width:100%; border-collapse:collapse ;margin-bottom:40px; }
.announcement-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight:700; }
.announcement-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; }
.date-cell { font-weight:600; color:#334e5c }
.title-cell { color:#334e5c }
.action-cell { text-align:left }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:10vh; }
@media (max-width:900px){ .announcement-card{ width:100%; padding:16px } .date-input{ width:100px } .query-row{ width:100%; flex: 0 0 100%; } }
</style>
