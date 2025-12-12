<template>
  <div class="announcement-edit-page">
    <div class="announcement-edit-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/megaphone.png" class="icon" alt="icon" />
        <span class="main-title">系統公告管理</span>
      </div>
      <div class="tab-row">
        <span class="tab-title">{{ isEditPage ? '系統公告編輯' : '新增系統公告' }}</span>
      </div>
      <div class="edit-form-card">
        <div class="form-row">
          <label class="form-label">標題：</label>
          <input v-model="form.title" class="form-input" placeholder="請輸入公告標題" />
        </div>
        <div class="form-row">
          <label class="form-label">內容：</label>
          <textarea v-model="form.content" class="form-textarea" rows="4" placeholder="請輸入公告內容"></textarea>
        </div>
        <div class="form-row">
          <label class="form-label">類型：</label>
          <div class="radio-group">
            <label><input type="radio" value="front" v-model="form.type" /> 前台公告</label>
            <label><input type="radio" value="back" v-model="form.type" /> 後台公告</label>
          </div>

        </div>
        <div class="form-row">
          <label class="form-label">發佈日期：</label>
          <div class="date-area">
            <input class="date-input" type="date" v-model="form.date" />
          </div>
        </div>
        <div class="form-row">
          <label class="form-label">結束日期：</label>
          <div class="date-area">
            <input class="date-input" type="date" v-model="form.endDate" />
          </div>
        </div>
        <div class="form-row">
          <label class="form-label">狀態：</label>
          <div class="radio-group">
            <label><input type="radio" value="enabled" v-model="form.status" /> 啟用</label>
            <label><input type="radio" value="disabled" v-model="form.status" /> 停用</label>
          </div>
        </div>
        <div class="form-row">
          <label class="form-label">附件：</label>
          <div class="attachment-area">
            <input type="file" @change="onFileChange" class="file-input" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif" />

            <!-- 顯示新上傳的檔案 -->
            <div v-if="form.attachment" class="file-info">
              <span class="file-name" :title="form.attachment.name">📎 {{ form.attachment.name }}</span>
              <span class="file-size">({{ (form.attachment.size / 1024).toFixed(2) }} KB)</span>
              <button type="button" @click="clearNewAttachment" class="clear-btn">✕</button>
            </div>

            <!-- 顯示原本的附件 (僅在編輯模式且沒有新上傳檔案時) -->
            <div v-else-if="isEditPage && form.originalAttachmentPath" class="file-info original">
              <span class="file-name" :title="getOriginalFileName()">📎 {{ getOriginalFileName() }} (現有檔案)</span>
              <button type="button" @click="removeOriginalAttachment" class="clear-btn">✕</button>
            </div>

            <!-- 提示訊息 -->
            <div v-else class="file-hint">支援格式：PDF、Word、Excel、圖片（最大 10MB）</div>
          </div>
        </div>
      </div>
      <div class="bottom-row">
        <button class="btn ghost" @click="goBack">返回</button>
        <button class="btn primary" @click="save">儲存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import http from '../api/http'
const router = useRouter()
const route = useRoute()

const STORAGE_KEY = 'announcementData'
const isEditPage = computed(() => route.name === 'AdminAnnouncementEdit')

const getToday = () => {
  const d = new Date();
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

const form = ref({
  id: null,
  date: getToday(),
  endDate: getToday(),
  title: '',
  content: '',
  type: 'front',
  status: 'enabled',
  attachment: null,
  originalAttachmentPath: null // 儲存原本的附件路徑
})

const list = ref([])

// 新增：記住載入時的原始附件路徑，用來判斷使用者是否清除附件
const initialOriginalAttachment = ref(null)

const loadList = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      list.value = JSON.parse(raw)
    } else {
      // 初始範例資料
      list.value = [
        { id: 1, date: '2025-10-01', title: '系統維護公告', content: '維護內容...', type: 'front' },
        { id: 2, date: '2025-10-05', title: '後台功能更新', content: '更新內容...', type: 'back' }
      ]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.value))
    }
  } catch (e) {
    console.error('loadList error', e)
  }
}

