<template>
  <div class="app-container">
    <template v-if="showMainLayout">
      <!-- Header -->
      <header>
        <nav class="header-nav">
          <div class="header-left" @click="goToPage('Home')" style="cursor:pointer;">
            <img class="logo" src="./imgs/moon.png" alt="logo" />
            <div class="vertical-stack">
              <span class="title-second">新竹縣政府 社會處</span>
              <span class="system-title">社區公共托育家園</span>
            </div>
          </div>

          <!-- 漢堡選單按鈕 (小螢幕顯示) -->
          <button class="hamburger-btn" @click="toggleMenu" aria-label="選單">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <!-- 導航選單 -->
          <div class="nav-menu" :class="{ 'nav-menu-open': isMenuOpen }">
            <div class="nav-item" @click="handleNavClick('News')" style="cursor:pointer;">
              <span>最新消息</span>
              <small class="nav-translation">News</small>
              <div class="nav-option"></div>
            </div>
            <div class="nav-item" @click="handleNavClick('AgencySearch')" style="cursor:pointer;">
              <span>查詢托育機構</span>
              <small class="nav-translation">Search Agencies</small>
              <div class="nav-option"></div>
            </div>
            <div class="nav-item" @click="handleNavClick('Qualification')" style="cursor:pointer;">
              <span>公托資格說明</span>
              <small class="nav-translation">Qualifications</small>
              <div class="nav-option"></div>
            </div>
            <div class="nav-item" @click="handleNavClick('MemberCenter')" style="cursor:pointer;">
              <span>會員中心</span>
              <small class="nav-translation">Member Center</small>
              <div class="nav-option"></div>
            </div>
            <!-- 後台管理入口，僅 admin 或 super_admin 角色顯示 -->
            <div
                v-if="['admin', 'super_admin'].includes(authStore.user?.role)"
                class="nav-item"
                @click="handleNavClick('AdminHome')"
                style="cursor:pointer;"
            >
              <span>後台管理</span>
              <small class="nav-translation">Admin</small>
              <div class="nav-option"></div>
            </div>
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

          <!-- 未登入時顯示登入按鈕 -->
          <div v-else class="login-actions">
            <button class="login-btn" @click="handleNavClick('Login')">登入</button>
            <button class="login-btn">註冊</button>
          </div>
        </nav>
      </header>

      <!-- 選單遮罩層 (點擊關閉選單) -->
      <div v-if="isMenuOpen" class="menu-overlay" @click="closeMenu"></div>

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
            <button class="btn-secondary" v-if="authStore.user?.role === 'admin'" @click="showChangePassword = !showChangePassword">修改密碼</button>
          </div>
          <div v-if="showChangePassword && authStore.user?.role === 'admin'" class="password-change-form">
            <input type="password" v-model="newPassword" placeholder="新密碼" />
            <input type="password" v-model="confirmPassword" placeholder="確認新密碼" />
            <button class="btn-danger" @click="handleChangePassword">送出</button>
            <div v-if="passwordError" class="error">{{ passwordError }}</div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Restore carousel only on Home route -->
        <div v-if="$route.name === 'Home'" class="carousel-wrapper">
          <button class="carousel-btn left" @click="prevSlide">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="20,8 12,16 20,24" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </button>
          <div class="carousel-image-box">
            <template v-if="carouselImages.length > 0">
              <img ref="carouselImg" :src="carouselImages[currentSlide]" alt="輪播圖" class="carousel-image" @error="retryCarouselImage" />
            </template>
            <template v-else>
              <div class="no-image-placeholder">暫無圖片</div>
            </template>
          </div>
          <button class="carousel-btn right" @click="nextSlide">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="12,8 20,16 12,24" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </button>
        </div>


        <!-- Router View - 顯示不同頁面的內容 -->

        <div class="content-area">
          <Breadcrumbs/>
          <div>
            <router-view />
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
          <button class="btn-secondary" v-if="authStore.user?.role === 'admin'" @click="showChangePassword = !showChangePassword">修改密碼</button>
        </div>
        <div v-if="showChangePassword && authStore.user?.role === 'admin'" class="password-change-form">
          <input type="password" v-model="newPassword" placeholder="新密碼" />
          <input type="password" v-model="confirmPassword" placeholder="確認新密碼" />
          <button class="btn-danger" @click="handleChangePassword">送出</button>
          <div v-if="passwordError" class="error">{{ passwordError }}</div>
        </div>

      </main>

      <!-- Footer -->
      <footer>
        <p>Copyright © 2019 <span>新竹縣政府社會處</span> All Rights Reserved.</p>
        <p>建議最佳瀏覽解析度 1920×1080　手機瀏覽解析度建議414×736或360×640</p>
      </footer>
      <Chatbot />
    </template>
    <router-view v-else />
  </div>
</template>

