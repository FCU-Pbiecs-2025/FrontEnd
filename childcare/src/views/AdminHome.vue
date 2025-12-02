<template>
  <div class="admin-layout">
    <!-- 漢堡按鈕 (小於1250px時顯示) -->
    <button
      v-if="isMobile && !sidebarOpen"
      class="mobile-hamburger"
      @click="toggleSidebar"
      aria-label="開啟選單"
    >
      ☰
    </button>

    <!-- 遮罩層 -->
    <div
      v-if="sidebarOpen && isMobile"
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>

    <!-- 側邊選單 -->
    <aside :class="['admin-sidebar', { 'is-open': sidebarOpen }, { 'mobile-mode': isMobile }]">
      <button class="sidebar-toggle" @click="toggleSidebar" :aria-expanded="String(sidebarOpen)">
        <span class="icon">☰</span>
      </button>
      <nav :class="['sidebar-menu', { 'is-open': sidebarOpen }]">
        <div v-if="isSuperAdmin" class="menu-section">
          <div class="menu-title clickable" @click="toggleSection(0)">
            帳號管理
            <span class="arrow" :class="{open: openSections[0]}" />
          </div>
          <transition name="slide-fade">
            <ul v-show="openSections[0]">
              <li :class="{active: isActive('/admin/citizen')}" @click="navigate('/admin/citizen')">民眾帳號</li>
              <li :class="{active: isActive('/admin/backend')}" @click="navigate('/admin/backend')">後台帳號</li>
            </ul>
          </transition>
        </div>
        <div class="menu-section">
          <div class="menu-title clickable" @click="toggleSection(1)">
            內容管理
            <span class="arrow" :class="{open: openSections[1]}" />
          </div>
          <transition name="slide-fade">
            <ul v-show="openSections[1]">
              <li v-if="isSuperAdmin" @click="navigate('/admin/banner')">首頁海報</li>
              <li v-if="isSuperAdmin" :class="{active: isActive('/admin/announcement')}" @click="navigate('/admin/announcement')">系統公告</li>
              <li v-if="isSuperAdmin" :class="{active: isActive('/admin/guidelines') }" @click="navigate('/admin/guidelines')">規範說明</li>
              <li :class="{active: isActive('/admin/institution')}" @click="navigate('/admin/institution')">機構管理</li>
              <!-- make 班級管理 navigable and active-aware -->
              <li :class="{active: isActive('/admin/class')}" @click="navigate('/admin/class')">班級管理</li>
            </ul>
          </transition>
        </div>
        <div class="menu-section">
          <div class="menu-title clickable" @click="toggleSection(2)">
            申請管理
            <span class="arrow" :class="{open: openSections[2]}" />
          </div>
          <transition name="slide-fade">
            <ul v-show="openSections[2]">
              <li :class="{active: isActive('/admin/application-review')}" @click="navigate('/admin/application-review')">審核申請</li>
              <li :class="{active: isActive('/admin/application-revoke')}" @click="navigate('/admin/application-revoke')">撤銷審核</li>
            </ul>
          </transition>
        </div>
        <div class="menu-section">
          <div class="menu-title clickable" :class="{active: isActive('/admin/case-management')}" @click="navigate('/admin/case-management')">個案管理</div>
          <!-- 修正：候補清冊可點擊，補位抽籤指向對應路由 -->
          <div class="menu-title clickable" :class="{active: isActive('/admin/waitlist')}" @click="navigate('/admin/waitlist')">候補清冊</div>
          <div v-if="isSuperAdmin" class="menu-title clickable" :class="{active: isActive('/admin/lottery-draw')}" @click="navigate('/admin/lottery-draw')">補位抽籤</div>
        </div>
      </nav>
    </aside>
    <!-- 右側內容 -->
    <main class="admin-main">
      <!-- 根據 route 顯示 dashboard 或子頁面 -->
      <template v-if="$route.name === 'AdminHome'">
        <div class="admin-announcement">
          <!-- 代辦事項通知區塊 -->
          <h2 class="section-title">待辦事項通知</h2>
          <div class="news-list-section">
            <div class="news-list-header">
              <span>事項標題</span>
              <span>內容</span>
            </div>
            <div v-for="item in todoList" :key="item.id" class="news-list-row">
              <span class="news-title-cell" :title="item.title">{{ item.title.length > 18 ? item.title.slice(0, 18) + '...' : item.title }}</span>
              <span class="news-content-cell">{{ item.content }}</span>
            </div>
            <div v-if="todoList.length === 0" class="empty-tip">目前沒有代辦事項</div>
          </div>

          <!-- 後台系統公告區塊 -->
          <h2 class="section-title">後台系統公告</h2>
          <div class="news-list-section">
            <div class="news-list-header">
              <span>發布日期</span>
              <span>公告標題</span>
              <span>公告內容</span>
            </div>
            <!-- 載入中顯示 -->
            <div v-if="loading" class="empty-tip">載入中...</div>
            <!-- 錯誤訊息顯示 -->
            <div v-else-if="error" class="error-tip" style="color: red; padding: 10px;">
              錯誤: {{ error }}
            </div>
            <!-- 公告列表 -->
            <div
              v-else
              v-for="item in announcementList"
              :key="item.id"
              class="news-list-row"
              @click="goAdminAnnouncementDetail(item.id)"
              style="cursor: pointer;"
            >
              <span class="news-date-cell">{{ item.date }}</span>
              <span class="news-title-cell" :title="item.title">{{ item.title.length > 18 ? item.title.slice(0, 18) + '...' : item.title }}</span>
              <span class="news-content-cell">{{ item.content }}</span>
            </div>
            <!-- 無資料時顯示 -->
            <div v-if="!loading && !error && announcementList.length === 0" class="empty-tip">目前沒有公告</div>
          </div>
        </div>
      </template>
      <template v-else>
        <router-view />
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// 導入通用的 Admin 響應式樣式
import '@/styles/admin-responsive.css'
// 導入後台首頁 API
import { getTodoCounts } from '@/api/AdminHome'
import { getBackendAnnouncements } from '@/api/announcements.js'
import { useAuthStore } from '@/store/auth.js'