const saveList = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.value))
}

// Map frontend string values to backend numeric values
// type: front=1, back=2; status: enabled=1, disabled=2
const mapToBackend = (payload) => {
  return {
    title: payload.title,
    content: payload.content,
    // backend expects dates as ISO yyyy-MM-dd (LocalDate)
    startDate: payload.date || null,
    endDate: payload.endDate || null,
    // convert type/status
    type: payload.type === 'back' ? 2 : 1,
    status: payload.status === 'disabled' ? 2 : 1, // 1=上架, 2=下架
    // optional fields: createdUser/createdTime can be omitted and backend will fill
  }
}

onMounted(async () => {
  loadList()
  if (isEditPage.value) {
    const idParam = route.params.id
    // try load from backend first (id may be UUID string)
    if (idParam) {
      try {
        const res = await http.get(`/announcements/${idParam}`)
        if (res && res.data) {
          const data = res.data
          // map backend fields to frontend form
          form.value.id = data.announcementID || data.id || idParam
          form.value.title = data.title || ''
          form.value.content = data.content || ''
          // backend stores Type as numeric; map back to string
          form.value.type = (data.type === 2 || data.type === '2') ? 'back' : 'front'
          // status: 1=上架(啟用), 2=下架(停用)
          form.value.status = (data.status === 2 || data.status === '2') ? 'disabled' : 'enabled'
          // dates: could be startDate or createdTime; prefer startDate
          form.value.date = data.startDate || data.date || getToday()
          form.value.endDate = data.endDate || getToday()
          // 保留原本的附件路徑資訊
          form.value.originalAttachmentPath = data.attachmentPath || null
          // 記錄載入時的原始附件，用來判斷是否被使用者清除
          initialOriginalAttachment.value = data.attachmentPath || null
          form.value.attachment = null // 新上傳的檔案
          return
        }
      } catch (e) {
        // backend not available or not found -> fallback to localStorage
        console.warn('Failed to load announcement from backend, falling back to localStorage', e)
      }
    }

    // existing localStorage fallback logic (expects numeric id)
    const idNum = Number(route.params.id)
    const localData = list.value.find(item => Number(item.id) === idNum)
    if (localData) {
      form.value = { ...form.value, ...localData }
      form.value.attachment = null
      // 若 local data 含附件路徑，也記錄初始附件狀態
      initialOriginalAttachment.value = form.value.originalAttachmentPath || null
    } else {
      router.replace({ path: '/admin/announcement' })
    }
  } else {
    form.value.date = getToday()
    form.value.endDate = getToday()
    form.value.status = 'enabled'
    form.value.attachment = null
  }
})

const goBack = () => {
  router.replace({ path: '/admin/announcement' })
}

const onFileChange = (e) => {
  const file = e.target.files[0]

  if (!file) {
    form.value.attachment = null
    return
  }

  // 檢查檔案大小 (10MB = 10 * 1024 * 1024 bytes)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    alert('檔案大小不能超過 10MB')
    e.target.value = '' // 清除選擇的檔案
    form.value.attachment = null
    return
  }

  // 檢查檔案格式
  const allowedTypes = [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ]

  if (!allowedTypes.includes(file.type)) {
    alert('不支援的檔案格式，請上傳 PDF、Word、Excel 或圖片檔案')
    e.target.value = '' // 清除選擇的檔案
    form.value.attachment = null
    return
  }

  form.value.attachment = file
}

// 清除新上傳的檔案
const clearNewAttachment = () => {
  form.value.attachment = null
  // 清除 file input 的值
  const fileInput = document.querySelector('.file-input')
  if (fileInput) {
    fileInput.value = ''
  }
}

