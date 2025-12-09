<template>
  <!-- Main -->
  <main>
    <template v-if="isHome">
      <section class="main-section">



        <div class="card-container">
          <div class="card" @click="goToPage('ApplicationStatus')" style="cursor:pointer;">
            <img src="../imgs/research.png" alt="申請進度查詢">
            <!--            <img src="https://img.icons8.com/ios/100/ffe8e8/id-verified.png" alt="申請進度查詢">-->
            <p>申請進度查詢</p>
          </div>
          <div class="card" @click="goToPage('ApplyService')" style="cursor:pointer;">
            <img src="../imgs/paper.png" alt="申請托育服務">
            <!--            <img src="https://img.icons8.com/ios/100/ffe8e8/document.png" alt="申請托育服務">-->
            <p>申請托育服務</p>
          </div>
          <div class="card" @click="goToPage('SubsidyCalculator')" style="cursor:pointer;">
            <img src="../imgs/salary.png" alt="補助試算">
            <!--            <img src="https://img.icons8.com/ios/100/ffe8e8/upload.png" alt="補助試算">-->

            <p>補助試算</p>
          </div>
        </div>
      </section>

      <section class="news">
        <div class="news-title">
          <div class="list-title">最新消息</div>
          <div class="title-decoration"></div>
          <RouterLink to="/news" class="more-news-link">更多消息</RouterLink>
        </div>

        <!-- 交換為 News.vue 的靜態區塊 -->
        <div class="content-area">
          <!-- 載入狀態 -->
          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>載入中...</p>
          </div>
          <!-- 錯誤狀態 -->
          <div v-else-if="error" class="error-state">
            <p style="color: #e74c3c; text-align: center;">{{ error }}</p>
          </div>
          <!-- 新聞列表 -->
          <div v-else class="news-list">
            <div
                v-for="item in newsItems"
                :key="item.announcementID"
                class="news-item"
                @click="goToNewsDetail(item.announcementID)"
                style="cursor:pointer;"
            >
              <div class="news-date">
                {{ item.startDate ? `${formatDate(item.startDate).year}/${formatDate(item.startDate).month}/${formatDate(item.startDate).day}` : '未定' }}
              </div>
              <div class="news-content">
                <h3>{{ item.title }}</h3>
                <p>{{ item.content }}</p>
              </div>
            </div>
            <!-- 沒有資料時顯示 -->
            <div v-if="newsItems.length === 0" class="empty-state">
              <p style="text-align: center; color: #888; padding: 40px 20px;">目前沒有最新消息</p>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- 子路由內容顯示區 -->
    <router-view />

  </main>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAllAnnouncements } from '../api/announcements.js'
import { useAuthStore } from '../store/auth.js'
import bannersApi from '../api/banners.js'

// 路由器實例
const router = useRouter()
const route = useRoute()
// 判斷是否在首頁
const isHome = computed(() => route.name === 'Home')
// 導航到不同頁面
const auth = useAuthStore()
const goToPage = (page) => {
  if (page === 'ApplicationStatus') {
    if (!auth.isLoggedIn) {
      router.push({ name: 'Login', query: { redirect: '/application-status' } }) // 請確認路由名稱是否為 'Login'，如有不同請調整
      return
    }
  }
  router.push({ name: page })
}

// 新增：載入前台有效海報
const banners = ref([])
const visibleBanners = computed(() => {
  const now = new Date()
  return banners.value.filter(b => {
    // 檢查狀態是否為顯示
    if ((b.status || '顯示') !== '顯示') return false

    // 檢查結束時間（如果有的話）
    if (b.endTime) {
      const endDate = new Date(b.endTime)
      if (now > endDate) return false
    }

    // 檢查開始時間（如果有的話）
    if (b.startTime) {
      const startDate = new Date(b.startTime)
      if (now < startDate) return false
    }

    return true
  })
})

const loadBanners = async () => {
  try {
    // 使用API獲取有效的海報，而不是從localStorage載入
    const response = await bannersApi.active()
    const bannersData = Array.isArray(response) ? response : (response?.data ?? [])

    banners.value = bannersData.map(item => ({
      id: item.id || item.ID || item.bannerId || item.bannerID,
      image: item.imageName ? bannersApi.imageUrl(item.imageName) : '',
      link: item.linkUrl || item.link || '',
      startTime: item.startTime || item.startDate,
      endTime: item.endTime || item.endDate,
      status: item.status === false || item.status === 0 ? '下架' : '顯示',
      title: item.title || '',
      _raw: item
    }))
  } catch (e) {
    console.error('載入海報失敗', e)
    banners.value = []
  }
}

