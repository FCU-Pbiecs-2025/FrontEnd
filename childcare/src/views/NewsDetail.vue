<template>
  <div class="news-detail-bg">
    <div class="news-detail">
      <h1 class="news-main-title">{{ news?.title || '公告詳細內容' }}</h1>

      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>載入中...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
      </div>
      <div v-else-if="news" class="news-content-block">
        <div class="news-content" v-html="news.content"></div>
        <div v-if="news.attachments && news.attachments.length" class="attachments-section">
          <div class="news-date">相關附件：</div>

          <ul class="attachments-list">
            <li v-for="(file, idx) in news.attachments" :key="idx">
              <a href="#" @click="handleDownload(file, $event)" :class="fileClass(file.name)" :title="file.name">
                <span class="file-icon" v-html="fileIcon(file.name)"></span>
                {{ file.name }}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div v-else class="not-found">找不到此公告。</div>
      <div class="news-detail-footer">
        <button class="back-btn" @click="goBack">返回公告列表</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAnnouncementDetail } from '../api/announcements.js'
import { extractOriginalFilename, downloadFile } from '../utils/fileUtils.js'

const route = useRoute()
const router = useRouter()
const news = ref(null)
const isLoading = ref(false)
const error = ref(null)

// 載入公告詳細資料
const loadNewsDetail = async (id) => {
  isLoading.value = true
  error.value = null
  try {
    // getAnnouncementDetail in api wrapper already returns res.data
    const data = await getAnnouncementDetail(id)
     // 將後端的 attachmentPath 映射為 attachments 陣列，提供下載 URL
     const attachments = []
     if (data && data.attachmentPath) {
       // attachmentPath format: UUID_originalFilename
       const displayName = extractOriginalFilename(data.attachmentPath)

       attachments.push({
         name: displayName,
         // 前端使用 /api 代理，後端的下載 endpoint 為 /announcements/{id}/attachment
         url: `/api/announcements/${id}/attachment`
       })
     }
     data.attachments = attachments
     news.value = data
   } catch (err) {
     console.error('載入公告詳細資料失敗:', err)
     error.value = '載入公告詳細資料失敗'
     news.value = null
   } finally {
     isLoading.value = false
   }
 }

 // 處理檔案下載
 const handleDownload = async (file, event) => {
   event.preventDefault()
   try {
     await downloadFile(file.url, file.name)
   } catch (err) {
     console.error('下載失敗:', err)
     alert('下載失敗，請稍後再試')
   }
 }

 function fileClass(name) {
   const ext = name.split('.').pop().toLowerCase()
   if (ext === 'pdf') return 'file-pdf'
   if (ext === 'doc' || ext === 'docx') return 'file-docx'
   if (ext === 'odt') return 'file-odt'
   return ''
 }

 function fileIcon(name) {
   const ext = name.split('.').pop().toLowerCase()
   if (ext === 'pdf') return `<svg width='20' height='20' viewBox='0 0 20 20'><rect width='20' height='20' rx='4' fill='#e35d6a'/><text x='4' y='15' font-size='10' fill='#fff'>PDF</text></svg>`
   if (ext === 'doc' || ext === 'docx') return `<svg width='20' height='20' viewBox='0 0 20 20'><rect width='20' height='20' rx='4' fill='#2176d2'/><text x='3' y='15' font-size='10' fill='#fff'>DOCX</text></svg>`
   if (ext === 'odt') return `<svg width='20' height='20' viewBox='0 0 20 20'><rect width='20' height='20' rx='4' fill='#1e88e5'/><text x='4' y='15' font-size='10' fill='#fff'>ODT</text></svg>`
   return `<svg width='20' height='20' viewBox='0 0 20 20'><rect width='20' height='20' rx='4' fill='#aaa'/></svg>`
 }

 function goBack() {
   router.push({ name: 'News' }).catch(() => {})
 }

 onMounted(() => {
   const id = route.params.id
   if (id) {
     loadNewsDetail(id)
   }
 })
</script>

<style scoped>
.news-detail-bg {

  min-height: 100%;
}
.news-detail {
  padding: 20px 50px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(249, 175, 174, 0.12);
  max-width: 900px; /* 改為 max-width，避免側邊欄被壓縮 */
  width: 100%;
  margin: 48px auto 0 auto;
}
.news-title-row {
  display: flex;
  align-items: center;
  font-weight: bold;
  margin: 15px;
  line-height: 1.2;
}
.news-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2em;
  font-size: 1.08rem;
  color: #888;

}
.news-date {
  color: #e35d6a;
  margin-bottom: 15px;
  margin-left: 15px;
}
.news-category {
  color: #a67c52;
}
.news-content-block {
  margin-bottom: 32px;
}
.news-content {
  color: #333;
  font-size: 1.13rem;
  line-height: 1.9;
  margin: 0px 40px;
  margin-bottom: 30px;
}
.news-section {
  margin-bottom: 18px;
}
.highlight {
  color: #e35d6a;
  font-weight: bold;
}
.attachments-section {
  margin-top: 10px;
}
.attachments-title {
  display: flex;
  align-items: center;
  color: #e35d6a;
  font-weight: bold;
  font-size: 1.08rem;
  margin-bottom: 10px;
  gap: 6px;
}
.attachments-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.attachments-list li {
  margin-bottom: 8px;
}
.attachments-list a {
  display: inline-flex;
  align-items: center;
  color: #a67c52;
  background: #fff;
  border-radius: 6px;
  padding: 6px 14px 6px 6px;
  text-decoration: none;
  font-size: 1.05rem;
  transition: background 0.18s, color 0.18s;
  gap: 7px;
  border: 1px solid #f9afae;
}
.attachments-list a:hover {
  background: #fff8f6;
  color: #e35d6a;
}
.file-pdf {
  color: #e35d6a !important;
  border-color: #e35d6a;
}
.file-docx {
  color: #2176d2 !important;
  border-color: #2176d2;
}
.file-odt {
  color: #1e88e5 !important;
  border-color: #1e88e5;
}
.file-icon {
  display: inline-block;
  margin-right: 4px;
  vertical-align: middle;
}
.not-found {
  color: #e35d6a;
  text-align: center;
  font-size: 1.2rem;
  margin: 40px 0;
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666;
}
.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #e35d6a;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.error-state {
  color: #e35d6a;
  text-align: center;
  font-size: 1.1rem;
  margin: 40px 0;
  padding: 20px;
  background: #fff8f6;
  border-radius: 8px;
  border-left: 4px solid #e35d6a;
}
.news-detail-footer {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
.back-btn {
  background: #e35d6a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 1.08rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.10);
}
.back-btn:hover {
  background: #c94c5c;
}
@media (max-width: 900px) {
  .news-detail {
    max-width: 98vw;
    padding: 24px 2vw 18px 2vw;
  }
}
@media (max-width: 600px) {
  .news-detail {
    padding: 12px 2vw 12px 2vw;
  }
  .news-main-title {
    font-size: 1.2rem;
  }
}
</style>
