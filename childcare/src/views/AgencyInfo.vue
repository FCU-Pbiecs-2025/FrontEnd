<template>
  <div class="agency-info-page">
    <div class="page-wrapper">
      <div class="content-area">
        <!-- 標題區塊（用統一後的 displayName） -->

        <div>
          <div class="list-title">{{ uiAgency.displayName }}</div>
          <div class="title-decoration"></div>
        </div>
        <!-- 主內容卡片：新樣式 + 舊功能 -->
          <!-- 載入中 -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>正在載入機構資訊...</p>
          </div>

          <!-- 錯誤 -->
          <div v-else-if="error" class="error-state">
            <p>{{ error }}</p>
            <button @click="reload" class="retry-btn">重新載入</button>
          </div>

          <!-- 內容 -->
          <div v-else class="agency-card">
            <!-- 顯示名稱膠囊 -->

            <!-- 機構圖片 -->
            <div class="agency-image-container" v-if="images.length">
              <div class="image-box">
                <img :src="images[0]" alt="機構環境照片" class="agency-image" />
              </div>
            </div>

            <!-- 機構資訊（統一欄位） -->
            <div class="agency-info-table">
              <div class="info-row" v-if="uiAgency.contactPerson"><span>聯絡人：</span><span>{{ uiAgency.contactPerson }}</span></div>
              <div class="info-row" v-if="uiAgency.responsiblePerson"><span>負責人：</span><span>{{ uiAgency.responsiblePerson }}</span></div>
              <div class="info-row" v-if="uiAgency.address"><span>機構地址：</span><span>{{ uiAgency.address }}</span></div>
              <div class="info-row" v-if="uiAgency.phoneNumber"><span>電話：</span><span>{{ uiAgency.phoneNumber }}</span></div>
              <div class="info-row" v-if="uiAgency.fax"><span>傳真：</span><span>{{ uiAgency.fax }}</span></div>
              <div class="info-row" v-if="uiAgency.email"><span>電子信箱：</span><span>{{ uiAgency.email }}</span></div>
              <div class="info-row" v-if="uiAgency.relatedLinks">
                <span>相關連結：</span>
                <span>
                  <a :href="ensureHttp(uiAgency.relatedLinks)" target="_blank" style="color: #2a4fa7; text-decoration: underline;">
                    {{ uiAgency.relatedLinks }}
                  </a>
                </span>
              </div>
              <div class="info-row" v-if="uiAgency.description"><span>機構說明：</span><span>{{ uiAgency.description }}</span></div>
            </div>

            <!-- 班級資訊（新後端資料） -->
            <div class="class-section" v-if="classList && classList.length">
              <table class="class-table">
                <thead>
                <tr>
                  <th>班級名稱</th>
                  <th>收托人數</th>
                  <th>就讀中人數</th>
                  <th>收托年齡</th>
                  <th>其他資訊</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="cls in classList" :key="cls.classID">
                  <td>{{ cls.className }}</td>
                  <td>{{ cls.capacity }}</td>
                  <td>{{ cls.currentStudents }}</td>
                  <td>{{ formatAgeRange(cls.minAgeDescription, cls.maxAgeDescription) }}</td>
                  <td>{{ cls.additionalInfo }}</td>
                </tr>
                </tbody>
              </table>
            </div>


            <!-- 底部返回按鈕 -->
            <div class="actions">
              <button class="back-to-list" @click="goBack">返回</button>
            </div>
          </div> <!-- /agency-card -->

      </div> <!-- /content-area -->
    </div> <!-- /page-wrapper -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAgencyById } from '@/api/agencies.js'
import { getClassByInstitutionId } from '@/api/class.js'

const router = useRouter()
const route = useRoute()

// 原始 API 回傳
const agencyRaw = ref({})
const classList = ref([])
const loading = ref(true)
const error = ref(null)

