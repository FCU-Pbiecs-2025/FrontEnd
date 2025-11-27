<template>
  <div class="progress-detail-page">
    <div v-if="!childActive" class="page-header">
      <h1>申請進度詳情</h1>
      <p class="page-description">查看申請案件摘要與目前狀態</p>
    </div>
    <div class="content-area">
      <!-- Loading 狀態 -->
      <div v-if="loading" class="loading-card">
        <p>載入中...</p>
      </div>

      <!-- 錯誤狀態 -->
      <div v-else-if="error" class="error-card">
        <p>{{ error }}</p>
        <button class="back-btn" @click="goBack">返回</button>
      </div>

      <!-- 找不到案件 -->
      <div v-else-if="!application" class="empty-card">
        <p>找不到此案號：{{ caseNo }}</p>
        <button class="back-btn" @click="goBack">返回</button>
      </div>

      <!-- 案件詳細資料 -->
      <div v-else>
        <div v-if="!childActive" class="detail-card">
          <h2>案件摘要</h2>
          <div class="summary-grid">
            <div class="field"><span class="label">申請案號</span><span class="value">{{ application.caseNo }}</span></div>
            <div class="field"><span class="label">申請日期</span><span class="value">{{ application.applyDate || application.applicationDate }}</span></div>
            <div class="field"><span class="label">申請人姓名</span><span class="value">{{ application.applicantName || '—' }}</span></div>
            <div class="field"><span class="label">申請幼兒姓名</span><span class="value">{{ application.childName || '—' }}</span></div>
            <div class="field"><span class="label">幼兒出生日期</span><span class="value">{{ application.childBirth || '—' }}</span></div>
            <div class="field"><span class="label">幼兒月齡</span><span class="value">{{ childMonthsLabel }}</span></div>
            <div class="field"><span class="label">申請機構</span><span class="value">{{ application.institutionName || application.assignedInstitution?.name || application.targetInstitution || '—' }}</span></div>
            <div class="field" v-if="application.cancellationID"><span class="label">撤銷案號</span><span class="value">{{ application.cancellationID }}</span></div>
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
            <p v-if="application.status === 'rejected'" class="explain-text">您的申請已退件，建議查看退件原因並完成修正後再行申請。</p>
            <p v-else-if="application.status === 'waitingForAdmission' || application.status === '候補中' || application.status === '錄取候補中'" class="explain-text">
              您目前為候補序位第 <strong>{{ application.currentOrder || application.queueNumber || '—' }}</strong> 位，名額釋出後將依序通知。
            </p>
            <p v-else-if="application.status === 'admitted'" class="explain-text">恭喜錄取！請依通知完成後續報到手續。</p>
            <p v-else-if="application.status === 'withdrawn'" class="explain-text">案件已退托，如需再次申請可回到申請頁面重新提出申請。</p>
            <p v-else-if="application.status === 'revokeProcessing'" class="explain-text">
              您的撤銷申請正在審核中，目前序位為第 <strong>{{ application.currentOrder || application.queueNumber || '—' }}</strong> 位。
            </p>
            <p v-else-if="application.status === 'revoked'" class="explain-text">您的撤銷申請已通過，案件已結束。</p>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'
import { useApplicationsStore } from '@/store/applications.js'
import { getCaseDetails } from '@/api/application.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const applicationsStore = useApplicationsStore()

// 允許從多個位置取 caseNo（route.params, route.query, 其它常見 param 名稱）
let caseNo = route.params.caseNo || route.query.caseNo || route.params.applicationId || route.params.id || route.query.applicationId || null

// 響應式資料
const application = ref(null)
const loading = ref(false)
const error = ref(null)

