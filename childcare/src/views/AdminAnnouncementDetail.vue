<template>
  <div class="admin-announcement-detail">
    <div class="detail-card">
      <h1 class="main-title">{{ announcement?.title || '公告詳細內容' }}</h1>

      <div class="title-row">
        <div class="title-text">{{ announcement?.title || '公告詳細內容' }}</div>
        <div class="meta" v-if="announcement">
          <span class="date">發布日期：{{ announcement.date }}</span>
        </div>
      </div>

      <div v-if="announcement" class="content-block">
        <div class="content" v-html="announcement.content"></div>
        <div v-if="announcement.attachments && announcement.attachments.length" class="attachments-section">
          <div class="attachments-title">相關附件：</div>
          <ul class="attachments-list">
            <li v-for="(file, idx) in announcement.attachments" :key="idx">
              <a :href="file.url" target="_blank" download :class="fileClass(file.name)">
                <span class="file-icon" v-html="fileIcon(file.name)"></span>
                {{ file.name }}
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const STORAGE_KEY = 'announcementData'
const announcement = ref(null)

onMounted(() => {
  // 強制 always mock PDF 公告，並直接顯示該資料
  const mockPdf = {
    id: 'mock-pdf',
    title: 'PDF 測試公告',
    date: '2025-10-28',
    category: '系統公告',
    content: '<p>這是一則包含 PDF 附件的公告內容。</p>',
    attachments: [
      { name: '測試檔案.pdf', url: '/files/test.pdf' }
    ]
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([mockPdf]))
  announcement.value = mockPdf
})

const goBack = () => {
  router.push({ name: 'AdminHome' })
}

const typeText = (t) => {
  if (t === 'front') return '前台公告'
  if (t === 'back') return '後台公告'
  return '公告'
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
.admin-announcement-detail { display:flex; justify-content:center; }
.detail-card {
  width: min(900px, 90vw); padding: 24px 28px; margin: 40px auto 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 70vh;
}
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight: 800; margin: 6px 0 14px 0; }
.title-row { display:flex; align-items:center; justify-content:space-between; gap: 16px; margin: 6px 0 18px 0; }
.title-text { font-size:1.2rem; font-weight:700; color:#334e5c; }
.meta { display:flex; align-items:center; gap: 12px; color:#6b7280; font-size:.95rem; }
.badge { padding:4px 10px; border-radius: 999px; font-weight: 700; font-size: .85rem; }
.badge.front { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }
.badge.back { background:#ffe6ea; color:#e35d6a; border:1px solid #f9b2be }
.date { color:#6b7280; }
.content-block { margin-top: 10px; }
.content { color:#333; font-size:1.06rem; line-height:1.9; }
.attachments-section { margin-top: 16px; }
.attachments-title { color:#e35d6a; font-weight:700; margin-bottom: 10px; }
.attachments-list { list-style:none; padding:0; margin:0; display:flex; flex-wrap:wrap; gap:12px; }
.attachments-list a { display:inline-flex; align-items:center; gap:7px; border:1px solid #f9afae; border-radius:6px; padding:6px 14px 6px 6px; color:#a67c52; text-decoration:none; }
.attachments-list a:hover{ background:#fff8f6; color:#e35d6a; }
.file-pdf { color:#e35d6a; border-color:#e35d6a; }
.file-docx { color:#2176d2; border-color:#2176d2; }
.file-odt { color:#1e88e5; border-color:#1e88e5; }
.file-icon{ display:inline-block; margin-right:4px; vertical-align:middle; }
.not-found { color:#e35d6a; text-align:center; font-size:1.05rem; margin: 28px 0; }
.footer {
  display: flex;
  justify-content: center;
  margin-top: auto;
}
.btn.back { background:#2e6fb7; color:#fff; border:none; border-radius:8px; padding:10px 22px; font-weight:700; cursor:pointer; }
.btn.back:hover { background:#1f5c9e; }
</style>
