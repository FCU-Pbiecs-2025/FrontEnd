<template>
  <div class="news-detail-bg">
    <div class="news-detail">
      <h1 class="news-main-title">{{ news?.title || '公告詳細內容' }}</h1>
      <div class="news-title-row">
        <div class="news-title">{{ news?.title || '公告詳細內容' }}</div>
        <RouterLink to="/news" class="more-news-link">更多消息</RouterLink>

      </div>

      <div v-if="news" class="news-content-block">
        <div class="news-content" v-html="news.content"></div>
        <div v-if="news.attachments && news.attachments.length" class="attachments-section">
          <div class="news-date">相關附件：</div>

          <ul class="attachments-list">
            <li v-for="(file, idx) in news.attachments" :key="idx">
              <a :href="file.url" target="_blank" download :class="fileClass(file.name)">
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
import { useRoute } from 'vue-router'

const route = useRoute()
const news = ref(null)

// 假資料，實際應從 API 取得
const newsList = [
  {
    id: '1',
    title: '新竹市加碼托育補助',
    date: '114-02-08',
    category: '經濟補助',
    content: `
      <div class='news-section'>
        <b class='highlight'>一、資格對象：</b><br>
        符合「直轄市、縣(市)政府辦理未滿二歲兒童托育公共化及準公共化服務條件要點」資格之父母、監護人或其他實際照顧兒童之人(以下稱申請人)，將分別送托於本市公共化或準公共化托育服務，且申請人一方或雙方均設籍本市。<br>
      </div>
      <div class='news-section'>
        <b class='highlight'>二、補助標準：</b><br>
        (一)送托於本市公共化托育服務提供者，包括與本府簽訂下述二歲兒童托育公共化服務合作契約，之居家托育人員或私立托嬰中心：<br>
        除原領有補助金額外，補助金額每月新臺幣(下同)1,500元至滿二歲前一日止。<br>
        (二)送托於本市社區公共托育家園或本市公共托嬰中心：<br>
        除原領有補助金額外，補助金額每月500元至滿二歲前一日止。<br>
        前項補助送托日數超過一個月未滿一個月者，依一個月以下天數比例計算。<br>
      </div>
      <div class='news-section'>
        <b class='highlight'>三、注意事項：</b><br>
        (一)為確保兒童及申請人申請權益，本府同收政府機關書面同意書等相關證明，申請，以免延誤補助權益。<br>
        (二)公共化及準公共化托育服務提供者，須依本府公告之規定辦理。<br>
        (三)本補助如有未盡事宜，悉依本府公告及相關法令規定辦理。<br>
      </div>
    `,
    attachments: [
      { name: '申請表.docx', url: '/files/申請表.docx' },
      { name: '補助說明.pdf', url: '/files/補助說明.pdf' },
      { name: '申請表.odt', url: '/files/申請表.odt' }
    ]
  }
]

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
  window.location.href = '/news';
}

onMounted(() => {
  const id = route.params.id
  news.value = newsList.find(n => n.id === id)
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
  width: 70%;

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