// 檢查並從 store 或 API 取得案件詳細資料
const fetchCaseDetails = async (effectiveCaseNo) => {
  // 首先檢查 store 中是否有選中的申請資料
  const selectedApplication = applicationsStore.selectedApplication

  if (selectedApplication && (
    String(selectedApplication.caseNo) === String(effectiveCaseNo) ||
    String(selectedApplication.applicationID) === String(effectiveCaseNo)
  )) {
    console.log('[ApplicationProgressDetail] 使用 store 中的申請資料:', selectedApplication)

    // 將 store 資料轉換為詳情頁需要的格式
    application.value = {
      caseNo: selectedApplication.caseNo,
      applyDate: selectedApplication.applyDate || selectedApplication.applicationDate,
      status: selectedApplication.status,
      statusClass: selectedApplication.statusClass,
      details: selectedApplication.details || selectedApplication.reason,
      applicantName: selectedApplication.username,
      childName: selectedApplication.childname,
      childBirth: selectedApplication.birthDate,
      targetInstitution: selectedApplication.institutionName,
      assignedInstitution: selectedApplication.assignedInstitution,
      supplementItems: selectedApplication.supplementItems,
      supplementDeadline: selectedApplication.supplementDeadline,
      queueNumber: selectedApplication.currentOrder || selectedApplication.queueNumber,
      admittedAt: selectedApplication.admittedAt,
      // 新增的欄位
      applicationID: selectedApplication.applicationID,
      applicationDate: selectedApplication.applicationDate,
      institutionID: selectedApplication.institutionID,
      institutionName: selectedApplication.institutionName,
      cancellationID: selectedApplication.cancellationID,
      reason: selectedApplication.reason,
      currentOrder: selectedApplication.currentOrder,
      childNationalID: selectedApplication.childNationalID
    }

    // 調試信息：確保序位正確傳遞
    console.log('[ApplicationProgressDetail] 序位信息:', {
      currentOrder: selectedApplication.currentOrder,
      queueNumber: selectedApplication.queueNumber,
      finalOrder: selectedApplication.currentOrder || selectedApplication.queueNumber,
      status: selectedApplication.status
    })

    loading.value = false
    return
  }

  // 如果 store 中沒有資料，則從 API 獲取
  const userID = authStore.user?.UserID
  if (!userID) {
    error.value = '請先登入'
    console.warn('[ApplicationProgressDetail] 未找到 authStore.user.UserID')
    return
  }

  loading.value = true
  error.value = null

  try {
    console.log('[ApplicationProgressDetail] store 中無資料，從 API 取得案件詳細，userID:', userID, 'caseNo:', effectiveCaseNo)

    // 從 /applications/{id} 或 /applications/user/{userID}/details 取得資料（後端可能回傳多筆或單筆）
    const res = await getCaseDetails(userID, effectiveCaseNo)
    console.log('[ApplicationProgressDetail] API 回應 (raw):', res)

    // helper: 將單筆或陣列的後端物件轉為統一格式
    const normalizeItem = (item) => {
      if (!item) return null
      return {
        caseNo: item.caseNo || item.applicationID || item.applicationId || item.id || item.applicationNo || item.caseId || item.applicationID || null,
        applyDate: item.applyDate || item.applicationDate || item.submittedAt || null,
        status: item.status || item.caseStatus || item.state || null,
        statusClass: item.statusClass || mapStatusToClass(item.status || item.caseStatus || item.state),
        details: item.details || item.description || item.reason || null,
        applicantName: item.applicantName || item.parentName || item.name || item.username || null,
        childName: item.childName || item.child || item.childname || null,
        childBirth: item.childBirth || item.childBirthDate || item.childDob || item.birthDate || null,
        targetInstitution: item.targetInstitution || item.institutionName || null,
        assignedInstitution: item.assignedInstitution || item.assigned || null,
        supplementItems: item.supplementItems || item.supplements || null,
        supplementDeadline: item.supplementDeadline || item.supplement_deadline || null,
        queueNumber: item.currentOrder || item.queueNumber || item.queueNo || null,
        admittedAt: item.admittedAt || item.assignedAt || null,
        // 新增的欄位
        applicationID: item.applicationID || item.applicationId || null,
        applicationDate: item.applicationDate || null,
        institutionID: item.institutionID || null,
        institutionName: item.institutionName || null,
        cancellationID: item.cancellationID || null,
        reason: item.reason || null,
        currentOrder: item.currentOrder || null,
        childNationalID: item.childNationalID || null
      }
    }

    // 情況 1: API 回傳陣列
    if (Array.isArray(res)) {
      console.log('[ApplicationProgressDetail] 回傳為陣列，共', res.length, '筆')
      if (effectiveCaseNo) {
        const found = res.find(i => {
          const raw = i.caseNo || i.applicationID || i.applicationId || i.id || i.applicationNo || i.caseId || i.applicationID
          return raw && String(raw) === String(effectiveCaseNo)
        })
        if (found) {
          application.value = normalizeItem(found)
        } else {
          error.value = '找不到此案件（API 回傳多筆，未找到對應案號）'
          console.warn('[ApplicationProgressDetail] 在陣列中找不到對應 caseNo:', effectiveCaseNo)
        }
      } else {
        // 沒有傳入 caseNo，取第一筆作為預設顯示（可視需求改為報錯）
        application.value = normalizeItem(res[0])
        console.warn('[ApplicationProgressDetail] 未提供 caseNo，使用第一筆資料顯示')
      }

    // 情況 2: API 回傳物件且可能含 content 或 data
    } else if (res && typeof res === 'object') {
      // 若回傳格式為 { content: [...] }
      if (Array.isArray(res.content)) {
        console.log('[ApplicationProgressDetail] 回傳 content 陣列，共', res.content.length, '筆')
        const arr = res.content
        if (effectiveCaseNo) {
          const found = arr.find(i => {
            const raw = i.caseNo || i.applicationID || i.applicationId || i.id || i.applicationNo || i.caseId || i.applicationID
            return raw && String(raw) === String(effectiveCaseNo)
          })
          if (found) {
            application.value = normalizeItem(found)
          } else {
            error.value = '找不到此案件（content 中未找到對應案號）'
            console.warn('[ApplicationProgressDetail] content 中找不到對應 caseNo:', effectiveCaseNo)
          }
        } else if (arr.length > 0) {
          application.value = normalizeItem(arr[0])
          console.warn('[ApplicationProgressDetail] 未提供 caseNo，使用 content 第一筆資料顯示')
        } else {
          error.value = '後端回傳空陣列'
        }

      // 若回傳已是單一案件物件
      } else {
        const normalized = normalizeItem(res)
        // 若 normalized.caseNo 與 effectiveCaseNo 不同，仍可顯示，但警告
        if (effectiveCaseNo && normalized.caseNo && String(normalized.caseNo) !== String(effectiveCaseNo)) {
          console.warn('[ApplicationProgressDetail] 回傳單筆案件的 caseNo 與 route caseNo 不同', normalized.caseNo, effectiveCaseNo)
        }
        application.value = normalized
      }

    } else {
      error.value = '後端回傳格式無法解析'
      console.warn('[ApplicationProgressDetail] 未知的 API 回傳格式', res)
    }

  } catch (err) {
    console.error('[ApplicationProgressDetail] 取得案件資料失敗:', err)
    application.value = null
    if (err?.response?.status === 404) {
      error.value = '找不到此案件（404），請確認案號是否正確'
    } else {
      error.value = err?.message || '載入資料時發生錯誤'
    }
  } finally {
    loading.value = false
  }
}

