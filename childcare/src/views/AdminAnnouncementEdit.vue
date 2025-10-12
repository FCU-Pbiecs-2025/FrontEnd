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
            <input class="date-input" type="date" v-model="form.date" /></div>

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
const router = useRouter()
const route = useRoute()

const STORAGE_KEY = 'announcementData'
const isEditPage = computed(() => route.name === 'AdminAnnouncementEdit')

const form = ref({
  id: null,
  date: '',
  title: '',
  content: '',
  type: 'front'
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

onMounted(() => {
  loadList()
  if (isEditPage.value) {
    const id = Number(route.params.id)
    const data = list.value.find(item => item.id === id)
    if (data) {
      form.value = { ...data }
    } else {
      router.replace({ path: '/admin/announcement' })
    }
  }
})

const goBack = () => {
  router.replace({ path: '/admin/announcement' })
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
  return true
}

const save = () => {
  if (!validate()) return

  loadList()

  if (isEditPage.value) {
    // 編輯
    const idx = list.value.findIndex(item => Number(item.id) === Number(form.value.id))
    if (idx !== -1) {
      list.value[idx] = { ...form.value }
      saveList()
      alert('編輯成功')
    }
  } else {
    // 新增
    form.value.id = Date.now()
    list.value.push({ ...form.value })
    saveList()
    alert('新增成功')
  }
  goBack()
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
