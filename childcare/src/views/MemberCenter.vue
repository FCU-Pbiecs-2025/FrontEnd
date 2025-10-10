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
        <h2>家長資料</h2>
        <div class="parent-info-card" v-for="(parentItem, idx) in parents" :key="parentItem.id">
          <div v-if="editParentIdx!==idx">
            <p>身分證字號/護照號碼：{{ parentItem.idNumber }}</p>
            <p>姓名：{{ parentItem.name }}</p>
            <p>性別：{{ parentItem.gender }}</p>
            <p>與幼兒關係：{{ parentItem.relation }}</p>
            <p>職業：{{ parentItem.job }}</p>
            <p>電話：{{ parentItem.phone }}</p>
            <p>戶籍地址：{{ parentItem.householdAddress }}</p>
            <p>通訊地址：{{ parentItem.contactAddress }}</p>
            <p>電子信箱：{{ parentItem.email }}</p>
            <p>出生年月日：{{ parentItem.birthday }}</p>
            <p>是否留停：{{ parentItem.isLeave ? '是' : '否' }}</p>
            <template v-if="parentItem.isLeave">
              <p>留停起：{{ parentItem.leaveStart }}</p>
              <p>留停訖：{{ parentItem.leaveEnd }}</p>
            </template>
            <button class="service-btn" @click="editParentIdx=idx">編輯</button>
          </div>
          <div v-else>
            <div class="parent-edit-form">
              <div class="form-grid">
                <label>身分證字號/護照號碼：<input v-model="parentItem.idNumber" /></label>
                <label>姓名：<input v-model="parentItem.name" /></label>
                <label>性別：
                  <select v-model="parentItem.gender">
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </label>
                <label>與幼兒關係：<input v-model="parentItem.relation" /></label>
                <label>職業：<input v-model="parentItem.job" /></label>
                <label>電話：<input v-model="parentItem.phone" /></label>
                <label>戶籍地址：<input v-model="parentItem.householdAddress" /></label>
                <label>通訊地址：<input v-model="parentItem.contactAddress" /></label>
                <label>電子信箱：<input v-model="parentItem.email" /></label>
                <label>出生年月日：<input v-model="parentItem.birthday" type="date" /></label>
                <label>是否留停：
                  <select v-model="parentItem.isLeave">
                    <option :value="true">是</option>
                    <option :value="false">否</option>
                  </select>
                </label>
                <template v-if="parentItem.isLeave">
                  <label>留停起：<input v-model="parentItem.leaveStart" type="date" /></label>
                  <label>留停訖：<input v-model="parentItem.leaveEnd" type="date" /></label>
                </template>
              </div>

              <div class="edit-actions">
                <button class="service-btn" @click="saveParent(idx)">儲存</button>
                <button class="service-btn ghost" @click="editParentIdx=null">取消</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用與新增幼兒相同的按鈕類別，使長度/樣式一致 -->
        <button class="service-btn add-child-btn" @click="addParentMode=true">新增家長</button>

        <div v-if="addParentMode" class="add-parent-modal">
          <div class="add-parent-form">
            <label>身分證字號/護照號碼：<input v-model="newParent.idNumber" /></label>
            <label>姓名：<input v-model="newParent.name" /></label>
            <label>性別：
              <select v-model="newParent.gender">
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </label>
            <label>與幼兒關係：<input v-model="newParent.relation" /></label>
            <label>職業：<input v-model="newParent.job" /></label>
            <label>電話：<input v-model="newParent.phone" /></label>
            <label>戶籍地址：<input v-model="newParent.householdAddress" /></label>
            <label>通訊地址：<input v-model="newParent.contactAddress" /></label>
            <label>電子信箱：<input v-model="newParent.email" /></label>
            <label>出生年月日：<input v-model="newParent.birthday" type="date" /></label>
            <label>是否留停：
              <select v-model="newParent.isLeave">
                <option :value="true">是</option>
                <option :value="false">否</option>
              </select>
            </label>
            <template v-if="newParent.isLeave">
              <label>留停起：<input v-model="newParent.leaveStart" type="date" /></label>
              <label>留停訖：<input v-model="newParent.leaveEnd" type="date" /></label>
            </template>
            <button class="service-btn" @click="addParent">儲存</button>
            <button class="service-btn" @click="addParentMode=false">取消</button>
          </div>
        </div>
        <h2 style="margin-top:32px;">幼兒資料</h2>
        <div class="children-list">
          <div v-for="(child, idx) in children" :key="child.id" class="child-info-card">
            <div v-if="editChildIdx!==idx">
              <p>身分證字號：{{ child.idNumber || '未填' }}</p>
              <p>姓名：{{ child.name }}</p>
              <p>生日：{{ child.birthday }}</p>
              <p>性別：{{ child.gender }}</p>
              <button class="service-btn" @click="editChildIdx=idx">編輯</button>
            </div>
            <div v-else>
              <label>身分證字號：<input v-model="child.idNumber" /></label>
              <label>姓名：<input v-model="child.name" /></label>
              <label>生日：<input v-model="child.birthday" type="date" /></label>
              <label>性別：
                <select v-model="child.gender">
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </label>
              <button class="service-btn" @click="saveChild(idx)">儲存</button>
              <button class="service-btn" @click="editChildIdx=null">取消</button>
            </div>
          </div>
          <button class="service-btn add-child-btn" @click="showAddChild=true">新增幼兒</button>
        </div>
        <div v-if="showAddChild" class="add-child-modal">
          <div class="add-child-form">
            <label>身分證字號：<input v-model="newChild.idNumber" /></label>
            <label>姓名：<input v-model="newChild.name" /></label>
            <label>生日：<input v-model="newChild.birthday" type="date" /></label>
            <label>性別：
              <select v-model="newChild.gender">
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </label>
            <button class="service-btn" @click="addChild">儲存</button>
            <button class="service-btn" @click="showAddChild=false">取消</button>
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

.account-management-section {
  background: linear-gradient(180deg, #fff8f6, #fff6f3);
  border-radius: 12px;
  padding: 20px 24px;
  margin-top: 32px;
  box-shadow: 0 6px 18px rgba(249, 175, 174, 0.08);
  border-left: 6px solid #F9AFAE; /* 左側強調條 */
}

.account-status-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-toggle span {
  color: #333;
  font-weight: bold;
}

.account-status-card .actions-row {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
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

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
