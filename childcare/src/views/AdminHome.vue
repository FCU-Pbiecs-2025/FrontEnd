<template>
  <div class="admin-layout">
    <!-- 側邊選單 -->
    <aside class="admin-sidebar">
      <button class="sidebar-toggle" @click="toggleSidebar">
        <span class="icon">☰</span>
      </button>
      <nav v-show="sidebarOpen" class="sidebar-menu">
        <div class="menu-section">
          <div class="menu-title">帳號管理 ▾</div>
          <ul>
            <li :class="{active: currentSection==='citizen'}" @click="currentSection='citizen'">民眾帳號</li>
            <li :class="{active: currentSection==='admin'}" @click="currentSection='admin'">後台帳號</li>
          </ul>
        </div>
        <div class="menu-section">
          <div class="menu-title">內容管理 ▾</div>
          <ul>
            <li>首頁海報</li>
            <li>系統公告</li>
            <li>規範說明</li>
            <li>機構管理</li>
            <li>班級管理</li>
          </ul>
        </div>
        <div class="menu-section">
          <div class="menu-title">申請管理 ▾</div>
          <ul>
            <li>審核申請</li>
            <li>撤銷審核</li>
            <li>個案管理</li>
            <li>候補清冊</li>
            <li>補位抽籤</li>
          </ul>
        </div>
      </nav>
    </aside>
    <!-- 右側內容 -->
    <main class="admin-main">
      <div class="admin-breadcrumb">後台首頁/</div>
      <div class="admin-announcement">
        <AdminCitizenAccount v-if="currentSection==='citizen'" />
        <template v-else>
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
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AdminCitizenAccount from './AdminCitizenAccount.vue'
const sidebarOpen = ref(true)
const currentSection = ref('')
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
// 假資料
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
  background: #f9f7f3 url('https://img.icons8.com/ios/50/cccccc/cloud.png') repeat;
}
.admin-sidebar {
  width: 220px;
  background: #fff;
  border-radius: 16px 0 0 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 24px 0 24px 0;
  position: relative;
  min-width: 180px;
}
.sidebar-toggle {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #ffd4d4;
  border: none;
  border-radius: 8px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 10;
}
.sidebar-menu {
  margin-top: 40px;
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
  border-radius: 0 16px 16px 0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  margin: 24px 0;
  display: flex;
  flex-direction: column;
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
</style>
