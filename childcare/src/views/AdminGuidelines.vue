<template>
  <div class="guidelines-page">
    <div class="guidelines-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/document.png" class="icon" alt="icon" />
        <span class="main-title">規範說明管理</span>
      </div>

      <!-- 錯誤和成功訊息 -->
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="loading" class="alert alert-info">處理中...</div>

      <div class="section-card">
        <!-- reordered: show Service Content (editor2) first -->
        <div class="section-header">服務內容與時間</div>
        <div ref="editor2" class="editor-container"></div>

        <!-- then Fee and Refund (editor3) -->
        <div class="section-header">收費及退費原則</div>
        <div ref="editor3" class="editor-container"></div>

        <!-- finally Admission Eligibility (editor1) -->
        <div class="section-header">收托資格</div>
        <div ref="editor1" class="editor-container"></div>
      </div>

      <div class="bottom-row">
        <button class="btn ghost" @click="load" :disabled="loading">還原</button>
        <button class="btn primary" @click="save" :disabled="loading">
          {{ loading ? '儲存中...' : '儲存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { getRules, updateRule } from '../api/rules'

const router = useRouter()

const editor1 = ref(null)
const editor2 = ref(null)
const editor3 = ref(null)

const quill1 = ref(null)
const quill2 = ref(null)
const quill3 = ref(null)

const ruleId = ref(1)
const loading = ref(false)
const error = ref('')

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

const loadContent = async () => {
  loading.value = true
  error.value = ''

  try {
    console.log('開始取得規則資料...')
    const res = await getRules()
    console.log('API 回應:', res)

    if (res.data && res.data.length > 0) {
      const rule = res.data[0]
      ruleId.value = rule.id

      // part1 對應 admissionEligibility (收托資格)
      // part2 對應 serviceContentAndTime (服務內容與時間)
      // part3 對應 feeAndRefundPolicy (收費及退費原則)
      data.value.part1 = rule.admissionEligibility || ''
      data.value.part2 = rule.serviceContentAndTime || ''
      data.value.part3 = rule.feeAndRefundPolicy || ''

      // 設定編輯器內容
      if (quill1.value) quill1.value.root.innerHTML = data.value.part1
      if (quill2.value) quill2.value.root.innerHTML = data.value.part2
      if (quill3.value) quill3.value.root.innerHTML = data.value.part3
    }
  } catch (err) {
    console.error('取得資料失敗:', err)
    error.value = '取得資料失敗: ' + (err.response?.data?.message || err.message)

    // 如果 API 失敗，嘗試從 localStorage 載入備份
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        data.value = { ...data.value, ...parsed }

        if (quill1.value) quill1.value.root.innerHTML = data.value.part1 || ''
        if (quill2.value) quill2.value.root.innerHTML = data.value.part2 || ''
        if (quill3.value) quill3.value.root.innerHTML = data.value.part3 || ''
      } catch (e) {
        console.warn('invalid guidelines content')
      }
    }
  } finally {
    loading.value = false
  }
}

const save = async () => {
  loading.value = true
  error.value = ''

  // 確保編輯器存在
  if (!quill1.value || !quill2.value || !quill3.value) {
    error.value = '編輯器尚未初始化完成，請稍後再試'
    loading.value = false
    return
  }

  // 收集編輯器內容
  data.value.part1 = quill1.value.root.innerHTML
  data.value.part2 = quill2.value.root.innerHTML
  data.value.part3 = quill3.value.root.innerHTML

  const apiData = {
    admissionEligibility: data.value.part1,
    serviceContentAndTime: data.value.part2,
    feeAndRefundPolicy: data.value.part3
  }

  console.log('儲存資料至 /api/rules/' + ruleId.value)

  try {
    await updateRule(ruleId.value, apiData)
    console.log('✅ 儲存成功')

    // 同時備份到 localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value))

    // 顯示瀏覽器的 alert 提示（使用者要求的跳 alert 方式）
    alert('儲存成功！資料已更新')

    // (內頁綠框提示已移除，如需在頁面顯示訊息可改用 error 或其他 UI 元件)
  } catch (err) {
    console.error('❌ 儲存失敗:', err)

    const status = err.response?.status
    let errorMsg

    // 根據狀態碼給出具體提示
    if (!status) {
      errorMsg = '無法連接到後端伺服器，請確認後端是否正常運行'
    } else if (status === 401) {
      errorMsg = '認證失敗，請重新登入'
    } else if (status === 403) {
      errorMsg = '權限不足，無法執行此操作'
    } else if (status === 404) {
      errorMsg = '找不到對應的資源'
    } else if (status === 500) {
      errorMsg = '伺服器內部錯誤，請稍後再試'
    } else if (err.response?.data?.message) {
      errorMsg = err.response.data.message
    } else {
      errorMsg = err.message || '未知錯誤'
    }

    error.value = errorMsg
  } finally {
    loading.value = false
  }
}

const load = async () => {
  if (!confirm('確定要重新載入資料？未儲存的變更將會遺失。')) {
    return
  }

  await loadContent()
}
</script>

<style scoped>
.guidelines-page { display:flex; justify-content:center; }
.guidelines-card { max-width:820px;min-width: 85%}
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
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 訊息提示框 */
.alert {
  padding: 15px;
  margin: 20px 0;
  border-radius: 6px;
  font-weight: 600;
}

.alert-error {
  background-color: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.alert-success {
  background-color: #efe;
  color: #3a3;
  border: 1px solid #cfc;
}

.alert-info {
  background-color: #def;
  color: #369;
  border: 1px solid #bce;
}

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
