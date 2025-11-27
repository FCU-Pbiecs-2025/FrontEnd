<template>
  <div class="manage-parents-page">
    <div class="page-header">
      <h1>家長資料管理</h1>
      <p class="page-description">管理家長基本資料、聯絡方式等資訊</p>
    </div>

    <div class="content-area">
      <!-- 家長資料列表 -->
      <div class="parents-section">
        <div class="section-header">
          <h2>家長資料</h2>
          <button class="save-btn" @click="showAddForm = true">新增家長</button>
        </div>

        <div v-if="parents.length === 0" class="no-data">
          <div class="no-data-icon">👨‍👩‍👧</div>
          <p>目前沒有家長資料</p>
          <button class="save-btn" @click="showAddForm = true">新增第一筆資料</button>
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
                  <span class="label">身分證字號：</span>
                  <span>{{ parent.idNumber || '未填寫' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">關係：</span>
                  <span>{{ parent.relation || '未填寫' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">性別：</span>
                  <span>{{ parent.gender }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">電話：</span>
                  <span>{{ parent.phone || '未填寫' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Email：</span>
                  <span>{{ parent.email || '未填寫' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">職業：</span>
                  <span>{{ parent.job || '未填寫' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">出生日期：</span>
                  <span>{{ parent.birthday || '未填寫' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">戶籍地址：</span>
                  <span>{{ parent.householdAddress || '未填寫' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">聯絡地址：</span>
                  <span>{{ parent.contactAddress || '未填寫' }}</span>
                </div>
              </div>
            </div>

            <!-- 編輯表單 -->
            <div v-else class="parent-edit-form">
              <div class="form-header">
                <h3>編輯家長資料</h3>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label>姓名：</label>
                  <input v-model="parent.name" placeholder="請輸入家長姓名" />
                </div>
                <div class="form-group">
                  <label>身分證字號：</label>
                  <input v-model="parent.idNumber" placeholder="請輸入身分證字號" @blur="validateParentId(idx)" />
                  <span v-if="parentIdErrors[idx]" class="error">{{ parentIdErrors[idx] }}</span>
                </div>
                <div class="form-group">
                  <label>關係：</label>
                  <input v-model="parent.relation" placeholder="例：父親、母親" />
                </div>
                <div class="form-group">
                  <label>性別：</label>
                  <select v-model="parent.gender">
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>電話：</label>
                  <input v-model="parent.phone" placeholder="請輸入電話號碼" />
                </div>
                <div class="form-group">
                  <label>Email：</label>
                  <input v-model="parent.email" type="email" placeholder="請輸入電子郵件" />
                </div>
                <div class="form-group">
                  <label>職業：</label>
                  <input v-model="parent.job" placeholder="請輸入職業" />
                </div>
                <div class="form-group">
                  <label>出生日期：</label>
                  <input v-model="parent.birthday" type="date" />
                </div>
                <div class="form-group">
                  <label>戶籍地址：</label>
                  <input v-model="parent.householdAddress" placeholder="請輸入戶籍地址" />
                </div>
                <div class="form-group">
                  <label>聯絡地址：</label>
                  <input v-model="parent.contactAddress" placeholder="請輸入聯絡地址" />
                </div>
              </div>
              <div class="form-actions">
                <button class="save-btn" @click="saveParent(idx)">儲存</button>
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
              <label>姓名：</label>
              <input v-model="newParent.name" placeholder="請輸入家長姓名" />
            </div>
            <div class="form-group">
              <label>身分證字號：</label>
              <input v-model="newParent.idNumber" placeholder="請輸入身分證字號" @blur="validateNewParentId" />
              <span v-if="newParentIdError" class="error">{{ newParentIdError }}</span>
            </div>
            <div class="form-group">
              <label>關係：</label>
              <input v-model="newParent.relation" placeholder="例：父親、母親" />
            </div>
            <div class="form-group">
              <label>性別：</label>
              <select v-model="newParent.gender">
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div class="form-group">
              <label>電話：</label>
              <input v-model="newParent.phone" placeholder="請輸入電話號碼" />
            </div>
            <div class="form-group">
              <label>Email：</label>
              <input v-model="newParent.email" type="email" placeholder="請輸入電子郵件" />
            </div>
            <div class="form-group">
              <label>職業：</label>
              <input v-model="newParent.job" placeholder="請輸入職業" />
            </div>
            <div class="form-group">
              <label>出生日期：</label>
              <input v-model="newParent.birthday" type="date" />
            </div>
            <div class="form-group">
              <label>戶籍地址：</label>
              <input v-model="newParent.householdAddress" placeholder="請輸入戶籍地址" />
            </div>
            <div class="form-group">
              <label>聯絡地址：</label>
              <input v-model="newParent.contactAddress" placeholder="請輸入聯絡地址" />
            </div>
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
import { getUserFamilyInfo } from '../api/user.js'

const router = useRouter()
const authStore = useAuthStore()

// 家長資料
const parents = ref([])
const editIdx = ref(null)
const showAddForm = ref(false)

// 新增家長表單資料
const newParent = ref({
  name: '',
  idNumber: '',
  relation: '',
  gender: '女',
  phone: '',
  email: '',
  job: '',
  birthday: '',
  householdAddress: '',
  contactAddress: ''
})

// 身分證驗證錯誤訊息
const parentIdErrors = ref([])
const newParentIdError = ref('')

// 台灣身分證驗證
function validateTWId(id) {
  if (!id || typeof id !== 'string') return false
  const upper = id.toUpperCase()
  const regex = /^[A-Z][12]\d{8}$/
  if (!regex.test(upper)) return false
  const letters = 'ABCDEFGHJKLMNPQRSTUVXYWZIO'
  const letterIndex = letters.indexOf(upper[0])
  if (letterIndex === -1) return false
  const n1 = Math.floor(letterIndex / 10) + 1
  const n2 = letterIndex % 10
  const nums = [n1, n2]
  for (let i = 1; i < upper.length; i++) nums.push(parseInt(upper[i], 10))
  const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1]
  let sum = 0
  for (let i = 0; i < weights.length; i++) sum += nums[i] * weights[i]
  return sum % 10 === 0
}

// 載入家長資料
const loadParents = async () => {
  try {
    // 確保用戶已登入，從 authStore 取得 userID
    if (!authStore.isLoggedIn) {
      console.warn('用戶未登入')
      return
    }

    const userID = authStore.user?.UserID
    if (!userID) {
      console.error('無法從 authStore 獲取 userID')
      return
    }

    console.log('========== ManageParents: 從 authStore 取得用戶信息 ==========')
    console.log('authStore.user:', authStore.user)
    console.log('取得的 userID:', userID)

    // 調用 API 獲取家庭信息
    console.log('========== 開始調用 getUserFamilyInfo API ==========')
    const response = await getUserFamilyInfo(userID)

    if (!response || !response.data) {
      console.error('❌ API 回應為空')
      // 如果 API 失敗，使用預設資料
      parents.value = [
        {
          id: 1,
          name: '王父親',
          idNumber: '',
          relation: '父親',
          gender: '男',
          phone: '',
          email: '',
          job: '',
          birthday: '',
          householdAddress: '',
          contactAddress: ''
        }
      ]
      return
    }

    const familyData = response.data
    console.log('========== ManageParents: 家庭數據結構分析 ==========')
    console.log('familyData 完整對象:', familyData)
    console.log('familyData.parents 內容:', familyData.parents)

    // 映射 API 返回的家長數據到組件變量
    if (Array.isArray(familyData.parents) && familyData.parents.length > 0) {
      console.log('========== 開始映射家長資料 ==========')
      const mappedParents = familyData.parents.map((parent, idx) => {
        const mappedParent = {
          id: idx + 1,
          parentID: parent.parentID || '',
          idNumber: parent.nationalID || '',
          name: parent.name || '',
          relation: parent.relationship || '',
          gender: parent.gender === false ? '女' : '男',
          phone: parent.phoneNumber || '',
          email: parent.email || '',
          job: parent.occupation || '',
          birthday: parent.birthDate || '',
          householdAddress: parent.householdAddress || '',
          contactAddress: parent.mailingAddress || ''
        }
        console.log(`映射家長 #${idx + 1}:`, mappedParent)
        return mappedParent
      })

      parents.value = mappedParents
      parentIdErrors.value = new Array(mappedParents.length).fill('')
      console.log('✅ 已從 API 載入家長資料:', parents.value)
    } else {
      console.warn('⚠️ 沒有家長資料或 parents 不是陣列')
      // 使用預設資料
      parents.value = [
        {
          id: 1,
          name: '王父親',
          idNumber: '',
          relation: '父親',
          gender: '男',
          phone: '',
          email: '',
          job: '',
          birthday: '',
          householdAddress: '',
          contactAddress: ''
        }
      ]
      parentIdErrors.value = ['']
    }
  } catch (error) {
    console.error('❌ 載入家長信息失敗:', error)
    // 載入失敗時使用預設資料
    parents.value = [
      {
        id: 1,
        name: '王父親',
        idNumber: '',
        relation: '父親',
        gender: '男',
        phone: '',
        email: '',
        job: '',
        birthday: '',
        householdAddress: '',
        contactAddress: ''
      }
    ]
    parentIdErrors.value = ['']
  }
}

// 儲存家長資料到 localStorage
const saveToStorage = () => {
  localStorage.setItem('parentsData', JSON.stringify(parents.value))
}

// 驗證（離開欄位時觸發）
const validateParentId = (idx) => {
  const id = parents.value[idx]?.idNumber || ''
  parentIdErrors.value[idx] = id ? (validateTWId(id) ? '' : '身分證字號格式錯誤') : ''
}

const validateNewParentId = () => {
  const id = newParent.value.idNumber || ''
  newParentIdError.value = id ? (validateTWId(id) ? '' : '身分證字號格式錯誤') : ''
}

// 編輯家長
const editParent = (idx) => {
  editIdx.value = idx
  if (parentIdErrors.value[idx] === undefined) parentIdErrors.value[idx] = ''
}

// 取消編輯
const cancelEdit = () => {
  editIdx.value = null
}

// 儲存家長資料（含驗證）
const saveParent = (idx) => {
  if (!parents.value[idx].name) {
    alert('請填寫家長姓名')
    return
  }
  validateParentId(idx)
  if (parentIdErrors.value[idx]) {
    alert(parentIdErrors.value[idx])
    return
  }
  saveToStorage()
  editIdx.value = null
  alert('家長資料已儲存')
}

// 刪除家長
const deleteParent = (idx) => {
  if (confirm(`確定要刪除 ${parents.value[idx].name} 的資料嗎？`)) {
    parents.value.splice(idx, 1)
    parentIdErrors.value.splice(idx, 1)
    saveToStorage()
    alert('家長資料已刪除')
  }
}

// 新增家長
const addParent = () => {
  if (!newParent.value.name) {
    alert('請填寫家長姓名')
    return
  }
  validateNewParentId()
  if (newParentIdError.value) {
    alert(newParentIdError.value)
    return
  }

  // 新增至列表
  const parentToAdd = {
    id: parents.value.length + 1,
    ...newParent.value
  }
  parents.value.push(parentToAdd)
  parentIdErrors.value.push('')

  // 儲存並重置
  saveToStorage()
  closeAddForm()
}

// 關閉新增表單
const closeAddForm = () => {
  showAddForm.value = false
  newParent.value = {
    name: '',
    idNumber: '',
    relation: '',
    gender: '女',
    phone: '',
    email: '',
    job: '',
    birthday: '',
    householdAddress: '',
    contactAddress: ''
  }
  newParentIdError.value = ''
}

// 返回會員中心
const goBack = () => {
  router.push('/member-center')
}

// 在組件掛載時載入資料
onMounted(() => {
  console.log('========== ManageParents.vue 已掛載 ==========')
  loadParents()
})
</script>

<style scoped>
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

.no-data {
  text-align: center;
  padding: 60px 20px;
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.no-data p {
  color: #999;
  font-size: 1rem;
  margin: 16px 0;
}

.parents-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.parent-card {
  background: #FFF8F6;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #FFE0DB;
}

.parent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.parent-header h3 {
  font-size: 1.4rem;
  color: #333;
  margin: 0;
}

.parent-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}

.edit-btn {
  background: #E8F4FF;
  color: #0066CC;
}

.edit-btn:hover {
  background: #D4E8FF;
}

.delete-btn {
  background: #FFE8E8;
  color: #CC0000;
}

.delete-btn:hover {
  background: #FFD4D4;
}

.parent-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  color: #555;
}

.detail-row {
  display: flex;
  gap: 8px;
}

.detail-row .label {
  font-weight: 600;
  color: #333;
  min-width: 80px;
}

.parent-edit-form {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.form-header {
  margin-bottom: 20px;
  border-bottom: 2px solid #F9AFAE;
  padding-bottom: 10px;
}

.form-header h3 {
  font-size: 1.2rem;
  color: #333;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: 1px solid #DDD;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #F9AFAE;
  box-shadow: 0 0 0 2px rgba(249, 175, 174, 0.1);
}

.error {
  color: #CC0000;
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save-btn, .cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
}

.save-btn {
  background: #F9AFAE;
  color: white;
}

.save-btn:hover {
  background: #f5a1a1;
}

.cancel-btn {
  background: #E8E8E8;
  color: #333;
}

.cancel-btn:hover {
  background: #D4D4D4;
}

.add-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.add-form-modal {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.back-section {
  text-align: center;
  margin-top: 40px;
}

.back-btn {
  padding: 12px 32px;
  background: #F9AFAE;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}

.back-btn:hover {
  background: #f5a1a1;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.8rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .parent-details {
    grid-template-columns: 1fr;
  }
}
</style>

