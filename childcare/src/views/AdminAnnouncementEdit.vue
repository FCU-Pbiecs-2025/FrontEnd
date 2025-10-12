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
          <label><input type="radio" value="front" v-model="form.type" /> 前台公告</label>
          <label><input type="radio" value="back" v-model="form.type" /> 後台公告</label>
        </div>
        <div class="form-row">
          <label class="form-label">發佈日期：</label>
          <input type="date" v-model="form.dateStart" />
          <span class="to-label">至</span>
          <input type="date" v-model="form.dateEnd" />
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

const isEditPage = computed(() => route.name === 'AdminAnnouncementEdit')

const form = ref({
  title: '',
  content: '',
  type: 'front',
  dateStart: '',
  dateEnd: ''
})

// 模擬取得公告資料（實際應串API或由父頁傳遞）
const mockList = [
  { id: 1, title: '系統維護公告', content: '維護內容...', type: 'front', dateStart: '2025-10-01', dateEnd: '2025-10-02' },
  { id: 2, title: '後台功能更新', content: '更新內容...', type: 'back', dateStart: '2025-10-05', dateEnd: '2025-10-06' }
]

onMounted(() => {
  if (isEditPage.value) {
    const id = Number(route.params.id)
    const data = mockList.find(item => item.id === id)
    if (data) {
      form.value = { ...data }
    }
  } else {
    form.value = { title: '', content: '', type: 'front', dateStart: '', dateEnd: '' }
  }
})

const goBack = () => {
  router.replace({ path: '/admin/announcement' })
}

const save = () => {
  if (!form.value.title) {
    alert('請輸入標題')
    return
  }
  if (!form.value.content) {
    alert('請輸入內容')
    return
  }
  if (!form.value.dateStart || !form.value.dateEnd) {
    alert('請選擇日期')
    return
  }
  if (isEditPage.value) {
    alert('已儲存公告（編輯模式，請串接API）')
  } else {
    alert('已新增公告（新增模式，請串接API）')
  }
  goBack()
}
</script>

<style scoped>
.announcement-edit-page { display:flex; justify-content:center; }
.announcement-edit-card { width:820px; }
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; margin-top: 60px}
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700; }
.tab-row { display:flex; justify-content:center; margin-bottom:18px; }
.tab-title { background: #f9dada; color:#e35d6a; font-weight:700; font-size:1.15rem; padding:6px 38px; border-radius:18px; letter-spacing:2px; margin-top: 50px}
.edit-form-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:18px 24px; margin-bottom:22px; box-shadow:0 2px 8px rgba(16,24,40,0.04); }
.form-row { display:flex; align-items:center; gap:18px; margin-bottom:16px; }
.form-label { font-weight:600; color:#2e6fb7; min-width:70px; }
.form-input { width:320px; max-width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; }
.form-textarea { width:420px; max-width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; resize:vertical; }
.to-label { color:#888; margin:0 8px; }
.btn { padding:7px 18px; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:1rem; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
.bottom-row { display:flex; justify-content:flex-end; gap:12px; margin-top:8px; }
@media (max-width:900px){ .announcement-edit-card{ width:100%; padding:16px } .form-input, .form-textarea{ width:100% } }
</style>
