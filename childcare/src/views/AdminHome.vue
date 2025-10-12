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
        <div class="menu-section">
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
              <li @click="navigate('/admin/banner')">首頁海報</li>
              <li :class="{active: isActive('/admin/announcement')}" @click="navigate('/admin/announcement')">系統公告</li>
              <li :class="{active: isActive('/admin/guidelines') }" @click="navigate('/admin/guidelines')">規範說明</li>
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
          <div class="menu-title">個案管理</div>
          <div class="menu-title">候補清冊</div>
          <div class="menu-title">補位抽籤</div>
        </div>
      </nav>
    </aside>
    <!-- 右側內容 -->
    <main class="admin-main">
      <!-- 根據 route 顯示 dashboard 或子頁面 -->
      <template v-if="$route.name === 'AdminHome'">
        <div class="admin-announcement">
          <!-- 代辦事項通知區塊 -->
          <h2 class="section-title">代辦事項通知</h2>
          <div class="news-list-section">
            <div class="news-list-header">
              <span>發布日期</span>
              <span>事項標題</span>
              <span>內容</span>
            </div>
            <div v-for="item in todoList" :key="item.id" class="news-list-row">
              <span class="news-date-cell">{{ item.date }}</span>
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
            <div v-for="item in announcementList" :key="item.id" class="news-list-row">
              <span class="news-date-cell">{{ item.date }}</span>
              <span class="news-title-cell" :title="item.title">{{ item.title.length > 18 ? item.title.slice(0, 18) + '...' : item.title }}</span>
              <span class="news-content-cell">{{ item.content }}</span>
            </div>
            <div v-if="announcementList.length === 0" class="empty-tip">目前沒有公告</div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// 導入通用的 Admin 響應式樣式
import '@/styles/admin-responsive.css'

const router = useRouter()
const route = useRoute()

// 響應式狀態
const isMobile = ref(window.innerWidth < 1250)
const sidebarOpen = ref(window.innerWidth >= 1250)

// 控制每個 menu-section 的展開狀態
const openSections = ref([true, true, true])

const toggleSection = idx => {
  openSections.value[idx] = !openSections.value[idx]
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

const navigate = (path) => {
  router.push(path)
  // 手機版點選後自動關閉側邊欄
  closeSidebar()
}

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

// 監聽視窗大小變化
const handleResize = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth < 1250

  // 從手機版切換到桌面版時，自動展開側邊欄
  if (wasMobile && !isMobile.value) {
    sidebarOpen.value = true
  }
  // 從桌面版切換到手機版時，自動收起側邊欄
  if (!wasMobile && isMobile.value) {
    sidebarOpen.value = false
  }
}

const breadcrumb = computed(() => {
  const matched = route.matched.slice().reverse().find(r => r.meta && r.meta.breadcrumb)
  return matched ? matched.meta.breadcrumb : (route.name || '後台')
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// AdminDashboard 內容
const todoList = [
  { id: 1, title: '審核新申請', content: '有 3 筆新申請待審核', date: '2025/10/10' },
  { id: 2, title: '補位抽籤', content: '本週需進行補位抽籤', date: '2025/10/09' }
]
const announcementList = [
  { id: 1, title: '系統維護通知', content: '後台系統將於本週末進行維護，請提前完成重要作業。', date: '2025/10/08' },
  { id: 2, title: '新功能上線', content: '公告管理功能已上線，歡迎使用。', date: '2025/10/05' }
]
</script>

<style scoped>

.admin-layout {
  display: flex;
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
  width: 60px;
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
  flex: 1;
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
  justify-content: space-between;
  font-weight: bold;
  color: #e35d6a;
  font-size: 1.1rem;
  border-bottom: 2px solid #FFE5C2;
  padding-bottom: 12px;
  margin-bottom: 8px;
}
.news-list-header span {
  flex: 1;
  text-align: left;
}
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
