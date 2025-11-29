<template>
  <div class="supplement-document-page">
    <div class="page-header">
      <h1>補件申請</h1>
      <p class="page-description">請依照審核意見補充相關文件資料</p>
    </div>

    <div class="content-area">
      <div class="supplement-section">
        <div class="notice-card">
          <h3>📋 審核意見</h3>
          <p class="review-comment">{{ reviewComment }}</p>
        </div>

        <div class="form-section">
          <h2>補充資料</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>上傳文件：</label>
              <input type="file" @change="handleFileUpload" multiple accept=".pdf,.jpg,.jpeg,.png" />
              <div v-if="uploadedFiles.length > 0" class="file-list">
                <div v-for="(file, idx) in uploadedFiles" :key="idx" class="file-item">
                  <span>📎 {{ file.name }}</span>
                  <button class="remove-file-btn" @click="removeFile(idx)">✕</button>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="save-btn" @click="submitSupplement">提交補件</button>
            <button class="cancel-btn" @click="goBack">返回</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useApplicationsStore } from '@/store/applications.js'

const router = useRouter()
const route = useRoute()
const applicationsStore = useApplicationsStore()

// 審核意見：優先取用 PINIA 選中申請的 reason，若無則嘗試從路由 query 帶入，最後為空字串
const reviewComment = computed(() => {
  return applicationsStore.selectedApplication?.reason || route.query.reason || ''
})

const uploadedFiles = ref([])

onMounted(() => {
  // 如需額外載入可以在此補充，但目前以 PINIA 為主
})

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  uploadedFiles.value.push(...files)
}

const removeFile = (idx) => {
  uploadedFiles.value.splice(idx, 1)
}

const submitSupplement = () => {
  if (uploadedFiles.value.length === 0) {
    alert('請至少上傳一個文件')
    return
  }

  // TODO: 呼叫 API 提交補件資料（可透過 applicationsStore.selectedApplication 取得對應的 application 資訊）
  alert('補件已提交，等待審核')
  router.back()
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.supplement-document-page {
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

.supplement-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
}

.notice-card {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 32px;
}

.notice-card h3 {
  color: #856404;
  margin-bottom: 12px;
}

.review-comment {
  color: #856404;
  line-height: 1.6;
  margin: 0;
}

.form-section h2 {
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 24px;
  border-bottom: 3px solid #F9AFAE;
  padding-bottom: 8px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
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

.form-group input {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #F9AFAE;
}

.file-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFF8F6;
  padding: 10px 16px;
  border-radius: 6px;
}

.remove-file-btn {
  background: #dc3545;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s;
}

.remove-file-btn:hover {
  background: #c82333;
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

.save-btn:hover {
  background: #f5a1a1;
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
