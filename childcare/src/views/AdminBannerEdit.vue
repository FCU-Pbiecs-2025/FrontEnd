<template>
  <div class="banner-edit-page">
    <div class="edit-card">
      <h2>海報管理</h2>
      <div class="edit-form">
        <label>Banner 圖片 URL：<input v-model="form.image" placeholder="https://..." /></label>
        <label>連結：<input v-model="form.link" placeholder="/apply-service 或 https://... 或 RouteName" /></label>
        <label>顯示日期：<input type="date" v-model="form.displayDate" /></label>
        <div class="perm-row">
          <span class="perm-label">狀態：</span>
          <label><input type="radio" value="顯示" v-model="form.status" /> 顯示</label>
          <label><input type="radio" value="隱藏" v-model="form.status" /> 隱藏</label>
        </div>
        <div class="actions-row">
          <button class="btn ghost" @click="cancel">返回</button>
          <button class="btn primary" @click="save">儲存</button>
          <button v-if="!isNew" class="btn danger" @click="doDelete">刪除</button>
        </div>
        <div v-if="previewAvailable" class="preview">
          <div>預覽：</div>
          <img :src="form.image" alt="preview" />
        </div>
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
.banner-edit-page { display:flex; justify-content:center; padding:24px 0; }
.edit-card { width:760px; background: #fff; border:1px solid #e6e6ea; border-radius:12px; padding:18px 22px; box-shadow:0 8px 24px rgba(16,24,40,0.04); }
.edit-card h2 { background: linear-gradient(90deg,#f0f6ff,#f7fbff); display:inline-block; padding:8px 14px; border-radius:20px; color:#2e6fb7; margin-bottom:14px; font-weight:700 }
.edit-form { padding:12px 4px }
.edit-form label { display:block; margin-bottom:12px; color:#333 }
.edit-form input { width:420px; max-width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; box-shadow:inset 0 1px 0 rgba(255,255,255,0.7) }
.perm-row { display:flex; align-items:center; gap:18px; margin-top:8px }
.perm-label { font-weight:700; margin-right:6px; color:#444 }
.actions-row { display:flex; justify-content:flex-end; gap:12px; margin-top:18px }
.btn { padding:8px 18px; border-radius:8px; border:none; cursor:pointer; font-weight:600 }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
.btn.danger { background:#ff7b8a; color:#fff }
.preview { margin-top:18px }
.preview img { width:100%; height:140px; object-fit:cover; border-radius:8px }
@media (max-width:720px){ .edit-card{ width:100%; padding:16px } .edit-form input{ width:100% } }
</style>
