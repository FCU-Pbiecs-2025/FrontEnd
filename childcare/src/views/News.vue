<template>
  <div class="news-page">
    <!-- 詳情頁時只顯示 <router-view />，否則顯示列表與 <router-view /> -->
    <template v-if="$route.name === 'News'">
      <!-- 輪播圖區塊 -->

      <div>
        <div class="news-list-title" >消息列表</div>
        <div class="news-title-decoration"></div>
      </div>
      <!-- 公告列表區塊 -->
      <div class="news-list-section">
        <div class="news-list-header">
          <span>發布日期</span>
          <span>公告標題</span>
          <span>公告內容</span>
        </div>
        <div
            v-for="item in newsList"
            :key="item.announcementID"
            class="news-list-row"
            @click="goToDetail(item.announcementID)"
            style="cursor:pointer;"
        >
          <span class="news-date-cell">{{ formatDate(item.createdTime) }}</span>
          <span class="news-title-cell" :title="item.title">{{ item.title.length > 18 ? item.title.slice(0, 18) + '...' : item.title }}</span>
          <span class="news-content-cell">{{ item.content }}</span>
        </div>
        <div v-if="newsList.length === 0" class="empty-tip">目前沒有公告</div>
        <div class="pagination-bar" v-if="totalPages > 1">
          <button :disabled="currentPage === 1" @click="previousPage">上一頁</button>
          <span>第 {{ currentPage }} / {{ totalPages }} 頁</span>
          <button :disabled="currentPage === totalPages" @click="nextPage">下一頁</button>
        </div>
      </div>
    </template>
    <template v-else>
      <!-- 僅顯示詳情頁 -->
      <router-view />
    </template>
  </div>
</template>

<script>
import { getAnnouncementsByOffset } from '@/api/announcements.js'

export default {
  name: 'News',
  data() {
    return {
      newsList: [],
      currentPage: 1,
      totalPages: 1,
      pageSize: 8,
      loading: false
    }
  },
  async created() {
    await this.fetchNews()
  },
  methods: {
    async fetchNews() {
      try {
        this.loading = true
        const offset = (this.currentPage - 1) * this.pageSize
        const response = await getAnnouncementsByOffset(offset)

        this.newsList = response.data.content
        this.totalPages = response.data.totalPages
      } catch (error) {
        console.error('獲取公告失敗:', error)
        this.newsList = []
        this.totalPages = 1
      } finally {
        this.loading = false
      }
    },
    async nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        await this.fetchNews()
      }
    },
    async previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        await this.fetchNews()
      }
    },
    goToDetail(announcementID) {
      this.$router.push({ name: 'NewsDetail', params: { id: announcementID } })
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-TW')
    }
  }
}
</script>

<style scoped>
.news-page {
  min-height: calc(100vh - 160px); /* 減去 header 和 footer 的高度 */

}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  color: #333;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 16px;
}

.page-description {
  color: #666;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

.content-area {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.news-box {
  background-color: #fff;
  border: 2px solid #F9AFAE;
  border-radius: 12px;
  padding: 32px 32px 32px 32px;
  min-height: 700px;
  max-height: 90vh;
  box-shadow: 0 4px 12px rgba(249, 175, 174, 0.15);
  overflow-y: auto;
}
.bulletin-box {
  background: #fffbe6;
  border: 2px dashed #ffb6b9;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(255,182,185,0.08);
  padding: 18px 24px;
  min-height: 120px;
  height: 160px;
  overflow-y: auto;
}
.news-item {
  display: flex;
  align-items: center;
  padding: 32px 32px;
  border-bottom: 1px solid #FFE5C2;
  transition: background-color 0.2s;
}
.news-item:last-child {
  border-bottom: none;
}
.news-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  min-width: 100px;
  background: #F9AFAE;
  border-radius: 8px;
  padding: 12px;
  margin-right: 24px;
  text-align: center;
}
.news-year {
  font-size: 14px;
  color: #fff;
  font-weight: bold;
  line-height: 1;
}
.news-month {
  font-size: 16px;
  color: #fff;
  font-weight: bold;
  line-height: 1;
  margin: 2px 0;
}
.news-day {
  font-size: 14px;
  color: #fff;
  font-weight: bold;
  line-height: 1;
}
.news-content {
  flex: 1;
  color: #333;
  font-size: 16px;
  line-height: 1.6;
  font-weight: 500;
}
.news-list-section {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(249, 175, 174, 0.12);
  padding: 32px 24px;
  margin: 10px auto 0 auto;
  max-width: 900px;
}
.news-list-header,
.news-list-row {
  display: grid;
  grid-template-columns: 130px 1.2fr 2fr;
  align-items: center;
  justify-content: stretch;
  gap: 12px;
}

.news-title-decoration{
  width: 65%;
  height: 2px;
  border-radius: 4px;
  background: var(--4th-text-color);
  margin: 20px auto;

}
.news-list-header {
  font-weight: bold;


  color: var(--4th-text-color);
  font-size: 1.1rem;
  border-bottom: 2px solid #ffe5c2;
  padding-bottom: 12px;
  margin-bottom: 18px;
  background: transparent;
}
.news-list-row {
  font-size: 1.08rem;
  border-bottom: 1px solid #ffe5c2;
  transition: background 0.2s;
  padding: 18px 0;
}
.news-list-row:last-child {
  border-bottom: none;
}
.news-list-row:hover {
  background: #fff8f6;
}
.news-date-cell {
  color: var(--secondary-color);
  min-width: 100px;
  text-align: left;
}
.news-title-cell {
  font-weight: 500;
  letter-spacing: 1px;
  color: var(--primary-text-color);
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.news-list-title{
  text-align:center;
  font-size:1.5rem;
  font-weight:bold;
  margin:50px 0 16px 0;
  letter-spacing:2px;
}
.news-content-cell {
  color: #333;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pagination-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  margin-top: 24px;
}
.pagination-bar button {
  background: var(--secondary-color);
  border: none;
  border-radius: 8px;
  padding: 6px 18px;
  color: #FFF;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.pagination-bar button:disabled {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}
.empty-tip {
  text-align: center;
  color: #aaa;
  padding: 32px 0 0 0;
  font-size: 1.1rem;
}
.main-title-row {
  display: flex;
  align-items: center;
  margin-left: 32px;
  margin-bottom: 0;
}
.main-title-icon {
  width: 48px;
  margin-right: 10px;
}
.main-title {
  color: #2176d2;
  font-size: 2rem;
}
@media (max-width: 600px) {
  .news-list-header, .news-list-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .news-content-cell {
    max-width: 90vw;
  }
  .news-list-section {
    padding: 16px 4px;
  }
}
@media (max-width: 768px) {
  .news-page {
    padding: 20px 0;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .content-area {
    padding: 0 16px;
  }

  .news-item {
    padding: 20px;
  }
}
</style>