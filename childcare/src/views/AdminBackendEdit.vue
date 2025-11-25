<template>
  <div class="backend-edit-page">
    <!-- 加載中提示 -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>正在加載帳號資料...</p>
    </div>

    <div v-else class="backend-edit-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/admin-settings-male.png" class="icon" alt="icon" />
        <span class="main-title">後台帳號管理</span>
      </div>
      <div class="tab-row">
        <span class="tab-title">{{ isNew ? '新增後台帳號' : '編輯後台帳號' }}</span>
      </div>
      <div class="edit-form-card">
        <div class="form-row">
          <label class="form-label">帳號 ID：</label>
          <input v-model="account.id" class="form-input" :readonly="!isNew" />
        </div>
        <div class="form-row">
          <label class="form-label">密碼：</label>
          <input v-model="account.password" type="password" class="form-input" :placeholder="isNew ? '請輸入密碼' : '若不修改可留空'" />
        </div>
        <div class="form-row">
          <label class="form-label">機構名稱：</label>
          <select v-model="account.org" class="form-input">
            <option value="">請選擇機構</option>
            <option value="市政府">市政府</option>
            <option v-for="inst in remoteInstitutions" :key="inst.id || inst.institutionName" :value="inst.institutionName">
              {{ inst.institutionName }}
            </option>
          </select>
          <div v-if="!remoteInstitutions.length" style="color:#e35d6a; font-size:0.95em; margin-top:4px;">未取得 API 資料，請檢查後端或 Console</div>
        </div>
        <div class="form-row">
          <label class="form-label">權限設定：</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" value="super_admin" v-model="account.role" />
              <span>管理員</span>
            </label>
            <label class="radio-label">
              <input type="radio" value="admin" v-model="account.role" />
              <span>機構人員</span>
            </label>
          </div>
        </div>
        <div class="form-row">
          <label class="form-label">帳號狀態：</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" value="enable" v-model="account.right" />
              <span>啟用</span>
            </label>
            <label class="radio-label">
              <input type="radio" value="suspended" v-model="account.right" />
              <span>停用</span>
            </label>
          </div>
        </div>
      </div>
      <div class="bottom-row">
        <button class="btn ghost" @click="cancel" :disabled="isSaving">返回</button>
        <button class="btn primary" @click="save" :disabled="isSaving">
          {{ isSaving ? '儲存中...' : '儲存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserById, updateUser, createUser } from '@/api/account.js'

const route = useRoute()
const router = useRouter()

// 從路由參數獲取帳號 ID，如果是新增頁面則生成新 ID
const accountId = computed(() => {
  if (route.name === 'AdminBackendNew') {
    return 'admin' + Date.now()
  }
  return route.params.id || ''
})

const account = ref({ id: '', password: '', org: '', role: 'admin', right: 'enable' })
const remoteInstitutions = ref([])
const isLoading = ref(false)
const isSaving = ref(false)

const isNew = computed(() => route.name === 'AdminBackendNew')

// 從 API 載入帳號資料
const loadAccountFromAPI = async (userId) => {
  try {
    isLoading.value = true
    const userData = await getUserById(userId)

    console.log('========== 載入使用者資料 ==========')
    console.log('API 回傳完整資料:', userData)
    console.log('institutionID:', userData.institutionID)
    console.log('密碼:', userData.password)

    // 根據 institutionID 從機構列表查找機構名稱
    let orgName = ''
    if (userData.institutionID && remoteInstitutions.value.length > 0) {
      console.log('開始從機構列表查找機構名稱...')

      const matchedInst = remoteInstitutions.value.find(
        inst => inst.institutionID === userData.institutionID || inst.id === userData.institutionID
      )

      if (matchedInst) {
        orgName = matchedInst.institutionName
        console.log('✓ 找到匹配的機構:', matchedInst)
        console.log('✓ 機構名稱:', orgName)
      } else {
        console.warn('✗ 在機構列表中找不到匹配的機構')
        console.warn('查找的 institutionID:', userData.institutionID)
      }
    } else if (userData.institutionName) {
      // 如果 API 直接回傳 institutionName（備用）
      orgName = userData.institutionName
      console.log('使用 API 回傳的 institutionName:', orgName)
    }

    // 映射 API 資料到表單
    account.value = {
      id: userData.account || '',
      password: userData.password || '', // 顯示密碼（加密後的）
      org: orgName,
      role: mapPermissionTypeToRole(userData.permissionType),
      right: userData.accountStatus === 1 ? 'enable' : 'suspended',
      // 保存完整的 API 資料以便儲存時使用
      _apiData: userData
    }

    console.log('映射後的表單資料:', account.value)
    console.log('表單機構名稱:', account.value.org)
    console.log('========== 載入完成 ==========')
  } catch (error) {
    console.error('載入帳號資料失敗:', error)
    // API 失敗時嘗試從 localStorage 載入
    loadAccountFromLocalStorage(userId)
  } finally {
    isLoading.value = false
  }
}

// 將 permissionType 映射為 role
const mapPermissionTypeToRole = (permissionType) => {
  // 1 = 管理員 (最高權限)
  // 2 = 機構人員 (管理員)
  if (permissionType === 1) return 'super_admin'
  if (permissionType === 2) return 'admin'
  return 'admin'
}

// load stored backend accounts from localStorage (key: backendAccounts) - fallback
const loadAccountFromLocalStorage = (id) => {
  const stored = JSON.parse(localStorage.getItem('backendAccounts') || '{}')
  if (stored[id]) {
    account.value = { ...stored[id], password: '' }
  } else {
    // 如果找不到，初始化為新帳號
    account.value = { id: id, password: '', org: '', role: 'admin', right: 'enable' }
  }
}

const fetchRemoteInstitutions = async () => {
  try {
    const res = await fetch('http://localhost:8080/institutions')
    if (!res.ok) {
      console.error('fetch institutions failed', res.status)
      return
    }
    const data = await res.json()
    console.log('API回傳:', data)
    let arr = []
    if (Array.isArray(data)) {
      arr = data
    } else if (Array.isArray(data.data)) {
      arr = data.data
    } else if (Array.isArray(data.list)) {
      arr = data.list
    }
    remoteInstitutions.value = arr.filter(x => x && x.institutionName)
  } catch (e) {
    console.error('error fetching institutions', e)
  }
}

onMounted(async () => {
  // 先載入機構列表
  await fetchRemoteInstitutions()

  if (isNew.value) {
    // 新增模式：初始化空白表單
    account.value.id = accountId.value
  } else {
    // 編輯模式：從 API 載入資料
    if (accountId.value) {
      await loadAccountFromAPI(accountId.value)
    }
  }
})

// 將 role 映射回 permissionType
const mapRoleToPermissionType = (role) => {
  if (role === 'super_admin') return 1  // 管理員
  if (role === 'admin') return 2        // 機構人員
  return 2
}

const save = async () => {
  // 驗證
  if (!account.value.id) {
    alert('帳號 ID 缺失')
    return
  }

  if (!account.value.org) {
    alert('請輸入機構名稱')
    return
  }

  if (isNew.value && !account.value.password) {
    alert('新增帳號時必須設定密碼')
    return
  }

  try {
    isSaving.value = true

    if (isNew.value) {
      // 新增模式：使用 createUser API

      // 根據機構名稱找到對應的 institutionID
      let institutionID = null
      if (account.value.org) {
        const matchedInst = remoteInstitutions.value.find(
          inst => inst.institutionName === account.value.org
        )
        if (matchedInst) {
          institutionID = matchedInst.institutionID || matchedInst.id
          console.log('找到匹配的機構 ID:', institutionID)
        } else {
          console.warn('找不到對應的機構 ID')
          alert('找不到對應的機構，請重新選擇')
          return
        }
      }

      // 準備新增資料
      const newUserData = {
        account: account.value.id,
        password: account.value.password, // 後端會進行加密
        accountStatus: account.value.right === 'enable' ? 1 : 0,
        permissionType: mapRoleToPermissionType(account.value.role),
        institutionID: institutionID,
        // 以下欄位使用預設值，後續可根據需求調整
        name: account.value.id, // 預設使用帳號作為名稱
        gender: true,
        phoneNumber: '',
        mailingAddress: '',
        email: '',
        birthDate: '1990-01-01',
        nationalID: ''
      }

      console.log('========== 準備新增資料 ==========')
      console.log('新增資料:', newUserData)
      console.log('機構名稱:', account.value.org)
      console.log('機構ID:', institutionID)

      // 呼叫 POST API 新增使用者
      const result = await createUser(newUserData)

      console.log('========== 新增成功 ==========')
      console.log('新增結果:', result)
      alert('新增成功！')

      // 同時更新 localStorage（保持相容性）
      const stored = JSON.parse(localStorage.getItem('backendAccounts') || '{}')
      stored[account.value.id] = {
        id: account.value.id,
        org: account.value.org,
        role: account.value.role,
        right: account.value.right,
        password: account.value.password
      }
      localStorage.setItem('backendAccounts', JSON.stringify(stored))

      // 返回列表頁
      router.push({ name: 'AdminBackendAccount' })

    } else {
      // 編輯模式：使用 updateUser API
      if (!account.value._apiData) {
        alert('缺少使用者資料，請重新載入頁面')
        return
      }

      // 根據機構名稱找到對應的 institutionID
      let institutionID = account.value._apiData.institutionID // 預設使用原本的
      if (account.value.org) {
        const matchedInst = remoteInstitutions.value.find(
          inst => inst.institutionName === account.value.org
        )
        if (matchedInst) {
          institutionID = matchedInst.institutionID || matchedInst.id
          console.log('找到匹配的機構 ID:', institutionID)
        } else {
          console.warn('找不到對應的機構 ID，使用原本的:', institutionID)
        }
      }

      // 準備更新資料
      const updateData = {
        ...account.value._apiData,  // 保留原始資料
        account: account.value.id,
        accountStatus: account.value.right === 'enable' ? 1 : 0,
        permissionType: mapRoleToPermissionType(account.value.role),
        institutionID: institutionID  // 使用 institutionID 而非 institutionName
      }

      // 密碼處理
      if (account.value.password && account.value.password.trim() !== '' && account.value.password !== account.value._apiData.password) {
        // 如果有輸入新密碼且與原密碼不同，使用新密碼
        updateData.password = account.value.password
        console.log('使用新密碼')
      } else {
        // 沒有輸入新密碼或密碼未改變，保持原密碼
        updateData.password = account.value._apiData.password
        console.log('保持原密碼')
      }

      console.log('========== 準備更新資料 ==========')
      console.log('userID:', account.value._apiData.userID)
      console.log('更新資料:', updateData)
      console.log('機構名稱:', account.value.org)
      console.log('機構ID:', institutionID)

      // 呼叫 API 更新
      const result = await updateUser(account.value._apiData.userID, updateData)

      console.log('========== 更新成功 ==========')
      console.log('更新結果:', result)
      alert('儲存成功！')

      // 同時更新 localStorage（保持相容性）
      const stored = JSON.parse(localStorage.getItem('backendAccounts') || '{}')
      stored[account.value.id] = {
        id: account.value.id,
        org: account.value.org,
        role: account.value.role,
        right: account.value.right,
        password: updateData.password
      }
      localStorage.setItem('backendAccounts', JSON.stringify(stored))

      // 返回列表頁
      router.push({ name: 'AdminBackendAccount' })
    }

  } catch (error) {
    console.error('儲存失敗:', error)

    if (error.response?.status === 404) {
      alert('找不到該使用者，請確認帳號是否存在')
    } else if (error.response?.status === 403) {
      alert('沒有權限修改此使用者資料')
    } else if (error.response?.status === 400) {
      alert('資料格式錯誤，請檢查輸入內容')
    } else {
      alert('儲存失敗，請稍後再試')
    }
  } finally {
    isSaving.value = false
  }
}

const cancel = () => {
  // 返回後台帳號列表頁
  router.push({ name: 'AdminBackendAccount' })
}

</script>

<style scoped>
.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; min-height: 400px; }
.spinner { width: 40px; height: 40px; border: 4px solid #e6f2ff; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 20px; }
@keyframes spin { to { transform: rotate(360deg); } }

.backend-edit-page {  width: 100% ;}
.backend-edit-card {max-width: 85%; display: flex; flex-direction: column; margin: 0 auto;}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px;margin-top: 60px}
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; font-weight:700;color:#2e6fb7; }
.tab-row { display:flex; justify-content:center; margin-bottom:18px; margin-top: 50px}
.tab-title { background: #f9dada; color:#e35d6a; font-weight:700; font-size:1.15rem; padding:6px 38px; border-radius:18px; letter-spacing:2px; }
.edit-form-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:18px 24px; margin-bottom:22px; box-shadow:0 2px 8px rgba(16,24,40,0.04); }
.form-row { display:flex; align-items:flex-start; gap:18px; margin-bottom:16px; justify-content: center; }
.form-label { font-weight:600; color:#2e6fb7; min-width:120px; margin-top:8px; }
.form-input { width:420px; max-width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; }
.form-input:read-only { background-color:#f3f4f6; cursor:not-allowed; }
.radio-group { display:flex; gap:30px; align-items:center; flex-wrap:wrap; padding-top:8px; width: 420px}
.radio-label { display:flex; align-items:center; gap:8px; cursor:pointer; color:#333; font-weight:500; }
.radio-label input[type="radio"] { cursor:pointer; width:16px; height:16px; }
.radio-label span { user-select:none; }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:8px; }
.btn { padding:7px 18px; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:1rem; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
.btn.danger { background:#ff7b8a; color:#fff }
@media (max-width:900px){
  .backend-edit-card{ width:100%; padding:16px }
  .form-row{ flex-direction:column; align-items:flex-start; }
  .form-label{ width:100%; }
  .form-input{ width:100%; }
}
</style>
