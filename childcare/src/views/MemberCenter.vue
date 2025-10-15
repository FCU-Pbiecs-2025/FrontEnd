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
            <div v-if="!editProfileMode">
              <h3>{{ authStore.user?.name || authStore.user?.account || '用戶' }}</h3>
              <p>📧 email: {{ authStore.user?.email || '未設定' }}</p>
              <p>📱 電話: {{ authStore.user?.phone || '未設定' }}</p>
              <p>🏠 地址: {{ authStore.user?.address || '未設定' }}</p>
              <button class="edit-btn" @click="editProfile">編輯資料</button>
            </div>
            <div v-else class="profile-edit-form">
              <label>姓名：<input v-model="editableUser.name" /></label>
              <label>電子信箱：<input v-model="editableUser.email" type="email" /></label>
              <label>電話：<input v-model="editableUser.phone" /></label>
              <label>地址：<input v-model="editableUser.address" /></label>
              <div style="margin-top:8px; display:flex; gap:8px; justify-content:flex-end;">
                <button class="edit-btn" @click="saveProfile">儲存</button>
                <button class="edit-btn" @click="cancelProfileEdit">取消</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="services-section">
        <h2>資料管理</h2>
        <div class="services-grid">
          <div class="service-card">
            <h1>家長資料</h1>
            <p>管理家長基本資料、職業資訊等</p>
            <button class="service-btn" @click="manageParents">管理家長資料</button>
          </div>
          <div class="service-card">
            <h1>幼兒資料</h1>
            <p>管理幼兒基本資料、生日等資訊</p>
            <button class="service-btn" @click="manageChildren">管理幼兒資料</button>
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
              <!-- 通過後補中顯示序位 -->
              <p v-if="application.status === 'waitingForAdmission' && application.queueNumber" class="queue-info">
                目前序位：<span class="queue-number">第 {{ application.queueNumber }} 位</span>
              </p>
            </div>
            <div class="application-status">
              <span :class="['status-badge', application.status]">{{ getStatusText(application.status) }}</span>
              <!-- 補件按鈕（主色系） -->
              <button v-if="application.status === 'supplement'" class="save-btn" @click="goToSupplement(application.id)">
                補件
              </button>
              <!-- 查看退件原因（次要、幽靈樣式） -->
              <button v-if="application.status === 'rejected'" class="cancel-btn" @click="viewRejection(application.id)">
                查看原因
              </button>
              <!-- 撤銷申請（次要、灰色） -->
              <button v-if="application.status === 'waitingForAdmission'" class="back-btn" @click="goToRevoke(application.id)">
                撤銷申請
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 帳號管理區塊 -->
      <div v-if="accountId" class="account-management-section">
        <h2>帳號管理</h2>
        <div class="account-status-card">
          <p>帳號 ID：{{ accountId }}</p>
          <div class="status-toggle">
            <span>狀態：</span>
            <select v-model="accountStatus">
              <option value="啟用">啟用</option>
              <option value="停用">停用</option>
            </select>
          </div>
          <div class="actions-row">
            <button class="service-btn" @click="saveAccountStatus">儲存狀態</button>
            <button class="service-btn ghost" @click="clearAccountQuery">關閉</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../store/auth.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 帳號管理（當 route query 帶 accountId 時顯示）
const accountId = ref(route.query.accountId || '')
const accountStatuses = ref(JSON.parse(localStorage.getItem('accountStatuses') || '{}'))
const accountStatus = ref('啟用')

const loadAccountStatus = (id) => {
  if (!id) return
  accountStatus.value = accountStatuses.value[id] || '啟用'
}

// 如果一開始就帶有 accountId，立即載入狀態
if (accountId.value) loadAccountStatus(accountId.value)

const saveAccountStatus = () => {
  if (!accountId.value) return
  accountStatuses.value[accountId.value] = accountStatus.value
  localStorage.setItem('accountStatuses', JSON.stringify(accountStatuses.value))
  alert('帳號狀態已儲存')
}

const clearAccountQuery = () => {
  // 移除 query，關閉帳號管理區塊
  router.replace({ path: '/member-center' })
}

// 當 route query 變化時同步 accountId 與載入狀態
watch(() => route.query.accountId, (val) => {
  accountId.value = val || ''
  loadAccountStatus(accountId.value)
})


// 申請記錄
const applications = ref([])

