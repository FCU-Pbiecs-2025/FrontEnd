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
              <span class="value">{{ applicationId }}</span>
            </div>
            <div class="info-row">
              <span class="label">申請人：</span>
              <span class="value">{{ applicantName }}</span>
            </div>
            <div class="info-row">
              <span class="label">幼兒姓名：</span>
              <span class="value">{{ childName }}</span>
            </div>
            <div class="info-row">
              <span class="label">目前序位：</span>
              <span class="value priority">第 {{ queueNumber }} 位</span>
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

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 支援嵌套路由下的 :caseNo，若無則退回 query.applicationId
const applicationId = ref(route.params.caseNo || route.query.applicationId || 'APP20240114001')
const applicantName = ref(authStore.user?.name || '王小明')
const childName = ref('王小寶')
const queueNumber = ref(15)

const revokeReason = ref('')
const agreeTerms = ref(false)

const canSubmit = computed(() => {
  // require revoke reason and agreement
  return revokeReason.value.trim() !== '' && agreeTerms.value
})

onMounted(() => {
  loadApplicationInfo()
})

const loadApplicationInfo = () => {
  // TODO: 根據 applicationId 從 API 載入申請資訊
}

const submitRevoke = () => {
  if (!canSubmit.value) {
    alert('請填寫完整資料並勾選同意事項')
    return
  }

  const revokeData = {
    applicationId: applicationId.value,
    revokeReason: revokeReason.value
  }

  // TODO: 呼叫 API 提交撤銷申請
  console.log('撤銷申請資料：', revokeData)
  alert('撤銷申請已送出，將於 3-5 個工作天完成審核')
  router.back()
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
