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
              <label>上傳文件（最多 4 件）：</label>
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
            <button class="save-btn" :disabled="uploading" @click="submitSupplement">{{ uploading ? '上傳中...' : '提交補件' }}</button>
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
import http from '@/api/http.js'

const router = useRouter()
const route = useRoute()
const applicationsStore = useApplicationsStore()

// Derive applicationId from store or route/query
const applicationId = computed(() => {
  return (
    applicationsStore.selectedApplication?.applicationID || // 修正：applicationID
    applicationsStore.selectedApplication?.applicationId ||
    applicationsStore.selectedApplication?.id ||
    route.params.applicationID ||
    route.params.applicationId ||
    route.params.id ||
    route.query.applicationID ||
    route.query.applicationId ||
    ''
  )
})

// 審核意見：優先取用 PINIA 選中申請的 reason，若無則嘗試從路由 query 帶入，最後為空字串
const reviewComment = computed(() => {
  return applicationsStore.selectedApplication?.reason || route.query.reason || ''
})

const uploadedFiles = ref([])
const uploading = ref(false)

onMounted(() => {
  // 如需額外載入可以在此補充，但目前以 PINIA 為主
})

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files || [])
  if (!files || files.length === 0) return

  // 驗證目前總數不超過 4
  const maxFiles = 4
  const available = maxFiles - uploadedFiles.value.length
  if (available <= 0) {
    alert(`最多只能上傳 ${maxFiles} 個檔案`)
    return
  }

  // 若一次選太多，截斷到可用數量
  const toAdd = files.slice(0, available)

  // 可選：檔案大小與類型驗證（簡單實作，與專案中其他上傳邏輯一致）
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']

  for (const f of toAdd) {
    if (f.size > maxSize) {
      alert(`檔案 ${f.name} 大小超過 10MB，已略過`)
      continue
    }
    if (allowedTypes.length > 0 && !allowedTypes.includes(f.type)) {
      alert(`檔案 ${f.name} 格式不支援，已略過`)
      continue
    }
    uploadedFiles.value.push(f)
  }

  // 清除 input 值以便重複選取相同檔案
  if (event.target) event.target.value = ''
}

const removeFile = (idx) => {
  uploadedFiles.value.splice(idx, 1)
}

// Helper: map uploadedFiles to backend keys file, file1, file2, file3
const buildFilesPayload = (files) => {
  const keys = ['file', 'file1', 'file2', 'file3']
  const payload = {}
  for (let i = 0; i < Math.min(files.length, keys.length); i++) {
    payload[keys[i]] = files[i]
  }
  return payload
}

const submitSupplement = async () => {
  if (uploadedFiles.value.length === 0) {
    alert('請至少上傳一個文件')
    return
  }

  const appId = applicationId.value
  if (!appId) {
    alert('找不到對應的申請資料，請返回申請頁面後再試')
    return
  }

  uploading.value = true
  try {
    // ✅ 直接呼叫後端 ApplicationsController.update()：PUT /api/applications/{id}
    // 後端接收 multipart/form-data 的 file/file1/file2/file3，並會把檔案存到 IdentityResource/{applicationId}/
    const fd = new FormData()
    const filesPayload = buildFilesPayload(uploadedFiles.value)
    Object.keys(filesPayload).forEach((k) => {
      fd.append(k, filesPayload[k], filesPayload[k].name)
    })

    // 保留（有些後端會用得到）；即使不需要也不會影響
    fd.append('applicationId', String(appId))

    // ✅ 改成 update endpoint（不要再打 /attachments）
    const updateRes = await http.put(`/applications/${encodeURIComponent(appId)}`, fd)

    // 後端 update 會回傳更新後的 application（含 AttachmentPath*）
    const data = updateRes?.data || {}

    alert('補件已提交，等待審核')

    // 1) 補件成功後，將該幼兒案件狀態設為「審核中」
    let childNationalID = applicationsStore.selectedApplication?.childNationalID
    if (!childNationalID && applicationsStore.selectedApplication?.children && applicationsStore.selectedApplication.children.length > 0) {
      childNationalID = applicationsStore.selectedApplication.children[0].nationalID
    }
    if (appId && childNationalID) {
      try {
        await http.put(`/applications/${encodeURIComponent(appId)}/case`, { children: [] }, {
          params: { NationalID: childNationalID, status: '審核中' }
        })
      } catch (e) {
        console.warn('補件後自動設審核中失敗', e)
      }
    }

    // 2) 回到申請進度查詢刷新
    router.push({ name: 'ApplicationStatus', query: { refresh: Date.now() } })

    // 3) 更新 store（可選）
    try {
      applicationsStore.selectedApplication = { ...applicationsStore.selectedApplication, ...(data || {}) }
    } catch (e) {}
  } catch (error) {
    console.error('補件上傳失敗:', error)
    const msg = error?.response?.data?.message || error?.message || '上傳失敗，請稍後重試'
    alert(msg)
  } finally {
    uploading.value = false
  }
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
