<template>
  <div class="announcement-page">
    <div class="announcement-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/lottery.png" class="icon" alt="icon" />
        <span class="main-title">補位抽籤</span>
      </div>

      <!-- 查詢/操作區塊 -->
      <div class="query-card">
        <div class="query-container">
          <div class="query-row">
            <div class="search-area">
              <label class="type-label">選擇公托社區：</label>
              <select v-model="selectedInstitution" class="date-input" @change="loadLotteryData" :disabled="institutionsLoading">
                <option value="" disabled>{{ institutionsLoading ? '載入中...' : '--- 請選擇機構 ---' }}</option>
                <option v-for="inst in institutions" :key="inst.institutionID" :value="inst.institutionID">
                  {{ inst.institutionName }}
                </option>
              </select>
              <div v-if="institutionsError" class="error-msg">{{ institutionsError }}</div>
            </div>
          </div>
        </div>
        <div class="btn-query">
          <button class="btn primary" @click="performDraw" :disabled="!canPerformLottery" :title="!selectedInstitution ? '請先選擇機構' : '執行抽籤'">
            進行抽籤
          </button>
        </div>
        <div v-if="!selectedInstitution" class="hint-msg">
          ℹ️ 提示：請先選擇特定機構才能執行抽籤
        </div>
      </div>


      <!-- 抽籤確認對話框 -->
      <!-- 已移除原本的抽籤確認對話框區塊 -->

      <!-- 抽籤進行中動畫 -->
      <div class="modal-overlay" v-if="isDrawing">
        <div class="drawing-animation">
          <div class="spinner"></div>
          <p class="drawing-text">抽籤進行中...</p>
        </div>
      </div>

      <!-- 抽籤結果對話框 -->
      <!-- 已移除抽籤完成彈窗區塊 -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getInstitutionsSimpleAll } from '@/api/Institution.js'
import { performLottery, getWaitlistByInstitution, getWaitlistStatistics } from '@/api/waitlist.js'

const router = useRouter()

// 機構列表
const institutions = ref([])
const institutionsLoading = ref(false)
const institutionsError = ref('')

const selectedInstitution = ref('')
const isDrawing = ref(false)

// 候補名單（待抽籤）- 候補中的申請人
const waitingList = ref([])


// 統計資訊
const statistics = ref(null)

// 是否可以執行抽籤（需要選擇機構）
const canPerformLottery = computed(() => selectedInstitution.value !== '')

// 獲取機構名稱
const getInstitutionName = (id) => {
  if (!id) return '全部機構'
  const inst = institutions.value.find(i => i.institutionID === id)
  return inst ? inst.institutionName : ''
}


// 載入機構列表
const loadInstitutions = async () => {
  try {
    institutionsLoading.value = true
    institutionsError.value = ''
    console.log('開始載入機構列表...')
    const response = await getInstitutionsSimpleAll()
    console.log('機構API回應:', response)

    if (Array.isArray(response)) {
      institutions.value = response
      console.log('載入機構列表成功，共', institutions.value.length, '個機構')
    } else {
      console.error('機構API回應格式錯誤:', response)
      institutionsError.value = 'API 回應格式錯誤'
      institutions.value = []
    }
  } catch (error) {
    console.error('載入機構列表失敗:', error)
    institutionsError.value = '載入機構列表失敗: ' + (error.message || '未知錯誤')
    // 如果API失敗，使用備用的靜態資料
    institutions.value = [
      { institutionID: '1', institutionName: '新竹市西區公托社區中心' },
      { institutionID: '2', institutionName: '新竹市東區公托社區中心' },
      { institutionID: '3', institutionName: '新竹市北區公托社區中心' }
    ]
    console.log('使用備用機構資料')
  } finally {
    institutionsLoading.value = false
  }
}

