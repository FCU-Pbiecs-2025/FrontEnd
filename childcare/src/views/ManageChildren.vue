<template>
  <div class="manage-children-page">
    <div class="page-header">
      <h1>幼兒資料管理</h1>
      <p class="page-description">管理幼兒基本資料、生日等資訊</p>
    </div>

    <div class="content-area">
      <!-- 幼兒資料列表 -->
      <div class="children-section">
        <div class="section-header">
          <h2>幼兒資料</h2>
          <button class="save-btn" @click="showAddForm = true">新增幼兒</button>
        </div>

        <div v-if="children.length === 0" class="no-data">
          <div class="no-data-icon">👶</div>
          <p>目前沒有幼兒資料</p>
          <button class="save-btn" @click="showAddForm = true">新增第一筆資料</button>
        </div>

        <div v-else class="children-list">
          <div v-for="(child, idx) in children" :key="child.id" class="child-card">
            <div v-if="editIdx !== idx" class="child-info">
              <div class="child-header">
                <h3>{{ child.name || '未填寫姓名' }}</h3>
                <div class="child-actions">
                  <button class="edit-btn" @click="editChild(idx)">編輯</button>
                  <button class="delete-btn" @click="deleteChild(idx)">刪除</button>
                </div>
              </div>
              <div class="child-details">
                <div class="detail-row">
                  <span class="label">身分證字號：</span>
                  <span>{{ child.idNumber || '未填寫' }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">性別：</span>
                  <span>{{ child.gender }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">出生日期：</span>
                  <span>{{ child.birthday || '未填寫' }}</span>
                </div>
              </div>
            </div>

            <!-- 編輯表單 -->
            <div v-else class="child-edit-form">
              <div class="form-header">
                <h3>編輯幼兒資料</h3>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label>姓名：</label>
                  <input v-model="child.name" placeholder="請輸入幼兒姓名" />
                </div>
                <div class="form-group">
                  <label>身分證字號：</label>
                  <input v-model="child.idNumber" placeholder="請輸入身分證字號" @blur="validateChildId(idx)" />
                  <span v-if="childIdErrors[idx]" class="error">{{ childIdErrors[idx] }}</span>
                </div>
                <div class="form-group">
                  <label>性別：</label>
                  <select v-model="child.gender">
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>出生日期：</label>
                  <input v-model="child.birthday" type="date" />
                </div>
              </div>
              <div class="form-actions">
                <button class="save-btn" @click="saveChild(idx)">儲存</button>
                <button class="cancel-btn" @click="cancelEdit">取消</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 新增幼兒表單 -->
      <div v-if="showAddForm" class="add-form-overlay">
        <div class="add-form-modal">
          <div class="form-header">
            <h3>新增幼兒資料</h3>
            <button class="close-btn" @click="closeAddForm">×</button>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>姓名：</label>
              <input v-model="newChild.name" placeholder="請輸入幼兒姓名" />
            </div>
            <div class="form-group">
              <label>身分證字號：</label>
              <input v-model="newChild.idNumber" placeholder="請輸入身分證字號" @blur="validateNewChildId" />
              <span v-if="newChildIdError" class="error">{{ newChildIdError }}</span>
            </div>
            <div class="form-group">
              <label>性別：</label>
              <select v-model="newChild.gender">
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div class="form-group">
              <label>出生日期：</label>
              <input v-model="newChild.birthday" type="date" />
            </div>
          </div>
          <div class="form-actions">
            <button class="save-btn" @click="addChild">新增</button>
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

const router = useRouter()

// 幼兒資料
const children = ref([])
const editIdx = ref(null)
const showAddForm = ref(false)

// 新增幼兒表單資料（僅四欄位）
const newChild = ref({
  name: '',
  idNumber: '',
  gender: '男',
  birthday: ''
})

// 身分證驗證錯誤訊息
const childIdErrors = ref([])
const newChildIdError = ref('')

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

// 載入幼兒資料（僅四欄位）
const loadChildren = () => {
  const savedChildren = localStorage.getItem('childrenData')
  if (savedChildren) {
    children.value = JSON.parse(savedChildren)
  } else {
    children.value = [
      {
        id: 1,
        name: '王小寶',
        idNumber: '',
        gender: '男',
        birthday: '2022-05-01'
      }
    ]
  }
  childIdErrors.value = new Array(children.value.length).fill('')
}

// 儲存幼兒資料到 localStorage
const saveToStorage = () => {
  localStorage.setItem('childrenData', JSON.stringify(children.value))
}

// 驗證（離開欄位時觸發）
const validateChildId = (idx) => {
  const id = children.value[idx]?.idNumber || ''
  childIdErrors.value[idx] = id ? (validateTWId(id) ? '' : '身分證字號格式錯誤') : ''
}

const validateNewChildId = () => {
  const id = newChild.value.idNumber || ''
  newChildIdError.value = id ? (validateTWId(id) ? '' : '身分證字號格式錯誤') : ''
}

// 編輯幼兒
const editChild = (idx) => {
  editIdx.value = idx
  if (childIdErrors.value[idx] === undefined) childIdErrors.value[idx] = ''
}

// 儲存幼兒資料（含驗證）
const saveChild = (idx) => {
  if (!children.value[idx].name) {
    alert('請填寫幼兒姓名')
    return
  }
  validateChildId(idx)
  if (childIdErrors.value[idx]) {
    alert(childIdErrors.value[idx])
    return
  }
  saveToStorage()
  editIdx.value = null
  alert('幼兒資料已儲存')
}

// 取消編輯
const cancelEdit = () => {
  editIdx.value = null
  loadChildren()
}

// 新增幼兒（含驗證）
const addChild = () => {
  if (!newChild.value.name) {
    alert('請填寫幼兒姓名')
    return
  }
  validateNewChildId()
  if (newChildIdError.value) {
    alert(newChildIdError.value)
    return
  }
  const child = { ...newChild.value, id: Date.now() }
  children.value.push(child)
  childIdErrors.value.push('')
  saveToStorage()
  closeAddForm()
  alert('幼兒資料新增成功')
}

// 刪除幼兒
const deleteChild = (idx) => {
  if (confirm('確定要刪除此幼兒資料嗎？')) {
    children.value.splice(idx, 1)
    childIdErrors.value.splice(idx, 1)
    saveToStorage()
    alert('幼兒資料已刪除')
  }
}

// 關閉新增表單
const closeAddForm = () => {
  showAddForm.value = false
  newChild.value = {
    name: '',
    idNumber: '',
    gender: '男',
    birthday: ''
  }
  newChildIdError.value = ''
}

// 返回會員中心
const goBack = () => {
  router.push('/member-center')
}

onMounted(() => {
  loadChildren()
})
</script>

<style scoped>
.error {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 4px;
  display: block;
}

.manage-children-page {
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
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

.children-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
}

.children-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.child-card {
  background: #FFF8F6;
  border-radius: 12px;
  padding: 24px;
  border-left: 4px solid #F9AFAE;
  margin-bottom: 20px;
}

.child-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.child-header h3 {
  color: #333;
  font-size: 1.3rem;
  margin: 0;
}

.child-actions {
  display: flex;
  gap: 8px;
}

.child-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
}

.detail-row {
  display: flex;
  padding: 8px 0;
}

.detail-row .label {
  font-weight: 600;
  color: #555;
  min-width: 120px;
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

.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 20px;
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
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #F9AFAE;
}

.form-header h3 {
  color: #333;
  font-size: 1.5rem;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 600;
  color: #555;
  font-size: 0.95rem;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #F9AFAE;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.child-edit-form {
  background: white;
  border-radius: 8px;
  padding: 20px;
}
</style>
