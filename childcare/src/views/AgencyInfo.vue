<template>
  <div class="agency-info-page">
    <div class="info-card">
      <div class="info-header">
        <img src="https://img.icons8.com/fluency/48/000000/school-building.png" class="info-icon" alt="機構圖示" />
        <span class="info-title">托育機構介紹</span>
      </div>

      <!-- 加載狀態 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在載入機構資訊...</p>
      </div>

      <!-- 錯誤狀態 -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="fetchAgencyData" class="retry-btn">重新載入</button>
      </div>

      <!-- 機構資訊內容 -->
      <div v-else class="agency-card">
        <div class="agency-name-label">" {{ agency.institutionName }} "</div>
        <div class="agency-carousel" v-if="agency.imagePath">
          <div class="carousel-img-box">
            <img :src="agency.imagePath" alt="機構照片" class="carousel-img" />
          </div>
        </div>

        <div class="agency-info-table">
          <div class="info-row" v-if="agency.contactPerson"><span>聯絡人：</span><span>{{ agency.contactPerson }}</span></div>
          <div class="info-row" v-if="agency.responsiblePerson"><span>負責人：</span><span>{{ agency.responsiblePerson }}</span></div>
          <div class="info-row" v-if="agency.address"><span>機構地址：</span><span>{{ agency.address }}</span></div>
          <div class="info-row" v-if="agency.phoneNumber"><span>電話：</span><span>{{ agency.phoneNumber }}</span></div>
          <div class="info-row" v-if="agency.fax"><span>傳真：</span><span>{{ agency.fax }}</span></div>
          <div class="info-row" v-if="agency.email"><span>電子信箱：</span><span>{{ agency.email }}</span></div>
          <div class="info-row" v-if="agency.relatedLinks"><span>相關連結：</span><span><a :href="agency.relatedLinks" target="_blank" style="color: #2a4fa7; text-decoration: underline;">{{ agency.relatedLinks }}</a></span></div>
          <div class="info-row" v-if="agency.description"><span>機構說明：</span><span>{{ agency.description }}</span></div>
        </div>

        <div class="class-section" v-if="classList && classList.length > 0">
          <div class="class-title">班級資訊</div>
          <table class="class-table">
            <thead>
            <tr><th>班級名稱</th><th>收托人數</th><th>就讀中人數</th><th>收托年齡</th><th>其他資訊</th></tr>
            </thead>
            <tbody>
            <tr v-for="cls in classList" :key="cls.classID">
              <td>{{ cls.className }}</td>
              <td>{{ cls.capacity }}</td>
              <td>{{ cls.currentStudents }}</td>
              <td>{{ cls.minAgeDescription }} - {{ cls.maxAgeDescription }}</td>
              <td>{{ cls.additionalInfo }}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- 新增：底部返回列表按鈕 -->
        <div class="actions">
          <button class="back-to-list" @click="goBack">返回機構列表</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAgencyById } from '@/api/agencies.js'
import { getClassByInstitutionId } from '@/api/class.js'

const router = useRouter()
const route = useRoute()

const agency = ref({
  institutionName: '',
  imagePath: '',
  contactPerson: '',
  address: '',
  phoneNumber: '',
  fax: '',
  email: '',
  relatedLinks: '',
  description: '',
  responsiblePerson: '',
  classes: []
})
const classList = ref([]) // 新增：班級列表
const loading = ref(true)
const error = ref(null)

// 獲取機構詳細資訊
const fetchAgencyData = async () => {
  try {
    loading.value = true
    error.value = null
    const agencyId = route.params.id

    if (!agencyId) {
      throw new Error('機構ID不存在')
    }

    // 將UUID轉換為大寫格式以匹配後端API
    const upperCaseId = agencyId.toUpperCase()
    const response = await getAgencyById(upperCaseId)
    agency.value = response.data

  } catch (err) {
    error.value = err.message || '獲取機構資訊失敗'
    console.error('獲取機構資訊失敗:', err)
  } finally {
    loading.value = false
  }
}

