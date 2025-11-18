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
          <input type="file" @change="onFileChange" class="form-input" />
          <span v-if="form.attachment">{{ form.attachment.name }}</span>
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
  attachment: null
})

const list = ref([])

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

// Map frontend string values to backend numeric values (assumption)
// Assumptions: type: front=0, back=1; status: enabled=0, disabled=1
const mapToBackend = (payload) => {
  return {
    title: payload.title,
    content: payload.content,
    // backend expects dates as ISO yyyy-MM-dd (LocalDate)
    startDate: payload.date || null,
    endDate: payload.endDate || null,
    // convert type/status
    type: payload.type === 'back' ? 1 : 0,
    status: payload.status === 'disabled' ? 1 : 0,
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
          form.value.type = (data.type === 1 || data.type === '1') ? 'back' : 'front'
          // status
          form.value.status = (data.status === 1 || data.status === '1') ? 'disabled' : 'enabled'
          // dates: could be startDate or createdTime; prefer startDate
          form.value.date = data.startDate || data.date || getToday()
          form.value.endDate = data.endDate || getToday()
          form.value.attachment = null // do not auto-load file
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
  form.value.attachment = file || null
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
        // multipart PUT (file + meta)
        const fd = new FormData()
        fd.append('file', form.value.attachment)
        fd.append('meta', new Blob([JSON.stringify(meta)], { type: 'application/json' }))
        await http.put(`/announcements/${idParam}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        alert('編輯成功')
        goBack()
      } else {
        // JSON PUT
        await http.put(`/announcements/${idParam}`, meta)
        alert('編輯成功')
        goBack()
      }
    } catch (e) {
      console.warn('backend update failed, falling back to localStorage', e)
      // fallback to localStorage behavior
      loadList()
      const idx = list.value.findIndex(item => String(item.id) === String(form.value.id) || Number(item.id) === Number(form.value.id))
      if (idx !== -1) {
        list.value[idx] = { ...form.value }
        saveList()
        alert('編輯成功 (已儲存在本機，後端連線失敗)')
      }
      goBack()
    }
  } else {
    // create
    try {
      if (form.value.attachment) {
        const fd = new FormData()
        fd.append('file', form.value.attachment)
        fd.append('meta', new Blob([JSON.stringify(meta)], { type: 'application/json' }))
        await http.post('/announcements/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        alert('新增成功')
        goBack()
      } else {
        // JSON POST
        await http.post('/announcements', meta)
        alert('新增成功')
        goBack()
      }
    } catch (e) {
      console.warn('backend create failed, falling back to localStorage', e)
      // fallback to localStorage
      loadList()
      form.value.id = Date.now()
      list.value.push({ ...form.value })
      saveList()
      alert('新增成功 (已儲存在本機，後端連線失敗)')
      goBack()
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
.btn { padding:7px 18px; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:1rem; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:8px; margin-bottom: 20px}

@media (max-width:900px){ .announcement-edit-card{ width:100%; padding:16px } .form-input, .form-textarea{ width:100% } }
</style>
