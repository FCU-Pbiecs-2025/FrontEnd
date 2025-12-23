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
          請先選擇特定機構後再進行抽籤
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

      <!-- 抽籤結果區塊（直接顯示在頁面下方） -->
      <div id="lottery-result-section" v-if="lotteryResult" class="result-section">
        <div class="result-card-inline">
          <div class="result-header-inline">
            <h3>📋 抽籤結果</h3>
            <button class="btn-export-inline" @click="exportResult" v-if="lotteryResult?.admitted?.length > 0">
               匯出 Excel
            </button>
          </div>
          <div class="result-message-inline" v-if="lotteryResult.message">
            <p>{{ lotteryResult.message }}</p>
          </div>
          <div>
            <p></p>
          </div>
          <div class="result-info-grid">
            <div class="info-box">
              <span class="info-label">機構名稱</span>
              <span class="info-value">{{ lotteryResult.institutionName }}</span>
            </div>
            <div class="info-box">
              <span class="info-label">抽籤時間</span>
              <span class="info-value">{{ lotteryResult.drawTime }}</span>
            </div>
            <div class="info-box highlight-box">
              <span class="info-label">錄取人數</span>
              <span class="info-value highlight">{{ lotteryResult.admitted?.length || 0 }} 人</span>
            </div>
            <div class="info-box" v-if="lotteryResult.waitlisted > 0">
              <span class="info-label">候補人數</span>
              <span class="info-value">{{ lotteryResult.waitlisted }} 人</span>
            </div>
          </div>

          <div class="priority-summary-inline" v-if="lotteryResult.admitted?.length > 0">
            <div class="priority-box">
              <span class="priority-label">已錄取第一序位</span>
              <span class="priority-count">{{ lotteryResult.firstPriorityAccepted }} 人</span>
            </div>
            <div class="priority-box">
              <span class="priority-label">已錄取第二序位</span>
              <span class="priority-count">{{ lotteryResult.secondPriorityAccepted }} 人</span>
            </div>
            <div class="priority-box">
              <span class="priority-label">已錄取第三序位</span>
              <span class="priority-count">{{ lotteryResult.thirdPriorityAccepted }} 人</span>
            </div>
          </div>

          <div class="result-content-inline">
            <div class="admitted-list-inline" v-if="lotteryResult.admitted?.length > 0">
              <h4 class="list-title">📝 錄取名單</h4>
              <div class="table-wrapper">
                <table class="result-table-inline">
                  <thead>
                    <tr>
                      <th>序號</th>
                      <th>姓名</th>
                      <th>序位</th>
                      <th>錄取機構</th>
                      <th>分配班級</th>
                      <th>狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(person, index) in lotteryResult.admitted" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td>{{ person.childName }}</td>
                      <td>第{{ person.priority }}序位</td>
                      <td>{{ lotteryResult.institutionName }}</td>
                      <td>{{ person.className }}</td>
                      <td><span class="status-badge success">{{ person.status }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else class="no-result-inline">
              <span class="no-result-icon">ℹ️</span>
              <p>本次抽籤無錄取人員</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getInstitutionsSimpleAll } from '@/api/Institution.js'
import { performLottery, getWaitlistByInstitution, getWaitlistStatistics } from '@/api/waitlist.js'
import * as XLSX from 'xlsx'

const router = useRouter()

// 機構列表
const institutions = ref([])
const institutionsLoading = ref(false)
const institutionsError = ref('')

const selectedInstitution = ref('')
const isDrawing = ref(false)

// 候補名單（待抽籤）- 候補中的申請人
const waitingList = ref([])

