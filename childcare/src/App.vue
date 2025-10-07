<template>
  <div class="app-container">
    <!-- Header -->
    <header>
      <div class="header-left" @click="goToPage('Home')" style="cursor:pointer;">
        <img class="logo" src="https://img.icons8.com/ios-filled/50/ffffff/baby.png" alt="logo" />
        <span class="system-title">新竹縣公共托育系統</span>
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
      </nav>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Router View - 顯示不同頁面的內容 -->
      <router-view />
    </main>

    <!-- Footer -->
    <footer>
      <p>Copyright © 2019 <span>新竹縣政府社會處</span> All Rights Reserved.</p>
      <p>建議最佳瀏覽解析度 1920×1080　手機瀏覽解析度建議414×736或360×640</p>
      <p>手機及平板裝置建議使用CHROME瀏覽器，可支援更多系統功能</p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

// 路由器實例
const router = useRouter()

// 導航到不同頁面
const goToPage = (page) => {
  router.push({ name: page })
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
  justify-content: space-between;
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
</style>
