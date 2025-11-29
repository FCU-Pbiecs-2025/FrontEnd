<template>
  <div class="announcement-page">
    <div class="announcement-card">
      <div v-if="!isEditPage">
        <div class="title-row">
          <img src="https://img.icons8.com/ios/48/2e6fb7/megaphone.png" class="icon" alt="icon" />
          <span class="main-title">系統公告管理</span>
        </div>
        <div class="query-card">
          <div class="query-row">
            <div class="search-area">
              <label class="date-label">發佈日期：</label>
              <div class="date-range">
                <input type="date" v-model="dateStart" class="date-input" />
                <span class="to-label">至</span>
                <input type="date" v-model="dateEnd" class="date-input" />
              </div>
            </div>
          </div>
          <div class="query-row">
            <div class="search-area">
              <label class="type-label">權限類型：</label>
              <div class="checkbox-group">
                <label><input type="checkbox" v-model="type.front" /> 前台公告</label>
                <label><input type="checkbox" v-model="type.back" /> 後台公告</label>
              </div>
            </div>
          </div>

          <div class="btn-query" style="display:flex; align-items:center; gap: 10px;">
            <button class="btn primary" @click="addNew">新增</button>
            <button class="btn query" @click="doQuery">查詢</button>
          </div>
        </div>
        <div class="table-section">
          <table class="announcement-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>標題</th>
                <th>類型</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in resultList" :key="item.id">
                <td class="date-cell">{{ item.date }}</td>
                <td class="title-cell">
                  <span class="title-link" @click="goDetail(item)">{{ item.title }}</span>
                </td>
                <td class="type-cell">{{ item.typeText }}</td>
                <td>
                  <div style="display: flex; gap: 8px;">
                    <button class="btn small" @click="editItem(item)">編輯</button>
                    <button class="btn small danger" @click="remove(item)">刪除</button>
                  </div>
                </td>
              </tr>
              <tr v-if="resultList.length === 0">
                <td colspan="4" class="empty-tip">目前沒有公告</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="bottom-row">

          <button class="btn primary" v-show="showBack" @click="goBack">返回</button>
        </div>
      </div>
      <router-view v-else />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAllAnnouncements, deleteAnnouncement } from '@/api/announcements.js'
const router = useRouter()
const route = useRoute()


// 查詢條件
const type = ref({ front: true, back: true })
const dateStart = ref('')
const dateEnd = ref('')

// 公告列表
const list = ref([])
const resultList = ref([])
const showBack = ref(false)

const loadList = async () => {
  try {
    const data = await getAllAnnouncements()
    if (data && Array.isArray(data)) {
      list.value = data.map(item => {
        // Normalize id: support announcementID (UUID from real backend), announcementId, or id (from mock server)
        const id = item.announcementID || item.announcementId || item.id || null

        // Normalize date: support startDate, publishDate, createdDate
        const date = item.startDate || item.publishDate || item.createdDate || new Date().toISOString().split('T')[0]

        // Normalize type: backend may return numeric 1/2 or strings 'front'/'back'
        const rawType = item.type
        let typeNum = 1
        if (rawType === 'back' || rawType === '後台' || rawType === 2 || rawType === '2') typeNum = 2
        else typeNum = 1

        const typeText = (rawType === 'back' || rawType === '後台' || typeNum === 2) ? '後台' : '前台'

        return {
          id,
          date,
          title: item.title || item.announcementTitle || '無標題',
          content: item.content || item.announcementContent || '無內容',
          attachmentPath: item.attachmentPath || null,
          type: typeNum,
          typeText
        }
      })
    } else {
      // API 沒有返回資料時，設為空陣列
      list.value = []
    }
  } catch (e) {
    console.error('loadList error', e)

    list.value = []
  }
}


onMounted(async () => {
  await loadList()
  resultList.value = [...list.value]
})

