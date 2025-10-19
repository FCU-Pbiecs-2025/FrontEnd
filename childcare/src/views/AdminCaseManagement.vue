<template>
  <div class="announcement-page">
    <div class="announcement-card" v-if="!isEditing">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/treatment-plan.png" class="icon" alt="icon" />
        <span class="main-title">個案管理</span>
      </div>

      <!-- Search Filters -->
      <div class="query-card">
        <div class="query-row">
          <div class="search-area">
            <label class="date-label">公托機構：</label>
            <select v-model="qAgency" class="date-input">
              <option value="">全部</option>
              <option v-for="a in agencyOptions" :key="a" :value="a">{{ a }}</option>
            </select>
          </div>
          <div class="search-area">
            <label class="date-label">班級名稱：</label>
            <select v-model="qClassName" class="date-input" :disabled="!qAgency">
              <option value="">{{ qAgency ? '全部' : '請先選擇機構' }}</option>
              <option v-for="cn in classOptions" :key="cn" :value="cn">{{ cn }}</option>
            </select>
          </div>
        </div>
        <div class="query-row">
          <div class="search-area">
            <label class="date-label">申請案號：</label>
            <input type="text" v-model="qCaseId" class="date-input" placeholder="請輸入案件編號" />
          </div>
          <div class="search-area">
            <label class="date-label">申請人身分證：</label>
            <input type="text" v-model="qApplicantId" class="date-input" placeholder="請輸入身分證字號" />
          </div>
        </div>
        <div class="query-row">
          <div class="search-area">
            <label class="date-label">身分別：</label>
            <select v-model="qIdentity" class="date-input">
              <option value="">全部</option>
              <option v-for="i in identityOptions" :key="i" :value="i">{{ i }}</option>
            </select>
          </div>
          <div class="search-area">
            <label class="date-label">案件狀態：</label>
            <select v-model="qStatus" class="date-input">
              <option value="">全部</option>
              <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>
        <div class="btn-query">
          <button class="btn query" @click="doQuery">查詢</button>
        </div>
      </div>

      <div class="table-section" >
        <table class="announcement-table">
          <thead>
            <tr>
              <th>案件編號</th>
              <th>申請日期</th>
              <th>機構</th>
              <th>幼兒資訊</th>
              <th>候補序號</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in resultItems" :key="item.id">
              <td class="date-cell">{{ item.id }}</td>
              <td class="date-cell">{{ item.applyDate }}</td>
              <td class="title-cell">{{ item.institution }}</td>
              <td>
                <div class="child-col">
                  <div class="child-row"><span>{{ item.childName || '-' }}</span></div>
                  <div class="child-row"><span>{{ ageInMonths(item.childBirth) }}</span></div>
                </div>
              </td>
              <td class="title-cell">{{ item.queueNo ?? '—' }}</td>
              <td class="title-cell">{{ item.status }}</td>
              <td class="action-cell">
                <RouterLink :to="{ name: 'AdminCaseManagementEdit', params: { id: item.id } }" class="btn small">管理</RouterLink>
              </td>
            </tr>
            <tr v-if="resultItems.length === 0">
              <td colspan="7" class="empty-tip">目前沒有個案</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bottom-row">
        <button class="btn primary" v-show="showBack" @click="goBack">返回</button>
      </div>

    </div>

      <router-view />

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isEditing = computed(() => route.name === 'AdminCaseManagementEdit')

const WAITING = '通過候補中'
const ADMITTED = '錄取'

// Base list
const items = ref([
  { id: 'C1001', applyDate: '2025/10/01', institution: '幸福幼兒園', status: WAITING, identityType: '中低收入戶', className: '小班', applicantId: 'A123456789', childName: '小寶', childBirth: '2022-03-15', queueNo: 12 },
  { id: 'C1002', applyDate: '2025/10/05', institution: '快樂托育中心', status: ADMITTED, identityType: '一般', className: '中班', applicantId: 'D223456789', childName: '小美', childBirth: '2021-07-20', queueNo: null }
])

// Result list (shown in table)
const resultItems = ref([...items.value])

// Query fields
const qAgency = ref('')
const qClassName = ref('')
const qCaseId = ref('')
const qApplicantId = ref('')
const qIdentity = ref('')
const qStatus = ref('')

// Options
const agencyOptions = computed(() => Array.from(new Set(items.value.map(i => i.institution))))
const classOptions = computed(() => {
  if (!qAgency.value) return []
  const list = items.value.filter(i => i.institution === qAgency.value).map(i => i.className)
  return Array.from(new Set(list)).filter(Boolean)
})
const identityOptions = ref(['一般', '中低收入戶', '低收入戶'])
const statusOptions = ref([WAITING, ADMITTED])

const showBack = ref(false)

watch(qAgency, () => { qClassName.value = '' })

const normalize = (v) => (v ?? '').toString().trim().toLowerCase()

// 計算月齡
const ageInMonths = (dateStr) => {
  if (!dateStr) return '-'
  const birth = new Date(dateStr)
  if (isNaN(birth)) return '-'
  const now = new Date()
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) months -= 1
  if (months < 0) months = 0
  return `${months} 月`
}

const doQuery = () => {
  const a = normalize(qAgency.value)
  const c = normalize(qClassName.value)
  const id = normalize(qCaseId.value)
  const pid = normalize(qApplicantId.value)
  const ident = normalize(qIdentity.value)
  const st = normalize(qStatus.value)

  resultItems.value = items.value.filter(item => {
    if (a && normalize(item.institution) !== a) return false
    if (ident && normalize(item.identityType) !== ident) return false
    if (st && normalize(item.status) !== st) return false
    if (c && normalize(item.className) !== c) return false
    if (id && !normalize(item.id).includes(id)) return false
    if (pid && !normalize(item.applicantId).includes(pid)) return false
    return true
  })

  showBack.value = true
}

const resetQuery = () => {
  qAgency.value = ''
  qClassName.value = ''
  qCaseId.value = ''
  qApplicantId.value = ''
  qIdentity.value = ''
  qStatus.value = ''
  resultItems.value = [...items.value]
  showBack.value = false
}

const goBack = () => {
  resetQuery()
}
</script>

<style scoped>
.announcement-page { display:flex; justify-content:center; }
.announcement-card { max-width: 85%}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; margin-top: 60px }
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700 }

/* Query styles borrowed from AdminBannerManager */
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:14px 18px; margin-bottom:50px; box-shadow:0 2px 8px rgba(16,24,40,0.04); margin-top:50px; display: flex; flex-direction: column; align-items: center; }
.query-row { display:flex; gap:12px; margin-bottom:12px; justify-content: space-between; flex-wrap: wrap; width: 100%; }
.search-area { gap:30px; display:flex; align-items:center; margin-bottom:0; width: calc(50% - 6px); }
.date-label { font-weight:600; color:#2e6fb7; min-width: 100px; text-align: right; }
.date-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; width:150px; }
.btn-query { display: flex; justify-content: center; margin-top: 30px; }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }

.table-section { margin-top: 20px; }
.announcement-table { width:100%; border-collapse:collapse; margin-bottom:40px; }
.announcement-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight:700; }
.announcement-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; }
.date-cell { font-weight:600; color:#334e5c }
.title-cell { color:#334e5c }
.action-cell { text-align:left }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600; }
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }

.bottom-row { display: flex; justify-content: center; gap: 12px; margin-top: 10vh; }

.child-col { display: flex; flex-direction: column; gap: 4px; }
.child-row { display: flex; gap: 6px; align-items: center; }

@media (max-width: 900px) {
  .search-area { width: 100%; }
}
</style>
