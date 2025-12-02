<template>
    <!-- 當未進入詳情時顯示列表；進入詳情/補件/撤銷時顯示子頁 -->
    <div v-if="!childActive" class="applications-section">
  <div class="status-page">
    <div>
      <div class="list-title">申請進度查詢</div>
      <div class="title-decoration"></div>
    </div>

      <div v-if="loading" class="loading-message">載入中...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="applications.length === 0" class="no-applications">目前沒有申請紀錄</div>

      <div v-else class="applications-list">
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
            <h4 class="application-title">{{ item.caseNumber || item.caseNo }} </h4>
            <p class="application-date">申請日期: {{ item.applyDate }}</p>
            <p class="application-details">案件編號: {{ item.caseNumber || '—' }}</p>
            <p class="application-details">申請人: {{ item.username || '—' }}</p>
            <p class="application-details">幼兒姓名: {{ item.childname || '—' }}</p>
            <p class="application-details">申請機構: {{ item.institutionName || '—' }}</p>
            <p v-if="item.reason" class="application-details">原因: {{ item.reason }}</p>
            <p v-else class="application-details muted">無詳細說明</p>
            <p v-if="(item.status === '錄取候補中' || item.status === 'waitingForAdmission') && item.currentOrder" class="queue-info">
              目前序位：<span class="queue-number">第 {{ item.currentOrder }} 位</span>
            </p>
          </div>

          <div class="application-status">
            <span :class="['status-badge', item.statusClass]">{{ getStatusLabel(item.statusClass, item.status) }}</span>
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
    <!-- 詳情 / 補件 / 撤銷 子頁 -->
    <router-view v-else />
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'
import { useApplicationsStore } from '@/store/applications.js'
import { getUserApplicationDetails, CASE_STATUS_MAP } from '@/api/application.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const applicationsStore = useApplicationsStore()

const childActive = computed(() => {
  return route.name === 'ApplicationProgressDetail' || route.name === 'ApplicationProgressSupplement' || route.name === 'ApplicationProgressRevoke'
})

function getStatusLabel(statusClass, rawStatus) {
  // If backend returned a Chinese label already, use it
  if (rawStatus && typeof rawStatus === 'string' && /[\u4e00-\u9fa5]/.test(rawStatus)) {
    return rawStatus
  }

  // If rawStatus is a numeric code (string or number) and we have a mapping, use it
  if (rawStatus !== undefined && rawStatus !== null) {
    const codeKey = String(rawStatus)
    if (CASE_STATUS_MAP && CASE_STATUS_MAP[codeKey]) {
      return CASE_STATUS_MAP[codeKey]
    }
  }

  // Otherwise map from statusClass
  const map = {
    processing: '審核中',
    pending: '審核中',
    supplement: '需要補件',
    rejected: '已退件',
    waitingForAdmission: '候補中',
    revokeProcessing: '撤銷申請審核中',
    revoked: '撤銷申請通過',
    admitted: '已錄取',
    withdrawn: '已退托'
  }
  return map[statusClass] || rawStatus || '未知狀態'
}

// 申請資料從 store 取得
const applications = computed(() => applicationsStore.applications)
const loading = computed(() => applicationsStore.loading)
const error = computed(() => applicationsStore.error)

