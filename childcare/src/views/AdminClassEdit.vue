<template>
  <div class="class-edit-page">
    <div class="class-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/edit-property.png" class="icon" alt="icon" />
        <span class="main-title">{{ isEdit ? '編輯班級' : '新增班級' }}</span>

      </div>


      <div class="form-card">
        <!-- 建立模式：super admin 可選擇機構；admin 顯示唯讀機構 -->
        <div class="form-row" v-if="!isEdit && isSuperAdmin">
          <label for="institution-select">選擇機構</label>
          <select v-model="form.institutionId" id="institution-select">
            <option value="" disabled>請選擇機構</option>
            <option v-for="inst in institutions" :key="inst.id" :value="inst.id">{{ inst.name }}</option>
          </select>
        </div>
        <div class="form-row" v-else-if="!isEdit && !isSuperAdmin">
          <label>機構</label>
          <div style="display:flex;flex-direction:column;">
            <input :value="resolvedInstitutionName || form.institutionName || '（未指定）'" type="text" readonly class="readonly-input" style="width:420px;padding:8px 10px;border-radius:6px;border:1px solid #d8dbe0;" />
          </div>
        </div>
        <div class="form-row" v-else>
          <label>機構</label>
          <!-- 編輯模式：僅顯示機構名稱（唯讀），不可變更，也不顯示機構ID -->
          <div style="display:flex;flex-direction:column;">
            <input :value="form.institutionName || resolvedInstitutionName || '（未指定）'" type="text" readonly class="readonly-input" style="width:420px;padding:8px 10px;border-radius:6px;border:1px solid #d8dbe0;" />
          </div>
        </div>

        <div class="form-row">
          <label>班級名稱</label>
          <input v-model="form.unit" type="text" />
        </div>

        <div class="form-row">
          <label>收托人數</label>
          <input v-model.number="form.capacity" type="number" min="0" />
        </div>

        <div class="form-row">
          <label>就讀中人數</label>
          <input v-model.number="form.currentStudents" type="number" min="0" />
        </div>

        <div class="form-row">
          <label>收托年齡起（單位：月）</label>
          <input v-model.number="form.age_from" type="number" min="0" max="216" />
        </div>

        <div class="form-row">
          <label>收托年齡訖（單位：月）</label>
          <input v-model.number="form.age_to" type="number" min="0" max="216" />
        </div>

        <div class="form-row">
          <label>其他資訊</label>
          <textarea v-model="form.additionalInfo" rows="4"></textarea>
        </div>


      </div>
      <div class="bottom-row">
        <button class="btn primary" @click="save" :disabled="!canSave">儲存</button>
        <button class="btn ghost" @click="cancel">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const isEdit = computed(() => !!route.params.id)
const isSuperAdmin = computed(() => Number(auth?.user?.PermissionType) === 1 || auth?.user?.role === 'super_admin')
const adminInstitutionId = computed(() => auth?.user?.InstitutionID || '')

// Remove hardcoded fake institutions and fetch from backend instead
const institutions = ref([])

const defaultForm = () => ({
  id: null,
  institutionId: '',
  institutionName: '',
  unit: '',
  capacity: 0,
  currentStudents: 0,
  age_from: 0,
  age_to: 0,
  additionalInfo: ''
})
const form = ref(defaultForm())

// computed helper to show a resolved institution name from the institutions list
const resolvedInstitutionName = computed(() => {
  if (form.value.institutionId) {
    const found = institutions.value.find(i => String(i.id) === String(form.value.institutionId))
    return found ? found.name : ''
  }
  // admin 建立時若尚未解析，從 auth 的機構ID解析名稱
  if (!isSuperAdmin.value && adminInstitutionId.value) {
    const found = institutions.value.find(i => String(i.id) === String(adminInstitutionId.value))
    return found ? found.name : ''
  }
  return ''
})

// whether save is allowed
const canSave = computed(() => {
  if (!form.value.unit || form.value.unit.trim() === '') return false
  // 編輯模式：只要有班級名稱即可儲存（不可變更機構）
  if (isEdit.value) return true
  // 新增模式：super admin 需選擇機構；admin 需有自身機構 ID
  if (isSuperAdmin.value) {
    return !!(form.value.institutionId && String(form.value.institutionId).trim() !== '')
  }
  // admin
  return !!(adminInstitutionId.value && String(adminInstitutionId.value).trim() !== '')
})

