<template>
  <div class="waitlist-page">
    <div class="waitlist-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/list.png" class="icon" alt="icon" />
        <span class="main-title">候補清冊</span>
      </div>

      <!-- 篩選條件 -->
      <div class="query-card">
        <div class="query-row">
          <div class="filters-wrapper">
            <div class="search-area">
              <label class="search-label" for="institution">選擇機構：</label>
              <select id="institution" v-model="selectedInstitutionId" class="search-input">
                <option value="0">全部機構</option>
                <option v-for="i in institutions" :key="i.id" :value="String(i.id)">{{ i.name }}</option>
              </select>
            </div>
            <div class="search-area">
              <label class="search-label" for="keyword">姓名：</label>
              <input id="keyword" v-model="keyword" class="search-input" placeholder="幼兒姓名" />
            </div>
          </div>
          <div class="actions-wrapper">
            <button class="btn query" @click="doFilter" :disabled="loading">{{ loading ? '查詢中...' : '查詢' }}</button>
            <button class="btn pdf" @click="generateExcel" :disabled="loadingExport">{{ loadingExport ? '匯出中...' : '匯出Excel' }}</button>
          </div>
        </div>
      </div>

      <!-- 清冊列表 -->
      <div class="table-section">
        <table class="waitlist-table">
          <thead>
            <tr>
              <th>案號</th>
              <th>幼兒姓名</th>
              <th>幼兒年紀</th>
              <th>機構名稱</th>
              <th>序位</th>
              <th>排序</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in waitlist" :key="row.CaseNumber">
              <td data-label="案號">{{ row.CaseNumber }}</td>
              <td data-label="幼兒姓名">{{ row.Name }}</td>
              <td data-label="幼兒年紀">{{ row.Age || formatBirthToAge(row.BirthDate) }}</td>
              <td data-label="機構名稱">{{ row.InstitutionName }}</td>
              <td data-label="序位">{{ row.IdentityType }}</td>
              <td data-label="排序">{{ row.CurrentOrder }}</td>
            </tr>
            <tr v-if="!loading && waitlist.length === 0">
              <td colspan="6" class="empty-tip">
                <div class="empty-box">
                  <img src="https://img.icons8.com/ios-glyphs/30/cfcfcf/opened-folder.png" alt="empty" />
                  <div>目前沒有候補資料</div>
                </div>
              </td>
            </tr>
            <tr v-if="loading">
              <td colspan="6" class="empty-tip">載入中...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import '@/styles/admin-responsive.css'
import * as XLSX from 'xlsx'

// 機構清單（API 取得）
const institutions = ref([])
const loading = ref(false)
const loadingExport = ref(false)

// 取得機構清單
const fetchInstitutions = async () => {
  try {
    const res = await fetch('http://localhost:8080/institutions')
    if (!res.ok) {
      console.warn('載入機構清單失敗，狀態：', res.status)
      institutions.value = []
      return
    }
    const data = await res.json()
    if (Array.isArray(data)) {
      institutions.value = data.map(item => ({ id: item.id || item.institutionID || item.institutionId || '', name: item.name || item.institutionName || item.InstitutionName || '' }))
    } else if (data && Array.isArray(data.content)) {
      institutions.value = data.content.map(item => ({ id: item.id || item.institutionID || item.institutionId || '', name: item.name || item.institutionName || item.InstitutionName || '' }))
    } else {
      institutions.value = []
    }
  } catch (err) {
    console.error('fetchInstitutions error:', err)
    institutions.value = []
  }
}

// 後端候補資料
const waitlist = ref([])
const selectedInstitutionId = ref('0')
const keyword = ref('')

// 依選取機構取得名稱（供標題/檔名）
const selectedInstitutionName = computed(() => {
  if (selectedInstitutionId.value === '0') return '全部'
  const found = institutions.value.find(i => String(i.id) === String(selectedInstitutionId.value))
  return (found && found.name) ? found.name : '全部'
})

// 依後端回傳格式計算年齡（若後端未提供 Age 欄位時備援）
const formatBirthToAge = (birthDateStr) => {
  if (!birthDateStr) return ''
  const birth = new Date(birthDateStr)
  if (isNaN(birth)) return ''
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  if (now.getDate() < birth.getDate()) {
    months -= 1
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  if (years < 0) return ''
  return years + '歲' + months + '個月'
}

// 串接候補名單 API（畫面列表用，會帶姓名參數）
const fetchWaitlist = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (selectedInstitutionId.value !== '0') params.append('institutionId', selectedInstitutionId.value)
    if (keyword.value.trim()) params.append('name', keyword.value.trim())
    const url = 'http://localhost:8080/waitlist/by-institution' + (params.toString() ? ('?' + params.toString()) : '')
    const res = await fetch(url)
    if (!res.ok) {
      console.warn('載入候補資料失敗，狀態：', res.status)
      waitlist.value = []
      return
    }
    const data = await res.json()
    waitlist.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('fetchWaitlist error:', e)
    waitlist.value = []
  } finally {
    loading.value = false
  }
}

function doFilter() {
  fetchWaitlist()
}