// 載入抽籤資料（查詢候補名單和統計）
const loadLotteryData = async () => {
  if (!selectedInstitution.value) {
    waitingList.value = []
    statistics.value = null
    return
  }

  try {
    console.log('載入機構資料:', selectedInstitution.value)

    // 同時查詢候補名單和統計資訊
    const [waitlistData, statsData] = await Promise.all([
      getWaitlistByInstitution(selectedInstitution.value),
      getWaitlistStatistics(selectedInstitution.value)
    ])

    console.log('候補名單資料:', waitlistData)
    console.log('統計資訊:', statsData)

    // 將候補名單顯示在表格中
    waitingList.value = waitlistData || []
    statistics.value = statsData

  } catch (error) {
    console.error('載入抽籤資料失敗:', error)
    alert('載入資料失敗：' + (error.message || '未知錯誤'))
    waitingList.value = []
    statistics.value = null
  }
}

// 執行抽籤
const performDraw = async () => {
  if (!selectedInstitution.value || selectedInstitution.value === '') {
    alert('⚠️ 請先選擇特定機構\n\n抽籤功能需要針對單一機構進行，\n無法同時對「全部機構」執行抽籤。\n\n請從下拉選單中選擇一個機構後再執行抽籤。')
    return
  }

  // 確認提醒
  const confirmMsg = `確定要進行補位抽籤嗎？\n機構：${getInstitutionName(selectedInstitution.value)}\n\n⚠️ 注意：\n1. 抽籤將依照第一、第二、第三序位順序進行\n2. 抽籤結果將直接更新資料庫\n3. 請確認所有申請人資料已審核完畢\n\n請確認後再執行。`
  if (!window.confirm(confirmMsg)) {
    return
  }

  isDrawing.value = true

  try {
    console.log('開始執行抽籤，機構 ID:', selectedInstitution.value)

    // 呼叫後端抽籤 API
    const result = await performLottery(selectedInstitution.value, true)

    console.log('抽籤完成，結果:', result)

    // 顯示後端返回的訊息
    if (result.message) {
      alert(result.message)
    }

    // 抽籤完成後重新載入資料
    if (result.success) {
      await loadLotteryData()
    } else {
      // 如果沒有 message 或抽籤失敗，顯示失敗訊息
      if (!result.message) {
        alert('抽籤失敗：' + (result.message || '未知錯誤'))
      }
    }

  } catch (error) {
    console.error('抽籤執行失敗:', error)
    alert('抽籤執行失敗：' + (error.response?.data?.message || error.message || '未知錯誤'))
  } finally {
    isDrawing.value = false
  }
}


// 組件掛載時載入機構列表
onMounted(() => {
  loadInstitutions()
})
</script>

<style scoped>
/* 與其他後台頁一致的容器設定 */
.announcement-page { display:flex; justify-content:center; }
.announcement-card { max-width:820px; min-width: 85% }

/* 標題列 */
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; margin-top:60px }
.icon { width:32px; height:32px }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700 }

/* 查詢區塊 */
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:14px 18px; margin-bottom:24px; box-shadow:0 2px 8px rgba(16,24,40,0.04); margin-top:20px }
.query-container { display:flex; flex-wrap:wrap; gap:12px }
.query-row { display:flex; width:50%; flex:0 0 calc(50% - 6px); margin-bottom:12px }
.search-area { gap:30px; display:flex; align-items:center; width:100% }
.type-label { font-weight:600; color:#2e6fb7; min-width:100px }
.date-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; flex:1; max-width:220px }
.btn-query { display:flex; gap:10px; justify-content:center; margin-top:10px }
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600 }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }


/* 提示訊息 */
.error-msg { color:#dc3545; font-size:0.875rem; margin-top:4px; margin-left:8px }
.hint-msg { color:#666; font-size:0.875rem; margin-top:8px; text-align:center; font-style:italic }

/* Modal 與動畫（維持原樣式，略） */
/* ...existing code... */

/* 響應式 */
@media (max-width:900px){ .announcement-card{ width:100%; padding:16px } .date-input{ width:160px; max-width:160px } .query-row{ width:100%; flex:0 0 100%; } }
</style>
