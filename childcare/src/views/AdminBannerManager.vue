<template>
  <div class="banner-manager-page">
    <div v-if="!isEditPage" class="banner-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/image.png" class="icon" alt="icon" />
        <span class="main-title">前台海報管理</span>
      </div>

      <div class="query-card">
        <div class="query-row">
          <div class="search-area">
            <label class="date-label">顯示日期：</label>
            <div class="date-range">
              <input type="date" v-model="dateStart" class="date-input" />
              <span class="to-label">至</span>
              <input type="date" v-model="dateEnd" class="date-input" />
            </div>
          </div>
        </div>
        <div class="btn-query">
          <button class="btn primary" @click="openNew">新增</button>
          <button class="btn query" @click="doQuery">查詢</button>
        </div>
      </div>

      <div class="table-section">
        <table class="banner-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Banner</th>
              <th>導向連結</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in resultBanners" :key="b.id">
              <td>
                <span v-if="b.id">{{ b.id }}</span>
                <span v-else style="color:red;font-weight:bold;">⚠️</span>
              </td>
              <td class="img-cell"><img :src="b.image" alt="banner" @error="handleImgError($event, b)" /></td>
              <td>{{ b.link }}</td>
              <td>{{ b.status }}</td>
              <td class="action-cell">
                <button class="btn small" @click="goEdit(b.id)" :disabled="!b.id">編輯</button>
                <button class="btn small danger" @click="remove(b.id)" :disabled="!b.id">刪除</button>
              </td>
            </tr>
            <tr v-if="resultBanners.length === 0">
              <td colspan="6" class="empty-tip">目前沒有海報</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button class="btn small" @click="prevPage" :disabled="!canPrev">上一頁</button>
        <button class="btn small" @click="nextPage" :disabled="!canNext">下一頁</button>
      </div>

      <div class="bottom-row">
        <button class="btn primary" v-show="showBack" @click="goBack">返回</button>
      </div>

      <div class="page-info" v-if="totalPages !== null">
        <span>第 {{ currentPage }} / {{ totalPages }} 頁</span>
      </div>
    </div>
    <router-view v-if="isEditPage" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import bannersApi from '../api/banners'

const router = useRouter()
const route = useRoute()

// removed storageKey and localStorage reliance; use backend API instead
const banners = ref([])
const resultBanners = ref([])
const showBack = ref(false)

// pagination
const offset = ref(0)
const size = ref(10)
const total = ref(null) // totalElements
const totalPages = ref(null)
const hasNext = ref(null)

const currentPage = computed(() => {
  return Math.floor(offset.value / size.value) + 1
})

// 日期查詢條件
const dateStart = ref('')
const dateEnd = ref('')

// load list from backend (paged)
const loadList = async () => {
  try {
    const resp = await bannersApi.listPaged(offset.value, size.value)
    console.debug('DEBUG bannersApi.listPaged response:', resp)
    // backend returns { content, offset, size, totalElements, totalPages, hasNext }
    let data = []
    if (resp.data) {
      if (Array.isArray(resp.data)) {
        data = resp.data
        total.value = null
        totalPages.value = null
        hasNext.value = null
      } else if (Array.isArray(resp.data.content)) {
        data = resp.data.content
        total.value = typeof resp.data.totalElements === 'number' ? resp.data.totalElements : (typeof resp.data.totalElements === 'string' ? Number(resp.data.totalElements) : null)
        totalPages.value = typeof resp.data.totalPages === 'number' ? resp.data.totalPages : (typeof resp.data.totalPages === 'string' ? Number(resp.data.totalPages) : null)
        hasNext.value = typeof resp.data.hasNext === 'boolean' ? resp.data.hasNext : null
      } else if (Array.isArray(resp.data.items)) {
        data = resp.data.items
        total.value = typeof resp.data.total === 'number' ? resp.data.total : null
        totalPages.value = typeof resp.data.totalPages === 'number' ? resp.data.totalPages : null
        hasNext.value = typeof resp.data.hasNext === 'boolean' ? resp.data.hasNext : null
      }
    }

    banners.value = data.map(item => {
      const getDatePart = (iso) => {
        if (!iso) return ''
        try {
          return new Date(iso).toISOString().slice(0,10)
        } catch (e) {
          return ''
        }
      }
      // 列出所有 key，方便 debug
      console.debug('Mapping banner item keys:', Object.keys(item))
      console.debug('Mapping banner item:', item)
      return {
        id: item.id || item.ID || item.bannerId || item.bannerID || item.pk || item._id || item.sortOrder,
        // 圖片路徑統一改為經過 API
        image: item.imageName ? `/banners/image/${item.imageName}` : '',
        link: item.linkUrl || '',
        displayDate: getDatePart(item.startTime),
        status: item.status ? '下架' : '顯示',
        _raw: item
      }
    })
    console.debug('Mapped banners:', banners.value) // Add debug log
    resultBanners.value = [...banners.value]
  } catch (e) {
    console.error('failed to load banners', e)
    banners.value = []
    resultBanners.value = []
    total.value = null
    totalPages.value = null
    hasNext.value = null
  }
}

const canPrev = computed(() => offset.value > 0)
const canNext = computed(() => {
  if (hasNext.value !== null) return hasNext.value
  if (total.value !== null) return offset.value + size.value < total.value
  // unknown total -> allow next
  return true
})

// modify prevPage/nextPage to guard by canPrev/canNext
const prevPage = async () => {
  if (!canPrev.value) return
  offset.value = Math.max(0, offset.value - size.value)
  await loadList()
}

