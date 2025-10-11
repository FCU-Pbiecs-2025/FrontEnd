<template>
  <div class="announcement-page">
    <div class="announcement-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/approval.png" class="icon" alt="icon" />
        <span class="main-title">審核申請</span>
      </div>

      <div class="query-card">
        <div class="query-container">
          <div class="query-row">
            <div class="search-area">
              <label class="type-label">公私幼類型：</label>
              <select v-model="filters.type" class="date-input" style="width:120px">
                <option value="">全部</option>
                <option value="public">公立</option>
                <option value="private">私立</option>
              </select>
            </div>
          </div>
          <div class="query-row">
            <div class="search-area">
              <label class="type-label">申請編號：</label>
              <input v-model="filters.applicationId" placeholder="請輸入申請編號" class="date-input" style="width:200px" />
            </div>
          </div>
          <div class="query-row">
            <div class="search-area">
              <label class="type-label">申請戶姓名：</label>
              <input v-model="filters.applicant" placeholder="姓名/身分證末四碼" class="date-input" style="width:200px" />
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
              <th>申請編號</th>
              <th>申請戶</th>
              <th>機構</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td class="date-cell">{{ item.id }}</td>
              <td class="title-cell">{{ item.applicant }}</td>
              <td class="title-cell">{{ item.institution }}</td>
              <td class="title-cell">{{ item.status }}</td>
              <td class="action-cell">
                <button class="btn small" @click="openDetail(item)">審核</button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="5" class="empty-tip">目前沒有符合條件的申請</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bottom-row" v-show="showBack">
        <button class="btn primary" @click="goBack">返回</button>
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
            <button class="btn query" @click="closeDetail">返回</button>
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

// 原始完整資料列表
const fullList = ref([
  { id: 'A1001', applicant: '王小明', institution: '幸福幼兒園', status: '待審核', type: 'public', content: '參考資料...' },
  { id: 'A1002', applicant: '陳小華', institution: '快樂托育中心', status: '待審核', type: 'private', content: '參考資料...' },
  { id: 'A1003', applicant: '李大明', institution: '陽光幼兒園', status: '已通過', type: 'public', content: '參考資料...' },
  { id: 'A1004', applicant: '張小花', institution: '愛心托育所', status: '已退件', type: 'private', content: '參考資料...' },
  { id: 'A1004', applicant: '張小花', institution: '愛心托育所', status: '已退件', type: 'private', content: '參考資料...' },
  { id: 'A1004', applicant: '張小花', institution: '愛心托育所', status: '已退件', type: 'private', content: '參考資料...' }
])

// 顯示的資料列表（初始顯示全部）
const items = ref([...fullList.value])

const detail = ref(null)
const reviewDate = ref(new Date().toISOString().slice(0, 10))
const reviewResult = ref('')
const reviewNote = ref('')
const showBack = ref(false)

function search() {
  const qId = filters.value.applicationId.trim()
  const qApplicant = filters.value.applicant.trim()
  const qType = filters.value.type

  // 根據條件過濾資料
  items.value = fullList.value.filter(item => {
    // 公私幼類型篩選
    if (qType && item.type !== qType) return false

    // 申請編號篩選（完全匹配或包含）
    if (qId && !item.id.toLowerCase().includes(qId.toLowerCase())) return false

    // 申請戶姓名篩選（包含匹配）
    if (qApplicant && !item.applicant.includes(qApplicant)) return false

    return true
  })

  // 如果有查詢結果，則顯示返回按鈕
  showBack.value = items.value.length > 0
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
    const idx = fullList.value.findIndex(i => i.id === detail.value.id)
    if (idx !== -1) {
      fullList.value[idx].status = reviewResult.value === '通過' ? '已通過' : (reviewResult.value === '退件' ? '已退件' : '待審核')
      fullList.value[idx].reviewDate = reviewDate.value
      fullList.value[idx].reviewNote = reviewNote.value
    }
    // 更新顯示列表
    search()
    closeDetail()
  }
}

function goBack() {
  // 重置所有查詢條件
  filters.value = { type: '', applicationId: '', applicant: '' }
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
  width:820px;

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
.announcement-table { width:100%; border-collapse:collapse ;margin-bottom:40px; }
.announcement-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight:700; }
.announcement-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; }
.date-cell { font-weight:600; color:#334e5c }
.title-cell { color:#334e5c }
.action-cell { text-align:right }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:10vh; }
.modal { position: fixed; left: 0; right: 0; top: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 99; }
.modal-content { background: white; padding: 24px; border-radius: 12px; width: 520px; box-shadow:0 8px 24px rgba(16,24,40,0.08); }
.modal-content h3 { color:#2e6fb7; font-size:1.2rem; margin-bottom:16px; }
.modal-actions { display: flex; gap: 12px; margin-top: 16px; justify-content:center; }
.review-form { margin-bottom: 12px; }
.form-row { display: flex; align-items: center; margin-bottom: 12px; }
.form-label { width: 100px; font-weight: 600; color: #2e6fb7; }
.form-input { flex: 1; padding: 8px 10px; border-radius: 6px; border: 1px solid #d8dbe0; font-size: 1rem; }
@media (max-width:900px){ .announcement-card{ width:100%; padding:16px } .date-input{ width:100px } .query-row{ width:100%; flex: 0 0 100%; } }
</style>
