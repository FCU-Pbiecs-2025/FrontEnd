<template>
  <div class="banner-edit-page">
    <div class="banner-edit-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/image.png" class="icon" alt="icon" />
        <span class="main-title">海報管理</span>
      </div>
      <div class="tab-row">
        <span class="tab-title">{{ isNew ? '新增海報' : '編輯海報' }}</span>
      </div>
      <div class="edit-form-card">
        <div class="form-row">
          <label class="form-label">Banner 圖片 URL：</label>
          <input v-model="form.image" class="form-input" placeholder="https://..." />
        </div>
        <div class="form-row">
          <label class="form-label">連結：</label>
          <input v-model="form.link" class="form-input" placeholder="/apply-service 或 https://... 或 RouteName" />
        </div>
        <div class="form-row">
          <label class="form-label">顯示日期：</label>
          <input type="date" v-model="form.displayDate" class="form-input" />
        </div>
        <div class="form-row">
          <label class="form-label">狀態：</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" value="顯示" v-model="form.status" />
              <span>顯示</span>
            </label>
            <label class="radio-label">
              <input type="radio" value="隱藏" v-model="form.status" />
              <span>隱藏</span>
            </label>
          </div>
        </div>

        <div v-if="previewAvailable" class="form-row">
          <label class="form-label">預覽：</label>
          <div class="preview-container">
            <img :src="form.image" alt="preview" class="preview-image" />
          </div>
        </div>
      </div>

      <div class="bottom-row">
        <button class="btn ghost" @click="cancel">返回</button>
        <button class="btn primary" @click="save">儲存</button>
        <button v-if="!isNew" class="btn danger" @click="doDelete">刪除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const storageKey = 'siteBanners'
const route = useRoute()
const router = useRouter()

const form = ref({ id: null, image: '', link: '', displayDate: '', status: '顯示' })
const banners = ref([])

const isNew = computed(() => route.name === 'AdminBannerNew' || !route.params.id)

const load = () => {
  const raw = localStorage.getItem(storageKey)
  banners.value = raw ? JSON.parse(raw) : []
}

onMounted(() => {
  load()
  if (!isNew.value) {
    const id = Number(route.params.id)
    const found = banners.value.find(b => Number(b.id) === id)
    if (found) {
      form.value = { ...found }
    } else {
      router.replace({ path: '/admin' })
    }
  }
})

const persist = () => localStorage.setItem(storageKey, JSON.stringify(banners.value))

const validate = () => {
  if (!form.value.image) {
    alert('請輸入圖片 URL')
    return false
  }
  return true
}

const save = () => {
  if (!validate()) return
  load()
  if (isNew.value) {
    const newItem = { id: Date.now(), ...form.value }
    banners.value.push(newItem)
  } else {
    const id = Number(route.params.id)
    const idx = banners.value.findIndex(b => Number(b.id) === id)
    if (idx !== -1) banners.value[idx] = { ...banners.value[idx], ...form.value }
  }
  persist()
  router.replace({ path: '/admin/banner' })
}

const doDelete = () => {
  if (!confirm('確定要刪除這筆海報嗎？')) return
  load()
  const id = Number(route.params.id)
  const idx = banners.value.findIndex(b => Number(b.id) === id)
  if (idx !== -1) {
    banners.value.splice(idx, 1)
    persist()
  }
  router.replace({ path: '/admin/banner' })
}

const cancel = () => {
  router.replace({ path: '/admin/banner' })
}

const previewAvailable = computed(() => !!form.value.image)
</script>

<style scoped>
.banner-edit-page { width: 100%}
.banner-edit-card { max-width: 85%; display: flex; flex-direction: column; margin: 0 auto;}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px;margin-top: 60px }
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700; }
.tab-row { display:flex; justify-content:center; margin-bottom:18px; }
.tab-title { background: #f9dada; color:#e35d6a; font-weight:700; font-size:1.15rem; padding:6px 38px; border-radius:18px; letter-spacing:2px; }
.edit-form-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:18px 24px; margin-bottom:50px; box-shadow:0 2px 8px rgba(16,24,40,0.04); }
.form-row {justify-content: center; display:flex; align-items:flex-start; gap:18px; margin-bottom:16px; }
.form-label { font-weight:600; color:#2e6fb7; min-width:140px; margin-top:8px; }
.form-input { width:420px; max-width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; }
.radio-group { display:flex; gap:24px; align-items:center; padding-top:8px; width: 420px;}
.radio-label { display:flex; align-items:center; gap:8px; cursor:pointer; color:#333; font-weight:500; }
.radio-label input[type="radio"] { cursor:pointer; width:16px; height:16px; }
.radio-label span { user-select:none; }
.preview-container { width: 420px }
.preview-image { width:100%; max-width:560px; height:180px; object-fit:cover; border-radius:8px; border:1px solid #e6e6ea; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:8px; }
.btn { padding:7px 18px; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:1rem; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
.btn.danger { background:#ff7b8a; color:#fff }
@media (max-width:900px){
  .banner-edit-card{ width:100%; padding:16px }
  .form-row{ flex-direction:column; align-items:flex-start; }
  .form-label{ width:100%; }
  .form-input{ width:100%; }
  .preview-image{ max-width:100%; height:140px; }
}
</style>