// 匯出 Excel：只依機構查全部資料（不帶姓名）
async function generateExcel() {
  if (loadingExport.value) return
  loadingExport.value = true
  try {
    const params = new URLSearchParams()
    if (selectedInstitutionId.value !== '0') params.append('institutionId', selectedInstitutionId.value)
    const url = 'http://localhost:8080/waitlist/by-institution' + (params.toString() ? ('?' + params.toString()) : '')

    const res = await fetch(url)
    if (!res.ok) {
      console.warn('匯出前查詢失敗，HTTP', res.status)
      alert('匯出失敗：查詢資料失敗')
      return
    }
    const data = await res.json()
    const list = Array.isArray(data) ? data : []
    if (list.length === 0) {
      alert('無資料可匯出')
      return
    }

    const rows = list.map(item => ({
      '案號': item.CaseNumber,
      '幼兒姓名': item.Name,
      '幼兒年紀': item.Age || formatBirthToAge(item.BirthDate),
      '機構名稱': item.InstitutionName,
      '序位': item.IdentityType,
      '排序': item.CurrentOrder
    }))

    const wb = XLSX.utils.book_new()
    // 先建立第一列為大標題，並合併 A1~F1
    const bigTitle = `${selectedInstitutionName.value}機構候補清冊`
    const ws = XLSX.utils.aoa_to_sheet([[bigTitle]])
    ws['!merges'] = ws['!merges'] || []
    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } })

    // 從 A2 開始放表頭與資料
    XLSX.utils.sheet_add_json(ws, rows, { header: ['案號', '幼兒姓名', '幼兒年紀', '機構名稱', '序位', '排序'], origin: 'A2' })

    // 自動欄寬（粗略）
    ws['!cols'] = [
      { wch: 15 }, // 案號
      { wch: 12 }, // 姓名
      { wch: 12 }, // 年紀
      { wch: 20 }, // 機構名稱
      { wch: 8 },  // 序位
      { wch: 8 }   // 排序
    ]

    XLSX.utils.book_append_sheet(wb, ws, '候補清冊')

    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'')
    const safe = (s) => String(s || '').replace(/[\\/:*?"<>|\s]+/g, '_')
    const fileName = `waitlist_${safe(selectedInstitutionName.value)}_${ts}.xlsx`
    XLSX.writeFile(wb, fileName)
  } catch (err) {
    console.error('generateExcel error:', err)
    alert('匯出Excel失敗')
  } finally {
    loadingExport.value = false
  }
}


onMounted(() => {
  fetchInstitutions()
  fetchWaitlist() // 初始載入
})
</script>

<style scoped>
.waitlist-page { display:flex; justify-content:center; }
.waitlist-card { max-width: 1100px; width: 100%; }
.title-row { display:flex; align-items:center; gap:10px; margin: 48px 0 12px }
.icon { width:28px; height:28px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:800; letter-spacing: .5px }

.query-card {
  background:#fff;
  border:1px solid #e6e6ea;
  border-radius:12px;
  padding:14px 18px;
  margin: 10px 0 24px;
  box-shadow:0 2px 8px rgba(16,24,40,0.04);
}
.query-row { display:flex; align-items:center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.filters-wrapper { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.search-area{gap: 10px; display: flex; align-items: center; }
.search-label { font-weight:700; color:#2e6fb7; font-size:.95rem }
.search-input {
  padding:9px 12px;
  border-radius:6px;
  border:1px solid #d8dbe0;
  min-width:220px;
  outline: none;
  background: #fff;
  transition: border-color .2s, box-shadow .2s;
}
.search-input:focus {
  border-color:#2e6fb7;
  box-shadow:0 0 0 3px rgba(46,111,183,.15);
}

.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:700 }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }
.btn.query:disabled { opacity:.6; cursor:not-allowed }
.btn.query:hover:not(:disabled) { filter: brightness(0.98); }

.btn.pdf {
  background: #e8f5e9;
  color: #388e3c;
  border: 1px solid #a5d6a7;
}
.btn.pdf:disabled { opacity:.6; cursor:not-allowed }
.btn.pdf:hover { filter: brightness(0.98); }

.actions-wrapper {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.table-section {
  background:#fff;
  border:1px solid #e6e6ea;
  border-radius:12px;
  box-shadow: 0 2px 8px rgba(16,24,40,.04);
  overflow:auto;
}
.waitlist-table { width:100%; border-collapse:separate; border-spacing:0; }
.waitlist-table thead th {
  position: sticky; top: 0;
  background:#cfe8ff;
  color:#2e6fb7; padding:10px 12px; text-align:left; font-weight:800; letter-spacing:.3px;
  border-bottom:1px solid #b3d4fc;
}
.waitlist-table tbody tr:nth-child(even) { background:#fbfdff; }
.waitlist-table tbody tr:hover { background:#f6fbff; }
.waitlist-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; color:#333 }

.empty-tip { color:#999; text-align:center; padding:24px 0 }
.empty-box { display:flex; gap:10px; align-items:center; justify-content:center; color:#aaa }

@media (max-width: 900px) {
  .query-row { flex-direction: column; align-items:stretch; }
  .filters-wrapper { flex-direction: column; align-items: stretch; width: 100%; }
  .actions-wrapper { justify-content: flex-start; }
  .search-input { width: 100%; }
  .waitlist-card { width: 95%; }
}
</style>