// 從後端獲取使用者申請詳細資訊
const fetchUserApplications = async () => {
  try {
    applicationsStore.setLoading(true)
    applicationsStore.clearError()

    // 從 Pinia authStore 獲取使用者 ID
    const userID = authStore.user?.UserID

    if (!userID) {
      console.warn('未找到使用者 ID，無法獲取申請資料')
      applicationsStore.setApplications([])
      return
    }

    const response = await getUserApplicationDetails(userID)

    // 將後端資料轉換為前端格式並存入 store
    if (response && Array.isArray(response)) {
      const formattedApplications = response.map((item, index) => {
        // 優先使用後端 DTO 的 applicationID
        const rawCase = item.applicationID || item.applicationId || item.caseNo || item.id || item.applicationNo || item.case_number || item.caseId
        const caseNo = rawCase ? String(rawCase) : `CASE-${Date.now()}-${index}`

        // derive a normalized status value (prefer Chinese label if provided, else code or English)
        const rawStatus = item.status !== undefined && item.status !== null ? item.status : item.caseStatus
        const statusClass = mapStatusToClass(rawStatus)

        return {
          caseNo: caseNo,
          applicationID: item.applicationID || item.applicationId || null,
          applicationDate: item.applicationDate || item.applyDate,
          applyDate: item.applicationDate || item.applyDate,
          caseNumber: item.caseNumber || '', // 新增案件編號欄位
          childname: item.childname || '',
          birthDate: item.birthDate || '',
          institutionID: item.institutionID || '',
          institutionName: item.institutionName || '',
          username: item.username || '',
          cancellationID: item.cancellationID || '',
          reason: item.reason || '',
          status: item.status || item.caseStatus || item.state || '',
          statusClass: statusClass,
          // 新增的欄位
          currentOrder: item.currentOrder || item.queueNumber || null,
          childNationalID: item.childNationalID || '',
          // 保留其他可能的欄位
          queueNumber: item.currentOrder || item.queueNumber,
          queueTotal: item.queueTotal,
          estimatedWaitWeeks: item.estimatedWaitWeeks,
          supplementItems: item.supplementItems,
          supplementDeadline: item.supplementDeadline,
          rejectionReason: item.rejectionReason || item.reason,
          assignedInstitution: item.assignedInstitution
        }
      })

      applicationsStore.setApplications(formattedApplications)
      console.log('申請資料已存入 store:', formattedApplications)
    } else if (response) {
      // 如果回傳的不是陣列，但有資料
      console.log('API回傳非陣列格式:', response)
      applicationsStore.setApplications([])
    } else {
      console.log('API沒有回傳有效資料')
      applicationsStore.setApplications([])
    }
  } catch (err) {
    console.error('獲取申請資料失敗:', err)
    applicationsStore.setError('無法載入申請資料，請稍後再試')
    applicationsStore.setApplications([])
  } finally {
    applicationsStore.setLoading(false)
  }
}

// 將後端中文狀態映射到前端狀態類別
function mapStatusToClass(status) {
  if (!status) return 'processing'

  // If status is numeric code, map via CASE_STATUS_MAP
  const codeKey = String(status)
  let resolved = status
  if (CASE_STATUS_MAP && CASE_STATUS_MAP[codeKey]) {
    resolved = CASE_STATUS_MAP[codeKey]
  }

  // now resolved is likely Chinese label or english
  const statusMap = {
    '審核中': 'processing',
    '需要補件': 'supplement',
    '已退件': 'rejected',
    '候補中': 'waitingForAdmission',
    '錄取候補中': 'waitingForAdmission',
    '撤銷申請審核中': 'revokeProcessing',
    '撤銷申請通過': 'revoked',
    '已退托': 'withdrawn',
    '已錄取': 'admitted',
    'admitted': 'admitted',
    '錄取': 'admitted'
  }

  // If resolved is a known key, return mapping, else default to processing
  return statusMap[resolved] || 'processing'
}

// 組件掛載時獲取資料
onMounted(() => {
  fetchUserApplications()
})

// 監聽 refresh 參數，若變動則重新抓資料
watch(() => route.query.refresh, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    fetchUserApplications()
  }
})

// Entire item click behavior -> unified progress detail page
const onItemClick = async (item) => {
  console.log('點擊項目:', item)

  // 將選中的申請資料存入 store
  applicationsStore.setSelectedApplication(item)
  console.log('已將申請資料存入 store:', item)

  // 嘗試多個可能的欄位來取得 caseNo
  const selectedCase = item.caseNo || item.applicationID || item.applicationId || item.id || item.caseId || item.applicationNo || item.case_number || item.applicationID || null
  console.log('選取的案件識別:', selectedCase)

  if (!selectedCase) {
    console.error('無法從項目中取得任何案件識別欄位', item)
    alert('案件識別不存在，無法查看詳細資料')
    return
  }

  const caseParam = String(selectedCase)
  const pathPush = `/application-status/progress/${encodeURIComponent(caseParam)}`

  console.log('使用 path 跳轉到:', pathPush)

  try {
    await router.push(pathPush)
    console.log('路由跳轉成功 (path)')
  } catch (e) {
    console.error('path 跳轉失敗:', e)
    alert('無法跳轉到詳細頁，請查看 console 以獲取更多資訊')
  }
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
.list-title{ text-align:center; font-size:1.5rem; font-weight:bold; margin:50px 0 16px 0; letter-spacing:2px; }
.title-decoration{ width: 65%; height: 2px; border-radius: 4px; background: var(--4th-text-color); margin: 0 auto; margin-bottom: 10px; }
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
.loading-message { text-align:center; color:#666; padding:18px 0; font-size:1rem }
.error-message { text-align:center; color:#d32f2f; padding:18px 0; font-size:1rem; background:#ffebee; border-radius:8px }

@media (max-width:760px) {
  .application-item { flex-direction:column; align-items:flex-start }
  .application-status { align-items:flex-start; min-width:unset }
}
</style>
