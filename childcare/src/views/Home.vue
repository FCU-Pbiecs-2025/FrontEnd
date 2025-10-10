<template>
  <!-- Main -->
  <main>
    <template v-if="isHome">
      <section class="main-section">

        <!-- clickable banner strip -->
        <div v-if="visibleBanners.length" class="banner-strip">
          <div class="banner-item" v-for="b in visibleBanners" :key="b.id">
            <img :src="b.image" :alt="b.link || 'banner'" @click="openBanner(b)" style="cursor:pointer;" />
          </div>
        </div>

        <div class="card-container">
          <div class="card" @click="goToPage('ApplicationStatus')" style="cursor:pointer;">
            <img src="https://img.icons8.com/ios/100/ffe8e8/id-verified.png" alt="申請進度查詢">
            <p>申請進度查詢</p>
          </div>
          <div class="card" @click="goToPage('ApplyService')" style="cursor:pointer;">
            <img src="https://img.icons8.com/ios/100/ffe8e8/document.png" alt="申請托育服務">
            <p>申請托育服務</p>
          </div>
          <div class="card" @click="goToPage('SubsidyCalculator')" style="cursor:pointer;">
            <img src="https://img.icons8.com/ios/100/ffe8e8/upload.png" alt="補助試算">
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
          <div class="news-list">
            <div
              v-for="item in homeNewsList"
              :key="item.id"
              class="news-item"
              @click="goToNewsDetail(item.id)"
              style="cursor:pointer;"
            >
              <div class="news-date">{{ item.date }}</div>
              <div class="news-content">
                <h3>{{ item.title }}</h3>
                <p>{{ item.content }}</p>
              </div>
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
      router.push({ name: 'Login' }) // 請確認路由名稱是否為 'Login'，如有不同請調整
      return
    }
  }
  router.push({ name: page })
}

// 新增：從 localStorage 載入前台海報
const storageKey = 'siteBanners'
const banners = ref([])
const visibleBanners = computed(() => banners.value.filter(b => (b.status || '顯示') === '顯示'))

const loadBanners = () => {
  try {
    const raw = localStorage.getItem(storageKey)
    banners.value = raw ? JSON.parse(raw) : []
  } catch (e) {
    banners.value = []
    console.error('載入 siteBanners 失敗', e)
  }
}

// reload banners if localStorage is changed in another tab/window
const onStorage = (e) => {
  if (!e) return
  if (e.key === storageKey) loadBanners()
}

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
  loadBanners()
  window.addEventListener('storage', onStorage)
})

onUnmounted(() => {
  window.removeEventListener('storage', onStorage)
})

// 新增：首頁最新消息列表資料
const homeNewsList = [
  { id: '1', title: '新竹縣公共托育服務申請流程更新通知', content: '為提供更優質的托育服務，本縣公共托育申請流程將於近期進行調整，請家長注意相關變更內容...', date: '2024/01/15' },
  { id: '2', title: '托育補助申請期限提醒', content: '提醒各位家長，本年度托育補助申請將於月底截止，尚未申請的家長請儘速辦理相關手續...', date: '2024/01/10' },
  { id: '3', title: '托育機構評鑑結果公告', content: '新竹縣各托育機構評鑑結果已公布，家長可至本系統查詢各機構的評鑑等級與服務品質...', date: '2024/01/05' }
]

// 新增：導航至新聞詳情頁面
function goToNewsDetail(id) {
  router.push({ name: 'NewsDetail', params: { id } })
}
</script>

<style scoped>
/* Main 樣式 */
main {
  min-height: 100vh;
  padding-bottom: 40px;
}

/* banner strip */
.banner-strip {
  max-width: 900px;
  margin: 16px auto;
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
}
.banner-item img {
  max-width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
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
  width: 270px;
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
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