const authStore = useAuthStore()
const isSuperAdmin = computed(() => authStore.user?.role === 'super_admin')
const institutionId = computed(() => authStore.user?.InstitutionID || null)

const router = useRouter()
const route = useRoute()

// Sidebar state: keep open by default on all admin pages
const isMobile = ref(window.innerWidth < 1250)
const sidebarOpen = ref(true)

// Sections open state
const openSections = ref([true, true, true])

const toggleSection = idx => { openSections.value[idx] = !openSections.value[idx] }
const toggleSidebar = () => { sidebarOpen.value = !sidebarOpen.value }
const closeSidebar = () => { if (isMobile.value) sidebarOpen.value = false }

// Do not auto-close the sidebar on navigation; keep it open for consistent navigation
const navigate = (path) => {
  router.push(path)
  // Intentionally do not close sidebar here to keep it visible across pages
}

const isActive = (path) => route.path === path || route.path.startsWith(path + '/')

// Resize handler: keep open on desktop; on mobile, preserve current state
const handleResize = () => {
  isMobile.value = window.innerWidth < 1250
  if (!isMobile.value) {
    sidebarOpen.value = true
  }
}

// Re-open sidebar when changing to any /admin route (ensures visibility across admin pages)
watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/admin')) {
    sidebarOpen.value = true
  }
})

