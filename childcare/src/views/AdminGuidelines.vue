<template>
  <div class="guidelines-page">
    <div class="guidelines-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/document.png" class="icon" alt="icon" />
        <span class="main-title">規範說明管理</span>
      </div>

      <div class="tab-row">
        <span class="tab-title">頁面編輯器</span>
      </div>

      <div class="section-card">
        <div class="section-header">收托資格</div>
        <div class="toolbar">
          <button @click.prevent="exec('bold')" title="Bold">B</button>
          <button @click.prevent="exec('italic')" title="Italic">I</button>
          <button @click.prevent="exec('underline')" title="Underline">U</button>
          <button @click.prevent="exec('insertUnorderedList')" title="Bullet">•</button>
          <button @click.prevent="exec('insertOrderedList')" title="Number">1.</button>
          <button @click.prevent="createLink" title="Link">🔗</button>
          <button @click.prevent="exec('removeFormat')" title="Clear">清除</button>
        </div>
        <div
          class="editor"
          contenteditable="true"
          ref="editor1"
          @input="onInput(1)"
        ></div>
      </div>

      <div class="section-card">
        <div class="section-header">服務內容與時間</div>
        <div class="toolbar">
          <button @click.prevent="exec('bold')" title="Bold">B</button>
          <button @click.prevent="exec('italic')" title="Italic">I</button>
          <button @click.prevent="exec('underline')" title="Underline">U</button>
          <button @click.prevent="exec('insertUnorderedList')" title="Bullet">•</button>
          <button @click.prevent="exec('insertOrderedList')" title="Number">1.</button>
          <button @click.prevent="createLink" title="Link">🔗</button>
          <button @click.prevent="exec('removeFormat')" title="Clear">清除</button>
        </div>
        <div
          class="editor"
          contenteditable="true"
          ref="editor2"
          @input="onInput(2)"
        ></div>
      </div>

      <div class="section-card">
        <div class="section-header">收費及退費原則</div>
        <div class="toolbar">
          <button @click.prevent="exec('bold')" title="Bold">B</button>
          <button @click.prevent="exec('italic')" title="Italic">I</button>
          <button @click.prevent="exec('underline')" title="Underline">U</button>
          <button @click.prevent="exec('insertUnorderedList')" title="Bullet">•</button>
          <button @click.prevent="exec('insertOrderedList')" title="Number">1.</button>
          <button @click.prevent="createLink" title="Link">🔗</button>
          <button @click.prevent="exec('removeFormat')" title="Clear">清除</button>
        </div>
        <div
          class="editor"
          contenteditable="true"
          ref="editor3"
          @input="onInput(3)"
        ></div>
      </div>

      <div class="bottom-row">
        <button class="btn ghost" @click="load">還原</button>
        <button class="btn primary" @click="save">儲存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const editor1 = ref(null)
const editor2 = ref(null)
const editor3 = ref(null)

const STORAGE_KEY = 'guidelinesContent'

const data = ref({
  part1: '',
  part2: '',
  part3: ''
})

onMounted(() => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      data.value = { ...data.value, ...parsed }
    } catch (e) {
      console.warn('invalid guidelines content')
    }
  }
  // populate editors
  if (editor1.value) editor1.value.innerHTML = data.value.part1 || ''
  if (editor2.value) editor2.value.innerHTML = data.value.part2 || ''
  if (editor3.value) editor3.value.innerHTML = data.value.part3 || ''
})

const exec = (cmd, value = null) => {
  document.execCommand(cmd, false, value)
}

const createLink = () => {
  const url = prompt('請輸入連結 (包含 http:// 或 https://)')
  if (url) document.execCommand('createLink', false, url)
}

const onInput = (idx) => {
  if (idx === 1) data.value.part1 = editor1.value.innerHTML
  if (idx === 2) data.value.part2 = editor2.value.innerHTML
  if (idx === 3) data.value.part3 = editor3.value.innerHTML
}

const save = () => {
  // gather
  data.value.part1 = editor1.value.innerHTML
  data.value.part2 = editor2.value.innerHTML
  data.value.part3 = editor3.value.innerHTML
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value))
  alert('儲存成功')
}

const load = () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    if (confirm('沒有已儲存的內容，是否清空？')) {
      editor1.value.innerHTML = ''
      editor2.value.innerHTML = ''
      editor3.value.innerHTML = ''
      data.value = { part1: '', part2: '', part3: '' }
    }
    return
  }
  try {
    const parsed = JSON.parse(raw)
    data.value = { ...data.value, ...parsed }
    editor1.value.innerHTML = data.value.part1 || ''
    editor2.value.innerHTML = data.value.part2 || ''
    editor3.value.innerHTML = data.value.part3 || ''
  } catch (e) {
    console.warn('invalid data')
  }
}
</script>

<style scoped>
.guidelines-page { display:flex; justify-content:center; padding:28px 0; }
.guidelines-card { width:860px; background:#fff; border:1.5px solid #e6e6ea; border-radius:14px; padding:22px 26px; box-shadow:0 8px 24px rgba(16,24,40,0.04); }
.title-row { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
.icon { width:30px; height:30px }
.main-title { font-size:1.4rem; color:#2e6fb7; font-weight:700 }
.tab-row { display:flex; justify-content:center; margin-bottom:18px }
.tab-title { background:#f9dada; color:#e35d6a; padding:6px 30px; border-radius:18px; font-weight:700 }
.section-card { border:1px solid #e6e6ea; border-radius:10px; padding:12px; margin-bottom:16px }
.section-header { font-weight:700; color:#2e6fb7; margin-bottom:8px }
.toolbar { display:flex; gap:8px; margin-bottom:8px }
.toolbar button { padding:6px 8px; border-radius:6px; border:1px solid #d8dbe0; background:#fff; cursor:pointer }
.editor { min-height:140px; border:1px solid #d8dbe0; border-radius:6px; padding:10px; background:#fff; overflow:auto }
.bottom-row { display:flex; justify-content:flex-end; gap:12px; margin-top:12px }
.btn { padding:8px 16px; border-radius:8px; cursor:pointer; font-weight:600 }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff; border:none }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
</style>