// 移除原本的附件
const removeOriginalAttachment = () => {
  form.value.originalAttachmentPath = null
}

// 取得原本附件的檔案名稱
const getOriginalFileName = () => {
  if (!form.value.originalAttachmentPath) return ''

  // 從路徑中提取檔案名稱
  let fileName = form.value.originalAttachmentPath

  // 處理各種路徑格式
  if (fileName.includes('/')) {
    const parts = fileName.split('/')
    fileName = parts[parts.length - 1]
  } else if (fileName.includes('\\')) {
    const parts = fileName.split('\\')
    fileName = parts[parts.length - 1]
  }

  // 如果檔名包含底線，只取底線後面的部分
  if (fileName.includes('_')) {
    const underscoreIndex = fileName.indexOf('_')
    fileName = fileName.substring(underscoreIndex + 1)
  }

  return fileName
}

const validate = () => {
  if (!form.value.title) {
    alert('請輸入標題')
    return false
  }
  if (!form.value.content) {
    alert('請輸入內容')
    return false
  }
  if (!form.value.date) {
    alert('請選擇發佈日期')
    return false
  }
  if (!form.value.endDate) {
    alert('請選擇結束日期')
    return false
  }

  // 檢查日期邏輯 - 結束日期不能早於發佈日期
  if (new Date(form.value.endDate) < new Date(form.value.date)) {
    alert('結束日期不能早於發佈日期')
    return false
  }

  // 如果有附件，再次檢查附件是否有效
  if (form.value.attachment) {
    const maxSize = 10 * 1024 * 1024
    if (form.value.attachment.size > maxSize) {
      alert('附件檔案大小不能超過 10MB')
      return false
    }
  }

  return true
}

const save = async () => {
  if (!validate()) return

  // prepare backend payload
  const meta = mapToBackend(form.value)

  // If edit page: update endpoint, else create
  if (isEditPage.value) {
    const idParam = route.params.id
    try {
      if (form.value.attachment) {
        // multipart PUT (file + meta) - 有新上傳檔案
        const fd = new FormData()
        fd.append('file', form.value.attachment)
        // 後端期望 meta 是 JSON 格式，使用 Blob 並指定正確的 Content-Type
        fd.append('meta', new Blob([JSON.stringify(meta)], { type: 'application/json' }))
        // 不要手動設定 Content-Type，讓瀏覽器自動加上 boundary
        await http.put(`/announcements/${idParam}`, fd)
        alert('編輯成功')
        goBack()
      } else {
        // 沒有新上傳檔案，處理原始附件的保留或刪除邏輯
        // 1) 若載入時有原始附件(initialOriginalAttachment)且使用者在編輯時把它刪除(form.originalAttachmentPath == null)
        //    -> 傳送 attachmentPath: '' 給後端，讓後端把資料庫的 attachmentPath 清空
        // 2) 若使用者保留原始附件 (form.originalAttachmentPath 有值) -> 傳送該 path，確保後端不會遺失
        // 3) 其他情況：不送 attachmentPath
        if (initialOriginalAttachment.value && !form.value.originalAttachmentPath) {
          const metaClearAttachment = { ...meta, attachmentPath: '' }
          await http.put(`/announcements/${idParam}`, metaClearAttachment)
          alert('編輯成功')
          goBack()
        } else if (form.value.originalAttachmentPath) {
          const metaWithOriginalAttachment = { ...meta, attachmentPath: form.value.originalAttachmentPath }
          await http.put(`/announcements/${idParam}`, metaWithOriginalAttachment)
          alert('編輯成功')
          goBack()
        } else {
          await http.put(`/announcements/${idParam}`, meta)
          alert('編輯成功')
          goBack()
        }
      }
    } catch (e) {
      console.error('backend update failed:', e)
      // 顯示詳細錯誤訊息
      const errorMsg = e.response?.data?.message || e.response?.data || e.message || '未知錯誤'
      alert(`編輯失敗: ${errorMsg}`)

      // fallback to localStorage behavior
      loadList()
      const idx = list.value.findIndex(item => String(item.id) === String(form.value.id) || Number(item.id) === Number(form.value.id))
      if (idx !== -1) {
        // 複製表單數據但排除附件檔案（因為 File 物件無法序列化）
        const { attachment, ...formDataWithoutFile } = form.value
        list.value[idx] = { ...formDataWithoutFile }
        saveList()
        alert('編輯失敗，已儲存在本機（不含附件）')
      }
    }
  } else {
    // create
    try {
      if (form.value.attachment) {
        const fd = new FormData()
        fd.append('file', form.value.attachment)
        // 後端期望 meta 是 JSON 格式，使用 Blob 並指定正確的 Content-Type
        fd.append('meta', new Blob([JSON.stringify(meta)], { type: 'application/json' }))
        // 不要手動設定 Content-Type，讓瀏覽器自動加上 boundary
        await http.post('/announcements/upload', fd)
        alert('新增成功')
        goBack()
      } else {
        // JSON POST (沒有附件)
        await http.post('/announcements', meta)
        alert('新增成功')
        goBack()
      }
    } catch (e) {
      console.error('backend create failed:', e)
      // 顯示詳細錯誤訊息
      const errorMsg = e.response?.data?.message || e.response?.data || e.message || '未知錯誤'
      alert(`新增失敗: ${errorMsg}`)

      // fallback to localStorage
      loadList()
      form.value.id = Date.now()
      // 複製表單數據但排除附件檔案（因為 File 物件無法序列化）
      const { attachment, ...formDataWithoutFile } = form.value
      list.value.push({ ...formDataWithoutFile })
      saveList()
      alert('新增失敗，已儲存在本機（不含附件）')
    }
  }
}
</script>