// 獲取班級資料
const fetchData = async () => {
  try {
    const agencyId = route.params.id
    if (!agencyId) {
      throw new Error('機構ID不存在')
    }
    const upperCaseId = agencyId.toUpperCase()
    const classRes = await getClassByInstitutionId(upperCaseId)
    if (classRes.data && Array.isArray(classRes.data)) {
      classList.value = classRes.data.map(cls => ({
        classID: cls.classID || '',
        className: cls.className || '',
        capacity: cls.capacity || 0,
        currentStudents: cls.currentStudents || 0,
        minAgeDescription: cls.minAgeDescription || '',
        maxAgeDescription: cls.maxAgeDescription || '',
        additionalInfo: cls.additionalInfo || '',
        institutionID: cls.institutionID || ''
      }))
    } else {
      classList.value = []
    }
  } catch (err) {
    error.value = err.message || '獲取班級資訊失敗'
    console.error('獲取班級資訊失敗:', err)
  }
}

onMounted(() => {
  fetchAgencyData()
  fetchData()
})


function goBack() {
  // 返回已註冊的列表頁（AgencySearch）
  router.push({ name: 'AgencySearch' })
}
</script>

<style scoped>

.info-card {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 18px 40px 18px;
}

/* 加載狀態樣式 */
.loading-state {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(249, 175, 174, 0.10);
  padding: 60px 20px;
  text-align: center;
  border: 1px solid #f3e6e6;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3e6e6;
  border-top: 4px solid #f9afae;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

/* 錯誤狀態樣式 */
.error-state {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(249, 175, 174, 0.10);
  padding: 40px 20px;
  text-align: center;
  border: 1px solid #f3e6e6;
}

.error-state p {
  color: #e74c3c;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.retry-btn {
  background: linear-gradient(135deg, #F9AFAE, #f5a1a1);
  color: #fff;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(249, 175, 174, 0.2);
  transition: all 0.25s ease;
}

.retry-btn:hover {
  background: linear-gradient(135deg, #f5a1a1, #f19594);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(249, 175, 174, 0.28);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.info-icon {
  width: 38px;
  height: 38px;
}
.info-title {
  color: #2a4fa7;
  font-size: 1.4rem;
  font-weight: bold;
  letter-spacing: 2px;
}
.agency-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(249, 175, 174, 0.10);
  padding: 32px 18px 24px 18px;
  border: 1px solid #f3e6e6;
  margin-top: 8px;
}
.agency-name-label {
  display: block;
  background: #f9afae;
  color: #333;
  font-size: 1.3rem;
  font-weight: bold;
  border-radius: 18px;
  text-align: center;
  padding: 10px 0;
  margin: 0 auto 24px auto;
  max-width: 340px;
  letter-spacing: 2px;
  box-shadow: 0 2px 8px #f8b6b633;
}
.agency-carousel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-bottom: 24px;
}
.carousel-img-box {
  width: 320px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(249, 175, 174, 0.10);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.agency-info-table {
  margin: 24px 0 0 0;
  padding: 0 8px;
}
.info-row {
  display: flex;
  gap: 12px;
  font-size: 1.08rem;
  color: #333;
  margin-bottom: 8px;
  border-bottom: 1px dashed #f3e6e6;
  padding-bottom: 6px;
}
.info-row span:first-child {
  min-width: 100px;
  color: #888;
}
.class-section {
  margin-top: 32px;
}
.class-title {
  font-size: 1.15rem;
  font-weight: bold;
  color: #2a4fa7;
  margin-bottom: 12px;
  letter-spacing: 1px;
}
.class-table {
  width: 100%;
  border-collapse: collapse;
  background: #f9f9fc;
  border-radius: 8px;
  overflow: hidden;
}
.class-table th, .class-table td {
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}
.class-table th {
  background: #e3eaff;
  color: #2a4fa7;
  font-weight: bold;
}
.class-table tr:last-child td {
  border-bottom: none;
}

/* 底部返回按鈕樣式（與站內主要按鈕風格一致） */
.actions { text-align: center; margin-top: 24px; }
.back-to-list {
  display: inline-block;
  background: linear-gradient(135deg, #F9AFAE, #f5a1a1);
  color: #fff;
  padding: 12px 32px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(249, 175, 174, 0.2);
  transition: all 0.25s ease;
}
.back-to-list:hover {
  background: linear-gradient(135deg, #f5a1a1, #f19594);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(249, 175, 174, 0.28);
}
@media (max-width: 600px) {
  .info-card, .agency-card {
    padding: 10px 2vw;
  }
  .carousel-img-box {
    width: 98vw;
    height: 140px;
  }
  .agency-name-label {
    font-size: 1.05rem;
    padding: 7px 0;
  }
  .class-table th, .class-table td {
    padding: 7px 2px;
    font-size: 0.98rem;
  }
}
</style>