<template>
  <div class="app-container">
    <!-- Header -->
    <header>
      <div class="header-left" @click="goToPage('Home')" style="cursor:pointer;">
        <img class="logo" src="https://img.icons8.com/ios-filled/50/ffffff/baby.png" alt="logo" />
        <span class="system-title">新竹公共托育系統</span>
      </div>
      <nav class="header-nav">
        <div class="nav-item" @click="goToPage('News')" style="cursor:pointer;">
          <img src="https://img.icons8.com/ios-filled/40/ffffff/news.png" alt="最新消息" />
          <span>最新消息</span>
        </div>
        <div class="nav-item" @click="goToPage('AgencySearch')" style="cursor:pointer;">
          <img src="https://img.icons8.com/ios-filled/40/ffffff/search--v1.png" alt="查詢托育機構" />
          <span>查詢托育機構</span>
        </div>
        <div class="nav-item" @click="goToPage('Qualification')" style="cursor:pointer;">
          <img src="https://img.icons8.com/ios-filled/40/ffffff/info.png" alt="公托資格說明" />
          <span>公托資格說明</span>
        </div>
        <div class="nav-item" @click="goToPage('MemberCenter')" style="cursor:pointer;">
          <img src="https://img.icons8.com/ios-filled/40/ffffff/user-male-circle.png" alt="會員中心" />
          <span>會員中心</span>
        </div>
        <!-- 登入/登出按鈕 -->
        <div v-if="authStore.isLoggedIn" class="nav-item" @click="handleLogout" style="cursor:pointer;">
          <img src="https://img.icons8.com/ios-filled/40/ffffff/logout-rounded-left.png" alt="登出" />
          <span>登出</span>
        </div>
        <!-- 顯示用戶名稱 -->
        <div v-if="authStore.isLoggedIn && authStore.user" class="user-info">
          <span>歡迎，{{ authStore.user.name || authStore.user.account }}</span>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Router View - 顯示不同頁面的內容 -->
      <Breadcrumbs/>
      <div><router-view /></div>

    </main>

    <!-- Footer -->
    <footer>
      <p>Copyright © 2019 <span>新竹縣政府社會處</span> All Rights Reserved.</p>
      <p>建議最佳瀏覽解析度 1920×1080　手機瀏覽解析度建議414×736或360×640</p>
    </footer>
  </div>
</template>

<script setup>

import { useRouter } from 'vue-router'
import { useAuthStore } from './store/auth.js'
import Breadcrumbs from "@/components/Breadcrumbs.vue";

// 路由器實例
const router = useRouter()
const authStore = useAuthStore()

// 導航到不同頁面
const goToPage = (page) => {
  // 如果是會員中心且未登入，導向登入頁
  if (page === 'MemberCenter' && !authStore.isLoggedIn) {
    router.push({
      name: 'Login',
      query: { redirect: '/member-center' }//這行是 在 Vue Router 中設定網址查詢參數。也就是說，登入頁在讀取時可以知道使用者原本想去哪。舉例：使用者點「會員中心」 → 還沒登入 → 被導向到登入頁 登入頁 URL：/login?redirect=/member-center當使用者成功登入後，程式就可以讀出這個參數：
    })
    return
  }

  router.push({ name: page })
  //這段程式碼可以導航到 Login.vue，是因為在專案的路由設定index.js中，已經有定義一個名稱為 Login 的路由，並且該路由對應的元件就是 Login.vue。
}

// 處理登出
const handleLogout = async () => {
  try {
    await authStore.logoutUser()
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<style scoped>
/* App Container */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header 樣式 */
header {
  background: #F9AFAE;
  display: flex;
  align-items: center;
  justify-content: space-between;/* 標題推到左邊 導覽列的圖示推到右邊 */
  padding: 0 40px;
  height: 80px;
  box-shadow: 0 2px 8px #f8b6b633;
  border-bottom: none;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  width: 48px;
  margin-right: 12px;
}

.system-title {
  color: #333;
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: 2px;
}

.header-nav {
  display: flex;
  gap: 32px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  font-size: 13px;
  border-radius: 10px;
  padding: 4px 10px;
}

.nav-item:hover {
  background: #e3f2fd;
}

.nav-item:hover span {
  color: #1976d2;
}

.nav-item:hover img {
  filter: brightness(1.2) drop-shadow(0 2px 4px #90caf9);
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 0 40px;
  /* Add padding to the main content */
}

/* Footer 樣式 */
footer {
  background: #F9AFAE;
  color: #333;
  text-align: center;
  padding: 16px 0 8px 0;
  font-size: 0.95rem;
  letter-spacing: 1px;
  margin-top: 32px;
  border-top: 1px solid #f8b6b6;
}

.user-info {
  display: flex;
  align-items: center;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 20px;
  margin-left: 10px;
}
</style>
