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
              <select v-model="selectedInstitution" class="date-input" @change="loadLotteryData">
                <option value="">全部機構</option>
                <option v-for="inst in institutions" :key="inst.id" :value="inst.id">
                  {{ inst.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="btn-query">
          <button class="btn primary" @click="performDraw" :disabled="!hasWaitingList">進行抽籤</button>
          <button class="btn query" @click="exportResults" :disabled="lotteryResults.length === 0">結果公告</button>
        </div>
      </div>

      <!-- 提示訊息 -->
      <div class="info-banner" v-if="selectedInstitution && purchasedList.length === 0">
        <span class="icon-info">ℹ️</span>
        <span>機構總結：尚無資料</span>
      </div>

      <!-- 抽籤前不顯示表格，抽籤後只顯示結果表格 -->
      <div v-if="showResultModal">
        <!-- 抽籤結果表格 -->
        <div class="table-section">
          <table class="announcement-table">
            <thead>
              <tr>
                <th>班級</th>
                <th>申請人姓名<br/>申請人身分證</th>
                <th>幼童姓名</th>
                <th>幼童身分證</th>
                <th>序號</th>
                <th>排序</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in lotteryResults" :key="item.id">
                <td class="class-cell">{{ item.className }}</td>
                <td class="applicant-cell">
                  <div>{{ item.applicantName }}</div>
                  <div class="id-number">{{ item.applicantId }}</div>
                </td>
                <td class="child-cell">{{ item.childName }}</td>
                <td class="id-cell">{{ item.childId }}</td>
                <td class="number-cell">{{ item.sequence }}</td>
                <td class="order-cell">{{ item.order || '-' }}</td>
              </tr>
              <tr v-if="lotteryResults.length === 0">
                <td colspan="6" class="empty-tip">目前沒有抽籤結果</td>
              </tr>
            </tbody>
          </table>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 機構列表
const institutions = ref([
  { id: 1, name: '新竹市西區公托社區中心' },
  { id: 2, name: '新竹市東區公托社區中心' },
  { id: 3, name: '新竹市北區公托社區中心' }
])

const selectedInstitution = ref('')
const showDrawModal = ref(false)
const showResultModal = ref(false)
const isDrawing = ref(false)
const drawTime = ref('')

// 購機名單（已分配名額）
const purchasedList = ref([])

// 候補名單（待抽籤）
const waitingList = ref([])

// 抽籤結果
const lotteryResults = ref([])

// 是否有候補名單
const hasWaitingList = computed(() => waitingList.value.length > 0)

// 獲取機構名稱
const getInstitutionName = (id) => {
  const inst = institutions.value.find(i => i.id === id)
  return inst ? inst.name : ''
}

// 載入抽籤資料
const loadLotteryData = () => {
  // 無論選擇哪個機構（包含全部機構），都要有測試資料
  purchasedList.value = [
    {
      id: 1,
      className: '小班A',
      applicantName: '王小明',
      applicantId: 'A123456789',
      childName: '王大寶',
      childId: 'B234567890',
      sequence: 1,
      order: 1
    },
    {
      id: 2,
      className: '小班A',
      applicantName: '李小華',
      applicantId: 'C345678901',
      childName: '李二寶',
      childId: 'D456789012',
      sequence: 2,
      order: 2
    }
  ];
  waitingList.value = [
    {
      id: 101,
      className: '小班A',
      applicantName: '張小花',
      applicantId: 'E567890123',
      childName: '張三寶',
      childId: 'F678901234',
      sequence: 3,
      order: null
    },
    {
      id: 102,
      className: '小班A',
      applicantName: '陳小美',
      applicantId: 'G789012345',
      childName: '陳四寶',
      childId: 'H890123456',
      sequence: 4,
      order: null
    },
    {
      id: 103,
      className: '小班B',
      applicantName: '林小強',
      applicantId: 'I901234567',
      childName: '林五寶',
      childId: 'J012345678',
      sequence: 5,
      order: null
    }
  ];
  lotteryResults.value = [];
}

// 執行抽籤
const performDraw = async () => {
  // 新增確認提醒
  const confirmMsg = `確定要進行補位抽籤嗎？\n機構：${getInstitutionName(selectedInstitution.value)}\n請確認後再執行。`
  if (!window.confirm(confirmMsg)) {
    return
  }
  isDrawing.value = true

  // 模擬抽籤過程（2秒）
  await new Promise(resolve => setTimeout(resolve, 2000))

  // 隨機打亂候補名單並分配排序
  const shuffled = [...waitingList.value]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  // 分配排序號碼
  shuffled.forEach((item, index) => {
    item.order = index + 1
  })

  waitingList.value = shuffled
  lotteryResults.value = shuffled

  // 記錄抽籤時間
  const now = new Date()
  drawTime.value = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  isDrawing.value = false
  showResultModal.value = true
}

// 匯出結果
const exportResults = () => {
  if (lotteryResults.value.length === 0) {
    alert('目前沒有抽籤結果可匯出')
    return
  }

  alert('匯出功能開發中...')
}
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
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }

/* 表格 */
.table-section { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:0; margin-bottom:24px; box-shadow:0 2px 8px rgba(16,24,40,0.04) }
.announcement-table { width:100%; border-collapse:collapse; }
.announcement-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight:700 }
.announcement-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align:middle; text-align:left }
.class-cell { font-weight:600; color:#334e5c }
.id-number { font-size:0.85rem; color:#888; margin-top:4px }
.order-cell { font-weight:700; color:#2e6fb7 }
.empty-tip { color:#999; text-align:center; padding:18px 0 }

/* 提示訊息 */
.info-banner { display:flex; align-items:center; gap:12px; padding:10px 14px; background:#fff8e1; border:1px solid #ffe58a; border-radius:8px; margin-bottom:16px; color:#8b6a00 }
.icon-info { font-size:1.2rem }

/* Modal 與動畫（維持原樣式，略） */
/* ...existing code... */

/* 響應式 */
@media (max-width:900px){ .announcement-card{ width:100%; padding:16px } .date-input{ width:160px; max-width:160px } .query-row{ width:100%; flex:0 0 100%; } }
</style>