// Fetch institutions from backend API (adjust endpoint if your backend differs)
const fetchInstitutions = async () => {
  try {
    const res = await fetch('http://localhost:8080/institutions')
    if (!res.ok) {
      console.warn('載入機構清單失敗，狀態：', res.status)
      institutions.value = []
      return
    }
    const data = await res.json()
    // Normalize expected shape: array of { id, name }
    if (Array.isArray(data)) {
      institutions.value = data.map(item => ({ id: item.id || item.institutionID || item.institutionId || '', name: item.name || item.institutionName || item.InstitutionName || '' }))
    } else if (data && Array.isArray(data.content)) {
      institutions.value = data.content.map(item => ({ id: item.id || item.institutionID || item.institutionId || '', name: item.name || item.institutionName || item.InstitutionName || '' }))
    } else {
      institutions.value = []
    }
  } catch (err) {
    console.error('fetchInstitutions error:', err)
    institutions.value = []
  }
}

// helper to resolve an institution ID from a name
const resolveInstitutionIdFromName = (name) => {
  if (!name) return ''
  const matched = institutions.value.find(i => i.name === name || String(i.id) === String(name))
  return matched ? matched.id : ''
}

// small UUIDv4 generator with fallback to crypto.randomUUID when available
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // fallback implementation (RFC4122 version 4) using crypto.getRandomValues if available
  const hex = (n) => {
    let s = ''
    for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 16).toString(16)
    return s
  }
  // Prefer secure RNG if available
  try {
    const buf = new Uint8Array(16)
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      crypto.getRandomValues(buf)
      // set version and variant bits
      buf[6] = (buf[6] & 0x0f) | 0x40
      buf[8] = (buf[8] & 0x3f) | 0x80
      const toHex = (b) => (b + 0x100).toString(16).substr(1)
      return `${toHex(buf[0])}${toHex(buf[1])}${toHex(buf[2])}${toHex(buf[3])}-${toHex(buf[4])}${toHex(buf[5])}-${toHex(buf[6])}${toHex(buf[7])}-${toHex(buf[8])}${toHex(buf[9])}-${toHex(buf[10])}${toHex(buf[11])}${toHex(buf[12])}${toHex(buf[13])}${toHex(buf[14])}${toHex(buf[15])}`
    }
  } catch (e) {
    // fall through to Math.random fallback
  }
  // Last-resort fallback (less secure)
  return `${hex(8)}-${hex(4)}-4${hex(3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${hex(3)}-${hex(12)}`
}

onMounted(async () => {
  // Always try to load institutions from backend; falls back to empty list
  await fetchInstitutions()

  if (isEdit.value) {
    const classId = route.params.id // 這是 classID (UUID)
    // 取得機構 ID 或名稱 (route 可能只傳 institutionId)
    const routeInstitutionId = route.params.institutionId

    try {
      // 從API獲取班級資料
      const res = await fetch('http://localhost:8080/classes/offset')
      if (res.ok) {
        const data = await res.json()
        const classes = data.content || []

        // 根據 classID 找到班級
        const found = classes.find(cls => cls.classID === classId)

        if (found) {
          // 如果 API 沒有回傳 institutionID，用 institutionName 找對應的 ID
          let institutionId = found.institutionID
          if (!institutionId && found.institutionName) {
            const matchedInstitution = institutions.value.find(inst => inst.name === found.institutionName)
            institutionId = matchedInstitution?.id || ''
          }

          // 如果 route 有提供 institutionId（可能在編輯頁面跳轉時帶入），使用它作為優先值
          if (!institutionId && routeInstitutionId) {
            institutionId = routeInstitutionId
          }

          form.value = {
            id: found.classID,
            institutionId: institutionId, // 確保有值
            institutionName: found.institutionName || '',
            unit: found.className,
            capacity: found.capacity,
            currentStudents: found.currentStudents || found.CurrentStudents || 0,
            age_from: Number(found.minAgeDescription) || 0,
            age_to: Number(found.maxAgeDescription) || 0,
            additionalInfo: found.additionalInfo || found.AdditionalInfo || found.notes || ''
          }

          // 編輯模式不允許變更機構；畫面僅顯示機構名稱（如未解析到 institutionId，仍會顯示名稱）

          // 除錯用：檢查 institutionId 是否正確
          console.log('編輯班級載入：', {
            classID: found.classID,
            institutionName: found.institutionName,
            institutionID: found.institutionID,
            finalInstitutionId: institutionId
          })
        } else {
          alert('找不到指定的班級')
          router.replace({ name: 'AdminClassManager' })
        }
      } else {
        alert('載入班級資料失敗')
        router.replace({ name: 'AdminClassManager' })
      }
    } catch (error) {
      console.error('載入班級資料失敗:', error)
      alert('載入班級資料失敗')
      router.replace({ name: 'AdminClassManager' })
    }
  } else {
    // 新增模式：清空表單
    form.value = defaultForm()
    // super admin 由使用者選擇；admin 固定為自己的機構
    if (!isSuperAdmin.value) {
      form.value.institutionId = adminInstitutionId.value || ''
    }
    if (route.params.institutionId) {
      form.value.institutionId = route.params.institutionId // 應為機構ID
    }
  }
})

