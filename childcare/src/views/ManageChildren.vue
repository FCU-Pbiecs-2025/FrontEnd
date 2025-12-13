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
          <div class="no-data-icon"></div>
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
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/auth.js'
import { getUserFamilyInfo } from '../api/user.js'
import { createChildInfo, updateChildInfo, deleteChildInfo } from '../api/childInfo.js'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 幼兒資料
const children = ref([])
const editIdx = ref(null)
const showAddForm = ref(false)

// 儲存 familyInfoId（從 authStore 或查詢結果中取得）
const currentFamilyInfoId = ref(null)

// 🔑 儲存目標用戶 ID（用於管理員代表民眾操作時）
const targetUserID = ref(null)

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

// 生成 UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 載入幼兒資料（僅四欄位）
const loadChildren = async () => {
  try {
    // 確保用戶已登入
    if (!authStore.isLoggedIn) {
      console.warn('用戶未登入')
      return
    }

    // 🔑 優先檢查路由參數中的 userID（用於管理員進入民眾帳號的場景）
    let targetUserIDValue = route.query.userID || route.params.userID || authStore.user?.UserID
    console.log('🔍 [loadChildren] 路由 query.userID:', route.query.userID)
    console.log('🔍 [loadChildren] 路由 params.userID:', route.params.userID)
    console.log('🔍 [loadChildren] 使用的 targetUserID:', targetUserIDValue)

    // 🔑 保存目標用戶 ID 到 ref，供後續操作使用
    targetUserID.value = targetUserIDValue

    if (!targetUserIDValue) {
      console.error('❌ 無法從路由參數或 authStore 獲取 userID')
      return
    }

    console.log('========== ManageChildren: 從路由參數或 authStore 取得用戶信息 ==========')
    console.log('targetUserIDValue:', targetUserIDValue)

    // 調用 API 獲取家庭信息
    console.log('========== 開始調用 getUserFamilyInfo API ==========')
    const response = await getUserFamilyInfo(targetUserIDValue)

    if (!response || !response.data) {
      console.error('❌ API 回應為空')
      return
    }

    const familyData = response.data
    console.log('========== ManageChildren: 家庭數據結構分析 ==========')
    console.log('familyData 完整對象:', familyData)
    console.log('familyData.children 內容:', familyData.children)

    // 🔑 從查詢結果中提取 familyInfoID（備用方案）
    let extractedFamilyInfoId = null
    if (familyData.familyInfoID) {
      extractedFamilyInfoId = familyData.familyInfoID
      console.log('🔑 [loadChildren] 從查詢結果中提取的 familyInfoID:', extractedFamilyInfoId)
      currentFamilyInfoId.value = extractedFamilyInfoId
    }

    // 映射 API 返回的幼兒數據到組件變量
    if (Array.isArray(familyData.children) && familyData.children.length > 0) {
      console.log('========== 開始映射幼兒資料 ==========')
      const mappedChildren = familyData.children.map((child, idx) => {
        const mappedChild = {
          id: idx + 1,
          childID: child.childID || '',
          idNumber: child.nationalID || '',
          name: child.name || '',
          gender: child.gender === false ? '女' : '男',
          birthday: child.birthDate || ''
        }
        console.log(`映射幼兒 #${idx + 1}:`, mappedChild)
        return mappedChild
      })

      children.value = mappedChildren
      childIdErrors.value = new Array(mappedChildren.length).fill('')
      console.log('✅ 已從 API 載入幼兒資料:', children.value)
    } else {
      console.warn('⚠️ 沒有幼兒資料或 children 不是陣列')
      // 初始化空陣列
      children.value = []
      childIdErrors.value = []
    }
  } catch (error) {
    console.error('❌ 載入幼兒信息失敗:', error)
    // 載入失敗時初始化空陣列
    children.value = []
    childIdErrors.value = []
  }
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

// 計算年齡
const getAge = (birthday) => {
  if (!birthday) return null
  const today = new Date()
  const birth = new Date(birthday)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// 儲存幼兒資料（含驗證）
const saveChild = async (idx) => {
  if (!children.value[idx].name) {
    alert('請填寫幼兒姓名')
    return
  }
  validateChildId(idx)
  if (childIdErrors.value[idx]) {
    alert(childIdErrors.value[idx])
    return
  }
  // 年齡檢查
  const age = getAge(children.value[idx].birthday)
  if (age !== null && age >= 3) {
    alert('本服務僅提供三歲以下幼童使用')
    return
  }

  try {
    console.log('========== 開始更新幼兒資料 ==========')
    console.log('🔑 [saveChild] 當前目標用戶 ID:', targetUserID.value)
    console.log('🔑 [saveChild] 當前 FamilyInfoID:', currentFamilyInfoId.value)
    console.log('🔑 [saveChild] authStore.user.FamilyInfoID:', authStore.user?.FamilyInfoID)

    const child = children.value[idx]
    const childID = child.childID

    if (!childID) {
      console.error('❌ 缺少幼兒 ID，無法更新')
      return
    }

    // 🔑 確保使用正確的 familyInfoID
    const familyInfoID = currentFamilyInfoId.value ||
                         authStore.user?.FamilyInfoID ||
                         authStore.user?.familyInfoID ||
                         authStore.user?.familyInfoId

    console.log('✅ [saveChild] 最終確定使用的 FamilyInfoID:', familyInfoID)

    if (!familyInfoID) {
      alert('❌ 無法取得家庭資訊 ID，請重新載入頁面')
      return
    }

    // 映射前端資料到 API 格式
    const updatePayload = {
      childID: childID,
      familyInfoID: familyInfoID,
      nationalID: child.idNumber,
      name: child.name,
      gender: child.gender === '男',
      birthDate: child.birthday,
      householdAddress: ''
    }

    console.log('📤 [saveChild] 準備發送的幼兒資訊:', JSON.stringify(updatePayload, null, 2))

    // 調用 API 更新幼兒
    const response = await updateChildInfo(childID, updatePayload)

    console.log('✅ API 更新成功:', response)

    saveToStorage()
    editIdx.value = null
    alert('✅ 幼兒資料已更新')
  } catch (error) {
    console.error('❌ 更新幼兒失敗:', error)
    alert(`❌ 更新幼兒失敗: ${error.message || '未知錯誤'}`)
  }
}

// 取消編輯
const cancelEdit = () => {
  editIdx.value = null
  loadChildren()
}

// 新增幼兒（含驗證）
const addChild = async () => {
  // ✅ 新增：完整的欄位驗證
  if (!newChild.value.name || newChild.value.name.trim() === '') {
    alert('❌ 請填寫幼兒姓名')
    return
  }

  if (!newChild.value.idNumber || newChild.value.idNumber.trim() === '') {
    alert('❌ 請填寫身分證字號')
    return
  }

  validateNewChildId()
  if (newChildIdError.value) {
    alert('❌ ' + newChildIdError.value)
    return
  }

  if (!newChild.value.gender || newChild.value.gender.trim() === '') {
    alert('❌ 請選擇性別')
    return
  }

  if (!newChild.value.birthday || newChild.value.birthday.trim() === '') {
    alert('❌ 請填寫出生日期')
    return
  }
  // 年齡檢查
  const age = getAge(newChild.value.birthday)
  if (age !== null && age >= 3) {
    alert('本服務僅提供三歲以下幼童使用')
    return
  }

  try {
    console.log('========== 開始新增幼兒資料到後端 ==========')

    // 生成幼兒 ID
    const childID = generateUUID()

    // 🔑 確保使用正確的 familyInfoId
    const familyInfoId = currentFamilyInfoId.value ||
                         authStore.user?.FamilyInfoID ||
                         authStore.user?.familyInfoID ||
                         authStore.user?.familyInfoId

    console.log('🔑 [addChild] 當前目標用戶 ID:', targetUserID.value)
    console.log('🔑 [addChild] 使用的 FamilyInfoID:', familyInfoId)
    console.log('🔑 [addChild] currentFamilyInfoId.value:', currentFamilyInfoId.value)

    if (!familyInfoId) {
      console.error('❌ 無法取得家庭資訊 ID，請重新登入')
      return
    }

    // 映射前端資料到 API 格式
    const childInfoPayload = {
      childID: childID,
      familyInfoID: familyInfoId,
      nationalID: newChild.value.idNumber,
      name: newChild.value.name,
      gender: newChild.value.gender === '男',
      birthDate: newChild.value.birthday,
      householdAddress: ''
    }

    console.log('🔑 [addChild] familyInfoID:', familyInfoId)
    console.log('📤 [addChild] 準備發送的幼兒資訊:', JSON.stringify(childInfoPayload, null, 2))

    // 調用 API 新增幼兒
    const response = await createChildInfo(childInfoPayload)

    console.log('✅ API 回應成功:', response)

    // 新增至本地列表（包含 API 返回的資訊，特別是 childID）
    const childToAdd = {
      id: children.value.length + 1,
      childID: response.childID || childID,
      name: newChild.value.name,
      idNumber: newChild.value.idNumber,
      gender: newChild.value.gender,
      birthday: newChild.value.birthday
    }
    children.value.push(childToAdd)
    childIdErrors.value.push('')

    // 儲存並重置
    saveToStorage()
    closeAddForm()
    alert('✅ 幼兒資料已成功新增')
  } catch (error) {
    console.error('❌ 新增幼兒失敗:', error)
    alert(`❌ 新增幼兒失敗: ${error.message}`)
  }
}

// 刪除幼兒
const deleteChild = async (idx) => {
  const target = children.value[idx]
  if (!target) return

  if (!confirm(`確定要刪除 ${target.name} 的資料嗎？`)) return

  try {
    // 確認有後端的 childID 可用
    const backendId = target.childID
    if (!backendId) {
      console.error('❌ 缺少幼兒 ID，無法刪除')
      return
    }

    console.log('========== 開始刪除幼兒資料 ==========')
    console.log('childID:', backendId)

    // 調用 API 刪除幼兒
    await deleteChildInfo(backendId)

    console.log('✅ API 刪除成功')

    // 刪除成功後更新 UI
    children.value.splice(idx, 1)
    childIdErrors.value.splice(idx, 1)
    saveToStorage()
    console.log('✅ 幼兒資料已刪除')
  } catch (error) {
    console.error('❌ 刪除幼兒失敗:', error)
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
  router.back()
}

onMounted(async () => {
  await loadChildren()
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