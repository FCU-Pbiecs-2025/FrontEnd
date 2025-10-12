<template>
  <div class="class-edit-page">
    <div class="class-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/edit-property.png" class="icon" alt="icon" />
        <span class="main-title">{{ isEdit ? '編輯班級' : '新增班級' }}</span>
      </div>


      <div class="form-card">
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
          <input v-model.number="form.enrolled" type="number" min="0" />
        </div>

        <div class="form-row">
          <label>收托年齡起</label>
          <input v-model.number="form.age_from" type="number" min="0" />
        </div>

        <div class="form-row">
          <label>收托年齡訖</label>
          <input v-model.number="form.age_to" type="number" min="0" />
        </div>

        <div class="form-row">
          <label>其他資訊</label>
          <textarea v-model="form.notes" rows="4"></textarea>
        </div>


      </div>
      <div class="bottom-row">
        <button class="btn primary" @click="save">儲存</button>
        <button class="btn ghost" @click="cancel">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

const STORAGE_KEY = 'admin_classes'
const isEdit = computed(() => !!route.params.id)

const defaultForm = () => ({
  id: null,
  institutionId: null,  // 新增機構ID欄位
  unit: '',
  capacity: 0,
  enrolled: 0,
  age_from: null,
  age_to: null,
  notes: ''
})
const form = ref(defaultForm())

const loadList = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

onMounted(() => {
  if (isEdit.value) {
    const id = Number(route.params.id)
    const list = loadList()
    const found = list.find(i => i.id === id)
    if (found) {
      form.value = { ...found }
    } else {
      alert('找不到指定的班級')
      const institutionId = route.params.institutionId
      if (institutionId) {
        router.replace({ name: 'AdminClassList', params: { institutionId } })
      } else {
        router.replace({ name: 'AdminClassManager' })
      }
    }
  } else {
    // 新增模式：從 params 取得機構 ID
    const institutionId = route.params.institutionId
    if (institutionId) {
      form.value.institutionId = Number(institutionId)
    } else {
      alert('缺少機構資訊')
      router.replace({ name: 'AdminClassManager' })
    }
  }
})

const save = () => {
  if (!form.value.unit || form.value.unit.trim() === '') {
    alert('請填寫班級名稱')
    return
  }
  if (!form.value.institutionId) {
    alert('缺少機構資訊')
    return
  }
  const list = loadList()
  if (isEdit.value) {
    // update
    const idx = list.findIndex(i => i.id === form.value.id)
    if (idx !== -1) {
      list[idx] = { ...form.value }
    }
  } else {
    // new
    const newId = Date.now()
    list.push({ ...form.value, id: newId })
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  // 返回到該機構的班級列表
  router.replace({ name: 'AdminClassList', params: { institutionId: form.value.institutionId } })
}

const cancel = () => {
  const institutionId = form.value.institutionId || route.params.institutionId
  if (institutionId) {
    router.replace({ name: 'AdminClassList', params: { institutionId } })
  } else {
    router.replace({ name: 'AdminClassManager' })
  }
}
</script>

<style scoped>
.class-edit-page { display:flex; justify-content:center; }
.class-card { width:100%; }
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; margin-top: 60px; }
.icon { width:28px; height:28px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700; }
.form-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:18px 24px; margin-bottom:50px; box-shadow:0 2px 8px rgba(16,24,40,0.04);margin-top: 50px }
.form-row { display:flex; align-items:center; gap:12px; margin-bottom:10px;justify-content: center; }
.form-row label { width:120px; color:#2e6fb7; font-weight:600; }
.form-row input, .form-row textarea {  height:40px;width: 420px;padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0;}
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:12px; }
.btn { padding:7px 18px; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:1rem; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
@media (max-width:900px){ .class-card{ width:100%; padding:16px } .form-row{ flex-direction:column; align-items:flex-start } .form-row label{ width:100% } }
</style>