// 家長資料
const parents = ref([
  {
    id: 1,
    idNumber: '',
    name: authStore.user?.name || '',
    gender: '女',
    relation: '',
    job: '',
    phone: authStore.user?.phone || '',
    householdAddress: '',
    contactAddress: '',
    email: authStore.user?.email || '',
    birthday: '',
    isLeave: false,
    leaveStart: '',
    leaveEnd: ''
  },
  {
    id: 2,
    idNumber: '',
    name: '',
    gender: '女',
    relation: '',
    job: '',
    phone: '',
    householdAddress: '',
    contactAddress: '',
    email: '',
    birthday: '',
    isLeave: false,
    leaveStart: '',
    leaveEnd: ''
  }
])
const editParentIdx = ref(null)
const addParentMode = ref(false)
const newParent = ref({
  id: Date.now(),
  idNumber: '',
  name: '',
  gender: '女',
  relation: '',
  job: '',
  phone: '',
  householdAddress: '',
  contactAddress: '',
  email: '',
  birthday: '',
  isLeave: false,
  leaveStart: '',
  leaveEnd: ''
})

// 幼兒資料
const children = ref([
  { id: 1, idNumber: '', name: '王小寶', birthday: '2022-05-01', gender: '男' }
])
const editChildIdx = ref(null)
const showAddChild = ref(false)
const newChild = ref({ idNumber: '', name: '', birthday: '', gender: '男' })

// 個人資料編輯
const editProfileMode = ref(false)
const editableUser = ref({ name: '', email: '', phone: '', address: '' })

const editProfile = () => {
  const u = authStore.user || {}
  editableUser.value = {
    name: u.name || u.account || '',
    email: u.email || '',
    phone: u.phone || '',
    address: u.address || ''
  }
  editProfileMode.value = true
}

const saveProfile = () => {
  if (!authStore.user) return
  // 更新 store 上的用戶資料（視 store 設計，這裡直接修改）
  authStore.user.name = editableUser.value.name
  authStore.user.email = editableUser.value.email
  authStore.user.phone = editableUser.value.phone
  authStore.user.address = editableUser.value.address
  editProfileMode.value = false
}

const cancelProfileEdit = () => {
  editProfileMode.value = false
}

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

    // 示例資料 - 包含所有申請狀態
    applications.value = [
      {
        id: 1,
        title: '公共托育服務申請 - 審核中',
        date: '2024-01-15',
        details: `申請人: ${authStore.user?.name || authStore.user?.account} | 幼兒: 王小寶`,
        status: 'processing'
      },
      {
        id: 2,
        title: '托育補助申請 - 需要補件',
        date: '2024-01-12',
        details: '申請人: 王小明 | 幼兒: 王小美',
        status: 'supplement'
      },
      {
        id: 3,
        title: '公共托育服務申請 - 已退件',
        date: '2024-01-10',
        details: '申請人: 李大華 | 幼兒: 李小華',
        status: 'rejected'
      },
      {
        id: 4,
        title: '托育補助申請 - 通過候補中',
        date: '2024-01-08',
        details: '申請人: 張美麗 | 幼兒: 張小天',
        status: 'waitingForAdmission',
        queueNumber: 15
      },
      {
        id: 5,
        title: '公共托育服務申請 - 撤銷申請審核中',
        date: '2024-01-05',
        details: '申請人: 陳建國 | 幼兒: 陳小明',
        status: 'revokeProcessing'
      },
      {
        id: 6,
        title: '托育補助申請 - 撤銷申請通過',
        date: '2024-01-03',
        details: '申請人: 林雅文 | 幼兒: 林小花',
        status: 'revoked'
      },
      {
        id: 7,
        title: '公共托育服務申請 - 已錄取',
        date: '2023-12-28',
        details: '申請人: 黃志明 | 幼兒: 黃小龍',
        status: 'admitted'
      },
      {
        id: 8,
        title: '托育補助申請 - 已退托',
        date: '2023-12-20',
        details: '申請人: 吳淑芬 | 幼兒: 吳小虎',
        status: 'withdrawn'
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
    processing: '審核中',
    supplement: '補件',
    rejected: '退件',
    waitingForAdmission: '通過後補中',
    revokeProcessing: '撤銷申請審核中',
    revoked: '撤銷聲請通過',
    admitted: '錄取',
    withdrawn: '已退托',
    approved: '已核准',
    pending: '待審核'
  }
  return statusMap[status] || '未知狀態'
}

// 補件：導向補件頁
const goToSupplement = (applicationId) => {
  router.push({ path: '/supplement-document', query: { applicationId } })
}

