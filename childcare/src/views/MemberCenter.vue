<template>
  <div class="member-center-page">
    <div class="page-header">
      <h1>會員中心</h1>
      <p class="page-description">管理您的個人資料、查看申請進度與托育服務狀況</p>
    </div>

    <div class="content-area">
      <div class="member-info-section">
        <h2>個人資料</h2>
        <div class="member-card">
          <div class="member-avatar">
            <img src="https://img.icons8.com/ios-filled/100/F9AFAE/user-male-circle.png" alt="會員頭像" />
          </div>
          <div class="member-details">
            <h3>{{ authStore.user?.name || authStore.user?.account || '用戶' }}</h3>
            <p>📧 email: {{ authStore.user?.email || '未設定' }}</p>
            <p>📱 電話: {{ authStore.user?.phone || '未設定' }}</p>
            <p>🏠 地址: {{ authStore.user?.address || '未設定' }}</p>
            <button class="edit-btn" @click="editProfile">編輯資料</button>
          </div>
        </div>
      </div>

      <div class="services-section">
        <h2>我的服務</h2>
        <div class="services-grid">
          <div class="service-card">
            <div class="service-icon">📋</div>
            <h3>申請進度查詢</h3>
            <p>查看托育服務申請的處理進度</p>
            <button class="service-btn" @click="checkApplications">查看詳情</button>
          </div>

          <div class="service-card">
            <div class="service-icon">📝</div>
            <h3>申請托育服務</h3>
            <p>線上申請公共托育服務</p>
            <button class="service-btn" @click="applyService">立即申請</button>
          </div>

          <div class="service-card">
            <div class="service-icon">💰</div>
            <h3>補助試算</h3>
            <p>計算您可申請的托育補助金額</p>
            <button class="service-btn" @click="calculateSubsidy">開始試算</button>
          </div>

          <div class="service-card">
            <div class="service-icon">📊</div>
            <h3>服務記錄</h3>
            <p>查看過往的申請與服務記錄</p>
            <button class="service-btn" @click="viewRecords">查看記錄</button>
          </div>
        </div>
      </div>

      <div class="applications-section">
        <h2>申請狀態</h2>
        <div class="applications-list">
          <div v-if="applications.length === 0" class="no-applications">
            <p>目前沒有申請記錄</p>
            <button class="service-btn" @click="applyService">開始申請</button>
          </div>
          <div v-else class="application-item" v-for="application in applications" :key="application.id">
            <div class="application-info">
              <h4>{{ application.title }}</h4>
              <p class="application-date">申請日期: {{ formatDate(application.date) }}</p>
              <p class="application-details">{{ application.details }}</p>
            </div>
            <div class="application-status">
              <span :class="['status-badge', application.status]">{{ getStatusText(application.status) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-actions-section">
        <h2>快速功能</h2>
        <div class="quick-actions">
          <button class="quick-action-btn" @click="editProfile">
            <span class="action-icon">🔄</span>
            <span>更新個人資料</span>
          </button>
          <button class="quick-action-btn" @click="contactSupport">
            <span class="action-icon">📞</span>
            <span>聯絡客服</span>
          </button>
          <button class="quick-action-btn" @click="downloadForms">
            <span class="action-icon">📋</span>
            <span>下載申請表</span>
          </button>
          <button class="quick-action-btn" @click="handleLogout">
            <span class="action-icon">🚪</span>
            <span>登出系統</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth.js'

const router = useRouter()
const authStore = useAuthStore()

// 申請記錄
const applications = ref([])

// 初始化會員中心資料
onMounted(async () => {
  // 確保用戶已登入，如果沒有登入則導向登入頁
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }

  // 載入用戶的申請記錄（這裡可以呼叫 API）
  loadApplications()
})

// 載入申請記錄
const loadApplications = async () => {
  try {
    // 這裡可以呼叫 API 獲取真實的申請記錄
    // const response = await getUserApplications()
    // applications.value = response.data

    // 示例資料
    applications.value = [
      {
        id: 1,
        title: '公共托育服務申請',
        date: '2024-01-15',
        details: `申請人: ${authStore.user?.name || authStore.user?.account} | 嬰兒: 王小寶 (6個月)`,
        status: 'processing'
      },
      {
        id: 2,
        title: '托育補助申請',
        date: '2024-01-10',
        details: '補助類型: 一般家庭托育補助',
        status: 'approved'
      }
    ]
  } catch (error) {
    console.error('載入申請記錄失敗:', error)
  }
}

// 處理登出
const handleLogout = async () => {
  try {
    await authStore.logoutUser()
    router.push('/')
  } catch (error) {
    console.error('登出失敗:', error)
  }
}

// 編輯個人資料
const editProfile = () => {
  // 這裡可以導向編輯個人資料頁面或開啟模態框
  alert('編輯個人資料功能（待實現）')
}

// 查看申請進度
const checkApplications = () => {
  // 捲動到申請狀態區塊
  document.querySelector('.applications-section').scrollIntoView({ behavior: 'smooth' })
}

// 申請托育服務
const applyService = () => {
  alert('申請托育服務功能（待實現）')
}

// 補助試算
const calculateSubsidy = () => {
  alert('補助試算功能（待實現）')
}

// 查看服務記錄
const viewRecords = () => {
  alert('查看服務記錄功能（待實現）')
}

// 聯絡客服
const contactSupport = () => {
  alert('聯絡客服功能（待實現）')
}

// 下載申請表
const downloadForms = () => {
  alert('下載申請表功能（待實現）')
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW')
}

// 獲取狀態文字
const getStatusText = (status) => {
  const statusMap = {
    'processing': '審核中',
    'approved': '已核准',
    'rejected': '已拒絕',
    'pending': '待審核'
  }
  return statusMap[status] || '未知狀態'
}
</script>

<style scoped>
.member-center-page {
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
  max-width: 600px;
  margin: 0 auto;
}

.content-area {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.member-info-section,
.services-section,
.applications-section,
.quick-actions-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
}

.member-info-section h2,
.services-section h2,
.applications-section h2,
.quick-actions-section h2 {
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 24px;
  border-bottom: 3px solid #F9AFAE;
  padding-bottom: 8px;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: #FFF8F6;
  border-radius: 12px;
}

.member-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.member-details h3 {
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 12px;
}

.member-details p {
  color: #666;
  margin: 6px 0;
  font-size: 1rem;
}

.edit-btn {
  background: #F9AFAE;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 12px;
  transition: background 0.2s;
}

.edit-btn:hover {
  background: #f5a1a1;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.service-card {
  padding: 24px;
  background: #FFF8F6;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(249, 175, 174, 0.2);
}

.service-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.service-card h3 {
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 12px;
}

.service-card p {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
}

.service-btn {
  background: #F9AFAE;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.service-btn:hover {
  background: #f5a1a1;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.application-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #FFF8F6;
  border-radius: 8px;
  border-left: 4px solid #F9AFAE;
}

.application-info h4 {
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.application-date,
.application-details {
  color: #666;
  font-size: 0.9rem;
  margin: 4px 0;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.85rem;
}

.status-badge.processing {
  background: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #FFF8F6;
  border: 2px solid #F9AFAE;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.quick-action-btn:hover {
  background: #F9AFAE;
  color: white;
}

.action-icon {
  font-size: 1.2rem;
}

.no-applications {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-applications p {
  margin-bottom: 20px;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .member-card {
    flex-direction: column;
    text-align: center;
  }

  .application-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
