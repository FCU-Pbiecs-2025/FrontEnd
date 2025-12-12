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
          <label class="form-label">排序值：</label>
          <input type="number" v-model="form.sortOrder" class="form-input" placeholder="1" min="1" />
        </div>
        <div class="form-row">
          <label class="form-label">Banner 圖片：</label>
          <div class="file-upload-container">
            <input
              type="file"
              ref="fileInput"
              @change="handleFileUpload"
              accept="image/*"
              class="file-input"
            />
            <button type="button" @click="$refs.fileInput.click()" class="btn file-btn">
              選擇檔案
            </button>
            <span v-if="form.imageName" class="file-name">{{ getDisplayFileName(form.imageName) }}</span>
          </div>
        </div>
        <div class="form-row">
          <label class="form-label">跳轉連結：</label>
          <input v-model="form.linkUrl" class="form-input" placeholder="/apply-service 或 https://... 或 RouteName" />
        </div>
        <div class="form-row">
          <label class="form-label">開始時間：</label>
          <input type="datetime-local" v-model="form.startTime" class="form-input" />
        </div>
        <div class="form-row">
          <label class="form-label">結束時間：</label>
          <input type="datetime-local" v-model="form.endTime" class="form-input" />
        </div>
        <div class="form-row">
          <label class="form-label">狀態：</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" :value="false" v-model="form.status" />
              <span>上架</span>
            </label>
            <label class="radio-label">
              <input type="radio" :value="true" v-model="form.status" />
              <span>下架</span>
            </label>
          </div>
        </div>

        <div v-if="previewAvailable" class="form-row">
          <label class="form-label">預覽：</label>
          <div class="preview-container">
            <img :src="previewImageUrl" alt="preview" class="preview-image" />
          </div>
        </div>
      </div>

      <div class="bottom-row">
        <button class="btn ghost" @click="cancel">返回</button>
        <button class="btn primary" @click="save">儲存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import bannersApi from '../api/banners'

const route = useRoute()
const router = useRouter()

const getToday = () => {
  const d = new Date();
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const form = ref({
  id: null,
  sortOrder: 1,
  imageName: '',
  linkUrl: '',
  startTime: getToday(),
  endTime: getToday(),
  status: false // false = 上架, true = 下架
})
const selectedFile = ref(null)
const fileInput = ref(null)

const isNew = computed(() => route.name === 'AdminBannerNew' || !route.params.id)

onMounted(async () => {
  if (!isNew.value) {
    const id = Number(route.params.id)
    try {
      const resp = await bannersApi.get(id)
      const data = resp.data
      if (data) {
        // Ensure dates are in datetime-local compatible format if backend returns ISO
        const normalizeDate = (d) => {
          if (!d) return getToday()
          const dt = new Date(d)
          const pad = n => n.toString().padStart(2, '0')
          return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
        }
        form.value = {
          id: data.id,
          sortOrder: data.sortOrder ?? 1,
          imageName: data.imageName ?? '',
          linkUrl: data.linkUrl ?? '',
          startTime: normalizeDate(data.startTime),
          endTime: normalizeDate(data.endTime),
          status: !!data.status
        }
      } else {
        router.replace({ path: '/admin' })
      }
    } catch (err) {
      console.error('failed to load banner', err)
      alert('讀取海報資料失敗，請稍後再試')
      router.replace({ path: '/admin' })
    }
  } else {
    // 新增時預設時間
    form.value.startTime = getToday();
    form.value.endTime = getToday();
  }
})

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    form.value.imageName = file.name
    // 這裡可以添加文件驗證邏輯
    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片檔案')
      selectedFile.value = null
      form.value.imageName = ''
    }
  }
}

const validate = () => {
  if (!form.value.imageName) {
    alert('請選擇圖片檔案')
    return false
  }
  if (!form.value.sortOrder || form.value.sortOrder < 1) {
    alert('請輸入正確的排序值')
    return false
  }
  if (!form.value.startTime) {
    alert('請選擇開始時間')
    return false
  }
  if (!form.value.endTime) {
    alert('請選擇結束時間')
    return false
  }
  if (new Date(form.value.startTime) >= new Date(form.value.endTime)) {
    alert('結束時間必須晚於開始時間')
    return false
  }
  return true
}

