<template>
  <!-- Main -->
  <main>
    <section class="main-section">
      <div class="section-title-bar">
        <span class="section-title" style="border:none;background:none;padding:0;margin:0;color:#333;font-weight:normal;font-size:24px;">首頁 /</span>
      </div>
      <div class="card-container">
        <div class="card">
          <img src="https://img.icons8.com/ios/100/000000/id-verified.png" alt="申請進度查詢">
          <p>申請進度查詢</p>
        </div>
        <div class="card">
          <img src="https://img.icons8.com/ios/100/000000/document.png" alt="申請托育服務">
          <p>申請托育服務</p>
        </div>
        <div class="card">
          <img src="https://img.icons8.com/ios/100/000000/upload.png" alt="補助試算">
          <p>補助試算</p>
        </div>
      </div>
    </section>

    <section class="news">
      <div class="news-title">
        <span>最新消息</span>
      </div>
      <div class="news-box bulletin-box">
        <!-- 載入狀態 -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>載入中...</p>
        </div>

        <!-- 錯誤狀態 -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="loadNewsData" class="retry-btn">重新載入</button>
        </div>

        <!-- 正常資料顯示 -->
        <ul v-else-if="newsItems.length > 0">
          <li class="news-item bulletin-item" v-for="item in newsItems" :key="item.id">
            <div class="news-date">
              <span class="news-year">{{ item.formattedDate.year }}</span>
              <span class="news-month">{{ item.formattedDate.month }}</span>
              <span class="news-day">{{ item.formattedDate.day }}</span>
            </div>
            <div class="news-content">
              {{ item.title }}
            </div>
          </li>
        </ul>

        <!-- 無資料狀態 -->
        <div v-else class="empty-state">
          <p>暫無最新消息</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllAnnouncements } from '../api/announcements.js'

// 響應式資料
const newsItems = ref([])
const isLoading = ref(false)
const error = ref(null)

// 格式化日期 - 處理後端的日期格式
const formatDate = (dateString) => {
  let date

  // 處理 LocalDate 格式 (YYYY-MM-DD) 或 LocalDateTime 格式
  if (typeof dateString === 'string') {
    date = new Date(dateString)
  } else if (Array.isArray(dateString)) {
    // 如果後端返回的是 [year, month, day] 格式
    date = new Date(dateString[0], dateString[1] - 1, dateString[2])
  } else {
    date = new Date(dateString)
  }

  return {
    year: date.getFullYear(),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    day: String(date.getDate()).padStart(2, '0')
  }
}

// 載入最新消息資料
const loadNewsData = async () => {
  isLoading.value = true
  error.value = null

  try {
    const response = await getAllAnnouncements()

    // 處理後端返回的數據格式
    newsItems.value = response.data
        .filter(item => item.status === 1) // 只顯示啟用的公告
        .map(item => ({
          id: item.announcementId,
          title: item.title,
          content: item.content,
          date: item.startDate || item.createdTime,
          type: item.type,
          formattedDate: formatDate(item.startDate || item.createdTime)
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // 按日期降序排列

  } catch (err) {
    console.error('載入最新消息失敗:', err)
    if (err.response) {
      // 服務器響應錯誤
      error.value = `載入失敗: ${err.response.status} ${err.response.statusText}`
    } else if (err.request) {
      // 網絡錯誤
      error.value = '網絡連接失敗，請檢查網絡連接'
    } else {
      // 其他錯誤
      error.value = '載入最新消息失敗，請稍後再試'
    }
  } finally {
    isLoading.value = false
  }
}

// 組件掛載時載入資料
onMounted(() => {
  loadNewsData()
})
</script>

<style scoped>
/* Main 樣式 */
main {
  min-height: 100vh;
  background: #FFF8F6;
  padding-bottom: 40px;
}

.main-section {
  margin: 32px auto 0 auto;
  max-width: 900px;
}

.section-title-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border: none;
  background: none;
  padding: 0;
  width: auto;
}

.section-title {
  color: #333;
  font-size: 1.2rem;
  font-weight: bold;
}

/* 卡片樣式 */
.card-container {
  display: flex;
  gap: 32px;
  justify-content: center;
}

.card {
  background: #FFE5C2;
  border-radius: 16px;
  box-shadow: 0 2px 8px #f8b6b633;
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 270px;
  transition: box-shadow 0.2s, transform 0.2s;
}

.card:hover {
  box-shadow: 0 6px 24px #f8b6b699;
  transform: translateY(-4px) scale(1.03);
}

.card img {
  width: 80px;
  margin-bottom: 16px;
}

.card p {
  color: #333;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

/* 最新消息樣式 */
.news {
  margin: 32px auto 0 auto;
  max-width: 1200px;
  background: transparent;
  border-radius: 16px;
  box-shadow: none;
  padding: 40px 40px 48px 40px;
}

.news-title {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
}

.news-title span {
  color: #333;
  font-size: 24px;
  font-weight: 700;
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

.news-box ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

.news-item {
  display: flex;
  align-items: center;
  padding: 32px 32px;
  border-bottom: 1px solid #FFE5C2;
  transition: background-color 0.2s;
}

.news-item:hover {
  background-color: #FFF8F6;
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

/* 載入狀態樣式 */
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
  border-top: 3px solid #F9AFAE;
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

/* 錯誤狀態樣式 */
.error-state {
  text-align: center;
  padding: 40px 20px;
  color: #e74c3c;
}

.error-state p {
  margin-bottom: 16px;
  font-size: 14px;
}

.retry-btn {
  background: #F9AFAE;
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #f5a1a1;
}

/* 空資料狀態樣式 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

/* 公告欄樣式 */
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

.bulletin-item {
  border-bottom: 1px dashed #ffd9b3;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.bulletin-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

/* 響應式設計 */
@media (max-width: 900px) {
  main {
    padding: 0 8px;
  }
  .card-container {
    gap: 12px;
  }
  .card {
    width: 100%;
    padding: 24px 10px 16px 10px;
  }
  .news-box {
    padding: 20px 8px;
    min-height: 400px;
    max-height: 70vh;
  }
}

@media (max-width: 768px) {
  .main-section {
    margin-top: 18px;
  }
  .card-container {
    flex-direction: column;
    gap: 16px;
  }
  .card {
    width: 100%;
    padding: 24px 10px 16px 10px;
  }
  .section-title-bar {
    padding: 6px 10px;
    margin-bottom: 14px;
  }
  .news {
    padding: 24px 4px 24px 4px;
    margin-top: 18px;
  }
  .news-box {
    padding: 12px 4px;
    min-height: 200px;
    max-height: 60vh;
  }
}
</style>
