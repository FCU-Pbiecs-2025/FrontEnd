<template>
  <div class="status-page">
    <div>
      <div class="list-title">申請進度查詢</div>
      <div class="title-decoration"></div>
    </div>

    <div class="applications-section">

      <div v-if="applications.length === 0" class="no-applications">目前沒有申請紀錄</div>

      <div class="applications-list">
        <div
          v-for="item in applications"
          :key="item.caseNo"
          class="application-item"
          role="button"
          tabindex="0"
          @click="onItemClick(item)"
          @keydown="onKeydown($event, item)"
        >
          <div class="application-info">
            <h4 class="application-title">{{ item.caseNo }} </h4>
            <p class="application-date">申請日期: {{ item.applyDate }}</p>
            <p v-if="item.details" class="application-details">{{ item.details }}</p>
            <p v-else class="application-details muted">無詳細說明</p>

            <p v-if="item.status === 'waitingForAdmission' && item.queueNumber" class="queue-info">
              目前序位：<span class="queue-number">第 {{ item.queueNumber }} 位</span>
            </p>
          </div>

          <div class="application-status">
            <span :class="['status-badge', item.statusClass]">{{ getStatusLabel(item.statusClass, item.status) }}</span>
            <!-- action buttons removed: entire item is clickable now -->
          </div>
        </div>
      </div>

      <!-- helper: include all status class combinations so CSS selectors are recognized by the build/linter -->
      <div style="display:none" aria-hidden="true" class="__status-class-helpers">
        <span class="status-badge processing"></span>
        <span class="status-badge pending"></span>
        <span class="status-badge approved"></span>
        <span class="status-badge rejected"></span>
        <span class="status-badge supplement"></span>
        <span class="status-badge waitingForAdmission"></span>
        <span class="status-badge revokeProcessing"></span>
        <span class="status-badge revoked"></span>
        <span class="status-badge admitted"></span>
        <span class="status-badge withdrawn"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function getStatusLabel(statusClass, rawStatus) {
  const map = {
    processing: '審核中',
    pending: '審核中',
    approved: '已通過',
    rejected: '已退件',
    supplement: '需要補件',
    waitingForAdmission: '通過候補中',
    revokeProcessing: '撤銷申請審核中',
    revoked: '撤銷申請已通過',
    admitted: '已錄取',
    withdrawn: '已退托'
  }
  return map[statusClass] || rawStatus || '未知狀態'
}

// sample data with multiple statuses + some non-empty details
const applications = ref([
  { caseNo: 'A20251018001', applyDate: '2025-10-18', status: 'processing', statusClass: 'processing', details: '' },
  { caseNo: 'A20250915002', applyDate: '2025-09-15', status: 'approved', statusClass: 'approved', details: '' },
  { caseNo: 'A20250820003', applyDate: '2025-08-20', status: 'rejected', statusClass: 'rejected', details: '資料不完整：請補上父母身分證明文件。' },
  { caseNo: 'A20250711004', applyDate: '2025-07-11', status: 'supplement', statusClass: 'supplement', details: '照片解析度不足，請上傳清晰頭像照片。' },
  { caseNo: 'A20250601005', applyDate: '2025-06-01', status: 'revoked', statusClass: 'revoked', details: '申請已由申請人撤回。' },
  { caseNo: 'A20250425006', applyDate: '2025-04-25', status: 'waitingForAdmission', statusClass: 'waitingForAdmission', details: '', queueNumber: 12 },
  { caseNo: 'A20250212007', applyDate: '2025-02-12', status: 'admitted', statusClass: 'admitted', details: '' },
  { caseNo: 'A20250130008', applyDate: '2025-01-30', status: 'withdrawn', statusClass: 'withdrawn', details: '已於 2025-02-15 正式退託。' }
])

// Routes aligned with MemberCenter.vue
const onSupplement = (item) => {
  router.push({ path: '/supplement-document', query: { applicationId: item.caseNo } })
}

const onViewRejection = (item) => {
  router.push({ path: '/rejection-reason', query: { applicationId: item.caseNo } })
}

const onRevoke = (item) => {
  router.push({ path: '/revoke-application', query: { applicationId: item.caseNo } })
}

// Entire item click behavior
const onItemClick = (item) => {
  if (item.status === 'supplement') return onSupplement(item)
  if (item.status === 'rejected') return onViewRejection(item)
  if (item.status === 'waitingForAdmission') return onRevoke(item)
  // default: no dedicated page per MemberCenter for other statuses yet
}

// Keyboard accessibility: Enter / Space triggers click
const onKeydown = (e, item) => {
  const key = e.key?.toLowerCase()
  if (key === 'enter' || key === ' ') {
    e.preventDefault()
    onItemClick(item)
  }
}
</script>

<style scoped>
/* follow MemberCenter visual style */
.status-page { max-width: 60%; margin: 28px auto; padding: 0 16px 40px; }
.list-title{
  text-align:center;
  font-size:1.5rem;
  font-weight:bold;
  margin:50px 0 16px 0;
  letter-spacing:2px;
}
.title-decoration{
  width: 65%;
  height: 2px;
  border-radius: 4px;
  background: var(--4th-text-color);
  margin: 0 auto;
  margin-bottom: 10px;
}
.applications-section { background: transparent }
.applications-list { display:flex; flex-direction:column; gap:12px }
.application-item { display:flex; justify-content:space-between; align-items:flex-start; background:#fff; padding:14px; border-radius:10px; box-shadow:0 6px 18px rgba(0,0,0,0.04); cursor:pointer; transition: box-shadow .15s ease, transform .05s ease }
.application-item:hover { box-shadow:0 8px 22px rgba(0,0,0,0.07) }
.application-item:active { transform: scale(0.997) }
.application-info { flex:1 1 auto; padding-right:12px }
.application-title { margin:0 0 6px 0; font-size:1rem; color:#3b2b24 }
.application-date { margin:0 0 8px 0; color:#666 }
.application-details { margin:0 0 8px 0; color:#444; white-space:pre-wrap }
.application-details.muted { color:#bfbfbf; font-style:italic }
.queue-info { margin:0; color:#666 }

.application-status { display:flex; flex-direction:column; align-items:flex-end; gap:8px; min-width:140px }

/* status badges (keep MemberCenter palette) */
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

.no-applications { text-align:center; color:#666; padding:18px 0 }

@media (max-width:760px) {
  .application-item { flex-direction:column; align-items:flex-start }
  .application-status { align-items:flex-start; min-width:unset }
}
</style>
