<template>
  <div class="manage-parents-page">
    <div class="page-header">
      <h1>家長資料管理</h1>
      <p class="page-description">管理家長基本資料、職業資訊等</p>
    </div>
    <div class="content-area">
      <!-- 家長資料列表 -->
      <div class="parents-section">
        <div class="section-header">
          <h2>家長資料</h2>
          <button class="add-btn" @click="showAddForm = true">新增家長</button>
        </div>
        <div v-if="parents.length === 0" class="no-data">
          <div class="no-data-icon">👥</div>
          <p>目前沒有家長資料</p>
          <button class="service-btn" @click="showAddForm = true">新增第一筆資料</button>
        </div>
        <div v-else class="parents-list">
          <div v-for="(parent, idx) in parents" :key="parent.id" class="parent-card">
            <div v-if="editIdx !== idx" class="parent-info">
              <div class="parent-header">
                <h3>{{ parent.name || '未填寫姓名' }}</h3>
                <div class="parent-actions">
                  <button class="edit-btn" @click="editParent(idx)">編輯</button>
                  <button class="delete-btn" @click="deleteParent(idx)">刪除</button>
                </div>
              </div>
              <div class="parent-details">
                <div class="detail-row">
                  <span class="label">身分證字號/護照號碼：</span>
                  <span>{{ parent.idNumber || '未填寫' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">性別：</span>
                  <span>{{ parent.gender }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">與幼兒關係：</span>
                  <span>{{ parent.relation || '未填寫' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">職業：</span>
                  <span>{{ parent.job || '未填寫' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">電話：</span>
                  <span>{{ parent.phone || '未填寫' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">電子信箱：</span>
                  <span>{{ parent.email || '未填寫' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">戶籍地址：</span>
                  <span>{{ parent.householdAddress || '未填寫' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">通訊地址：</span>
                  <span>{{ parent.contactAddress || '未填寫' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">出生年月日：</span>
                  <span>{{ parent.birthday || '未填寫' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">是否留停：</span>
                  <span>{{ parent.isLeave ? '是' : '否' }}</span>
                </div>
                <template v-if="parent.isLeave">
                  <div class="detail-row">
                    <span class="label">留停起：</span>
                    <span>{{ parent.leaveStart || '未填寫' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">留停訖：</span>
                    <span>{{ parent.leaveEnd || '未填寫' }}</span>
                  </div>
                </template>
              </div>
            </div>
            <!-- 編輯表單 -->
            <div v-else class="parent-edit-form">
              <div class="form-header">
                <h3>編輯家長資料</h3>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label>身分證字號/護照號碼：</label>
                  <input v-model="parent.idNumber" placeholder="請輸入身分證字號或護照號碼" @blur="validateEditParentId" />
                  <span v-if="editParentIdError" style="color:red;font-size:0.95em;">{{ editParentIdError }}</span>
                </div>
                <div class="form-group">
                  <label>姓名：</label>
                  <input v-model="parent.name" placeholder="請輸入姓名" />
                </div>
                <div class="form-group">
                  <label>性別：</label>
                  <select v-model="parent.gender">
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>與幼兒關係：</label>
                  <input v-model="parent.relation" placeholder="如：父親、母親等" />
                </div>
                <div class="form-group">
                  <label>職業：</label>
                  <input v-model="parent.job" placeholder="請輸入職業" />
                </div>
                <div class="form-group">
                  <label>電話：</label>
                  <input v-model="parent.phone" placeholder="請輸入電話號碼" />
                </div>
                <div class="form-group">
                  <label>戶籍地址：</label>
                  <input v-model="parent.householdAddress" placeholder="請輸入戶籍地址" />
                </div>
                <div class="form-group">
                  <label>通訊地址：</label>
                  <input v-model="parent.contactAddress" placeholder="請輸入通訊地址" />
                </div>
                <div class="form-group">
                  <label>電子信箱：</label>
                  <input v-model="parent.email" type="email" placeholder="請輸入電子信箱" />
                </div>
                <div class="form-group">
                  <label>出生年月日：</label>
                  <input v-model="parent.birthday" type="date" />
                </div>
                <div class="form-group">
                  <label>是否留停：</label>
                  <select v-model="parent.isLeave">
                    <option :value="false">否</option>
                    <option :value="true">是</option>
                  </select>
                </div>
                <template v-if="parent.isLeave">
                  <div class="form-group">
                    <label>留停起：</label>
                    <input v-model="parent.leaveStart" type="date" />
                  </div>
                  <div class="form-group">
                    <label>留停訖：</label>
                    <input v-model="parent.leaveEnd" type="date" />
                  </div>
                </template>
              </div>
              <div class="form-actions">
                <button class="save-btn" @click="saveParent">儲存</button>
                <button class="cancel-btn" @click="cancelEdit">取消</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 新增家長表單 -->
      <div v-if="showAddForm" class="add-form-overlay">
        <div class="add-form-modal">
          <div class="form-header">
            <h3>新增家長資料</h3>
            <button class="close-btn" @click="closeAddForm">×</button>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>身分證字號/護照號碼：</label>
              <input v-model="newParent.idNumber" placeholder="請輸入身分證字號或護照號碼" @blur="validateNewParentId" />
              <span v-if="newParentIdError" style="color:red;font-size:0.95em;">{{ newParentIdError }}</span>
            </div>
            <div class="form-group">
              <label>姓名：</label>
              <input v-model="newParent.name" placeholder="請輸入姓名" />
            </div>
            <div class="form-group">
              <label>性別：</label>
              <select v-model="newParent.gender">
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div class="form-group">
              <label>與幼兒關係：</label>
              <input v-model="newParent.relation" placeholder="如：父親、母親等" />
            </div>
            <div class="form-group">
              <label>職業：</label>
              <input v-model="newParent.job" placeholder="請輸入職業" />
            </div>
            <div class="form-group">
              <label>電話：</label>
              <input v-model="newParent.phone" placeholder="請輸入電話號碼" />
            </div>
            <div class="form-group">
              <label>戶籍地址：</label>
              <input v-model="newParent.householdAddress" placeholder="請輸入戶籍地址" />
            </div>
            <div class="form-group">
              <label>通訊地址：</label>
              <input v-model="newParent.contactAddress" placeholder="請輸入通訊地址" />
            </div>
            <div class="form-group">
              <label>電子信箱：</label>
              <input v-model="newParent.email" type="email" placeholder="請輸入電子信箱" />
            </div>
            <div class="form-group">
              <label>出生年月日：</label>
              <input v-model="newParent.birthday" type="date" />
            </div>
            <div class="form-group">
              <label>是否留停：</label>
              <select v-model="newParent.isLeave">
                <option :value="false">否</option>
                <option :value="true">是</option>
              </select>
            </div>
            <template v-if="newParent.isLeave">
              <div class="form-group">
                <label>留停起：</label>
                <input v-model="newParent.leaveStart" type="date" />
              </div>
              <div class="form-group">
                <label>留停訖：</label>
                <input v-model="newParent.leaveEnd" type="date" />
              </div>
            </template>
          </div>
          <div class="form-actions">
            <button class="save-btn" @click="addParent">新增</button>
            <button class="cancel-btn" @click="closeAddForm">取消</button>
          </div>
        </div>
      </div>
      <!-- 返回按鈕 -->
      <div class="back-section">
        <button class="back-btn" @click="goBack">返回會員中心</button>
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

// 驗證台灣身分證字號
function validateTWId(id) {
  if (!id || typeof id !== 'string') return false
  id = id.toUpperCase()
  const regex = /^[A-Z][12]\d{8}$/
  if (!regex.test(id)) return false
  const letters = 'ABCDEFGHJKLMNPQRSTUVXYWZIO'
  const letterIndex = letters.indexOf(id[0])
  if (letterIndex === -1) return false
  const n1 = Math.floor(letterIndex / 10) + 1
  const n2 = letterIndex % 10
  const nums = [n1, n2]
  for (let i = 1; i < id.length; i++) {
    nums.push(parseInt(id[i], 10))
  }
  // 加權（包含末位檢查碼的 1）
  const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1]
  let sum = 0
  for (let i = 0; i < weights.length; i++) {
    sum += nums[i] * weights[i]
  }
  return sum % 10 === 0
}

// 驗證護照常見格式（1字母+8數字 或 2字母+7數字）
function validatePassport(id) {
  if (!id || typeof id !== 'string') return false
  const upper = id.toUpperCase()
  return /^([A-Z]\d{8}|[A-Z]{2}\d{7})$/.test(upper)
}

function validateIdNumberFlexible(id) {
  if (!id) return true
  return validateTWId(id) || validatePassport(id)
}

// 家長資料
const parents = ref([])
const editIdx = ref(null)
const showAddForm = ref(false)

// 新增家長表單資料
const newParent = ref({
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

// 驗證錯誤訊息
const newParentIdError = ref('')
const editParentIdError = ref('')

// 新增家長身分證/護照驗證
const validateNewParentId = () => {
  const id = newParent.value.idNumber
  newParentIdError.value = validateIdNumberFlexible(id) ? '' : '身分證/護照格式錯誤'
}

// 編輯家長身分證/護照驗證
const validateEditParentId = () => {
  if (editIdx.value === null) {
    editParentIdError.value = ''
    return
  }
  const id = parents.value[editIdx.value]?.idNumber || ''
  editParentIdError.value = validateIdNumberFlexible(id) ? '' : '身分證/護照格式錯誤'
}

// 載入家長資料
const loadParents = () => {
  // 從 localStorage 載入或使用預設資料
  const savedParents = localStorage.getItem('parentData')
  if (savedParents) {
    parents.value = JSON.parse(savedParents)
  } else {
    // 預設資料
    parents.value = [
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
      }
    ]
  }
}

// 儲存家長資料到 localStorage
const saveToStorage = () => {
  localStorage.setItem('parentData', JSON.stringify(parents.value))
}

// 編輯家長
const editParent = (idx) => {
  editIdx.value = idx
}

// 儲存家長資料
const saveParent = () => {
  if (editParentIdError.value) {
    alert(editParentIdError.value)
    return
  }
  saveToStorage()
  editIdx.value = null
  alert('家長資料已儲存')
}

// 取消編輯
const cancelEdit = () => {
  editIdx.value = null
  // 重新載入資料以恢復原始狀態
  loadParents()
}

// 新增家長
const addParent = () => {
  if (!newParent.value.name) {
    alert('請填寫姓名')
    return
  }
  if (newParentIdError.value) {
    alert(newParentIdError.value)
    return
  }
  const parent = {
    ...newParent.value,
    id: Date.now()
  }
  parents.value.push(parent)
  saveToStorage()
  closeAddForm()
  alert('家長資料新增成功')
}

// 刪除家長
const deleteParent = (idx) => {
  if (confirm('確定要刪除此家長資料嗎？')) {
    parents.value.splice(idx, 1)
    saveToStorage()
    alert('家長資料已刪除')
  }
}

// 關閉新增表單
const closeAddForm = () => {
  showAddForm.value = false
  // 重置表單
  newParent.value = {
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

// 返回會員中心
const goBack = () => {
  router.push('/member-center')
}

onMounted(() => {
  loadParents()
})
</script>

<style scoped>
.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: bold;
  color: #555;
}

.form-group input, .form-group select {
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus, .form-group select:focus {
  border-color: #F9AFAE;
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

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

.add-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.add-form-modal {
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.back-section {
  text-align: center;
  margin-top: 32px;
}

.back-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #5a6268;
}

.manage-parents-page {
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

.parents-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 3px solid #F9AFAE;
  padding-bottom: 8px;
}

.section-header h2 {
  color: #333;
  font-size: 1.8rem;
  margin: 0;
}

.add-btn {
  background: #F9AFAE;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #f5a1a1;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.parents-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.parent-card {
  background: #FFF8F6;
  border-radius: 12px;
  padding: 24px;
  border-left: 4px solid #F9AFAE;
}

.parent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.parent-header h3 {
  color: #333;
  font-size: 1.3rem;
  margin: 0;
}

.parent-actions {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.edit-btn {
  background: #F9AFAE;
  color: white;
}

.edit-btn:hover {
  background: #f5a1a1;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
}

.parent-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.detail-row .label {
  font-weight: bold;
  color: #555;
  min-width: 140px;
  flex-shrink: 0;
}

.parent-edit-form, .add-form-modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 2px solid #F9AFAE;
  padding-bottom: 12px;
}

.form-header h3 {
  color: #333;
  font-size: 1.5rem;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>