// 格式化年齡範圍顯示 (資料庫存的是月份)
const formatAgeRange = (ageFromMonths, ageToMonths) => {
  const fromMonths = Number(ageFromMonths) || 0
  const toMonths = Number(ageToMonths) || 0

  const formatAge = (months) => {
    if (months < 12) return `${months}個月`

    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) return `${years}歲`
    return `${years}歲${remainingMonths}個月`
  }

  if (fromMonths === toMonths) {
    return formatAge(fromMonths)
  } else {
    return `${formatAge(fromMonths)} - ${formatAge(toMonths)}`
  }
}

// 圖片路徑處理函數 - 將 API 返回的路徑轉換為可訪問的 HTTP URL
function getImageUrl(imagePath) {
  if (!imagePath) return ''

  // 如果已經是完整的 HTTP URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('[AgencyInfo] 已是完整 URL:', imagePath)
    return imagePath
  }

  // 路徑映射：
  // API 返回: /InstitutionResource/filename 或其他路徑
  // 提取文件名: filename
  // 前端訪問 URL: http://localhost:8080/institution-files/filename
  const backendBaseUrl = 'http://localhost:8080/institution-files'

  // 提取文件名（移除路徑前綴）
  const fileName = imagePath.replace(/.*\//, '')
  const fullUrl = `${backendBaseUrl}/${fileName}`

  console.log('[AgencyInfo] imagePath 來源:', imagePath)
  console.log('[AgencyInfo] 提取的文件名:', fileName)
  console.log('[AgencyInfo] 後端基礎 URL:', backendBaseUrl)
  console.log('[AgencyInfo] 完整 URL:', fullUrl)
  console.log('========== getImageUrl 計算完成 ==========')

  return fullUrl
}

// 圖片
const images = computed(() => {
  // 兼容：imagePath（單張字串）或 images（陣列）
  const fromArray = (agencyRaw.value?.images && Array.isArray(agencyRaw.value.images))
      ? agencyRaw.value.images.map(img => getImageUrl(img)).filter(Boolean)
      : []
  const fromSingle = agencyRaw.value?.imagePath ? [getImageUrl(agencyRaw.value.imagePath)] : []
  const merged = [...fromArray, ...fromSingle].filter(Boolean)
  // 去重
  return Array.from(new Set(merged))
})

// 將各來源欄位統一映射到 UI
const uiAgency = computed(() => {
  const a = agencyRaw.value || {}

  // 名稱：先取 institutionName，其次 name
  const displayName = a.institutionName || a.name || ''

  return {
    displayName,
    // 人員
    contactPerson: a.contactPerson || a.contact || '',
    responsiblePerson: a.responsiblePerson || a.responsible || '',
    // 聯絡/位置
    address: a.address || '',
    phoneNumber: a.phoneNumber || a.phone || '',
    fax: a.fax || '',
    email: a.email || '',
    // 連結與描述
    relatedLinks: a.relatedLinks || a.fanpage || '',
    description: a.description || a.license || '',
    // 舊結構之 classes（若有）
    classes: Array.isArray(a.classes) ? a.classes : []
  }
})

function ensureHttp(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `https://${url}`
}

// 取機構資料
const fetchAgencyData = async () => {
  const agencyId = route.params.id
  if (!agencyId) throw new Error('機構ID不存在')
  const upperCaseId = String(agencyId).toUpperCase()
  const res = await getAgencyById(upperCaseId)
  agencyRaw.value = res?.data || {}
}

// 取班級資料（新 API）
const fetchClassData = async () => {
  const agencyId = route.params.id
  if (!agencyId) throw new Error('機構ID不存在')
  const upperCaseId = String(agencyId).toUpperCase()
  const classRes = await getClassByInstitutionId(upperCaseId)
  if (classRes?.data && Array.isArray(classRes.data)) {
    classList.value = classRes.data.map(cls => ({
      classID: cls.classID || '',
      className: cls.className || '',
      capacity: cls.capacity ?? 0,
      currentStudents: cls.currentStudents ?? 0,
      minAgeDescription: Number(cls.minAgeDescription) || 0,
      maxAgeDescription: Number(cls.maxAgeDescription) || 0,
      additionalInfo: cls.additionalInfo || '',
      institutionID: cls.institutionID || ''
    }))
  } else {
    classList.value = []
  }
}