const breadcrumb = computed(() => {
  const matched = route.matched.slice().reverse().find(r => r.meta && r.meta.breadcrumb)
  return matched ? matched.meta.breadcrumb : (route.name || '後台')
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
  fetchTodoCountsAndAnnouncements()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// AdminDashboard 設定資料（預設本地展示，會被後端回應覆蓋）
// helper: 是否為每年 7/25 - 7/31 的抽籤週
function isLotteryWindow(date = new Date()) {
  const m = date.getMonth() // 0-based, July is 6
  const d = date.getDate()
  return m === 6 && d >= 25 && d <= 31
}

// 建立待辦清單的工廠函式（方便在初始值與更新時使用）
function buildTodoList(pending = 0, revoke = 0) {
  const list = [
    { id: 'pending', title: '審核新申請', content: `有 ${pending} 筆新申請待審核`, date: null, count: pending },
    { id: 'revoke', title: '撤銷申請', content: `有 ${revoke} 筆撤銷申請待審核`, date: null, count: revoke }
  ]
  if (isLotteryWindow()) {
    // 避免重複插入：若已有相同 id 則不插入
    if (!list.find(i => i.id === 'lottery')) {
      list.push({ id: 'lottery', title: '抽籤通知', content: '7/31 即將進行抽籤', date: null })
    }
  }
  return list
}

const todoList = ref(buildTodoList(3, 0))
const announcementList = ref([])

const loading = ref(false)
const error = ref(null)

// 抓取 todo counts 與 announcements，並更新到對應的資料陣列
async function fetchTodoCountsAndAnnouncements() {
  loading.value = true
  error.value = null
  try {
    // 依角色決定是否帶機構ID（使用大寫 InstitutionID 符合資料庫欄位）
    const todoParams = isSuperAdmin.value ? undefined : (institutionId.value ? { InstitutionID: institutionId.value } : undefined)

    const [todosRes, annRes] = await Promise.all([
      getTodoCounts(todoParams),
      getBackendAnnouncements()
    ])

    // 解析 todo-counts 格式: { pending: number, revoke: number }
    if (todosRes && typeof todosRes === 'object') {
      const pending = Number(todosRes.pending || 0)
      const revoke = Number(todosRes.revoke || 0)

      // 標題根據角色描述對象：super_admin 顯示「全部」；admin 顯示「本機構」
      const scopeLabel = isSuperAdmin.value ? '' : '（本機構）'
      const list = [
        { id: 'pending', title: `審核新申請${scopeLabel}`, content: `有 ${pending} 筆新申請待審核`, date: null, count: pending },
        { id: 'revoke', title: `撤銷申請${scopeLabel}`, content: `有 ${revoke} 筆撤銷聲請待審`, date: null, count: revoke }
      ]
      if (isLotteryWindow()) {
        if (!list.find(i => i.id === 'lottery')) {
          list.push({ id: 'lottery', title: '抽籤通知', content: '7/31 即將進行抽籤', date: null })
        }
      }
      todoList.value = list
    }

    // annRes 現在直接是陣列，符合 AnnouncementSummaryDTO 格式
    if (Array.isArray(annRes)) {
      announcementList.value = annRes.map(announcement => ({
        id: announcement.announcementID, // PK uniqueidentifier (UUID)
        title: announcement.title || '無標題', // nvarchar(100)
        content: announcement.content || '無內容', // nvarchar(max)
        date: announcement.startDate || '', // date (ISO: "YYYY-MM-DD")
        attachmentPath: announcement.attachmentPath // nvarchar(max) (附件路徑)
      })).filter(item => item.id) // 過濾掉沒有 ID 的項目
      console.log('Successfully loaded announcements:', announcementList.value)
    } else {
      console.warn('API 回傳的公告資料格式不正確:', annRes)
      announcementList.value = []
    }
  } catch (e) {
    console.error('fetchTodoCountsAndAnnouncements error:', e)
    console.error('錯誤詳情:', {
      message: e.message,
      response: e.response?.data,
      status: e.response?.status,
      statusText: e.response?.statusText,
      config: e.config
    })

    // 顯示用戶友好的錯誤訊息
    if (e.response?.status === 404) {
      error.value = 'API 端點不存在，請檢查後端服務'
    } else if (e.response?.status >= 500) {
      error.value = '伺服器錯誤，請稍後再試'
    } else if (e.code === 'NETWORK_ERROR') {
      error.value = '網路連線錯誤，請檢查後端服務是否啟動'
    } else {
      error.value = e.message || String(e)
    }

    // 發生錯誤時清空列表，不保留假資料
    announcementList.value = []
  } finally {
    loading.value = false
  }
}

const goAdminAnnouncementDetail = (id) => {
  // 導向後台公告詳情頁 - 修正路由路徑
  router.push({ path: `/admin/detail/${id}` })
}
</script>

<style scoped>

.admin-layout {
  display: flex;
  flex-wrap: nowrap; /* prevent wrapping that can squeeze sidebar */
  min-height: 80vh;
  gap: 30px;
  margin: 30px;
  position: relative;

}

/* 漢堡按鈕樣式 */
.mobile-hamburger {
  display: none;
}

/* 遮罩層樣式 */
.sidebar-overlay {
  display: none;
}

/* 預設為收合狀態：aside 與按鈕一樣大 */
.admin-sidebar {
  flex: 0 0 60px; /* default collapsed basis */
  width: 60px;
  flex-shrink: 0; /* never shrink */
  height: 60px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 4px;
  position: relative;
  overflow: hidden;
  transition: width 0.3s cubic-bezier(.4,0,.2,1), height 0.3s cubic-bezier(.4,0,.2,1), padding 0.2s, border-radius 0.2s;
}
/* 展開狀態：回到完整側欄尺寸 */
.admin-sidebar.is-open {
  flex: 0 0 180px; /* expanded basis matches width */
  width: 180px;
  height: auto; /* 高度自動撐開 */
  padding: 10px ;
  border-radius: 20px;

}
/* 切換按鈕：收合時填滿容器；展開時固定 40x40 */
.sidebar-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: #ffd4d4;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;

  z-index: 1;
}
.admin-sidebar.is-open .sidebar-toggle {
  width: 50px;
  height: 50px;
}

/* 收合時，內容區域隱藏且不佔互動 */
.sidebar-menu {
  padding: 10px;
  margin-top: 10px;
  opacity: 0;
  max-height: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, max-height 0.3s cubic-bezier(.4,0,.2,1), margin-top 0.2s ease;
}
/* 展開時顯示內容 */
.sidebar-menu.is-open {
  margin-top: 16px;
  opacity: 1;
  max-height: 1000px; /* 足夠大的值以容納內容 */
  pointer-events: auto;
}
.menu-section {
  margin-bottom: 24px;
}
.menu-title {
  font-weight: bold;
  color: #5f8ba8;
  margin-bottom: 8px;
  font-size: 1.1rem;
}
.menu-title.clickable {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.arrow {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-left: 6px;
  border-right: 2px solid #5f8ba8;
  border-bottom: 2px solid #5f8ba8;
  transform: rotate(-45deg) translateY(-2px);
  transition: transform 0.2s;
}
.arrow.open {
  transform: rotate(45deg) translateY(2px);
}
.menu-section ul {
  list-style: none;
  padding-left: 0;
}
.menu-section li {
  padding: 6px 0 6px 18px;
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  width: 80%;
  border-radius: 20px;


}
.menu-section li:hover {
  background: #fff6f6;
  color: #e35d6a;
  border-radius: 20px;
  width: 80%;

}
.menu-section li.active {
  background: #fff6f6;
  color: #e35d6a;
  font-weight: bold;
  border-radius: 20px;
  width: 80%;


}
.admin-main {
  flex: 1 1 auto;
  min-width: 0; /* allow content to shrink instead of pushing sidebar */
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  display: flex;
  justify-content: center;

}
.section-title {
  font-size: 1.35rem;
  color: #e35d6a;
  font-weight: bold;
  margin: 24px 0 8px 0;
  letter-spacing: 1px;
}
.admin-breadcrumb {
  color: #5f8ba8;
  font-size: 1.1rem;
  margin-bottom: 18px;
  font-weight: bold;
}
.admin-announcement {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-top: 12px;
}
.news-list-section {
  background-color: #fff;
  border: 2px solid #F9AFAE;
  border-radius: 12px;
  padding: 32px 32px 32px 32px;
  box-shadow: 0 4px 12px rgba(249, 175, 174, 0.15);
  overflow-y: auto;
}
.news-list-header {
  display: flex;
  align-items: center; /* vertically center header cells */
  font-weight: bold;
  color: #e35d6a;
  font-size: 1.1rem;
  border-bottom: 2px solid #FFE5C2;
  padding: 12px 0; /* give same vertical spacing as rows */
  margin-bottom: 8px;
}
/* Make header columns use the same flex ratios as the row cells so columns align */
.news-list-header span {
  text-align: left;
}
.news-list-header span:nth-child(1) { flex: 1; min-width: 110px; }
.news-list-header span:nth-child(2) { flex: 2; min-width: 180px; }
.news-list-header span:nth-child(3) { flex: 3; min-width: 220px; }
.news-list-row {
  display: flex;
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid #FFE5C2;
  transition: background-color 0.2s;
}
.news-list-row:hover {
  background: #fffbe6;
}
.news-date-cell {
  flex: 1;
  color: #888;
  font-size: 1rem;
  min-width: 110px;
}
.news-title-cell {
  flex: 2;
  color: #333;
  font-weight: bold;
  font-size: 1.05rem;
  min-width: 180px;
}
.news-content-cell {
  flex: 3;
  color: #555;
  font-size: 1rem;
  min-width: 220px;
}
.empty-tip {
  color: #aaa;
  text-align: center;
  padding: 24px 0;
}
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.25s cubic-bezier(.4,0,.2,1);
}
.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}
.slide-fade-enter-to, .slide-fade-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}