// 監聽路由變化，從編輯頁面返回時重新載入資料
watch(() => route.name, async (newName, oldName) => {
  if (newName === 'AdminAnnouncement' && (oldName === 'AdminAnnouncementCreate' || oldName === 'AdminAnnouncementEdit')) {
    await loadList()
    resultList.value = [...list.value]
    // 重置查詢條件
    type.value = { front: true, back: true }
    dateStart.value = ''
    dateEnd.value = ''
    showBack.value = false
  }
})

const doQuery = async () => {
  await loadList() // 確保查詢前先重新載入最新資料
  resultList.value = list.value.filter(item => {
    // 類型篩選 (後端 type: 1=前台, 2=後台)
    if (item.type === 1 && !type.value.front) return false
    if (item.type === 2 && !type.value.back) return false
    // 日期篩選
    if (dateStart.value && item.date < dateStart.value) return false
    if (dateEnd.value && item.date > dateEnd.value) return false
    return true
  })
  showBack.value = true
}

const addNew = () => {
  router.push({ name: 'AdminAnnouncementCreate' })
}

const editItem = (item) => {
  if (!item.id) {
    alert('無法編輯：缺少公告 ID')
    return
  }
  router.push({ name: 'AdminAnnouncementEdit', params: { id: String(item.id) } })
}

const remove = async (item) => {
  if (!item.id) {
    alert('無法刪除：缺少公告 ID')
    return
  }
  if (confirm('確定要刪除這則公告嗎？')) {
    try {
      console.log('刪除公告 ID:', item.id) // Debug log
      await deleteAnnouncement(item.id)
      alert('刪除成功')
      // 刪除成功後重新載入資料
      await loadList()
      // 重新執行查詢以更新顯示列表
      if (showBack.value) {
        doQuery()
      } else {
        resultList.value = [...list.value]
      }
    } catch (error) {
      console.error('刪除公告失敗:', error)
      // 更詳細的錯誤訊息
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || '刪除公告失敗'
      alert(`刪除公告失敗：${errorMessage}`)
    }
  }
}

const goBack = async () => {
  type.value = { front: true, back: true }
  dateStart.value = ''
  dateEnd.value = ''
  await loadList()
  resultList.value = [...list.value]
  showBack.value = false
}

const isEditPage = computed(() => {
  return route.name === 'AdminAnnouncementCreate' ||
         route.name === 'AdminAnnouncementEdit' ||
         route.name === 'AdminAnnouncementDetail'
})

const goDetail = (item) => {
  router.push({ name: 'AdminAnnouncementDetail', params: { id: String(item.id) } })
}
</script>



<style>
.announcement-card {
  max-width:820px;min-width: 85%;margin: 0 auto;
}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px;margin-top: 60px }
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700 }
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; ; margin-bottom:50px;   box-shadow:0 2px 8px rgba(16,24,40,0.04); margin-top:50px; }
.query-row { gap:12px; width: 490px; margin: 1px auto 12px auto; }
.search-area { gap:30px; display:flex; align-items:center; margin-bottom:8px; }
.type-label, .date-label { font-weight:600; color:#2e6fb7; min-width: 100px; text-align: right; }
.checkbox-group { display:flex; gap:60px; align-items:center; }
.checkbox-group label { display:flex; align-items:center; gap:5px; color:#334e5c; }
.date-range { display:flex; align-items:center; gap:10px; }
.date-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; width:150px; }
.to-label { color:#888; margin:0 8px; }
.btn-query { display: flex;justify-content: center;margin-top: 30px; }
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff ;margin-right: 12px}
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6; margin-right:6px; }
.btn.danger { background:#ff7b8a; color:#fff }
.announcement-table { width:100%; border-collapse:collapse }
.announcement-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight:700; }
.announcement-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; }
.date-cell { font-weight:600; color:#334e5c }
.title-cell { color:#334e5c }
.type-cell { color:#334e5c; font-weight: 600; }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:10vh; }
@media (max-width:900px){ .announcement-card{ width:100%; padding:16px } .date-input{ width:100px } }
</style>