const loadAll = async () => {
  try {
    loading.value = true
    error.value = null
    await Promise.all([fetchAgencyData(), fetchClassData()])
  } catch (err) {
    console.error(err)
    error.value = err?.message || '載入失敗'
  } finally {
    loading.value = false
  }
}


function goBack() {
  router.push({ name: 'AgencySearch' })
}

function reload() {
  loadAll()
}

onMounted(loadAll)

// 當路由 id 改變時重新抓資料
watch(() => route.params.id, () => {
  loadAll()
})
</script>

<style scoped>
.agency-info-page {
  min-height: calc(100vh - 160px);
}
.page-wrapper { width: 100%; }
.content-area { max-width: 1000px; margin: 0 auto; }
.info-card {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px 32px;
  background: #fff;
}

/* 標題 */
.list-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 50px 0 16px 0;
  letter-spacing: 2px;
  color: #333;
}
.title-decoration {
  width: 80%;
  height: 2px;
  border-radius: 4px;
  background: var(--4th-text-color);
  margin: 10px auto 24px;
}

/* Header */
.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.info-icon { width: 38px; height: 38px; }
.info-title {
  color: #2a4fa7;
  font-size: 1.4rem;
  font-weight: bold;
  letter-spacing: 2px;
}

.list-title{
  text-align:center;
  font-size:1.5rem;
  font-weight:bold;
  margin:50px 0 16px 0;
  letter-spacing:2px;
}
.title-decoration{
  width: 80%;
  height: 2px;
  border-radius: 4px;
  background: var(--4th-text-color);
  margin: 10px auto;
}

/* 載入/錯誤 */
.loading-state,
.error-state {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(249, 175, 174, 0.10);
  padding: 40px 20px;
  text-align: center;
  border: 1px solid #f3e6e6;
}
.loading-state { padding: 60px 20px; }
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3e6e6;
  border-top: 4px solid #f9afae;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.loading-state p { color: #666; font-size: 1.1rem; margin: 0; }
.error-state p { color: #e74c3c; font-size: 1.1rem; margin-bottom: 20px; }

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

/* 卡片與名稱膠囊 */
.agency-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(249, 175, 174, 0.10);
  padding: 12px 12px 12px 12px;
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

/* 圖片顯示 */
.agency-image-container {
  width: 100%;
  margin-bottom: 32px;
}
.image-box {
  width: 100%;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(249, 175, 174, 0.15);
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
}
.agency-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 資訊表 */
.agency-info-table { margin: 60px 60px; padding: 0; }
.info-row {
  display: flex;
  gap: 12px;
  font-size: 1rem;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.info-row:last-child { border-bottom: none; }
.info-row span:first-child { min-width: 110px; color: #666; font-weight: 600; }
.info-row span:last-child { flex: 1; color: #333; }

/* 班級表格 */
.class-section { margin-top: 40px;}
.class-title {
  font-size: 1.2rem; font-weight: bold; color: #333; margin-bottom: 16px; letter-spacing: 1px; }
.class-table {
  width: 100%;
  border-collapse: collapse;
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
}
.class-table th, .class-table td {
  padding: 12px 16px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}
.class-table th {
  background: #de858e;
  color: #fff;
  font-weight: bold;
}
.class-table tr:last-child td { border-bottom: none; }

/* 底部 actions */
.actions { text-align: center; margin-top: 32px; }
.back-to-list {
  background: var(--front-btn);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.back-to-list:hover { background: #f5a1a1; transform: translateY(-2px); }

/* RWD */
@media (max-width: 768px) {
  .info-card { padding: 24px 16px; }
  .image-box { height: 280px; }
}
@media (max-width: 600px) {
  .info-card { padding: 16px 12px; }
  .image-box { height: 220px; border-radius: 12px; }
  .info-row { flex-direction: column; gap: 4px; }
  .info-row span:first-child { min-width: auto; }
  .class-table th, .class-table td { padding: 8px 4px; font-size: 0.9rem; }
}
</style>