// 移除 localStorage 相關的監聽器，因為現在從API獲取
// const onStorage = (e) => {
//   if (!e) return
//   if (e.key === storageKey) loadBanners()
// }

// 點擊海報：如果是內部路徑 (以 / 開頭) 使用 router 推轉，否則在新分頁開啟
const openBanner = (b) => {
  const link = (b && b.link) || ''
  if (!link) return
  if (/^https?:\/\//i.test(link)) {
    window.open(link, '_blank')
    return
  }
  if (link.startsWith('/')) {
    // 使用 path 導航
    router.push({ path: link }).catch(() => {})
    return
  }
  // 否則嘗試當成 route name
  try {
    router.push({ name: link }).catch(() => {
      // fallback: open as relative path
      router.push(link).catch(() => {})
    })
  } catch (e) {
    console.warn('無法導航至海報連結', link)
  }
}

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
    // 使用統一的 announcements API，並在 client 端過濾出前台公告 (type === 1)
    const response = await getAllAnnouncements()
    // getAllAnnouncements 已在 api wrapper 返回 res.data，但要保險處理
    let announcements = Array.isArray(response) ? response : (response?.data ?? [])

    // 有些後端會回傳字串形式的 JSON，要嘗試解析
    if (typeof announcements === 'string') {
      try {
        const parsed = JSON.parse(announcements)
        announcements = Array.isArray(parsed) ? parsed : []
      } catch (e) {
        console.warn('解析 announcements 字串失敗', e)
        announcements = []
      }
    }

    // 過濾前台公告：後端 type 字段：1=前台, 2=後台
    const frontendAnnouncements = announcements.filter(item => {
      // 若沒有 type 欄位，預設視為前台公告
      if (item == null) return false
      const t = item.type === undefined || item.type === null ? 1 : parseInt(item.type)
      return t === 1
    })

    // 正規化欄位並排序、取前五筆
    newsItems.value = frontendAnnouncements
      .map(item => ({
        announcementID: item.announcementID || item.id || item.announcementId,
        title: item.title || '無標題',
        content: item.content || item.summary || '無內容',
        startDate: item.startDate || item.createdAt || item.date
      }))
      .filter(i => i.announcementID)
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      .slice(0, 5)
  } catch (err) {
    console.error('載入最新消息失敗:', err)
    if (err.response) {
      error.value = `載入失敗: ${err.response.status} ${err.response.statusText}`
    } else if (err.request) {
      error.value = '網絡連接失敗，請檢查網絡連接'
    } else {
      error.value = '載入最新消息失敗，請稍後再試'
    }
    // 發生錯誤時使用空陣列
    newsItems.value = []
  } finally {
    isLoading.value = false
  }
}

// 組件掛載時載入資料
onMounted(() => {
  loadNewsData()
  loadBanners()
})

onUnmounted(() => {
  // 移除localStorage監聽器，因為現在使用API
})


// 新增：導航至新聞詳情頁面
function goToNewsDetail(id) {
  if (!id) return
  router.push({ name: 'NewsDetail', params: { id } }).catch(() => {})
}
</script>

<style scoped>
/* Main 樣式 */
main {
  min-height: 100vh;
  padding-bottom: 40px;
}

.main-section {
  margin: 32px auto 0 auto;
  max-width: 1200px;
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
  margin-top: 50px;
}
.list-title{
  text-align:center;
  font-size:1.5rem;
  font-weight:bold;
  margin:50px 0 16px 0;
  letter-spacing:2px;
}
.title-decoration{
  width: 65%;
  height: 2px;
  border-radius: 4px;
  background: var(--4th-text-color);
  margin: 0 auto;
}
.card {
  background: #e48891;
  border-radius: 16px;
  box-shadow: 0 2px 8px #f8b6b633;
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 350px;
  height: 300px;
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
}

.card:hover {
  box-shadow: 0 6px 24px #f8b6b699;
  transform: translateY(-4px) scale(1.03);
}

.card img {
  width: 120px;
  margin-bottom: 16px;
}

.card p {
  color: #ffe8e8;
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
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
  min-height: 48px;
}

.more-news-link {
  position: absolute;
  right: 8%;
  top: 80%;
  padding: 8px 16px;
  background: #f9aFAe;
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.3s;
  display: inline-block;
}

.more-news-link:hover {
  background: #f8b6b6;
}

/* 移除 .news-box, .bulletin-box 樣式，加入 .content-area, .news-list, .news-item 樣式 */
.content-area {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.news-item {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
  border-left: 4px solid #F9AFAE;
  transition: transform 0.2s, box-shadow 0.2s;
}

.news-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(249, 175, 174, 0.2);
}

.news-date {
  color: #F9AFAE;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 12px;
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