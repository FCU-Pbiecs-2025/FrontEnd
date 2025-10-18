<template>
  <div class="rejection-reason-page">
    <div class="page-header">
      <h1>退件說明</h1>
      <p class="page-description">您的申請未通過審核，請查看詳細原因</p>
    </div>

    <div class="content-area">
      <div class="rejection-section">
        <div class="rejection-card">
          <div class="rejection-icon">❌</div>
          <h2>申請未通過</h2>

          <div class="info-row">
            <span class="label">申請案號：</span>
            <span class="value">{{ applicationId }}</span>
          </div>

          <div class="info-row">
            <span class="label">審核日期：</span>
            <span class="value">{{ reviewDate }}</span>
          </div>

          <div class="reason-box">
            <h3>退件原因：</h3>
            <p>{{ rejectionReason }}</p>
          </div>

          <div class="suggestion-box">
            <h3>💡 建議事項：</h3>
            <ul>
              <li v-for="(suggestion, idx) in suggestions" :key="idx">{{ suggestion }}</li>
            </ul>
          </div>

          <div class="actions">
            <button class="service-btn" @click="goBack">返回會員中心</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const applicationId = ref(route.query.applicationId || 'APP20240114001')
const reviewDate = ref('2024-01-20')
const rejectionReason = ref('經審核後，申請人不符合公共托育資格條件。主要原因：家長雙方未同時就業，不符合雙薪家庭托育補助申請資格。')
const suggestions = ref([
  '請確認家長雙方均有工作證明文件',
  '如有特殊情況，可檢附相關證明文件重新申請',
  '建議參考「托育資格條件說明」，確認是否符合其他托育方案',
  '如有疑問，歡迎聯絡申請機構諮詢'
])

onMounted(() => {
  loadRejectionInfo()
})

const loadRejectionInfo = () => {
  // TODO: 根據 applicationId 從 API 載入退件資訊
}

const goBack = () => {
  router.push('/member-center')
}
</script>

<style scoped>
.rejection-reason-page {
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
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.rejection-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
}

.rejection-card {
  text-align: center;
}

.rejection-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.rejection-card h2 {
  color: #dc3545;
  font-size: 2rem;
  margin-bottom: 32px;
}

.info-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 1rem;
}

.info-row .label {
  font-weight: 600;
  color: #555;
}

.info-row .value {
  color: #333;
}

.reason-box {
  background: #f8d7da;
  border-left: 4px solid #dc3545;
  border-radius: 8px;
  padding: 20px;
  margin: 32px 0;
  text-align: left;
}

.reason-box h3 {
  color: #721c24;
  margin-bottom: 12px;
}

.reason-box p {
  color: #721c24;
  line-height: 1.6;
  margin: 0;
}

.suggestion-box {
  background: #d1ecf1;
  border-left: 4px solid #17a2b8;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 32px;
  text-align: left;
}

.suggestion-box h3 {
  color: #0c5460;
  margin-bottom: 12px;
}

.suggestion-box ul {
  margin: 0;
  padding-left: 24px;
}

.suggestion-box li {
  color: #0c5460;
  line-height: 1.8;
  margin-bottom: 8px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.service-btn {
  background: #F9AFAE;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 1rem;
}

.service-btn:hover {
  background: #f5a1a1;
}
</style>
