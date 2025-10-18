<template>
  <div class="institution-edit-page">
    <div class="institution-edit-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/organization.png" class="icon" alt="icon" />
        <span class="main-title">機構管理</span>
      </div>
      <div class="tab-row">
        <span class="tab-title">{{ isNew ? '新增各托機構' : '編輯各托機構' }}</span>
      </div>
      <div class="edit-form-card">
        <div class="form-row">
          <label class="form-label">機構名稱：</label>
          <input v-model="form.name" class="form-input" placeholder="請輸入機構名稱" />
        </div>
        <div class="form-row">
          <label class="form-label">連絡人：</label>
          <input v-model="form.contact" class="form-input" placeholder="請輸入連絡人" />
        </div>
        <div class="form-row">
          <label class="form-label">機構地址：</label>
          <input v-model="form.address" class="form-input" placeholder="請輸入機構地址" />
        </div>
        <div class="form-row">
          <label class="form-label">機構電話：</label>
          <input v-model="form.phone" class="form-input" placeholder="請輸入機構電話" />
        </div>
        <div class="form-row">
          <label class="form-label">傳真：</label>
          <input v-model="form.fax" class="form-input" placeholder="請輸入傳真" />
        </div>
        <div class="form-row">
          <label class="form-label">電子信箱：</label>
          <input v-model="form.email" class="form-input" placeholder="請輸入電子信箱" />
        </div>
        <div class="form-row">
          <label class="form-label">相關連結：</label>
          <input v-model="form.link" class="form-input" placeholder="請輸入相關連結" />
        </div>
        <div class="form-row">
          <label class="form-label">機構說明：</label>
          <textarea v-model="form.description" class="form-textarea" rows="4" placeholder="請輸入機構說明"></textarea>
        </div>
        <div class="form-row">
          <label class="form-label">負責人：</label>
          <input v-model="form.director" class="form-input" placeholder="請輸入負責人" />
        </div>
        <div class="form-row">
          <label class="form-label">圖片：</label>
          <div class="file-btn"> <button class="btn secondary" @click="uploadPhoto">瀏覽檔案</button></div>
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
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const storageKey = 'institutionData'

const form = ref({
  id: null,
  name: '',
  contact: '',
  address: '',
  phone: '',
  fax: '',
  email: '',
  link: '',
  description: '',
  director: '',
  image: ''
})

const institutions = ref([])

const isNew = computed(() => route.name === 'AdminInstitutionNew' || !route.params.id)

const load = () => {
  const raw = localStorage.getItem(storageKey)
  institutions.value = raw ? JSON.parse(raw) : []
}

onMounted(() => {
  load()
  if (!isNew.value) {
    const id = Number(route.params.id)
    const found = institutions.value.find(item => Number(item.id) === id)
    if (found) {
      form.value = { ...found }
    } else {
      router.replace({ path: '/admin/institution' })
    }
  }
})

const persist = () => localStorage.setItem(storageKey, JSON.stringify(institutions.value))

const validate = () => {
  if (!form.value.name) {
    alert('請輸入機構名稱')
    return false
  }
  if (!form.value.contact) {
    alert('請輸入連絡人')
    return false
  }
  if (!form.value.address) {
    alert('請輸入機構地址')
    return false
  }
  if (!form.value.phone) {
    alert('請輸入機構電話')
    return false
  }
  if (!form.value.email) {
    alert('請輸入電子信箱')
    return false
  }
  if (!form.value.director) {
    alert('請輸入負責人')
    return false
  }
  return true
}

const save = () => {
  if (!validate()) return
  load()
  if (isNew.value) {
    // 新增
    form.value.id = Date.now()
    institutions.value.push({ ...form.value })
    persist()
    alert('新增成功')
  } else {
    // 編輯
    const idx = institutions.value.findIndex(item => Number(item.id) === Number(form.value.id))
    if (idx !== -1) {
      institutions.value[idx] = { ...form.value }
      persist()
      alert('編輯成功')
    }
  }
  goBack()
}

const goBack = () => {
  router.replace({ path: '/admin/institution' })
}

const uploadPhoto = () => {
  alert('請串接檔案上傳功能')
}
</script>

<style scoped>
.institution-edit-page { display:flex; justify-content:center;  }
.institution-edit-card { width: 100%  }
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; margin-top: 60px}
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700;  }
.tab-row { display:flex; justify-content:center; margin-bottom:18px;margin-top: 50px }
.tab-title { background: #f9dada; color:#e35d6a; font-weight:700; font-size:1.15rem; padding:6px 38px; border-radius:18px; letter-spacing:2px; }
.edit-form-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:18px 24px; margin-bottom:22px; box-shadow:0 2px 8px rgba(16,24,40,0.04); }
.form-row { display:flex; align-items:flex-start; gap:18px; margin-bottom:16px; justify-content: center; }
.form-label { font-weight:600; color:#2e6fb7; min-width:100px; margin-top:8px; }
.form-input { width:420px; max-width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; height: 40px}
.form-textarea { width:420px; height:200px;max-width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; resize:vertical; }
.btn { padding:7px 18px; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:1rem; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.file-btn{width: 420px}
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
.btn.secondary { background:#f3f4f6; color:#333; border:1px solid #d8dbe0; }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:8px; margin-bottom: 20px}
@media (max-width:900px){ .institution-edit-card{ width:100%; padding:16px } .form-input, .form-textarea{ width:100% } }
</style>