// 組件掛載時取得資料，允許從 route.query 或其他 param 名稱取得 caseNo
onMounted(() => {
  // 若 route.params.caseNo 未提供，嘗試從 query 或其他 param 拿到
  caseNo = caseNo || route.params.caseNo || route.query.caseNo || route.params.applicationId || route.params.id || null
  console.log('ApplicationProgressDetail mounted, resolved caseNo:', caseNo)
  console.log('AuthStore user:', authStore.user)
  fetchCaseDetails(caseNo)
})

// 監聽路由變化，當從子路由（如撤銷申請）返回時重新獲取資料
watch(() => route.name, (newName, oldName) => {
  console.log('[ApplicationProgressDetail] 路由變化:', oldName, '->', newName)

  // 當從撤銷申請頁面返回到詳情頁時
  if (oldName === 'ApplicationProgressRevoke' && newName === 'ApplicationProgressDetail') {
    console.log('[ApplicationProgressDetail] 從撤銷申請頁面返回，重新獲取資料')
    // 清除 store 中的選中申請，強制從 API 獲取最新資料
    applicationsStore.clearSelectedApplication()
    fetchCaseDetails(caseNo)
  }

  // 當從補件頁面返回時也重新獲取資料
  if (oldName === 'ApplicationProgressSupplement' && newName === 'ApplicationProgressDetail') {
    console.log('[ApplicationProgressDetail] 從補件頁面返回，重新獲取資料')
    applicationsStore.clearSelectedApplication()
    fetchCaseDetails(caseNo)
  }
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

// 將後端中文狀態映射到前端狀態類別
function mapStatusToClass(status) {
  if (!status) return 'processing'

  const statusMap = {
    '審核中': 'processing',
    '需要補件': 'supplement',
    '已退件': 'rejected',
    '候補中': 'waitingForAdmission',
    '錄取候補中': 'waitingForAdmission',
    '撤銷申請審核中': 'revokeProcessing',
    '撤銷申請通過': 'revoked',
    '已退托': 'withdrawn',
    '已錄取': 'admitted'
  }

  return statusMap[status] || 'processing'
}

const isProcessing = computed(() => {
  const s = application.value?.status
  return s === 'processing' || s === 'pending' || s === '審核中'
})
const isSupplement = computed(() => {
  const s = application.value?.status
  return s === 'supplement' || s === '需要補件'
})

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

.loading-card, .error-card, .empty-card, .detail-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(249,175,174,0.1); }
.loading-card, .error-card, .empty-card { text-align: center; }
.error-card { border-left: 4px solid #dc3545; }
.loading-card { border-left: 4px solid #F9AFAE; }

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