/* ========== 響應式設計 (< 1250px) ========== */
@media (max-width: 1250px) {
  .admin-layout {
    margin: 0;
    gap: 0;




  }

  /* 漢堡按鈕 - 固定在 App.vue header 下方 */
  .mobile-hamburger {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 140px; /* App.vue header 高度 + 間距 */
    left: 20px;
    width: 50px;
    height: 50px;
    background: #e35d6a;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 997;
    box-shadow: 0 4px 12px rgba(227, 93, 106, 0.4);
    transition: transform 0.2s;
  }

  .mobile-hamburger:active {
    transform: scale(0.95);
  }

  /* 遮罩層 */
  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 130px; /* App.vue header 高度 */
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
  }

  /* 側邊欄手機版樣式 */
  .admin-sidebar.mobile-mode {
    position: fixed;
    top: 130px;
    left: 0;
    bottom: 0;
    height: calc(100vh - 130px);
    margin: 0;
    border-radius: 0;
    z-index: 999;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .admin-sidebar.mobile-mode.is-open {
    transform: translateX(0);
    width: 250px;
  }

  /* 主內容區調整 */
  .admin-main {
    max-width: 100%;
    width: 100%;
    margin: 0;
    border-radius: 20px;


  }

  /* 表格響應式 */
  .news-list-header {
    display: none;
  }

  .news-list-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 15px;
    border: 1px solid #FFE5C2;
    border-radius: 8px;
    margin-bottom: 10px;
  }

  .news-date-cell,
  .news-title-cell,
  .news-content-cell {
    width: 100%;
    min-width: auto;
  }

  .news-date-cell::before {
    content: '發布日期：';
    font-weight: bold;
    color: #e35d6a;
    margin-right: 8px;
  }

  .news-title-cell::before {
    content: '標題：';
    font-weight: bold;
    color: #e35d6a;
    margin-right: 8px;
  }

  .news-content-cell::before {
    content: '內容：';
    font-weight: bold;
    color: #e35d6a;
    margin-right: 8px;
  }
}
</style>
