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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'
import { getUserApplicationDetails } from '@/api/application.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const childActive = computed(() => {
  return route.name === 'ApplicationProgressDetail' || route.name === 'ApplicationProgressSupplement' || route.name === 'ApplicationProgressRevoke'
})

function getStatusLabel(statusClass, rawStatus) {
  // 如果後端直接提供中文狀態，優先使用
  if (rawStatus && typeof rawStatus === 'string' && /[\u4e00-\u9fa5]/.test(rawStatus)) {
    return rawStatus
  }

  // 否則根據 statusClass 轉換
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

// 申請資料
const applications = ref([])
const loading = ref(false)
const error = ref(null)

// 從後端獲取使用者申請詳細資訊
const fetchUserApplications = async () => {
  try {
    loading.value = true
    error.value = null

    // 從 Pinia authStore 獲取使用者 ID
    const userID = authStore.user?.UserID

    if (!userID) {
      console.warn('未找到使用者 ID，無法獲取申請資料')
      applications.value = []
      return
    }

    console.log('[ApplicationStatus] 正在獲取使用者申請資料，UserID:', userID)
    const response = await getUserApplicationDetails(userID)

    console.log('[ApplicationStatus] API回應:', response)
    console.log('[ApplicationStatus] API回應類型:', typeof response)
    console.log('[ApplicationStatus] 是否為陣列:', Array.isArray(response))

    // 將後端資料轉換為前端格式
    if (response && Array.isArray(response)) {
      applications.value = response.map((item, index) => {
        // 優先使用後端 DTO 的 applicationID
        const rawCase = item.applicationID || item.applicationId || item.applicationId || item.caseNo || item.id || item.applicationNo || item.case_number || item.caseId || item.applicationID
        const caseNo = rawCase ? String(rawCase) : `CASE-${Date.now()}-${index}`

        console.log('處理案件資料:', {
          originalData: item,
          mappedCaseNo: caseNo
        })

        return {
          caseNo: caseNo,
          applicationID: item.applicationID || item.applicationId || null,
          applyDate: item.applicationDate || item.applyDate || item.submittedAt,
          status: item.status,
          statusClass: mapStatusToClass(item.status),
          details: item.details || item.reason || '',
          queueNumber: item.queueNumber,
          queueTotal: item.queueTotal,
          estimatedWaitWeeks: item.estimatedWaitWeeks,
          supplementItems: item.supplementItems,
          supplementDeadline: item.supplementDeadline,
          rejectionReason: item.rejectionReason || item.reason,
          assignedInstitution: item.assignedInstitution
        }
      })

      console.log('映射後的applications:', applications.value)
    } else if (response) {
      // 如果回傳的不是陣列，但有資料
      console.log('API回傳非陣列格式:', response)
      applications.value = []
    } else {
      console.log('API沒有回傳有效的陣列資料，使用測試資料')
      // 臨時測試資料 - 在實際API正常回應後可以移除
      applications.value = [
        {
          caseNo: 'TEST-001',
          applyDate: '2024-11-20',
          status: '審核中',
          statusClass: 'processing',
          details: '您的申請正在審核中，請耐心等候',
        },
        {
          caseNo: 'TEST-002',
          applyDate: '2024-11-15',
          status: '需要補件',
          statusClass: 'supplement',
          details: '請補充戶口名簿影本',
        }
      ]
    }
  } catch (err) {
    console.error('獲取申請資料失敗:', err)
    error.value = '無法載入申請資料，請稍後再試'
    applications.value = []
  } finally {
    loading.value = false
  }
}

// 將後端中文狀態映射到前端狀態類別
function mapStatusToClass(status) {
  if (!status) return 'processing'

  const statusMap = {
    '審核中': 'processing',
    '需要補件': 'supplement',
    '已退件': 'rejected',
    '候補中': 'waitingForAdmission',
    '撤銷申請審核中': 'revokeProcessing',
    '撤銷申請通過': 'revoked',
    '已退托': 'withdrawn',
    '已錄取': 'admitted'
  }

  return statusMap[status] || 'processing'
}

// 組件掛載時獲取資料
onMounted(() => {
  fetchUserApplications()
})

// Entire item click behavior -> unified progress detail page
const onItemClick = async (item) => {
  console.log('點擊項目:', item)
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
