<template>
  <div class="detail-card">
    <h1 class="main-title">{{ announcement?.title || '公告詳細內容' }}</h1>

    <div class="meta" v-if="announcement">
      <span class="date">發布日期：{{ announcement.date }}</span>
    </div>

    <div v-if="announcement" class="content-block">
      <div class="content" v-html="announcement.content"></div>
      <div v-if="attachmentUrlComputed" class="attachments-section">
        <div class="attachments-title">相關附件：</div>
        <ul class="attachments-list">
          <li>
            <a :href="attachmentUrlComputed" target="_blank" download :class="fileClass(attachmentName)">
              <span class="file-icon" v-html="fileIcon(attachmentName)"></span>
              {{ attachmentName || '下載附件' }}
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div v-else class="not-found">找不到此公告。</div>

    <div class="footer">
      <button class="btn back" @click="goBack">返回後台首頁</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAnnouncementDetail } from '@/api/announcements.js'
import { extractOriginalFilename } from '@/utils/fileUtils.js'

const route = useRoute()
const router = useRouter()
const announcement = ref(null)
const loading = ref(false)
const loadError = ref(null)

function ensureSidebarVisible() {
  // 通過事件通知父層 AdminHome 展開側邊欄
  const event = new CustomEvent('ensure-sidebar-open')
  window.dispatchEvent(event)
}

function restoreSidebarState() {
  // 不需要恢復，讓用戶狀態保持
}

onMounted(async () => {
  ensureSidebarVisible()
  const id = route.params.id
  if (!id) {
    loadError.value = '缺少公告 ID'
    return
  }
  loading.value = true
  try {
    const data = await getAnnouncementDetail(id)
    if (data && (data.announcementID || data.id)) {
      announcement.value = {
        id: String(data.announcementID || data.id),
        title: data.title || '',
        content: data.content || '',
        date: data.startDate || '',
        attachmentPath: data.attachmentPath || null,
      }
    } else {
      loadError.value = '未找到公告資料'
    }
  } catch (e) {
    console.error('load announcement detail error:', e)
    loadError.value = e?.message || '載入失敗'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  restoreSidebarState()
})

// Compute attachment name and URL robustly
const attachmentName = computed(() => {
  const p = announcement.value?.attachmentPath
  if (!p) return ''

  // 使用 extractOriginalFilename 函數來正確解析檔名
  return extractOriginalFilename(p)
})

const attachmentUrlComputed = computed(() => {
  const p = announcement.value?.attachmentPath
  if (!p) return ''

  // If already absolute URL (http/https), return as-is
  if (p.startsWith('http://') || p.startsWith('https://')) return p

  // If it starts with the backend static path, ensure it's proxied through /api
  if (p.startsWith('/AttachmentResource') || p.startsWith('AttachmentResource')) {
    const rel = p.startsWith('/') ? p.substring(1) : p
    return `/api/${rel}`
  }

  // Extract filename from various path formats and use backend controller endpoint
  const filename = (() => {
    // Handle file:///C:/path... format
    const filePrefix = 'file:///'
    if (p.startsWith(filePrefix)) {
      const rest = p.substring(filePrefix.length)
      const parts = rest.split(/[\\/]/)
      return parts[parts.length - 1]
    }
    // Handle Windows absolute path C:\path... or C:/path...
    if (/^[A-Za-z]:[\\/]/.test(p)) {
      const parts = p.split(/[\\/]/)
      return parts[parts.length - 1]
    }
    // Handle regular path or just filename
    const parts = p.split(/[\\/]/)
    return parts[parts.length - 1]
  })()

  if (!filename) return ''

  // Use the backend AttachmentResourceController endpoint via /api proxy
  return `/api/AttachmentResource/${encodeURIComponent(filename)}`
})

const goBack = () => {
  // Navigate back to admin home (/admin) using explicit path
  router.push('/admin')
}

function fileClass(name) {
  const ext = (name?.split('.')?.pop() || '').toLowerCase()
  if (ext === 'pdf') return 'file-pdf'
  if (ext === 'doc' || ext === 'docx') return 'file-docx'
  if (ext === 'odt') return 'file-odt'
  return ''
}
function fileIcon(name) {
  const ext = (name?.split('.')?.pop() || '').toLowerCase()
  if (ext === 'pdf') return `<svg width='20' height='20' viewBox='0 0 20 20'><rect width='20' height='20' rx='4' fill='#e35d6a'/><text x='4' y='15' font-size='10' fill='#fff'>PDF</text></svg>`
  if (ext === 'doc' || ext === 'docx') return `<svg width='20' height='20' viewBox='0 0 20 20'><rect width='20' height='20' rx='4' fill='#2176d2'/><text x='3' y='15' font-size='10' fill='#fff'>DOCX</text></svg>`
  if (ext === 'odt') return `<svg width='20' height='20' viewBox='0 0 20 20'><rect width='20' height='20' rx='4' fill='#1e88e5'/><text x='4' y='15' font-size='10' fill='#fff'>ODT</text></svg>`
  return `<svg width='20' height='20' viewBox='0 0 20 20'><rect width='20' height='20' rx='4' fill='#aaa'/></svg>`
}
</script>

<style scoped>
.detail-card {
  width: 100%;
  max-width: 100%;
  padding: 30px;
  margin: 0;
  display: flex;
  flex-direction: column;
  min-height: 70vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.main-title {
  font-size: 1.35rem;
  color: #2e6fb7;
  font-weight: 800;
  margin: 6px 0 14px 0;
}

.meta {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  font-size: .95rem;
  margin-bottom: 18px;
}

.date { color: #6b7280; }

.content-block { margin-top: 10px; }

.content {
  color: #333;
  font-size: 1.06rem;
  line-height: 1.9;
  word-wrap: break-word;
  overflow-wrap: anywhere;
  max-width: 100%;
}

.attachments-section { margin-top: 16px; }

.attachments-title {
  color: #e35d6a;
  font-weight: 700;
  margin-bottom: 10px;
}

.attachments-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.attachments-list a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #f9afae;
  border-radius: 6px;
  padding: 6px 14px 6px 6px;
  color: #a67c52;
  text-decoration: none;
  word-break: break-all;
}

.attachments-list a:hover {
  background: #fff8f6;
  color: #e35d6a;
}

.file-pdf { color: #e35d6a; border-color: #e35d6a; }
.file-docx { color: #2176d2; border-color: #2176d2; }
.file-odt { color: #1e88e5; border-color: #1e88e5; }

.file-icon {
  display: inline-block;
  margin-right: 4px;
  vertical-align: middle;
}

.not-found {
  color: #e35d6a;
  text-align: center;
  font-size: 1.05rem;
  margin: 28px 0;
}

.footer {
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding-top: 20px;
}

.btn.back {
  background: #2e6fb7;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 22px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn.back:hover {
  background: #1f5c9e;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .detail-card {
    padding: 20px;
    border-radius: 8px;
  }

  .main-title {
    font-size: 1.2rem;
  }

  .meta {
    justify-content: flex-start;
    margin-bottom: 18px;
  }

  .content {
    font-size: 1rem;
    line-height: 1.7;
  }

  .attachments-list a {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
}
</style>
