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
            <button class="btn query" @click="doFilter">查詢</button>
            <button class="btn pdf" @click="generatePdf">產出PDF</button>
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
              <th>序位</th>
              <th>班級名稱</th>
              <th>排序</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in displayedList" :key="row.id">
              <td data-label="案號">{{ row.id }}</td>
              <td data-label="幼兒姓名">{{ row.childName }}</td>
              <td data-label="幼兒年紀(月)">{{ row.ageInMonths }}</td>
              <td data-label="序位">{{ row.priority }}</td>
              <td data-label="班級名稱">{{ row.className }}</td>
              <td data-label="排序">{{ row.rank }}</td>
            </tr>
            <tr v-if="displayedList.length === 0">
              <td colspan="6" class="empty-tip">
                <div class="empty-box">
                  <img src="https://img.icons8.com/ios-glyphs/30/cfcfcf/opened-folder.png" alt="empty"/>
                  <div>目前沒有候補資料</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import '@/styles/admin-responsive.css'

// 機構清單（可之後改為 API 取得）
const institutions = ref([
  { id: 1, name: '快樂幼兒園' },
  { id: 2, name: '幸福幼兒園' },
  { id: 3, name: '希望幼兒園' }
])

// 候補清冊假資料（之後可接 API）
const waitlist = ref([
  // 快樂幼兒園
  { id: 101, institutionId: 1, childName: '小米', dob: '2021-05-03', priority: 2, appliedAt: '2025-07-01', notes: '' },
  { id: 102, institutionId: 1, childName: '小芳', dob: '2020-11-22', priority: 1, appliedAt: '2025-06-28', notes: '低收入戶' },
  { id: 103, institutionId: 1, childName: '小偉', dob: '2021-02-10', priority: 3, appliedAt: '2025-07-05', notes: '' },
  // 幸福幼兒園
  { id: 201, institutionId: 2, childName: '小進', dob: '2020-08-12', priority: 1, appliedAt: '2025-06-20', notes: '' },
  { id: 202, institutionId: 2, childName: '小芸', dob: '2021-03-09', priority: 2, appliedAt: '2025-07-02', notes: '雙胞胎' },
  // 希望幼兒園
  { id: 301, institutionId: 3, childName: '小恩', dob: '2020-12-30', priority: 1, appliedAt: '2025-06-18', notes: '' },
  { id: 302, institutionId: 3, childName: '小安', dob: '2021-01-15', priority: 2, appliedAt: '2025-06-25', notes: '' }
])

const selectedInstitutionId = ref('0')
const keyword = ref('')

// 根據優先序與申請日期計算每個機構的排序序號
function computeRanks() {
  // 分機構分組
  const grouped = new Map()
  for (const w of waitlist.value) {
    const list = grouped.get(w.institutionId) || []
    list.push(w)
    grouped.set(w.institutionId, list)
  }
  // 依規則排序後賦 rank
  for (const [, list] of grouped) {
    list.sort((a, b) => {
      // 優先序小者在前；若相同，申請日期早者在前
      if (a.priority !== b.priority) return a.priority - b.priority
      return new Date(a.appliedAt) - new Date(b.appliedAt)
    })
    list.forEach((item, idx) => {
      item.rank = idx + 1
    })
  }
}

// 幼兒年齡 x歲x月（以 2025/10/27 為基準）
function ageInYearsMonths(dob) {
  if (!dob) return '-';
  const birthDate = new Date(dob);
  if (isNaN(birthDate)) return '-';
  const today = new Date('2025-10-27');
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
  if (today.getDate() < birthDate.getDate()) months -= 1;
  if (months < 0) months = 0;
  const years = Math.floor(months / 12);
  const remainMonths = months % 12;
  return `${years}歲${remainMonths}月`;
}

const displayedList = computed(() => {
  const selectedId = Number(selectedInstitutionId.value)
  const kw = keyword.value.trim().toLowerCase()
  const nameById = new Map(institutions.value.map(i => [i.id, i.name]))

  return waitlist.value
    .filter(w => selectedId === 0 || w.institutionId === selectedId)
    .filter(w => {
      if (!kw) return true
      return (
        (w.childName || '').toLowerCase().includes(kw) ||
        (w.notes || '').toLowerCase().includes(kw)
      )
    })
    .map(w => ({
      ...w,
      institutionName: nameById.get(w.institutionId) || '-',
      ageInMonths: ageInYearsMonths(w.dob),
      className: '混齡班'
    }))
    .sort((a, b) => {
      // 先依機構，再依 rank 排序
      if (a.institutionId !== b.institutionId) return a.institutionId - b.institutionId
      return (a.rank || 9999) - (b.rank || 9999)
    })
})

function doFilter() {
  // 設計上 computed 已自動反應；此處保留以符合使用者操作體驗
}

function generatePdf() {
  alert('產出PDF功能尚未實作');
}

onMounted(() => {
  computeRanks()
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
.btn.query:hover { filter: brightness(0.98); }

.btn.pdf {
  background: #e8f5e9;
  color: #388e3c;
  border: 1px solid #a5d6a7;
}
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