const save = async () => {
  if (!form.value.unit || form.value.unit.trim() === '') {
    alert('請填寫班級名稱')
    return
  }

  // 僅在新增模式時要求與解析 institutionId；編輯模式不得變更機構
  if (!isEdit.value) {
    // admin 角色強制綁定到自己的機構
    if (!isSuperAdmin.value) {
      if (!adminInstitutionId.value) {
        alert('您的帳號未綁定機構，無法新增班級，請聯絡管理員')
        return
      }
      form.value.institutionId = adminInstitutionId.value
    } else {
      if (!form.value.institutionId || String(form.value.institutionId).trim() === '') {
        const resolved = resolveInstitutionIdFromName(form.value.institutionName)
        if (resolved) {
          form.value.institutionId = resolved
        } else {
          alert('請選擇機構')
          return
        }
      }
    }
  }

  // If creating a new class, ensure we assign a UUID for classID
  if (!isEdit.value) {
    if (!form.value.id) {
      form.value.id = generateUUID()
    }
  }

  // Validate and coerce age fields (months)
  const coercedAgeFrom = Math.max(0, Math.floor(Number(form.value.age_from) || 0))
  const coercedAgeTo = Math.max(0, Math.floor(Number(form.value.age_to) || 0))
  if (coercedAgeFrom > coercedAgeTo) {
    alert('收托年齡起 不能大於 收托年齡訖，請檢查輸入（單位：月）')
    return
  }

  // 準備要傳送給後端的資料
  const dataToSend = {
    classID: form.value.id, // 編輯時使用原有的classID，新增時為自動產生的 UUID
    className: form.value.unit,
    capacity: form.value.capacity,
    currentStudents: form.value.currentStudents || 0,
    minAgeDescription: coercedAgeFrom,
    maxAgeDescription: coercedAgeTo,
    additionalInfo: form.value.additionalInfo || ''
  }

  // 若表單有 institutionId（不論新增或編輯），就把它加入 payload
  if (form.value.institutionId && String(form.value.institutionId).trim() !== '') {
    dataToSend.institutionId = form.value.institutionId
  }

  // 除錯用：檢查送出的資料
  console.log('準備送出的資料：', dataToSend)
  console.log('表單 institutionId：', form.value.institutionId)

  try {
    let response

    if (isEdit.value) {
      // 更新現有班級 - PUT 請求
      response = await fetch(`http://localhost:8080/classes/${form.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })
    } else {
      // 新增班級 - POST 請求
      response = await fetch('http://localhost:8080/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })
    }

    if (response && response.ok) {
      alert(isEdit.value ? '班級更新成功！' : '班級新增成功！')
      // 返回到班級管理主頁，並帶上 updated 查詢參數以觸發列表刷新
      router.replace({ name: 'AdminClassManager', query: { updated: Date.now() } })
    } else {
      const errorData = response ? await response.text() : 'no response'
      alert(`儲存失敗：${response ? response.status : ''} - ${errorData}`)
    }
  } catch (error) {
    console.error('儲存班級資料失敗:', error)
    alert('儲存失敗，請檢查網路連線')
  }
}

const cancel = () => {
  // 直接返回班級管理主頁
  router.replace({ name: 'AdminClassManager' })
}
</script>

<style scoped>
.class-edit-page { display:flex; justify-content:center; }
.class-card { width:100%; }
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; margin-top: 60px;}
.icon { width:28px; height:28px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700; }
.form-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:18px 24px; margin-bottom:50px; box-shadow:0 2px 8px rgba(16,24,40,0.04);margin-top: 50px }
.form-row { display:flex; align-items:center; gap:12px; margin-bottom:10px;justify-content: center; }
.form-row label { width:120px; color:#2e6fb7; font-weight:600; }
.form-row input, .form-row textarea {  height:40px;width: 420px;padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0;}
.form-row input.readonly-input { background-color: #f5f5f5; color: #666; }
.form-row select { height: 40px; width: 420px; padding: 8px 10px; border-radius: 6px; border: 1px solid #d8dbe0; }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:12px; }
.btn { padding:7px 18px; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:1rem; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
.btn[disabled] { opacity:0.6; cursor:not-allowed }
@media (max-width:900px){ .class-card{ width:100%; padding:16px } .form-row{ flex-direction:column; align-items:flex-start } .form-row label{ width:100% } }
</style>