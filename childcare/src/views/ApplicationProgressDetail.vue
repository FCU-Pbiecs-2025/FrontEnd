<template>
  <div class="progress-detail-page">
    <div v-if="!childActive" class="page-header">
      <h1>申請進度詳情</h1>
      <p class="page-description">查看申請案件摘要與目前狀態</p>
    </div>
    <div class="content-area">
      <div v-if="!application" class="empty-card">
        <p>找不到此案號：{{ caseNo }}</p>
        <button class="back-btn" @click="goBack">返回</button>
      </div>

      <div v-else>
        <div v-if="!childActive" class="detail-card">
          <h2>案件摘要</h2>
          <div class="summary-grid">
            <div class="field"><span class="label">案號</span><span class="value">{{ application.caseNo }}</span></div>
            <div class="field"><span class="label">申請日期</span><span class="value">{{ application.applyDate }}</span></div>
            <div class="field"><span class="label">申請人姓名</span><span class="value">{{ application.applicantName || '—' }}</span></div>
            <div class="field"><span class="label">申請幼兒姓名</span><span class="value">{{ application.childName || '—' }}</span></div>
            <div class="field"><span class="label">幼兒月齡</span><span class="value">{{ childMonthsLabel }}</span></div>
            <div class="field"><span class="label">申請機構</span><span class="value">{{ application.assignedInstitution?.name || application.targetInstitution || '—' }}</span></div>
          </div>

          <div class="status-row">
            <span class="status-label">申請狀態：</span>
            <span :class="['status-badge', application.statusClass || application.status]">
              {{ getStatusLabel(application.statusClass || application.status, application.status) }}
            </span>
          </div>

          <div class="explain-card">
            <h3>說明</h3>
            <p v-if="isProcessing" class="explain-text">請靜候幾日等候審核，我們會盡快完成審核並以簡訊/Email 通知您。</p>
            <div v-else-if="isSupplement" class="explain-text">
              <p>需補上戶口名簿圖片檔，或其他審核要求的文件。</p>
              <ul v-if="application.supplementItems?.length" class="supplement-list">
                <li v-for="it in application.supplementItems" :key="it.key">
                  <strong>{{ it.label }}</strong><span v-if="it.required" class="required">（必填）</span>
                </li>
              </ul>
              <p v-if="application.supplementDeadline" class="deadline">補件期限：{{ application.supplementDeadline }}</p>
            </div>
            <p v-else-if="application.status === 'rejected'" class="explain-text">您的申請已退件，建議查看退件原因並完成修正後再行申請。</p>
            <p v-else-if="application.status === 'waitingForAdmission'" class="explain-text">
              您目前為候補序位第 <strong>{{ application.queueNumber }}</strong> 位，名額釋出後將依序通知。
            </p>
            <p v-else-if="application.status === 'admitted'" class="explain-text">恭喜錄取！請依通知完成後續報到手續。</p>
            <p v-else-if="application.status === 'withdrawn'" class="explain-text">案件已退托，如需再次申請可回到申請頁面重新提出申請。</p>
            <p v-else class="explain-text">{{ application.details || '—' }}</p>
          </div>

          <div class="actions">
            <button v-if="!['rejected','revoked','revokeProcessing','withdrawn'].includes(application.status)" class="danger-btn" @click="goRevoke">撤銷申請</button>
            <button v-if="application.status === 'supplement'" class="primary-btn" @click="goSupplement">補件</button>
            <button class="back-btn" @click="goBack">返回</button>
          </div>
        </div>
        <router-view v-if="childActive" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const caseNo = route.params.caseNo

// 簡易本地資料（可改為串 API），補上申請人/幼兒/出生日期等欄位以展示摘要
const dataset = [
  { caseNo: 'A20251018001', applyDate: '2025-10-18', status: 'processing', statusClass: 'processing', details: '', applicantName: '王小明', childName: '王小寶', childBirth: '2022-05-01', targetInstitution: '幸福托育中心' },
  { caseNo: 'A20251018002', applyDate: '2025-10-17', status: 'pending', statusClass: 'pending', details: '等候資料審核', applicantName: '王小明', childName: '王小寶', childBirth: '2022-05-01', targetInstitution: '幸福托育中心' },
  { caseNo: 'A20250820003', applyDate: '2025-08-20', status: 'supplement', statusClass: 'supplement', details: '照片解析度不足，請上傳清晰頭像照片。', supplementItems: [ { key: 'hukou', label: '戶口名簿影本', required: true } ], supplementDeadline: '2025-09-03', applicantName: '林小華', childName: '林小安', childBirth: '2023-01-15', targetInstitution: '希望托育中心' },
  { caseNo: 'A20250711004', applyDate: '2025-07-11', status: 'rejected', statusClass: 'rejected', details: '資料不完整：請補上父母身分證明文件。', applicantName: '李大華', childName: '李小華', childBirth: '2021-11-20', targetInstitution: '快樂托育中心' },
  { caseNo: 'A20250425006', applyDate: '2025-04-25', status: 'waitingForAdmission', statusClass: 'waitingForAdmission', details: '', queueNumber: 12, queueTotal: 50, estimatedWaitWeeks: 8, applicantName: '陳建國', childName: '陳小明', childBirth: '2022-10-10', targetInstitution: '幸福托育中心' },
  { caseNo: 'A20250601005', applyDate: '2025-06-01', status: 'revokeProcessing', statusClass: 'revokeProcessing', details: '已送出撤銷申請，等待處理。', applicantName: '張美麗', childName: '張小天', childBirth: '2021-06-05', targetInstitution: '希望托育中心' },
  { caseNo: 'A20250601006', applyDate: '2025-06-02', status: 'revoked', statusClass: 'revoked', details: '撤銷申請已通過。', applicantName: '林雅文', childName: '林小花', childBirth: '2020-12-30', targetInstitution: '快樂托育中心' },
  { caseNo: 'A20250130008', applyDate: '2025-01-30', status: 'withdrawn', statusClass: 'withdrawn', details: '已於 2025-02-15 正式退託。', applicantName: '吳淑芬', childName: '吳小虎', childBirth: '2020-05-10', targetInstitution: '幸福托育中心' },
  { caseNo: 'A20250212007', applyDate: '2025-02-12', status: 'admitted', statusClass: 'admitted', details: '恭喜，您已錄取。', admittedAt: '2025-03-01', assignedInstitution: { id: 'I-1001', name: '幸福托育中心' }, applicantName: '黃志明', childName: '黃小龍', childBirth: '2021-03-22' }
]