<script setup>
import Chatbot from "@/components/Chatbot.vue";
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './store/auth.js'
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

import bannersApi from './api/banners.js'

// 路由器實例
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const showMainLayout = computed(() => route.name !== 'AdminLogin')

// 漢堡選單狀態
const isMenuOpen = ref(false)

// 切換選單
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// 關閉選單
const closeMenu = () => {
  isMenuOpen.value = false
}

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

// 處理導航點擊 (包含關閉選單)
const handleNavClick = (page) => {
  closeMenu()
  goToPage(page)
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

const handleChangePassword = async () => {
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

  try {
    // 呼叫後端 API 進行密碼修改
    const result = await authStore.changePassword(newPassword.value)

    // 密碼修改成功後的處理
    alert(result.message || '密碼修改成功')
    showChangePassword.value = false
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err) {
    // 處理錯誤
    passwordError.value = err.message || '修改密碼失敗，請稍後再試'
    console.error('Password change error:', err)
  }
}

const carouselImages = ref([])
const currentSlide = ref(0)
const carouselImg = ref(null)

async function fetchCarousel() {
  try {
    const res = await bannersApi.active()
    const imgs = (res.data || [])
        .map(item => (item && typeof item.imageName === 'string' ? item.imageName.trim() : ''))
        .filter(name => !!name)
        .map(name => bannersApi.imageUrl(name))
    // 加上 cache buster，避免瀏覽器快取舊圖
    const ts = Date.now()
    carouselImages.value = imgs.map(u => `${u}${u.includes('?') ? '&' : '?'}_=${ts}`)
    currentSlide.value = 0
    if (carouselImg.value) carouselImg.value.removeAttribute('data-attempt-index')
  } catch (e) {
    carouselImages.value = []
  }
}

onMounted(async () => {
  await fetchCarousel()
  // 監聽後台更新事件
  window.addEventListener('banners:updated', fetchCarousel)
})

onBeforeUnmount(() => {
  window.removeEventListener('banners:updated', fetchCarousel)
})

function nextSlide() {
  if (carouselImages.value.length === 0) return
  currentSlide.value = (currentSlide.value + 1) % carouselImages.value.length
  if (carouselImg.value) carouselImg.value.removeAttribute('data-attempt-index')
}

function prevSlide() {
  if (carouselImages.value.length === 0) return
  currentSlide.value = (currentSlide.value - 1 + carouselImages.value.length) % carouselImages.value.length
  if (carouselImg.value) carouselImg.value.removeAttribute('data-attempt-index')
}

function openImageInNewWindow() {
  if (carouselImages.value.length === 0) return
  const imageUrl = carouselImages.value[currentSlide.value]
  window.open(imageUrl, '_blank')
}

function retryCarouselImage(event) {
  try {
    const img = event.target
    const currentUrl = carouselImages.value[currentSlide.value] || ''
    const name = currentUrl ? decodeURIComponent(currentUrl.split('/').pop() || '') : ''
    if (!name) return

    let idx = Number(img.dataset.attemptIndex || 0)
    const encoded = encodeURIComponent(name)

    const candidates = [
      bannersApi.imageUrl(name),
      `/api/BannerResource/${name}`,
      `/api/BannerResource/${encoded}`,
      `/BannerResource/${name}`,
      `/BannerResource/${encoded}`,
      `/api/banners/image/${name}`,
      `/api/banners/image/${encoded}`,
      `/banners/image/${name}`,
      `/banners/image/${encoded}`,
      `http://localhost:8080/BannerResource/${name}`,
      `http://localhost:8080/BannerResource/${encoded}`,
      `http://localhost:8080/banners/image/${name}`,
      `http://localhost:8080/banners/image/${encoded}`
    ]

    // unique and drop blanks
    const uniq = Array.from(new Set(candidates.filter(Boolean)))
        // avoid retrying with exactly the same URL as current
        .filter(u => u !== currentUrl)

    if (idx >= uniq.length) {
      console.warn('Carousel image failed. Tried all candidates for:', name, '\nCandidates:', uniq)
      img.dataset.attemptIndex = uniq.length
      img.src = ''
      return
    }

    img.dataset.attemptIndex = idx + 1
    const nextUrl = uniq[idx]
    console.debug('Carousel retry', { name, attempt: idx + 1, nextUrl })
    img.src = nextUrl
    // 同步更新陣列，之後重繪會直接用可用的 URL
    carouselImages.value.splice(currentSlide.value, 1, nextUrl)
  } catch (e) {
    console.debug('retryCarouselImage failed', e)
  }
}

// 角色正規化：監聽 PermissionType 變化，自動同步 user.role
watch(
  () => authStore.user ? (authStore.user.PermissionType ?? authStore.user.permissionType) : null,
  (perm) => {
    if (perm == null) return
    const num = Number(perm)
    let role = 'general'
    if (num === 1) role = 'super_admin'
    else if (num === 2) role = 'admin'
    // 僅在不同時更新，避免不必要的響應
    if (authStore.user.role !== role) {
      authStore.user.role = role
      console.debug('[RoleSync] Synced role from PermissionType:', perm, '=>', role)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
/* 移除原先輪播相關樣式，新增簡單橫幅與 nav 翻譯樣式 */

.hero-banner {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  z-index: 90;
}

.hero-image {
  display: block;
  width: 100%;
  height: 600px;
  object-fit: cover;
}

/* 英文翻譯 (細體) */
.nav-translation {
  display: block;
  font-size: 12px;
  font-weight: 300;
  font-family: system-ui, -apple-system, 'Noto Sans', 'Helvetica Neue', Arial, sans-serif;
  color: #b85a63;
  margin-top: 4px;
  letter-spacing: 0.6px;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}

/* App Container */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header 樣式 */
header {
  background: #FFF;
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
.title-second{
  font-size: 1rem;
  font-weight: lighter;
}

.system-title {

  font-size: 2.15rem;
  font-weight: lighter;
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

.nav-item:active{
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
  margin-top: 100px;

  /* Add padding to the main content */
}

/* Footer 樣式 ffd4d4*/
footer {
  background: #FFF;
  color: #3a1f1f;
  text-align: center;
  padding: 16px 0 8px 0;
  font-size: 0.95rem;
  letter-spacing: 1px;
  margin-top: 32px;
  box-shadow: 0 -5px 6px rgba(0, 0, 0, 0.2);
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
  top: 5px;
  right: 5px;
  display: flex;
  align-items: center;
  gap: 0;
  z-index: 110;
}

.login-actions {
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  align-items: center;
  gap: 0;
  z-index: 110;
}

.login-btn {
  background: none;
  color:  #e35d6a;
  border: none;
  border-radius: 6px;
  padding: 8px 8px;
  font-size: 14px;
  font-weight: 300;
  cursor: pointer;
  transition: background-color 0.2s;
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

/* Carousel styles */
.carousel-wrapper {
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  height: 600px;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 90;
}
.carousel-image-box {
  width: 100%;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.no-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #e35d6a;
  background: #f9f9f9;
  border-radius: 8px;
}
.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.3);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 91;
  transition: background 0.2s;
}
.carousel-btn.left {
  left: 32px;
}
.carousel-btn.right {
  right: 32px;
}
.carousel-btn:hover {
  background: rgba(227,93,106,0.7);
}

/* 漢堡選單按鈕樣式 */
.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  z-index: 111;
  position: relative;
}

.hamburger-btn span {
  width: 100%;
  height: 3px;
  background: #e35d6a;
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* 導航選單容器 */
.nav-menu {
  display: flex;
  gap: 32px;
  align-items: flex-end;
}

/* 選單遮罩層 */
.menu-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 98;
}

/* 響應式設計：小於 1150px 時 */
@media (max-width: 1330px) {
  .hamburger-btn {
    display: flex;
    position: absolute;
    top: 0px;
    right: 20px; /* 在 user-actions 左側留出空間 */
  }

  /* 當未登入時（沒有 user-actions），漢堡按鈕移到最右側 */
  .header-nav:not(:has(.user-actions)) .hamburger-btn {
    right: 20px;
  }

  .menu-overlay {
    display: block;
  }

  .nav-menu {
    position: fixed;
    top: 0;
    right: -100%;
    width: 280px;
    height: 100vh;
    background: #fff;
    flex-direction: column;
    gap: 0;
    padding: 80px 20px 20px;
    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
    transition: right 0.3s ease;
    z-index: 99;
    align-items: stretch;
    overflow-y: auto;
  }

  .nav-menu-open {
    right: 0;
  }

  .nav-item {
    width: 100%;
    padding: 16px 20px;
    border-radius: 8px;
    margin-bottom: 8px;
    align-items: flex-start;
  }

  .nav-item:hover {
    background: #ffe8e8;
  }

  .nav-option {
    width: 100%;
    margin-top: 8px;
  }

  .nav-translation {
    text-align: left;
    margin-left: 0;
  }

  .header-nav {
    position: relative;
  }
  .user-actions {
    position: absolute;
    top: -50px;
    right: 0px;
    display: flex;
    align-items: center;
    gap: 0;
    z-index: 110;
  }
}

/* 更小螢幕的額外調整 */
@media (max-width: 768px) {
  .header-left {
    margin-left: 10px;
  }

  .system-title {
    font-size: 1.5rem;
  }

  .title-second {
    font-size: 0.85rem;
  }

  .content-area {
    margin: 3% 5%;
    padding: 30px 20px;
  }
  .user-actions {
    position: absolute;
    top: -50px;
    right: 0px;
    display: flex;
    align-items: center;
    gap: 0;
    z-index: 110;
  }

}
</style>