const nextPage = async () => {
  if (!canNext.value) return
  offset.value = offset.value + size.value
  await loadList()
}

onMounted(async () => {
  // remove any leftover local demo data to prevent showing stale placeholder banners
  try { localStorage.removeItem('siteBanners') } catch (e) { /* ignore */ }
  await loadList()
})

// 監聽路由變化，從編輯頁面返回時重新載入資料
watch(() => route.name, async (newName, oldName) => {
  if (newName === 'AdminBannerManager' && (oldName === 'AdminBannerNew' || oldName === 'AdminBannerEdit')) {
    await loadList()
    // 重置查詢條件
    dateStart.value = ''
    dateEnd.value = ''
    showBack.value = false
  }
})

const doQuery = () => {
  // client-side filter for now; paging remains
  resultBanners.value = banners.value.filter(item => {
    return (!(dateStart.value && item.displayDate < dateStart.value)) && (!(dateEnd.value && item.displayDate > dateEnd.value))
  })
  showBack.value = true
}

const openNew = () => {
  router.push({ name: 'AdminBannerNew' })
}

const goEdit = (id) => {
  console.debug('goEdit clicked with id:', id)
  console.debug('current route name:', route.name)

  if (!id) {
    console.error('Invalid ID for edit:', id)
    alert('無法編輯：ID 無效')
    return
  }

  try {
    router.push({ name: 'AdminBannerEdit', params: { id: String(id) } })
    console.debug('router.push executed successfully')
  } catch (e) {
    console.error('router.push failed:', e)
    alert('導航失敗，請稍後再試')
  }
}

const remove = async (id) => {
  console.debug('remove clicked with id:', id)

  if (!id) {
    console.error('Invalid ID for remove:', id)
    alert('無法刪除：ID 無效')
    return
  }

  if (!confirm('確定要刪除這筆海報嗎？')) return

  try {
    await bannersApi.remove(id)
    console.debug('Remove successful for id:', id)
    // reload list from backend
    await loadList()
    if (showBack.value) {
      doQuery()
    }
    // 通知前台更新海報資料
    try { window.dispatchEvent(new CustomEvent('banners:updated')) } catch (e) { /* ignore */ }
    alert('刪除成功')
  } catch (e) {
    console.error('delete banner failed', e)
    alert('刪除失敗，請稍後再試: ' + (e.response?.data?.message || e.message))
  }
}

const goBack = () => {
  dateStart.value = ''
  dateEnd.value = ''
  resultBanners.value = [...banners.value]
  showBack.value = false
}

const isEditPage = computed(() => {
  return route.name === 'AdminBannerNew' || route.name === 'AdminBannerEdit'
})

// Try alternate image URLs when the image fails to load (toggle /api prefix)
const handleImgError = (event, b) => {
  try {
    const img = event.target
    const name = (b && b._raw && b._raw.imageName) || (b && b.image && b.image.split('/').pop())
    if (!name) return

    let idx = Number(img.dataset.attemptIndex || 0)
    const candidates = [
      `/api/BannerResource/${name}`,
      `/BannerResource/${name}`,
      bannersApi.imageUrl(name),
      `/api/banners/image/${name}`,
      `/banners/image/${name}`,
      `http://localhost:8080/BannerResource/${name}`,
      `http://localhost:8080/banners/image/${name}`
    ]

    const uniq = Array.from(new Set(candidates.filter(Boolean)))

    if (idx >= uniq.length) {
      img.dataset.attemptIndex = uniq.length
      img.src = ''
      return
    }

    img.dataset.attemptIndex = idx + 1
    img.src = uniq[idx]
  } catch (e) {
    console.debug('handleImgError failed', e)
  }
}
</script>

<style scoped>
.banner-manager-page {
  display: flex;
  justify-content: center;
}
.banner-card {
  max-width:820px;min-width: 85%
}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; margin-top: 60px; }
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700 }
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:14px 18px; margin-bottom:50px; box-shadow:0 2px 8px rgba(16,24,40,0.04); margin-top:50px; display: flex; flex-direction: column; align-items: center; }
.query-row { display:flex; gap:12px; margin-bottom:12px; }
.search-area { gap:30px; display:flex; align-items:center; margin-bottom:8px; }
.date-label { font-weight:600; color:#2e6fb7; min-width: 100px; text-align: right; }
.date-range { display:flex; align-items:center; gap:10px; }
.date-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; width:150px; }
.to-label { color:#888; margin:0 8px; }
.btn-query { display: flex; justify-content: center; margin-top: 30px; }
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff ; margin-right:12px; }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6; margin-right:6px; cursor: pointer; border: none; }
.btn.small:hover { background:#e2e8f0; }
.btn.small:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.danger { background:#ff7b8a; color:#fff }
.table-section { margin-bottom:18px; }
.banner-table { width:100%; border-collapse:collapse; }
.banner-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight:700; }
.banner-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; }
.img-cell img { width:160px; height:56px; object-fit:cover; border-radius:6px }
.action-cell { text-align:left; position: relative; z-index: 1; }
.empty-tip { text-align:center; padding:18px; color:#999 }
.bottom-row { display: flex; justify-content: center; gap:12px; margin-top: 10vh; }
.pagination { display: flex; justify-content: center; gap: 12px; margin-top: 20px; }
.page-info { text-align: center; margin-top: 10px; color: #666; }
@media (max-width:900px){ .banner-card{ width:100%; padding:16px } .date-input{ width:100px } }
</style>
