<template>
  <div class="guidelines-page">
    <div class="guidelines-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/document.png" class="icon" alt="icon" />
        <span class="main-title">規範說明管理</span>
      </div>



      <div class="section-card">
        <div class="section-header">收托資格</div>
        <div ref="editor1" class="editor-container"></div>



        <div class="section-header">服務內容與時間</div>
        <div ref="editor2" class="editor-container"></div>



        <div class="section-header">收費及退費原則</div>
        <div ref="editor3" class="editor-container"></div>
      </div>

      <div class="bottom-row">
        <button class="btn ghost" @click="load">還原</button>
        <button class="btn primary" @click="save">儲存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const router = useRouter()

const editor1 = ref(null)
const editor2 = ref(null)
const editor3 = ref(null)

const quill1 = ref(null)
const quill2 = ref(null)
const quill3 = ref(null)

const STORAGE_KEY = 'guidelinesContent'

const data = ref({
  part1: '',
  part2: '',
  part3: ''
})

const toolbarOptions = [
  ['bold', 'italic', 'underline'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  ['link'],
  ['clean']
]

onMounted(async () => {
  await nextTick()

  // 初始化 Quill 編輯器
  quill1.value = new Quill(editor1.value, {
    theme: 'snow',
    modules: {
      toolbar: toolbarOptions
    }
  })

  quill2.value = new Quill(editor2.value, {
    theme: 'snow',
    modules: {
      toolbar: toolbarOptions
    }
  })

  quill3.value = new Quill(editor3.value, {
    theme: 'snow',
    modules: {
      toolbar: toolbarOptions
    }
  })

  // 載入儲存的內容
  loadContent()
})

const loadContent = () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      data.value = { ...data.value, ...parsed }

      // 設定編輯器內容
      if (quill1.value) quill1.value.root.innerHTML = data.value.part1 || ''
      if (quill2.value) quill2.value.root.innerHTML = data.value.part2 || ''
      if (quill3.value) quill3.value.root.innerHTML = data.value.part3 || ''
    } catch (e) {
      console.warn('invalid guidelines content')
    }
  }
}

const save = () => {
  // 收集編輯器內容
  data.value.part1 = quill1.value ? quill1.value.root.innerHTML : ''
  data.value.part2 = quill2.value ? quill2.value.root.innerHTML : ''
  data.value.part3 = quill3.value ? quill3.value.root.innerHTML : ''

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value))
  alert('儲存成功')
}

const load = () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    if (confirm('沒有已儲存的內容，是否清空？')) {
      if (quill1.value) quill1.value.setText('')
      if (quill2.value) quill2.value.setText('')
      if (quill3.value) quill3.value.setText('')
      data.value = { part1: '', part2: '', part3: '' }
    }
    return
  }

  try {
    const parsed = JSON.parse(raw)
    data.value = { ...data.value, ...parsed }

    if (quill1.value) quill1.value.root.innerHTML = data.value.part1 || ''
    if (quill2.value) quill2.value.root.innerHTML = data.value.part2 || ''
    if (quill3.value) quill3.value.root.innerHTML = data.value.part3 || ''
  } catch (e) {
    console.warn('invalid data')
  }
}
</script>

<style scoped>
.guidelines-page { display:flex; justify-content:center; }
.guidelines-card { width:860px; }
.title-row { display:flex; align-items:center; gap:10px; margin-bottom:8px;margin-top: 60px; }
.icon { width:30px; height:30px }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700 }
.tab-row { display:flex; justify-content:center; margin-bottom:18px }
.tab-title { background:#f9dada; color:#e35d6a; padding:6px 30px; border-radius:18px; font-weight:700 }
.section-card {border:1px solid #e6e6ea; border-radius:10px; padding:30px; margin:50px auto; }
.section-header { font-weight:700; color:#2e6fb7; font-size:1.1rem; margin-bottom:12px; }
.editor-container { min-height:180px; margin-bottom: 40px}
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:12px ;margin-bottom: 20px}
.btn { padding:8px 16px; border-radius:8px; cursor:pointer; font-weight:600 }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff; border:none }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }

/* Quill 編輯器樣式調整 */
:deep(.ql-toolbar) {
  border-top: 1px solid #ccc;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
}

:deep(.ql-container) {
  border-bottom: 1px solid #ccc;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 6px 6px;
  min-height: 140px;
}

:deep(.ql-editor) {
  min-height: 140px;
  padding: 12px;
}
</style>