const application = computed(() => dataset.find(a => String(a.caseNo) === String(caseNo)))

function getStatusLabel(statusClass, rawStatus) {
  const map = {
    processing: '審核中',
    supplement: '需要補件',
    rejected: '已退件',
    waitingForAdmission: '錄取候補中',
    revokeProcessing: '撤銷申請審核中',
    revoked: '撤銷申請通過',
    admitted: '已錄取',
    withdrawn: '已退托',

  }
  return map[statusClass] || map[rawStatus] || rawStatus || '未知狀態'
}

const isProcessing = computed(() => {
  const s = application.value?.status
  return s === 'processing' || s === 'pending'
})
const isSupplement = computed(() => application.value?.status === 'supplement')

// 檢查是否為補件 / 撤銷 子路由（若是，則 childActive 為 true）
const childActive = computed(() => {
  const names = ['ApplicationProgressSupplement', 'ApplicationProgressRevoke']
  if (names.includes(route.name)) return true
  return Array.isArray(route.matched) && route.matched.some(r => names.includes(r.name))
})

const childMonthsLabel = computed(() => {
  const birth = application.value?.childBirth
  if (!birth) return '—'
  const months = monthsBetween(birth, new Date())
  return months >= 0 ? `${months} 個月` : '—'
})

function monthsBetween(from, to) {
  const d1 = new Date(from)
  const d2 = new Date(to)
  let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth())
  if (d2.getDate() < d1.getDate()) months -= 1
  return months
}

const goBack = () => router.back()
const goSupplement = () => router.push({ name: 'ApplicationProgressSupplement', params: { caseNo } })
const goRevoke = () => router.push({ name: 'ApplicationProgressRevoke', params: { caseNo } })
</script>

<style scoped>
.progress-detail-page { min-height: calc(100vh - 160px); padding: 40px 0; }
.page-header { text-align: center; margin-bottom: 24px; }
.page-header h1 { color: #333; font-size: 2rem; font-weight: bold; margin-bottom: 8px; }
.page-description { color: #666; font-size: 1.05rem; }

.content-area { max-width: 900px; margin: 0 auto; padding: 0 20px; }

.empty-card, .detail-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(249,175,174,0.1); }
.empty-card { text-align: center; }

.detail-card h2 { color: #333; font-size: 1.6rem; margin-bottom: 16px; border-bottom: 3px solid #F9AFAE; padding-bottom: 8px; }

.summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 18px; margin-bottom: 16px; }
.field { display:flex; gap: 10px; align-items: center; }
.label { color:#5f8ba8; font-weight: 700; min-width: 120px; }
.value { color:#333; font-weight: 500; }

.status-row { display:flex; align-items: center; gap: 10px; margin: 12px 0 20px 0; }
.status-label { color:#555; font-weight: 600; }

.explain-card { background:#FFF8F6; border-radius: 10px; padding: 16px 18px; border-left: 4px solid #F9AFAE; }
.explain-card h3 { margin: 0 0 8px 0; color:#3b2b24; }
.explain-text { color:#444; line-height: 1.7; }
.supplement-list { margin: 8px 0 0 18px; color:#444; }
.supplement-list li { margin: 4px 0; }
.required { color:#dc3545; font-weight: 700; }
.deadline { color:#dc3545; font-weight: 600; }

.actions { display:flex; justify-content: center; gap: 12px; margin-top: 20px; }
.primary-btn { background:#F9AFAE; color:#fff; border:none; padding: 10px 20px; border-radius: 6px; cursor:pointer; }
.primary-btn:hover { background:#f5a1a1; }
.danger-btn { background:#dc3545; color:#fff; border:none; padding: 10px 20px; border-radius: 6px; cursor:pointer; }
.danger-btn:hover { background:#c82333; }
.back-btn { background: transparent; color: #F9AFAE; border: 2px solid #F9AFAE; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.back-btn:hover { background: #F9AFAE; color:#fff; }

/* 狀態徽章，沿用 ApplicationStatus 樣式 */
.status-badge { padding:6px 12px; border-radius:16px; font-weight:700; font-size:0.88rem }
.status-badge.processing, .status-badge.pending { background:#fff3cd; color:#856404 }
.status-badge.approved { background:#d4edda; color:#155724 }
.status-badge.rejected { background:#f8d7da; color:#721c24 }
.status-badge.supplement { background:#fff3cd; color:#856404 }
.status-badge.waitingForAdmission { background:#cce5ff; color:#004085 }
.status-badge.revokeProcessing { background:#e2e3e5; color:#383d41 }
.status-badge.revoked { background:#d6d8db; color:#1b1e21 }
.status-badge.admitted { background:#d1ecf1; color:#0c5460 }
.status-badge.withdrawn { background:#f8d7da; color:#721c24 }

@media (max-width: 760px) {
  .summary-grid { grid-template-columns: 1fr; }
}
</style>
