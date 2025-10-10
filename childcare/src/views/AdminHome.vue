<template>
  <div class="admin-layout">
    <!-- 側邊選單 -->
    <aside :class="['admin-sidebar', { 'is-open': sidebarOpen }]">
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
      <div class="admin-breadcrumb">{{ breadcrumb }} /</div>
      <!-- Use router-view to render child admin pages (dashboard, citizen, backend, etc.) -->
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(true)

// 控制每個 menu-section 的展開狀態
const openSections = ref([true, true, true]) // 預設全部展開，可依需求調整
const toggleSection = idx => {
  openSections.value[idx] = !openSections.value[idx]
}
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const navigate = (path) => {
  router.push(path)
}

const isActive = (path) => {
  // treat active when current route path equals or starts with the provided path
  return route.path === path || route.path.startsWith(path + '/')
}

// dynamic breadcrumb: find the deepest matched route that has a breadcrumb meta
const breadcrumb = computed(() => {
  const matched = route.matched.slice().reverse().find(r => r.meta && r.meta.breadcrumb)
  return matched ? matched.meta.breadcrumb : (route.name || '後台')
})
</script>

<style scoped>

.admin-layout {
  display: flex;
  min-height: 80vh;
  gap: 30px;
  margin: 30px;
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
}
.menu-section li:hover {
  background: #f3f8ff;
  color: #e35d6a;
}
.menu-section li.active {
  background: #e6f2ff;
  color: #e35d6a;
  font-weight: bold;
}
.admin-main {
  flex: 1;
  padding: 36px 48px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  max-width: 90%;
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
</style>
