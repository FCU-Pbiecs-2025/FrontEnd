<template>
  <div class="announcement-page">
    <div class="announcement-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/delete-sign.png" class="icon" alt="icon" />
        <span class="main-title">撤銷審核 - {{ revokeId }}</span>
      </div>

      <div class="detail-card">
        <h3>申請詳情</h3>
        <div class="detail-info">
          <div class="info-row">
            <label class="info-label">撤銷編號：</label>
            <span class="info-value">{{ revokeData.id }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">申請日期：</label>
            <span class="info-value">{{ revokeData.Date }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">申請人：</label>
            <span class="info-value">{{ revokeData.applicant }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">機構：</label>
            <span class="info-value">{{ revokeData.institution }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">撤銷原因：</label>
            <span class="info-value">{{ revokeData.reason }}</span>
          </div>
        </div>
      </div>

      <div class="revoke-card">
        <h3>撤銷確認</h3>
        <div class="revoke-form">
          <div class="form-row">
            <label class="form-label">確認日期：</label>
            <input type="date" v-model="revokeDate" class="form-input" />
          </div>
          <div class="form-row">
            <label class="form-label">立案資料：</label>
            <textarea v-model="revokeNote" class="form-input" rows="5" placeholder="請輸入撤銷備註..."></textarea>
          </div>
          <div class="form-row">
            <label class="form-label">撤銷類型：</label>
            <select v-model="revokeType" class="form-input">
              <option value="qualification">資格不符</option>
              <option value="document">文件不全</option>
              <option value="other">其他原因</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bottom-row">
        <button class="btn danger" @click="confirmRevoke">確認撤銷</button>
        <button class="btn query" @click="goBack">返回列表</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const revokeId = ref(route.params.id)
const revokeData = ref({})
const revokeDate = ref(new Date().toISOString().slice(0, 10))
const revokeNote = ref('')
const revokeType = ref('')

// 模擬資料 - 實際應用中這裡會從 API 獲取資料
const mockData = {
  'R2001': { id: 'R2001', Date: '2025/01/01', applicant: '張麗麗', institution: '快樂托育', reason: '資格不符', type: 'qualification' },
  'R2002': { id: 'R2002', Date: '2025/01/01', applicant: '王小明', institution: '幸福幼兒園', reason: '文件不全', type: 'document' },
  'R2003': { id: 'R2003', Date: '2025/01/01', applicant: '李小華', institution: '陽光托育所', reason: '其他原因', type: 'other' },
  'R2004': { id: 'R2004', Date: '2025/01/01', applicant: '陳大同', institution: '愛心幼兒園', reason: '資格不符', type: 'qualification' }
}

onMounted(() => {
  // 載入撤銷資料
  if (mockData[revokeId.value]) {
    revokeData.value = { ...mockData[revokeId.value] }
    revokeType.value = revokeData.value.type
    // 如果已有撤銷記錄，載入之前的撤銷資料
    if (revokeData.value.revokeDate) {
      revokeDate.value = revokeData.value.revokeDate
    }
    if (revokeData.value.revokeNote) {
      revokeNote.value = revokeData.value.revokeNote
    }
  } else {
    // 如果找不到資料，返回列表頁
    router.push('/admin/application-revoke')
  }
})

function confirmRevoke() {
  if (!revokeNote.value.trim()) {
    alert('請輸入立案資料')
    return
  }

  // 這裡應該發送 API 請求保存撤銷結果
  console.log('撤銷資料:', {
    revokeId: revokeId.value,
    revokeDate: revokeDate.value,
    revokeNote: revokeNote.value,
    revokeType: revokeType.value
  })

  alert('撤銷完成！')
  goBack()
}

function goBack() {
  router.push('/admin/application-revoke')
}
</script>

<style scoped>
.announcement-page {
  display: flex;
  justify-content: center;
}

.announcement-card {
  max-width: 820px;
  min-width: 85%;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  margin-top: 60px;
}

.icon {
  width: 32px;
  height: 32px;
}

.main-title {
  font-size: 1.35rem;
  color: #2e6fb7;
  font-weight: 700;
}

.detail-card, .revoke-card {
  background: #fff;
  border: 1px solid #e6e6ea;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(16, 24, 40, 0.04);
}

.detail-card h3, .revoke-card h3 {
  color: #2e6fb7;
  font-size: 1.2rem;
  margin-bottom: 20px;
  border-bottom: 2px solid #e6f2ff;
  padding-bottom: 10px;
}

.detail-info {
  display: grid;
  gap: 16px;
}

.info-row {
  display: flex;
  align-items: center;
}

.info-label {
  width: 120px;
  font-weight: 600;
  color: #2e6fb7;
}

.info-value {
  color: #334e5c;
  font-weight: 500;
}

.revoke-form {
  display: grid;
  gap: 20px;
}

.form-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.form-label {
  width: 120px;
  font-weight: 600;
  color: #2e6fb7;
  margin-top: 8px;
}

.form-input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #d8dbe0;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2e6fb7;
  box-shadow: 0 0 0 2px rgba(46, 111, 183, 0.1);
}

.form-input[type="date"] {
  width: 200px;
}

select.form-input {
  width: 200px;
}

textarea.form-input {
  resize: vertical;
  min-height: 120px;
}

.bottom-row {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn.danger {
  background: linear-gradient(90deg, #ef4444, #dc2626);
  color: #fff;
}

.btn.danger:hover {
  background: linear-gradient(90deg, #dc2626, #b91c1c);
}

.btn.query {
  background: #e6f2ff;
  color: #2e6fb7;
  border: 1px solid #b3d4fc;
}

.btn.query:hover {
  background: #d1e7ff;
}

@media (max-width: 900px) {
  .announcement-card {
    width: 100%;
    padding: 16px;
  }

  .detail-card, .revoke-card {
    padding: 16px;
  }

  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .form-label {
    width: auto;
    margin-top: 0;
    margin-bottom: 8px;
  }

  .form-input[type="date"], select.form-input {
    width: 100%;
  }
}
</style>
