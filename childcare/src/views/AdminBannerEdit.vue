<template>
  <div class="banner-edit-page">
    <div class="banner-card">
      <h2>{{ isNew ? '新增海報' : '編輯海報' }}</h2>

      <div class="form-row">
        <label>Banner 圖片 URL</label>
        <input v-model="form.image" placeholder="https://..." />
      </div>

      <div class="form-row">
        <label>連結 (可為外部 http(s) 或本系統 path 或 route name)</label>
        <input v-model="form.link" placeholder="/apply-service 或 https://... 或 RouteName" />
      </div>

      <div class="form-row">
        <label>顯示日期</label>
        <input type="date" v-model="form.displayDate" />
      </div>

      <div class="form-row">
        <label>狀態</label>
        <select v-model="form.status">
          <option>顯示</option>
          <option>隱藏</option>
        </select>
      </div>

      <div class="actions">
        <button class="btn" @click="save">儲存</button>
        <button class="btn ghost" @click="cancel">取消</button>
        <button v-if="!isNew" class="btn danger" @click="doDelete">刪除</button>
      </div>

      <div v-if="previewAvailable" class="preview">
        <div>預覽：</div>
        <img :src="form.image" alt="preview" />
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
      // if not found, redirect back to manager
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
  // go back to manager list
  router.replace({ path: '/admin' })
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
  router.replace({ path: '/admin' })
}

const cancel = () => {
  router.back()
}

const previewAvailable = computed(() => !!form.value.image)
</script>

<style scoped>
.banner-edit-page { padding: 18px 0; display:flex; justify-content:center }
.banner-card { width: 520px; background: #fff; border:1px solid #F1E9E9; border-radius:10px; padding:18px; box-shadow:0 8px 24px rgba(0,0,0,0.04)}
.banner-card h2 { color:#2e6fb7; margin-bottom:12px }
.form-row { display:flex; flex-direction:column; gap:6px; margin-bottom:12px }
.form-row input, .form-row select { padding:8px; border-radius:6px; border:1px solid #e5e7eb }
.actions { display:flex; gap:8px }
.btn { padding:8px 14px; border-radius:8px; border:none; background:#3b82f6; color:#fff; cursor:pointer }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
.btn.danger, .danger { background:#ff7b8a; color:#fff }
.preview { margin-top:12px }
.preview img { width:100%; height:140px; object-fit:cover; border-radius:8px }
</style>
