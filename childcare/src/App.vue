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
          <img src="https://img.icons8.com/ios-filled/40/5f8ba8/news.png" alt="最新消息" />
          <span>最新消息</span>
        </div>
        <div class="nav-item" @click="goToPage('AgencySearch')" style="cursor:pointer;">
          <img src="https://img.icons8.com/ios-filled/40/5f8ba8/search--v1.png" alt="查詢托育機構" />
          <span>查詢托育機構</span>
        </div>
        <div class="nav-item" @click="goToPage('Qualification')" style="cursor:pointer;">
          <img src="https://img.icons8.com/ios-filled/40/5f8ba8/info.png" alt="公托資格說明" />
          <span>公托資格說明</span>
        </div>
        <div class="nav-item" @click="goToPage('MemberCenter')" style="cursor:pointer;">
          <img src="https://img.icons8.com/ios-filled/40/5f8ba8/user-male-circle.png" alt="會員中心" />
          <span>會員中心</span>
        </div>
        <!-- 登入/登出與用戶名稱包在同一個區塊，固定在 header 右上角 -->
        <div v-if="authStore.isLoggedIn && authStore.user" class="user-actions">
          <div class="user-info">
            <div class="user-avatar">{{ authStore.user.name ? authStore.user.name.charAt(0) : '' }}</div>
          </div>
          <!-- 替換原本的登出按鈕為下拉樣式按鈕，點擊打開帳號資訊彈窗 -->
          <button class="account-btn" type="button" @click="openAccountModal">

            <svg class="caret" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="#5f8ba8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </nav>
    </header>

    <!-- 帳號資訊 Modal -->
    <div v-if="showAccountModal" class="modal-overlay" @click="closeAccountModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <div class="avatar-lg">{{ authStore.user?.name ? authStore.user.name.charAt(0) : '' }}</div>
          <div class="title-group">
            <h3 class="modal-title">帳號資訊</h3>
            <p class="modal-subtitle">以下是您的帳號詳細資料</p>
          </div>
          <button class="modal-close" @click="closeAccountModal" aria-label="關閉">×</button>
        </div>
        <div class="modal-body">
          <div class="info-row" v-if="authStore.user?.name">
            <span class="label">姓名</span>
            <span class="value">{{ authStore.user.name }}</span>
          </div>
          <div class="info-row" v-if="authStore.user?.account">
            <span class="label">帳號</span>
            <span class="value">{{ authStore.user.account }}</span>
          </div>
          <div class="info-row" v-if="authStore.user?.email">
            <span class="label">Email</span>
            <span class="value">{{ authStore.user.email }}</span>
          </div>
          <div class="info-row" v-if="authStore.user?.phone">
            <span class="label">電話</span>
            <span class="value">{{ authStore.user.phone }}</span>
          </div>
          <div class="info-row" v-if="authStore.user?.role">
            <span class="label">角色</span>
            <span class="value">{{ authStore.user.role }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeAccountModal">關閉</button>
          <button class="btn-danger" @click="handleLogout">登出</button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Router View - 顯示不同頁面的內容 -->

      <div class="content-area">
        <Breadcrumbs/>
        <div>
          <router-view />
        </div>

      </div>

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
import { ref, onMounted, onBeforeUnmount } from 'vue'

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
    closeAccountModal()
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const showAccountModal = ref(false)
const openAccountModal = () => { showAccountModal.value = true }
const closeAccountModal = () => { showAccountModal.value = false }

// 按下 ESC 關閉彈窗
const onKey = (e) => { if (e.key === 'Escape') closeAccountModal() }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
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
  background: #ffd4d4;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 40px;
  height: 130px;
  box-shadow: 0 5px 6px rgba(0, 0, 0, 0.2);
  border-bottom: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
}
.header-left {
  display: flex;
  align-items: center;
  height: 70px;
  position: absolute;
  top: 50%;
  left: 40px;
  transform: translateY(-50%);
  align-self: flex-start;
}
.header-nav {
  display: flex;
  gap: 32px;
  width: 100%;
  justify-content: flex-end;
  align-items: flex-end;
  margin-top: auto;
  padding-bottom: 8px; /* 與 header 底部有點距離 */
}
.content-area {

  background: rgba(255, 248, 246, 0.84);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  border-radius: 16px;
  margin: 3% 10%;
  padding: 50px;
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
  color: #5f8ba8;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  font-size: 13px;
  border-radius: 10px;
  padding: 4px 10px;
  width:100px;
  font-weight: bold;
}

.nav-item:hover span {
  color: #87a6ba;
}

.nav-item:hover img {
  filter: brightness(1.2) drop-shadow(0 2px 4px #87a6ba);
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 0 40px;
  margin-top: 130px;

  /* Add padding to the main content */
}

/* Footer 樣式 */
footer {
  background: #ffd4d4;
  color: #333;
  text-align: center;
  padding: 16px 0 8px 0;
  font-size: 0.95rem;
  letter-spacing: 1px;
  margin-top: 32px;
  border-top: 1px solid #f8b6b6;
}

.user-info {
  background: transparent;
  padding: 0;
  margin-left: 0;
  display: flex;
  align-items: center;
}
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  color: #f9afae;
  border: 2px solid #f9afae;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1px;
  box-shadow: 0 2px 8px rgba(249,175,174,0.08);
  user-select: none;
}

.user-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 0;
  z-index: 110;
}
@media (max-width: 900px) {
  .user-actions {
    position: static;
    margin-left: auto;
    margin-top: 8px;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
}

.account-btn {
  background: #fff;
  color: #5f8ba8;
  border: none;
  border-radius: 8px;
  padding: 4px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
}
.account-btn img { width: 18px; height: 18px; display: block; }
.account-btn .caret { display: block; }
.account-btn:hover { background: #eef5fa; }

/* Modal 基礎樣式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal {
  background: #fff;
  width: min(560px, 92vw);
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid #f0f0f0;
}
.avatar-lg {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  color: #f9afae;
  border: 2px solid #f9afae;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}
.title-group { flex: 1; min-width: 0; }
.modal-title { margin: 0; font-size: 18px; color: #333; }
.modal-subtitle { margin: 2px 0 0; font-size: 12px; color: #777; }
.modal-close {
  background: transparent;
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: #999;
}
.modal-close:hover { color: #666; }

.modal-body {
  padding: 16px 18px;
}
.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #f3f3f3;
}
.info-row:last-child { border-bottom: none; }
.label { color: #888; font-size: 14px; }
.value { color: #333; font-size: 14px; font-weight: 600; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 18px 16px;
  border-top: 1px solid #f0f0f0;
}
.btn-secondary {
  background: #f4f6f8;
  color: #333;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
}
.btn-secondary:hover { background: #e9eef3; }
.btn-danger {
  background: #e35d6a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
}
.btn-danger:hover { background: #d94a58; }
</style>
