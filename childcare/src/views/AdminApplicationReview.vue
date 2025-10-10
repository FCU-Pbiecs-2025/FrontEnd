<template>
  <div class="class-page">
    <div class="class-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/approval.png" class="icon" alt="icon" />
        <span class="main-title">審核申請</span>
      </div>
      <div class="tab-row">
        <span class="tab-title">申請審核查詢</span>
      </div>
      <div class="query-card">
        <div class="query-row">
          <label class="search-label">公私幼類型：</label>
          <select v-model="filters.type" class="search-input" style="width:120px">
            <option value="">全部</option>
            <option value="public">公立</option>
            <option value="private">私立</option>
          </select>
          <label class="search-label">申請編號：</label>
          <input v-model="filters.applicationId" placeholder="請輸入申請編號" class="search-input" style="width:140px" />
          <label class="search-label">申請戶姓名：</label>
          <input v-model="filters.applicant" placeholder="姓名/身分證末四碼" class="search-input" style="width:140px" />
          <button class="btn query" @click="search">查詢</button>
        </div>
      </div>
      <div class="table-section">
        <table class="class-table">
          <thead>
            <tr>
              <th>申請編號</th>
              <th>申請戶</th>
              <th>機構</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.applicant }}</td>
              <td>{{ item.institution }}</td>
              <td>{{ item.status }}</td>
              <td>
                <button class="btn small primary" @click="openDetail(item)">審核</button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="5" class="empty-tip">目前沒有符合條件的申請</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="bottom-row">
        <button class="btn ghost" @click="goBack">返回</button>
      </div>
      <div v-if="detail" class="modal">
        <div class="modal-content">
          <h3>申請詳情 - {{ detail.id }}</h3>
          <div class="review-form">
            <div class="form-row">
              <label class="form-label">審核日期：</label>
              <input type="date" v-model="reviewDate" class="form-input" />
            </div>
            <div class="form-row">
              <label class="form-label">審核結果：</label>
              <select v-model="reviewResult" class="form-input">
                <option value="">請選擇</option>
                <option value="通過">通過</option>
                <option value="退件">退件</option>
              </select>
            </div>
            <div class="form-row">
              <label class="form-label">立案資料：</label>
              <textarea v-model="reviewNote" class="form-input" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn primary" @click="confirmReview">送出</button>
            <button class="btn ghost" @click="closeDetail">返回</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const filters = ref({ type: '', applicationId: '', applicant: '' })
const items = ref([
  { id: 'A1001', applicant: '王小明', institution: '幸福幼兒園', status: '待審核', content: '參考資料...' },
  { id: 'A1002', applicant: '陳小華', institution: '快樂托育中心', status: '待審核', content: '參考資料...' }
])
const detail = ref(null)
const reviewDate = ref(new Date().toISOString().slice(0, 10))
const reviewResult = ref('')
const reviewNote = ref('')
function search() {
  const qId = filters.value.applicationId.trim()
  const qApplicant = filters.value.applicant.trim()
  const qType = filters.value.type
  // 可根據條件過濾 items
}
function openDetail(item) {
  detail.value = { ...item }
  reviewDate.value = new Date().toISOString().slice(0, 10)
  reviewResult.value = ''
  reviewNote.value = ''
}
function closeDetail() {
  detail.value = null
}
function confirmReview() {
  if (detail.value) {
    const idx = items.value.findIndex(i => i.id === detail.value.id)
    if (idx !== -1) {
      items.value[idx].status = reviewResult.value === '通過' ? '已通過' : (reviewResult.value === '退件' ? '已退件' : '待審核')
      items.value[idx].reviewDate = reviewDate.value
      items.value[idx].reviewNote = reviewNote.value
    }
    closeDetail()
  }
}
function goBack() {
  router.replace({ path: '/admin' })
}
</script>

<style scoped>
.class-page { display:flex; justify-content:center; padding:32px 0; }
.class-card { width:820px; background: #fff; border:1.5px solid #e6e6ea; border-radius:16px; padding:28px 32px; box-shadow:0 8px 24px rgba(16,24,40,0.04); }
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
.icon { width:32px; height:32px; }
.main-title { font-size:1.45rem; color:#2e6fb7; font-weight:700; letter-spacing:1px; }
.tab-row { display:flex; justify-content:center; margin-bottom:18px; }
.tab-title { background: #f9dada; color:#e35d6a; font-weight:700; font-size:1.15rem; padding:6px 38px; border-radius:18px; letter-spacing:2px; }
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:18px 24px; margin-bottom:22px; box-shadow:0 2px 8px rgba(16,24,40,0.04); }
.query-row { display:flex; align-items:center; gap:18px; margin-bottom:12px; }
.search-label { font-weight:600; color:#2e6fb7; margin-right:6px; }
.search-input { width:120px; max-width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; }
.btn { padding:7px 18px; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:1rem; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc; }
.btn.small { padding:5px 12px; font-size:0.95rem; margin-right:6px; background:#f3f4f6; }
.table-section { margin-bottom:18px; }
.class-table { width:100%; border-collapse:collapse; background:transparent; border-radius:10px; overflow:hidden; }
.class-table th { background:#cfe8ff; color:#2e6fb7; font-weight:700; padding:10px; text-align:left; }
.class-table td { padding:10px; border-bottom:1px solid #f3f4f6; }
.empty-tip { color: #aaa; text-align: center; padding: 24px 0; }
.bottom-row { display:flex; justify-content:flex-end; gap:12px; margin-top:8px; }
.modal { position: fixed; left: 0; right: 0; top: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 99; }
.modal-content { background: white; padding: 18px; border-radius: 8px; width: 520px; box-shadow:0 8px 24px rgba(16,24,40,0.08); }
.modal-actions { display: flex; gap: 8px; margin-top: 12px; }
.review-form { margin-bottom: 12px; }
.form-row { display: flex; align-items: center; margin-bottom: 10px; }
.form-label { width: 100px; font-weight: 600; color: #2e6fb7; }
.form-input { flex: 1; padding: 7px 10px; border-radius: 6px; border: 1px solid #d8dbe0; font-size: 1rem; }
@media (max-width:900px){ .class-card{ width:100%; padding:16px } .search-input{ width:100% } }
</style>
