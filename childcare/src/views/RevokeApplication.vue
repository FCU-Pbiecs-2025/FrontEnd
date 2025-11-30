<template>
  <div class="revoke-application-page">
    <div class="page-header">
      <h1>撤銷申請</h1>
      <p class="page-description">填寫撤銷申請單，放棄此次托育申請</p>
    </div>

    <div class="content-area">
      <div class="revoke-section">
        <div class="warning-card">
          <h3>⚠️ 重要提醒</h3>
          <ul>
            <li>撤銷申請後，您的申請將被取消，無法復原</li>
            <li>如需重新申請，須重新排序</li>
            <li>撤銷申請需經審核，審核期間約 3-5 個工作天</li>
          </ul>
        </div>

        <div class="form-section">
          <h2>撤銷申請資訊</h2>

          <div class="info-card">
            <div class="info-row">
              <span class="label">申請案號：</span>
              <span class="value">{{ applicationId || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="label">申請人：</span>
              <span class="value">{{ applicantName || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="label">幼兒姓名：</span>
              <span class="value">{{ childName || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="label">目前序位：</span>
              <span class="value priority">第 {{ queueNumber ?? '—' }} 位</span>
            </div>
          </div>

          <div class="form-grid">
            <!-- Only keep a single textarea for revoke reason -->
            <div class="form-group">
              <label>撤銷原因：<span class="required">*</span></label>
              <textarea v-model="revokeReason" placeholder="請詳細說明撤銷原因" rows="5"></textarea>
            </div>
          </div>

          <div class="agreement-box">
            <label class="checkbox-label">
              <input type="checkbox" v-model="agreeTerms" />
              <span>我已了解撤銷申請的相關規定，並確認要撤銷此次申請</span>
            </label>
          </div>

          <div class="form-actions">
            <button class="save-btn" @click="submitRevoke" :disabled="!canSubmit">確認撤銷</button>
            <button class="cancel-btn" @click="goBack">返回</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/auth.js'
import { useApplicationsStore } from '@/store/applications.js'
import { getCaseDetails } from '@/api/application.js'
import { createRevoke } from '@/api/revokes.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const applicationsStore = useApplicationsStore()

// 取得路由中的 caseNo / applicationId
const routeCaseNo = route.params.caseNo || route.query.applicationId || null

// 反應式：提交狀態
const submitting = ref(false)
const loadError = ref(null)

// 從 store 取得選中申請
const selected = computed(() => applicationsStore.selectedApplication)

// 計算顯示欄位（優先使用 selected，其次嘗試在 store.applications 中搜尋，最後為 null）
const applicationRecord = computed(() => {
  if (selected.value) return selected.value
  // 在 store 中搜尋
  const found = applicationsStore.applications.find(a => {
    return [a.caseNo, a.applicationID, a.applicationId].filter(Boolean).some(id => String(id) === String(routeCaseNo))
  })
  return found || null
})

const applicationId = computed(() => applicationRecord.value?.applicationID || applicationRecord.value?.caseNo)
const applicantName = computed(() => applicationRecord.value?.username)
const childName = computed(() => applicationRecord.value?.childname)
const queueNumber = computed(() => applicationRecord.value?.currentOrder ?? applicationRecord.value?.queueNumber)
const childNationalID = computed(() => applicationRecord.value?.childNationalID)

// 撤銷原因、同意條款
const revokeReason = ref('')
const agreeTerms = ref(false)

// 是否可提交
const canSubmit = computed(() => {
  return !submitting.value && revokeReason.value.trim() !== '' && agreeTerms.value && !!applicationId.value
})

// 載入申請資訊（若 store 中沒有）
const loadApplicationInfo = async () => {
  try {
    loadError.value = null
    if (applicationRecord.value) {
      // 已有資料，若尚未設定 selected，將其塞入 selected 以便後續操作
      if (!selected.value) applicationsStore.setSelectedApplication(applicationRecord.value)
      return
    }
    // 無資料 -> 呼叫後端補抓 (需要 userID 與 caseNo)
    const userID = authStore.user?.UserID
    if (!userID || !routeCaseNo) {
      loadError.value = '無法載入申請資料（缺少使用者或案件識別）'
      return
    }
    const res = await getCaseDetails(userID, routeCaseNo)
    // 正規化：沿用 ApplicationProgressDetail.vue 的 normalize 方式簡化
    const norm = Array.isArray(res) ? res[0] : (res?.content && Array.isArray(res.content) ? res.content[0] : res)
    if (norm) {
      const mapped = {
        caseNo: norm.caseNo || norm.applicationID || norm.applicationId || routeCaseNo,
        applicationID: norm.applicationID || norm.applicationId || norm.caseNo || null,
        applicationDate: norm.applicationDate || norm.applyDate,
        applyDate: norm.applicationDate || norm.applyDate,
        institutionID: norm.institutionID,
        institutionName: norm.institutionName,
        childname: norm.childname || norm.childName,
        birthDate: norm.birthDate || norm.childBirth,
        status: norm.status,
        statusClass: norm.statusClass,
        reason: norm.reason,
        currentOrder: norm.currentOrder || norm.queueNumber,
        queueNumber: norm.currentOrder || norm.queueNumber,
        childNationalID: norm.childNationalID || norm.nationalID,
        username: norm.username || norm.applicantName
      }
      applicationsStore.setSelectedApplication(mapped)
    } else {
      loadError.value = '後端未回傳有效的申請資料'
    }
  } catch (e) {
    console.error('[RevokeApplication] 載入資料失敗', e)
    loadError.value = e.message || '載入申請資料失敗'
  }
}

onMounted(() => {
  loadApplicationInfo()
})

// 提交撤銷
const submitRevoke = async () => {
  if (!canSubmit.value) {
    alert('請填寫完整資料並勾選同意事項')
    return
  }
  if (!applicationId.value) {
    alert('無法取得申請案號，無法提交撤銷')
    return
  }
  submitting.value = true
  try {
    // 呼叫後端建立 cancellation 紀錄
    const resp = await createRevoke({
      applicationID: applicationId.value,
      nationalID: childNationalID.value,
      abandonReason: revokeReason.value
    })
    console.log('[RevokeApplication] createRevoke response:', resp)
    // 以前會更新 store 中的 selected 與 applications list；改為直接回到申請進度查詢，由該頁面重新從後端拉資料
    alert('撤銷申請已送出，審核約 3-5 個工作天')
    // 跳回申請進度查詢並強制刷新列表
    await router.push({ name: 'ApplicationStatus', query: { refresh: Date.now() } })
  } catch (e) {
    console.error('[RevokeApplication] 撤銷提交失敗', e)
    alert(e.message || '撤銷申請提交失敗，請稍後再試')
  } finally {
    submitting.value = false
  }
}

const goBack = () => router.back()
</script>

<style scoped>
.revoke-application-page {
  min-height: calc(100vh - 160px);
  padding: 40px 0;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  color: #333;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 16px;
}

.page-description {
  color: #666;
  font-size: 1.1rem;
}

.content-area {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.revoke-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
}

.warning-card {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 32px;
}

.warning-card h3 {
  color: #856404;
  margin-bottom: 12px;
}

.warning-card ul {
  margin: 0;
  padding-left: 24px;
}

.warning-card li {
  color: #856404;
  line-height: 1.8;
  margin-bottom: 8px;
}

.form-section h2 {
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 24px;
  border-bottom: 3px solid #F9AFAE;
  padding-bottom: 8px;
}

.info-card {
  background: #FFF8F6;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 32px;
}

.info-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 1rem;
}

.info-row .label {
  font-weight: 600;
  color: #555;
  min-width: 100px;
}

.info-row .value {
  color: #333;
}

.info-row .priority {
  color: #dc3545;
  font-weight: bold;
  font-size: 1.1rem;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #555;
  font-size: 1rem;
}

.required {
  color: #dc3545;
  margin-left: 4px;
}

.form-group select,
.form-group textarea,
.form-group input {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group select:focus,
.form-group textarea:focus,
.form-group input:focus {
  outline: none;
  border-color: #F9AFAE;
}

.agreement-box {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.checkbox-label span {
  color: #333;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.save-btn, .cancel-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.save-btn {
  background: #F9AFAE;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #f5a1a1;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background: transparent;
  color: #F9AFAE;
  border: 2px solid #F9AFAE;
}

.cancel-btn:hover {
  background: #F9AFAE;
  color: white;
}
</style>
