<template>
  <div class="app-container">
    <!-- Header -->
    <header>
      <nav class="header-nav">
        <div class="header-left" @click="goToPage('Home')" style="cursor:pointer;">
          <img class="logo" src="./imgs/mother.png" alt="logo" />
          <div class="vertical-stack">
            <span>新竹縣政府 社會處</span>
            <span class="system-title">社區公共托育家園</span>
          </div>
        </div>
       
          <div class="nav-item" @click="goToPage('News')" style="cursor:pointer;">
          <span>最新消息
          <div class="nav-option"></div></span>

          </div>
          <div class="nav-item" @click="goToPage('AgencySearch')" style="cursor:pointer;">
          <span>查詢托育機構
          <div class="nav-option"></div></span>

          </div>
          <div class="nav-item" @click="goToPage('Qualification')" style="cursor:pointer;">
          <span>公托資格說明
          <div class="nav-option"></div></span>

          </div>
          <div class="nav-item" @click="goToPage('MemberCenter')" style="cursor:pointer;">
          <span>會員中心
          <div class="nav-option"></div></span>

          </div>
          <!-- 後台管理入口，僅 admin 角色顯示 -->
          <div
              v-if="authStore.user?.role === 'admin'"
              class="nav-item"
              @click="goToPage('AdminHome')"
              style="cursor:pointer;"
          >
          <span>後台管理
          <div class="nav-option"></div></span>


          </div>
          <!-- 登入/登出與用戶名稱包在同一個區塊，固定在 header 右上角 -->
          <div v-if="authStore.isLoggedIn && authStore.user" class="user-actions">
            <div class="user-info">
              <div class="user-avatar">{{ authStore.user.name ? authStore.user.name.charAt(0) : '' }}</div>
            </div>
            <!-- 替換原本的登出按鈕為下拉樣式按鈕，點擊打開帳號資訊彈窗 -->
            <button class="account-btn" type="button" @click="openAccountModal">

              <svg class="caret" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="#e35d6a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
          <button class="btn-secondary" v-if="authStore.user?.role !== 'citizen' && authStore.user?.role !== 'test'" @click="showChangePassword = !showChangePassword">修改密碼</button>
        </div>
        <div v-if="showChangePassword && authStore.user?.role !== 'citizen' && authStore.user?.role !== 'test'" class="password-change-form">
          <input type="password" v-model="newPassword" placeholder="新密碼" />
          <input type="password" v-model="confirmPassword" placeholder="確認新密碼" />
          <button class="btn-danger" @click="handleChangePassword">送出</button>
          <div v-if="passwordError" class="error">{{ passwordError }}</div>
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
      // 使用當前頁面的完整路徑作為登入後返回的目標
      query: { redirect: router.currentRoute.value.fullPath }
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

// 修改密碼相關的狀態與方法
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')

const showChangePassword = ref(false)

const handleChangePassword = () => {
  passwordError.value = '' // 重置錯誤訊息

  // 簡單的前端驗證
  if (newPassword.value.length < 6) {
    passwordError.value = '密碼長度至少為 6 個字元'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = '兩次輸入的密碼不相符'
    return
  }

  // 呼叫後端 API 進行密碼修改
  authStore.changePassword(newPassword.value)
    .then(() => {
      // 密碼修改成功後的處理
      closeAccountModal()
      router.push('/') // 可選：修改密碼後導向的頁面
    })
    .catch(err => {
      // 處理錯誤
      passwordError.value = '修改密碼失敗，請稍後再試'
      console.error(err)
    })
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
  background: #ffd4d4;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 40px;
  height: 100px;
  box-shadow: 0 5px 6px rgba(0, 0, 0, 0.2);
  border-bottom: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  padding: 5px;
}

.header-left {
  display: flex;
  margin-left: 20px;
  align-items: center;
  height: 70px;
margin-bottom: 10px;
  margin-right: auto;
}
.header-nav {
  display: flex;
  gap: 32px;
  width: 100%;
  justify-content: flex-end;
  align-items: flex-end;
  margin-top: auto;


}


.content-area {

  background: rgba(255, 248, 246, 0.84);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  border-radius: 16px;
  margin: 3% 10%;
  padding: 50px;
}

.logo {
  height: 100%;
}
.vertical-stack {
  color: #3a1f1f;
  font-weight: bold;
  font-size: 18px;
  display: flex;
  flex-direction: column;
  letter-spacing: 2px;
  align-items: flex-start; /* 可根據需求調整對齊方式 */
}
.system-title {

  font-size: 2.15rem;
  font-weight: bold;
  letter-spacing: 3px;
}

.header-nav {
  display: flex;
  height: 40px;
  gap: 32px;
  margin-bottom: 0;

}
.nav{
  display: flex;
  gap: 20px;
  margin-right: 20px;
  align-items: center;
  flex-wrap: wrap;
  height: 100%;
}
.nav-option {
  background: #e35d6a;
  height: 5px;
  width:100%;
  margin-top: 5px;
  margin-bottom: 0;

  display: none;
  border-radius: 10px;
}
.nav-item:hover .nav-option {
  display: flex;

}

.nav-item:hover{
  background: #ffe8e8;
}


.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #e35d6a;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  font-size: 18px;
  border-radius: 10px;
  padding: 4px 10px;
  width:150px;
  height: auto;
  font-weight: bold;
  letter-spacing: 1px;

}

.nav-item:hover span {
  color: #e35d6a;
}

.nav-item:hover img {
  filter: brightness(1.2) drop-shadow(0 2px 4px #e35d6a);
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
  color: #3a1f1f;
  text-align: center;
  padding: 16px 0 8px 0;
  font-size: 0.95rem;
  letter-spacing: 1px;
  margin-top: 32px;
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
  background: #fdd2d2;
  color: #e35d6a;
  border: none;
  border-radius: 50%;
  padding: 6px 6px;
  display: inline-flex;
  align-items: center;
  font-weight: bold;
  cursor: pointer;
}
.account-btn img { width: 18px; height: 18px; display: block; }
.account-btn .caret { display: block; }
.account-btn:hover { background: #ffe8e8; }

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

/* 新增的修改密碼表單樣式 */
.password-change-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  align-items: center;
}
.password-change-form input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}
.password-change-form .error {
  color: #e35d6a;
  font-size: 12px;
  margin-top: -8px;
}
.password-change-form button {
  background: #e35d6a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  padding: 8px 14px;
  min-width: 80px;
  cursor: pointer;
  align-self: center;
  box-shadow: 0 2px 8px rgba(227,93,106,0.08);
  transition: background 0.2s;
  margin-top: 16px;
  margin-bottom: 12px;
}
</style>