// 退件：導向退件說明
const viewRejection = (applicationId) => {
  router.push({ path: '/rejection-reason', query: { applicationId } })
}

// 通過後補中：導向撤銷申請
const goToRevoke = (applicationId) => {
  router.push({ path: '/revoke-application', query: { applicationId } })
}

// 儲存家長資料
function saveParent(idx) {
  // 這裡可串接 API 儲存家長資料
  editParentIdx.value = null
}

// 新增家長資料
function addParent() {
  parents.value.push({ ...newParent.value, id: Date.now() })
  addParentMode.value = false
  newParent.value = {
    id: Date.now(),
    idNumber: '',
    name: '',
    gender: '女',
    relation: '',
    job: '',
    phone: '',
    householdAddress: '',
    contactAddress: '',
    email: '',
    birthday: '',
    isLeave: false,
    leaveStart: '',
    leaveEnd: ''
  }
}

// 儲存幼兒資料
function saveChild(idx) {
  // v-model 已綁定 child 資料，這裡只需關閉編輯狀態
  editChildIdx.value = null
}

// 新增幼兒資料
function addChild() {
  children.value.push({
    id: Date.now(),
    idNumber: newChild.value.idNumber,
    name: newChild.value.name,
    birthday: newChild.value.birthday,
    gender: newChild.value.gender
  })
  showAddChild.value = false
  newChild.value = { idNumber: '', name: '', birthday: '', gender: '男' }
}

// 管理家長資料
const manageParents = () => {
  router.push('/manage-parents')
}

// 管理幼兒資料
const manageChildren = () => {
  router.push('/manage-children')
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
.applications-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
}

.member-info-section h2,
.services-section h2,
.applications-section h2 {
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

.parent-info-card {
  background: #FFF8F6;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  min-height: 200px;
}

.parent-edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.children-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.child-info-card {
  background: #FFF8F6;
  border-radius: 12px;
  padding: 18px 24px;
}

.add-child-btn {
  margin: 18px auto;
  background: #5f8ba8;
  display: block;
  padding: 12px 24px;
  width: 180px;
  text-align: center;
  color: white;
  border: none;
  border-radius: 6px;
}

.add-child-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.add-child-form {
  background: #fff;
  border-radius: 12px;
  padding: 32px 40px;
  box-shadow: 0 4px 16px #0002;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.add-child-form label {
  color: #5f8ba8;
  font-weight: bold;
}

.add-parent-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.add-parent-form {
  background: #fff;
  border-radius: 12px;
  padding: 32px 40px;
  box-shadow: 0 4px 16px #0002;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.add-parent-form label {
  color: #5f8ba8;
  font-weight: bold;
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

.service-btn.ghost {
  background: transparent;
  color: #F9AFAE;
  border: 2px solid #F9AFAE;
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

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.supplement {
  background: #fff3cd;
  color: #856404;
}

.status-badge.waitingForAdmission {
  background: #cce5ff;
  color: #004085;
}

.status-badge.revokeProcessing {
  background: #e2e3e5;
  color: #383d41;
}

.status-badge.revoked {
  background: #d6d8db;
  color: #1b1e21;
}

.status-badge.admitted {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.withdrawn {
  background: #f8d7da;
  color: #721c24;
}

.queue-info {
  color: #004085;
  font-weight: 600;
  margin-top: 8px;
  font-size: 0.95rem;
}

.queue-number {
  color: #dc3545;
  font-size: 1.1rem;
  font-weight: bold;
}

.application-status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

/* 統一按鈕樣式（沿用全站主題） */
.save-btn, .cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}
.save-btn {
  background: #F9AFAE;
  color: #fff;
}
.save-btn:hover { background: #f5a1a1; }
.cancel-btn {
  background: transparent;
  color: #F9AFAE;
  border: 2px solid #F9AFAE;
}
.cancel-btn:hover { background: #F9AFAE; color: #fff; }
.back-btn {
  background: #6c757d;
  color: #fff;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}
.back-btn:hover { background: #5a6268; }

/* 移除舊的 action-btn 顏色定義，避免不一致 */
.action-btn, .supplement-btn, .rejection-btn, .revoke-btn { all: unset; }
/* 重新設定 action-btn 為按鈕的 reset 之後的基礎樣式（不覆蓋新樣式）*/
.action-btn { display: inline-block; }

/* 保留既有的狀態徽章與其他樣式 */
</style>