const save = async () => {
  if (!validate()) return

  // Prepare meta object (the backend expects JSON meta for create/update)
  const normalizeDateForBackend = (localDateTime) => {
    // form inputs are like YYYY-MM-DDTHH:mm, backend expects seconds as well: YYYY-MM-DDTHH:mm:00
    if (!localDateTime) return null
    if (localDateTime.length === 16) return `${localDateTime}:00`
    return localDateTime
  }

  const meta = {
    sortOrder: Number(form.value.sortOrder),
    linkUrl: form.value.linkUrl || null,
    startTime: normalizeDateForBackend(form.value.startTime),
    endTime: normalizeDateForBackend(form.value.endTime),
    // backend sample expects numeric status (e.g. 1) - convert boolean to integer: true=>1, false=>0
    status: form.value.status ? 1 : 0,
    imageName: form.value.imageName || null
  }

  try {
    if (selectedFile.value) {
      // When uploading a file, send multipart/form-data with file + meta as JSON part
      const fd = new FormData()
      fd.append('file', selectedFile.value)
      // Attach meta as a JSON blob with content-type application/json so backend @RequestPart parses it
      const metaBlob = new Blob([JSON.stringify(meta)], { type: 'application/json' })
      fd.append('meta', metaBlob)

      if (isNew.value) {
        // creating new banner with file
        const uploadResp = await bannersApi.upload(fd)
        const created = uploadResp.data
        if (created) {
          form.value.id = created.id ?? form.value.id
          form.value.imageName = created.imageName ?? form.value.imageName
        }
      } else {
        // editing existing banner and replacing file
        const id = form.value.id || route.params.id
        const resp = await bannersApi.update(id, fd)
        const updated = resp.data
        if (updated) {
          form.value.imageName = updated.imageName ?? form.value.imageName
        }
      }
    } else {
      // No file selected - just send JSON meta
      if (isNew.value) {
        const resp = await bannersApi.create(meta)
        const created = resp.data
        if (created) {
          form.value.id = created.id ?? form.value.id
          form.value.imageName = created.imageName ?? form.value.imageName
        }
      } else {
        const id = form.value.id || route.params.id
        const resp = await bannersApi.update(id, meta)
        const updated = resp.data
        if (updated) {
          form.value.imageName = updated.imageName ?? form.value.imageName
        }
      }
    }

    // 通知前台更新海報資料
    try { window.dispatchEvent(new CustomEvent('banners:updated')) } catch (e) { /* ignore */ }

    // navigate back to banner list
    router.replace({ path: '/admin/banner' })
  } catch (err) {
    console.error('save banner error', err)
    alert('儲存失敗，請稍後再試')
  }
}

const cancel = () => {
  router.replace({ path: '/admin/banner' })
}

// 提取顯示用的檔案名稱（去掉UUID前綴）
const getDisplayFileName = (fileName) => {
  if (!fileName) return ''

  // 如果檔名包含底線，只取底線後面的部分
  if (fileName.includes('_')) {
    const underscoreIndex = fileName.indexOf('_')
    return fileName.substring(underscoreIndex + 1)
  }

  return fileName
}

const previewAvailable = computed(() => !!(selectedFile.value || form.imageName))

const previewImageUrl = computed(() => {
  if (selectedFile.value) {
    return URL.createObjectURL(selectedFile.value)
  } else if (form.value.imageName) {
    // Use the configured static resource path via dev proxy
    return `/api/BannerResource/${form.value.imageName}`
  }
  return ''
})
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

/* File upload styles */
.file-upload-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 420px;
  max-width: 100%;
}

.file-input {
  display: none;
}

.file-btn {
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #d8dbe0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #495057;
  transition: all 0.2s ease;
}

.file-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.file-name {
  font-size: 0.9rem;
  color: #28a745;
  font-weight: 500;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

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
@media (max-width:900px){
  .banner-edit-card{ width:100%; padding:16px }
  .form-row{ flex-direction:column; align-items:flex-start; }
  .form-label{ width:100%; }
  .form-input{ width:100%; }
  .file-upload-container { width: 100%; }
  .file-name { max-width: 100%; }
  .preview-image{ max-width:100%; height:140px; }
}
</style>