// 抽籤結果
const lotteryResult = ref(null)

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

    // 保存錄取名單（從後端的 acceptedList 取得）
    const acceptedList = result.acceptedList || []
    console.log('錄取名單:', acceptedList)

    // 獲取班級資訊以對應班級名稱
    let classMap = new Map()
    try {
      const statsData = await getWaitlistStatistics(selectedInstitution.value)
      console.log('統計資訊（含班級資訊）:', statsData)

      if (statsData && statsData.classInfo && Array.isArray(statsData.classInfo)) {
        console.log('班級資訊陣列:', statsData.classInfo)
        statsData.classInfo.forEach((cls, index) => {
          console.log(`班級 ${index}:`, cls)
          // 支援多種欄位名稱格式
          const classId = cls.ClassID || cls.classID || cls.classId
          const className = cls.ClassName || cls.className || cls.name
          if (classId && className) {
            const key = classId.toString().toLowerCase()
            classMap.set(key, className)
            console.log(`班級對應已建立: ${key} -> ${className}`)
          } else {
            console.warn(`班級資料不完整:`, cls)
          }
        })
        console.log('班級對應表建立完成，共', classMap.size, '個班級')
      } else {
        console.warn('統計資訊中沒有 classInfo 或不是陣列')
      }
    } catch (error) {
      console.error('獲取班級資訊失敗:', error)
    }

    lotteryResult.value = {
      institutionName: getInstitutionName(selectedInstitution.value),
      drawTime: new Date().toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      // 格式化錄取名單資料，使用 classMap 對應班級名稱
      admitted: acceptedList.map(person => {
        const classId = person.ClassID
        let className = '待分配'

        if (classId) {
          const classIdStr = classId.toString()
          if (classMap.has(classIdStr)) {
            className = classMap.get(classIdStr)
            console.log(`找到班級對應: ${classIdStr} -> ${className}`)
          } else {
            console.warn(`找不到班級對應: ${classIdStr}`)
          }
        }

        return {
          childName: person.Name || '未提供',
          name: person.Name || '未提供',
          priority: person.IdentityType || 3,
          nationalId: person.NationalID,
          status: person.Status || '已錄取',
          className: className,
          classId: classId,
          reason: person.Reason || ''
        }
      }),
      message: result.message,
      // 額外統計資訊
      firstPriorityAccepted: result.firstPriorityAccepted || 0,
      secondPriorityAccepted: result.secondPriorityAccepted || 0,
      thirdPriorityAccepted: result.thirdPriorityAccepted || 0,
      waitlisted: result.waitlisted || 0
    }

    console.log('最終錄取結果:', lotteryResult.value)

    // 不顯示對話框，結果會直接在頁面下方呈現
    // showResultDialog.value = true

    // 抽籤完成後重新載入資料
    if (result.success) {
      await loadLotteryData()
    }

    // 自動滾動到結果區域
    setTimeout(() => {
      const resultSection = document.getElementById('lottery-result-section')
      if (resultSection) {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)

  } catch (error) {
    console.error('抽籤執行失敗:', error)
    alert('抽籤執行失敗：' + (error.response?.data?.message || error.message || '未知錯誤'))
  } finally {
    isDrawing.value = false
  }
}

// 匯出錄取名單為 Excel
const exportResult = () => {
  if (!lotteryResult.value || !lotteryResult.value.admitted || lotteryResult.value.admitted.length === 0) {
    alert('沒有可匯出的錄取名單')
    return
  }

  try {
    // 準備工作表資料
    const worksheetData = [
      // 標題資訊
      ['抽籤錄取名單'],
      ['機構名稱', lotteryResult.value.institutionName],
      ['抽籤時間', lotteryResult.value.drawTime],
      ['錄取人數', `${lotteryResult.value.admitted.length} 人`],
      ['第一序位錄取', `${lotteryResult.value.firstPriorityAccepted} 人`],
      ['第二序位錄取', `${lotteryResult.value.secondPriorityAccepted} 人`],
      ['第三序位錄取', `${lotteryResult.value.thirdPriorityAccepted} 人`],
      ['候補人數', `${lotteryResult.value.waitlisted} 人`],
      [], // 空行
      // 表頭
      ['序號', '姓名', '身分證字號', '序位', '錄取機構', '分配班級', '狀態', '備註'],
      // 資料行
      ...lotteryResult.value.admitted.map((person, index) => [
        index + 1,
        person.childName,
        person.nationalId || '',
        `第${person.priority}序位`,
        lotteryResult.value.institutionName,
        person.className,
        person.status,
        person.reason || ''
      ])
    ]

    // 建立工作簿和工作表
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    // 設定欄位寬度
    worksheet['!cols'] = [
      { wch: 8 },  // 序號
      { wch: 15 }, // 姓名
      { wch: 15 }, // 身分證字號
      { wch: 12 }, // 序位
      { wch: 25 }, // 錄取機構
      { wch: 20 }, // 分配班級
      { wch: 12 }, // 狀態
      { wch: 25 }  // 備註
    ]

    // 合併標題儲存格 (第一列)
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } } // 合併 A1 到 H1
    ]

    // 將工作表加入工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '錄取名單')

    // 生成檔名
    const timestamp = new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/[/:]/g, '').replace(/\s/g, '_')

    const fileName = `錄取名單_${lotteryResult.value.institutionName}_${timestamp}.xlsx`

    // 匯出 Excel 檔案
    XLSX.writeFile(workbook, fileName)

    console.log('匯出 Excel 成功:', fileName)
  } catch (error) {
    console.error('匯出 Excel 失敗:', error)
    alert('匯出失敗：' + error.message)
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
.query-container { display:flex; flex-wrap:wrap; gap:12px ;justify-content: center;}
.query-row { display:flex; width:50%; flex:0 0 calc(50% - 6px); margin-bottom:12px }
.search-area { gap:30px; display:flex; align-items:center; width:100% }
.type-label { font-weight:600; color:#2e6fb7; min-width:20% }
.date-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; flex:1; max-width:80% }
.btn-query { display:flex; gap:10px; justify-content:center; margin-top:10px }
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600 }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }


/* 提示訊息 */
.error-msg { color:#dc3545; font-size:0.875rem; margin-top:4px; margin-left:8px }
.hint-msg { color:#666; font-size:0.875rem; margin-top:8px; text-align:center; font-style:italic }

/* Modal 與動畫 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.drawing-animation {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.drawing-text {
  font-size: 1.1rem;
  color: #2e6fb7;
  font-weight: 600;
}

/* 抽籤結果區塊（頁面內嵌） */
.result-section {
  margin-top: 24px;
  margin-bottom: 50px;
  animation: slideDown 0.4s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-card-inline {
  background: #fff;
  border: 1px solid #e6e6ea;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(16, 24, 40, 0.04);
}

.result-header-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e6e6ea;
}

.result-header-inline h3 {
  margin: 0;
  font-size: 1.35rem;
  color: #2e6fb7;
  font-weight: 700;
}

.btn-export-inline {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  color: #fff;
  border: none;
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export-inline:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.result-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.info-box {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 14px;
  border-left: 3px solid #2e6fb7;
}

.info-box.highlight-box {
  background: #e6f2ff;
  border-left-color: #2e6fb7;
}

.info-label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 6px;
  font-weight: 600;
}

.info-value {
  display: block;
  font-size: 1rem;
  color: #334e5c;
  font-weight: 600;
}

.info-value.highlight {
  color: #2e6fb7;
  font-size: 1.2rem;
}

.priority-summary-inline {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.priority-box {
  flex: 1;
  min-width: 150px;
  background: #e6f2ff;
  border: 1px solid #b3d4fc;
  border-radius: 8px;
  padding: 14px;
  text-align: center;
}

.priority-label {
  display: block;
  font-size: 0.9rem;
  color: #2e6fb7;
  margin-bottom: 6px;
  font-weight: 600;
}

.priority-count {
  display: block;
  font-size: 1.4rem;
  font-weight: 700;
  color: #2e6fb7;
}

.result-content-inline {
  margin-top: 20px;
}

.admitted-list-inline {
  margin-top: 16px;
}

.list-title {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  color: #2e6fb7;
  font-weight: 700;
}

.table-wrapper {
  overflow-x: auto;
  margin-bottom: 20px;
}

.result-table-inline {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  background: #fff;
}

.result-table-inline th,
.result-table-inline td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.result-table-inline thead th {
  background: #cfe8ff;
  color: #2e6fb7;
  font-weight: 700;
  white-space: nowrap;
}

.result-table-inline tbody tr {
  transition: background 0.15s;
}

.result-table-inline tbody tr:hover {
  background: #f8f9fa;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.success {
  background: #d4edda;
  color: #155724;
}

.no-result-inline {
  text-align: center;
  padding: 40px;
  color: #999;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 16px;
}

.no-result-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 10px;
}

.no-result-inline p {
  margin: 0;
  font-size: 1rem;
  font-style: italic;
}

.result-message-inline {
  margin-top: 16px;
  padding: 14px;
  background: #e6f2ff;
  border-left: 3px solid #2e6fb7;
  border-radius: 6px;
}

.result-message-inline p {
  margin: 0;
  color: #334e5c;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* 響應式 */
@media (max-width:900px){
  .announcement-card{ width:100%; padding:16px }
  .date-input{ width:160px; max-width:160px }
  .query-row{ width:100%; flex:0 0 100%; }

  .result-card-inline {
    padding: 14px;
  }

  .result-header-inline {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .result-header-inline h3 {
    font-size: 1.2rem;
  }

  .btn-export-inline {
    width: 100%;
  }

  .result-info-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .priority-summary-inline {
    flex-direction: column;
    gap: 10px;
  }

  .priority-box {
    min-width: unset;
  }

  .result-table-inline {
    font-size: 0.9rem;
  }

  .result-table-inline th,
  .result-table-inline td {
    padding: 10px 8px;
    font-size: 0.85rem;
  }
}
</style>
