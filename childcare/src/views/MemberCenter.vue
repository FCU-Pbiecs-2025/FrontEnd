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
              <h3 class="user-info-title">{{ authStore.user?.name || authStore.user?.account || '用戶' }}</h3>
              <p class="user-info-detail">email: {{ authStore.user?.email || '未設定' }}</p>
              <p class="user-info-detail">電話: {{ authStore.user?.phone || '未設定' }}</p>
              <p class="user-info-detail">地址: {{ authStore.user?.address || '未設定' }}</p>
              <button class="edit-btn" @click="editProfile">編輯資料</button>
            </div>
            <div v-else class="profile-edit-form">
              <form class="profile-form" @submit.prevent="saveProfile">
                <div class="input-row">
                  <label class="field">姓名 <input v-model="editableUser.name" class="input-field" /></label>
                  <label class="field">電子信箱 <input v-model="editableUser.email" type="email" class="input-field" /></label>
                </div>

                <div class="input-row">
                  <label class="field">電話 <input v-model="editableUser.phone" class="input-field" /></label>
                  <label class="field">地址 <input v-model="editableUser.address" class="input-field" /></label>
                </div>

                <div class="form-actions">
                  <button type="submit" class="save-btn">儲存</button>
                  <button type="button" class="cancel-btn" @click="cancelProfileEdit">取消</button>
                </div>
              </form>
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
        <!-- 使用 ApplicationStatus 的卡片式布局 -->
        <div v-if="applications.length === 0" class="no-applications">目前沒有申請紀錄</div>

        <div class="applications-list">
          <div
            v-for="item in applications"
            :key="item.id"
            class="application-item"
            role="button"
            tabindex="0"
            @click="goToProgress(item)"
            @keydown.enter.prevent="goToProgress(item)"
            @keydown.space.prevent="goToProgress(item)"
          >
            <div class="application-info">
              <h4 class="application-title">{{ item.caseNumber || 'N/A' }}</h4>
              <p class="application-date">申請日期: {{ item.date }}</p>
              <p v-if="item.details" class="application-details">{{ item.details }}</p>
              <p v-else class="application-details muted">無詳細說明</p>

              <p v-if="item.status === 'waitingForAdmission' && item.queueNumber" class="queue-info">
                目前序位：<span class="queue-number">第 {{ item.queueNumber }} 位</span>
              </p>
            </div>

            <div class="application-status">
              <span :class="['status-badge', item.statusClass || item.status]">
                {{ getStatusLabel(item.statusClass || item.status, item.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- helper: include all status class combinations so CSS selectors are recognized -->
        <div style="display:none" aria-hidden="true" class="__status-class-helpers">
          <span class="status-badge processing"></span>
          <span class="status-badge pending"></span>
          <span class="status-badge approved"></span>
          <span class="status-badge rejected"></span>
          <span class="status-badge supplement"></span>
          <span class="status-badge waitingForAdmission"></span>
          <span class="status-badge revokeProcessing"></span>
          <span class="status-badge revoked"></span>
          <span class="status-badge admitted"></span>
          <span class="status-badge withdrawn"></span>
        </div>
      </div>

      <!-- 帳號管理區塊 -->
      <div v-if="accountId" class="member-info-section">
        <div class="title-row">
          <span class="main-title">帳號管理</span>
          <span class="account-id">ID：{{ accountId }}</span>
        </div>
        <div class="status-toggle">
          <span class="status-label">狀態：</span>
          <select v-model="accountStatus" class="form-input">
            <option value="啟用">啟用</option>
            <option value="停用">停用</option>
          </select>
        </div>
        <div class="bottom-row">
          <button class="btn primary" @click="saveAccountStatus">儲存狀態</button>
          <button class="btn ghost" @click="clearAccountQuery">關閉</button>
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
  // 跳轉回前頁，關閉帳號管理區塊
  router.go(-1)
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
        caseNumber: 'CC2024010001',
        title: '公共托育服務申請 - 審核中',
        date: '2024-01-15',
        details: '申請人: 王小明 | 幼兒: 王小美',
        status: 'processing'
      },
      {
        id: 2,
        caseNumber: 'CC2024010002',
        title: '公共托育服務申請- 需要補件',
        date: '2024-01-12',
        details: '申請人: 王小明 | 幼兒: 王小美',
        status: 'supplement'
      },
      {
        id: 3,
        caseNumber: 'CC2024010003',
        title: '公共托育服務申請 - 已退件',
        date: '2024-01-10',
        details: '申請人: 李大華 | 幼兒: 李小華',
        status: 'rejected'
      },
      {
        id: 4,
        caseNumber: 'CC2024010004',
        title: '公共托育服務申請 - 錄取候補中',
        date: '2024-01-08',
        details: '申請人: 張美麗 | 幼兒: 張小天',
        status: 'waitingForAdmission',
        queueNumber: 15
      },
      {
        id: 5,
        caseNumber: 'CC2024010005',
        title: '公共托育服務申請 - 撤銷申請審核中',
        date: '2024-01-05',
        details: '申請人: 陳建國 | 幼兒: 陳小明',
        status: 'revokeProcessing'
      },
      {
        id: 6,
        caseNumber: 'CC2024010006',
        title: '公共托育服務申請 - 撤銷申請通過',
        date: '2024-01-03',
        details: '申請人: 林雅文 | 幼兒: 林小花',
        status: 'revoked'
      },
      {
        id: 8,
        caseNumber: 'CC2023120008',
        title: '公共托育服務申請 - 已退托',
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
const getStatusLabel = (statusClass, rawStatus) => {
  const map = {
    processing: '審核中',
    pending: '審核中',
    supplement: '需要補件',
    rejected: '已退件',
    waitingForAdmission: '錄取候補中',
    revokeProcessing: '撤銷申請審核中',
    revoked: '撤銷申請通過',
    admitted: '已錄取',
    withdrawn: '已退托',
    approved: '已核准'
  }
  return map[statusClass] || map[rawStatus] || rawStatus || '未知狀態'
}

// 兼容舊代碼：保留 getStatusText 作為簡單 wrapper
const getStatusText = (status) => getStatusLabel(status, status)

// 前往統一的申請進度詳情頁（使用 caseNumber 優先，否則使用 id）
const goToProgress = (application) => {
  const caseNo = application.caseNumber || application.id || ''
  if (!caseNo) {
    alert('找不到案號，無法檢視詳情')
    return
  }
  router.push({ name: 'ApplicationProgressDetail', params: { caseNo } })
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
  padding: 6px 6px;
  border-radius: 1100px;
  font-weight: 700;
  font-size: 0.88rem;

}

.status-badge.processing,
.status-badge.pending {
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

/* 統一按鈕樣式 */
.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
  white-space: nowrap;
}

/* 補件按鈕樣式 */
.action-btn.supplement {
  background: #F9AFAE;
  color: #fff;
}
.action-btn.supplement:hover {
  background: #f5a1a1;
}

/* 查看原因按鈕樣式 */
.action-btn.view-reason {
  background: #F9AFAE;
  color: #fff;
}
.action-btn.view-reason:hover {
  background: #f5a1a1;
}

/* 撤銷申請按鈕樣式 */
.action-btn.revoke {
  background: #F9AFAE;
  color: #fff;
  border: 1px solid transparent;
}
.action-btn.revoke:hover {
  background: #f5a1a1;
  color: #fff;
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
.supplement-btn, .rejection-btn, .revoke-btn { all: unset; }
/* 重新設定 action-btn 為按鈕的 reset 之後的基礎樣式（不覆蓋新樣式）*/


/* 保留既有的狀態徽章與其他樣式 */

/* 新增 News-like 列表樣式（來自 News.vue 的公告列表區塊） */
.news-list-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin: 10px auto 0 auto;
  max-width: 900px;
}

/* 更新為四欄並排版 */
.news-list-header,
.news-list-row {
  display: grid;
  grid-template-columns: 120px 2fr 2.5fr 140px;
  align-items: center;
  justify-content: stretch;
  gap: 16px;
  text-align: center;
}

.news-list-header {
  font-weight: bold;
  color: var(--4th-text-color);
  font-size: 1.05rem;
  border-bottom: 2px solid #ffe5c2;
  padding-bottom: 12px;
  margin-bottom: 12px;
  background: transparent;
}

.news-list-row {
  font-size: 1.02rem;
  border-bottom: 1px solid #ffe5c2;
  transition: background 0.2s;
  padding: 12px 0;
}

.news-list-row:hover {
  background: #fff8f6;
}

/* 各欄位樣式 */
.application-id-cell {
  color: var(--secondary-color);
  font-weight: 500;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.application-title-cell {
  font-weight: 500;
  letter-spacing: 1px;
  color: var(--primary-text-color);
  overflow: visible;
  text-overflow: unset;
  white-space: normal;
  line-height: 1.4;
}

.application-content-cell {
  color: #333;
  overflow: visible;
  text-overflow: unset;
  white-space: normal;
  line-height: 1.4;
}

.application-status-cell {
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-tip {
  text-align: center;
  color: #aaa;
  padding: 24px 0;
  font-size: 1.05rem;
  grid-column: 1 / -1;
}

/* profile edit styles (simplified: form-only) */
.profile-edit-form { width: 100%; }
.profile-form { display: flex; flex-direction: column; gap: 12px; }
.input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; font-weight: 600; color: #555; }
.input-field { padding: 10px 12px; border-radius: 8px; border: 1px solid #eee; background: #fff; font-size: 0.98rem; outline: none; }
.input-field:focus { box-shadow: 0 0 0 4px rgba(249,175,174,0.12); border-color: #f5a1a1; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
@media (max-width: 700px) {
  .input-row { grid-template-columns: 1fr; }
}

/* 美化帳號管理區塊 */
/* 刪除 account-card 相關 CSS，讓帳號管理區塊繼承 member-info-section 樣式 */
.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.main-title {
  font-size: 1.35rem;
  color: #f27575;
  font-weight: bold;
  margin: 0;
}
.account-id {
  font-size: 1.08rem;
  color: #5f8ba8;
  background: #fff3f1;
  border-radius: 8px;
  padding: 4px 12px;
  font-weight: 500;
  letter-spacing: 1px;
}
.status-toggle {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}
.status-label {
  font-size: 1.08rem;
  color: #555;
  font-weight: 600;
}
.form-input {
  font-size: 1.08rem;
  padding: 8px 24px;
  border-radius: 10px;
  border: 1.5px solid #f9afae;
  background: #fff;
  color: #f27575;
  font-weight: bold;
  box-shadow: 0 2px 8px #f9afae22;
  transition: border 0.2s, box-shadow 0.2s;
}
.form-input:focus {
  border-color: #f27575;
  box-shadow: 0 0 0 3px #f9afae33;
  outline: none;
}
.form-input option[value="啟用"] {
  color: #3bb97b;
  font-weight: bold;
}
.form-input option[value="停用"] {
  color: #f27575;
  font-weight: bold;
}
.bottom-row {
  display: flex;
  gap: 18px;
  justify-content: flex-end;
  margin-top: 10px;
}
.btn {
  padding: 10px 28px;
  border-radius: 10px;
  font-size: 1.08rem;
  transition: background 0.2s, box-shadow 0.2s;
}
.btn.primary {
  background: linear-gradient(90deg, #f9afae 60%, #f27575 100%);
  color: #fff;
  font-weight: bold;
  border: none;
  box-shadow: 0 2px 8px #f9afae33;
}
.btn.primary:hover {
  background: linear-gradient(90deg, #f27575 60%, #f9afae 100%);
  box-shadow: 0 4px 16px #f9afae44;
}
.btn.ghost {
  background: #fff;
  color: #f27575;
  border: 2px solid #f9afae;
  border-radius: 10px;
  font-weight: bold;
  padding: 10px 28px;
  font-size: 1.08rem;
  transition: background 0.2s, color 0.2s, border 0.2s;
}
.btn.ghost:hover {
  background: #f9afae22;
  color: #f27575;
  border-color: #f27575;
}
@media (max-width: 600px) {
  .account-card {
    padding: 18px 6px 16px 6px;
    gap: 16px;
  }
  .bottom-row {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  .btn {
    width: 100%;
    padding: 10px 0;
    font-size: 1rem;
  }
}

/* 新增 .user-info-title 和 .user-info-detail 樣式 */
.user-info-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}
.user-info-detail {
  font-size: 1.25rem;
  color: #555;
  margin: 6px 0;
}
</style>