<style scoped>
.announcement-edit-page {  width: 100%}
.announcement-edit-card {   width: 100%}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; margin-top: 60px}
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700;  }
.tab-row { display:flex; justify-content:center; margin-bottom:18px;margin-top: 50px }
.tab-title { background: #f9dada; color:#e35d6a; font-weight:700; font-size:1.15rem; padding:6px 38px; border-radius:18px; letter-spacing:2px; }
.edit-form-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:18px 24px; margin-bottom:22px; box-shadow:0 2px 8px rgba(16,24,40,0.04); }
.form-row { display:flex; align-items:flex-start; gap:18px; margin-bottom:16px; justify-content: center}
.form-label { font-weight:600; color:#2e6fb7; min-width:100px; margin-top:8px; }
.form-input { width:420px; max-width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; height: 40px}
.form-textarea { width:420px; max-width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; resize:vertical; height: 200px }
.date-area{width: 420px;}
.date-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; width:150px;height: 40px }
.radio-group{width: 420px;margin-top: 10px}
.radio-group label{margin-right:30px;}
.attachment-area { width: 420px; display: flex; flex-direction: column; gap: 8px; }
.file-input { padding: 8px 10px; border-radius: 6px; border: 1px solid #d8dbe0; width: 100%; }
.file-info { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; }
.file-info.original { background: #fef3c7; border-color: #fcd34d; }
.file-name { font-weight: 500; color: #0369a1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.file-info.original .file-name { color: #92400e; }
.file-size { color: #64748b; font-size: 0.9rem; flex-shrink: 0; }
.clear-btn { background: #ef4444; color: white; border: none; border-radius: 4px; padding: 2px 6px; font-size: 0.8rem; cursor: pointer; }
.clear-btn:hover { background: #dc2626; }
.file-hint { font-size: 0.85rem; color: #64748b; }
.btn { padding:7px 18px; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:1rem; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:8px; margin-bottom: 20px}

@media (max-width:900px){ .announcement-edit-card{ width:100%; padding:16px } .form-input, .form-textarea{ width:100% } }
</style>
