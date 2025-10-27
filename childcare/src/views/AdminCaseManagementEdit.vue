<template>
  <div class="case-page">
    <div class="case-card">
      <!-- Title -->
      <div class="title-row">
        <div class="title-left">
          <img src="https://img.icons8.com/ios/48/2e6fb7/treatment-plan.png" class="icon" alt="icon" />
          <span class="main-title">個案管理編輯 - {{ caseId }}</span>
        </div>
        <!-- Always show title-right so we can display identity for all statuses; queue number remains WAITING-only -->
        <div class="title-right">
          <div class="wait-chip">
            <span class="label">身份別：</span>
            <strong>{{ caseData.identityType || '—' }}</strong>
          </div>
          <div v-if="caseData.status === WAITING" class="wait-chip">
            <span class="label">候補序號：</span>
            <strong>{{ caseData.queueNo ?? '—' }}</strong>
          </div>
        </div>
      </div>

      <!-- Case summary -->
      <div class="detail-card">
        <h3>案件摘要</h3>
        <div class="detail-info">
          <div class="info-row">
            <label class="info-label">案件編號：</label>
            <span class="info-value">{{ caseData.id }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">申請日期：</label>
            <span class="info-value">{{ caseData.applyDate }}</span>
          </div>
          <!-- Moved: Children summary under apply date -->
          <div class="info-row" v-if="(caseData.children?.length || 0) > 0">
            <label class="info-label">幼兒：</label>
            <div class="info-value">
              <ul class="children-summary">
                <li v-for="(c, i) in caseData.children" :key="i">
                  <span>{{ c.name || '—' }}</span>
                  <span class="sep">｜</span>
                  <span>{{ c.birth || '—' }}</span>
                </li>
              </ul>
            </div>
          </div>
          <div class="info-row">
            <label class="info-label">機構：</label>
            <span class="info-value">{{ caseData.institution }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">當前狀態：</label>
            <span class="info-value">{{ caseData.status }}</span>
          </div>
          <div class="info-row" v-if="caseData.status === ADMITTED">
            <label class="info-label">就讀班級：</label>
            <span class="info-value">{{ caseData.selectedClass || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- ADMITTED extra info -->
      <div v-if="caseData.status === ADMITTED" class="wait-extra">
        <div class="admit-setup">
          <div class="form-row">
            <label class="info-label">退托原因說明：</label>
            <textarea v-model="withdrawNote" class="text-input" rows="3" placeholder="請填寫退托原因說明（必填）"></textarea>
          </div>
        </div>
      </div>
      <!--      textarea去寫退托原因-->



      <div v-if="caseData.status === WAITING" class="wait-extra">
        <div class="admit-setup">
          <div class="form-row">
            <label class="info-label">申請單位：</label>
            <select v-model="admitAgency" class="select-input" disabled>
              <option v-if="!appliedAgency" value="">尚未指定</option>
              <option v-else :value="appliedAgency">{{ appliedAgency }}</option>
            </select>
          </div>
          <div class="form-row">
            <label class="info-label">就讀班級：</label>
            <select v-model="admitClass" class="select-input" :disabled="!admitAgency">
              <option value="">{{ admitAgency ? '請選擇班級' : '請先選機構' }}</option>
              <option v-for="c in classOptions" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
        </div>
      </div>
      <!-- Waitlist extra info -->

      <!-- Collapsible sections -->
      <div class="section-card">
        <div class="section-header" @click="toggle('applicant')">
          <h3>申請人資訊</h3>
          <button class="collapse-btn">{{ openSections.applicant ? '收合' : '展開' }}</button>
        </div>
        <div v-show="openSections.applicant" class="section-body">
          <div class="grid two-col">
            <div class="row"><span class="label">姓名：</span><span>{{ caseData.applicant?.name || '—' }}</span></div>
            <div class="row"><span class="label">生日：</span><span>{{ caseData.applicant?.birth || '—' }}</span></div>
            <div class="row"><span class="label">身分證：</span><span>{{ caseData.applicant?.id || '—' }}</span></div>
            <div class="row"><span class="label">戶籍地址：</span><span>{{ caseData.applicant?.homeAddress || '—' }}</span></div>
            <div class="row"><span class="label">通訊地址：</span><span>{{ caseData.applicant?.mailAddress || '—' }}</span></div>
            <div class="row"><span class="label">行動電話：</span><span>{{ caseData.applicant?.mobile || '—' }}</span></div>
            <div class="row"><span class="label">電子信箱：</span><span>{{ caseData.applicant?.email || '—' }}</span></div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header" @click="toggle('parents')">
          <h3>雙親資訊</h3>
          <button class="collapse-btn">{{ openSections.parents ? '收合' : '展開' }}</button>
        </div>
        <div v-show="openSections.parents" class="section-body">
          <div class="parent-block">
            <div class="parent-title">家長1</div>
            <div class="grid two-col">
              <div class="row"><span class="label">姓名：</span><span>{{ caseData.parent1?.name || '—' }}</span></div>
              <div class="row"><span class="label">性別：</span><span>{{ caseData.parent1?.gender || '—' }}</span></div>
              <div class="row"><span class="label">生日：</span><span>{{ caseData.parent1?.birth || '—' }}</span></div>
              <div class="row"><span class="label">身分證：</span><span>{{ caseData.parent1?.id || '—' }}</span></div>
              <div class="row"><span class="label">家長類別：</span><span>{{ caseData.parent1?.parentType || '—' }}</span></div>
              <div class="row"><span class="label">戶籍地址：</span><span>{{ caseData.parent1?.homeAddress || '—' }}</span></div>
              <div class="row"><span class="label">通訊地址：</span><span>{{ caseData.parent1?.contactAddress || '—' }}</span></div>
              <div class="row"><span class="label">行動電話：</span><span>{{ caseData.parent1?.mobile || '—' }}</span></div>
              <div class="row"><span class="label">電子信箱：</span><span>{{ caseData.parent1?.email || '—' }}</span></div>
              <div class="row"><span class="label">任職單位：</span><span>{{ caseData.parent1?.company || '—' }}</span></div>
              <div class="row"><span class="label">是否留停：</span><span>{{ caseData.parent1?.isLeave ? '是' : '否' }}</span></div>
              <template v-if="caseData.parent1?.isLeave">
                <div class="row"><span class="label">留停起：</span><span>{{ caseData.parent1?.leaveStart || '—' }}</span></div>
                <div class="row"><span class="label">留停迄：</span><span>{{ caseData.parent1?.leaveEnd || '—' }}</span></div>
              </template>
            </div>
          </div>
          <div class="parent-block">
            <div class="parent-title">家長2</div>
            <div class="grid two-col">
              <div class="row"><span class="label">姓名：</span><span>{{ caseData.parent2?.name || '—' }}</span></div>
              <div class="row"><span class="label">性別：</span><span>{{ caseData.parent2?.gender || '—' }}</span></div>
              <div class="row"><span class="label">生日：</span><span>{{ caseData.parent2?.birth || '—' }}</span></div>
              <div class="row"><span class="label">身分證：</span><span>{{ caseData.parent2?.id || '—' }}</span></div>
              <div class="row"><span class="label">家長類別：</span><span>{{ caseData.parent2?.parentType || '—' }}</span></div>
              <div class="row"><span class="label">戶籍地址：</span><span>{{ caseData.parent2?.homeAddress || '—' }}</span></div>
              <div class="row"><span class="label">通訊地址：</span><span>{{ caseData.parent2?.contactAddress || '—' }}</span></div>
              <div class="row"><span class="label">行動電話：</span><span>{{ caseData.parent2?.mobile || '—' }}</span></div>
              <div class="row"><span class="label">電子信箱：</span><span>{{ caseData.parent2?.email || '—' }}</span></div>
              <div class="row"><span class="label">任職單位：</span><span>{{ caseData.parent2?.company || '—' }}</span></div>
              <div class="row"><span class="label">是否留停：</span><span>{{ caseData.parent2?.isLeave ? '是' : '否' }}</span></div>
              <template v-if="caseData.parent2?.isLeave">
                <div class="row"><span class="label">留停起：</span><span>{{ caseData.parent2?.leaveStart || '—' }}</span></div>
                <div class="row"><span class="label">留停迄：</span><span>{{ caseData.parent2?.leaveEnd || '—' }}</span></div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header" @click="toggle('child')">
          <h3>幼兒資料</h3>
          <button class="collapse-btn">{{ openSections.child ? '收合' : '展開' }}</button>
        </div>
        <div v-show="openSections.child" class="section-body">
          <div class="grid one-col">
            <div class="row"><span class="label">申請之就讀機構：</span><span>{{ caseData.selectedAgency || '—' }}</span></div>
          </div>
          <div class="children-grid">
            <div class="child-card" v-for="(c, i) in caseData.children || []" :key="i">
              <div class="child-header">幼兒 {{ i + 1 }}</div>
              <div class="grid two-col">
                <div class="row"><span class="label">姓名：</span><span>{{ c.name || '—' }}</span></div>
                <div class="row"><span class="label">性別：</span><span>{{ c.gender || '—' }}</span></div>
                <div class="row"><span class="label">年齡：</span><span>{{ computeChildAge(c.birth) || '—' }}</span></div>
                <div class="row"><span class="label">生日：</span><span>{{ c.birth || '—' }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header" @click="toggle('files')">
          <h3>附件檔案</h3>
          <button class="collapse-btn">{{ openSections.files ? '收合' : '展開' }}</button>
        </div>
        <div v-show="openSections.files" class="section-body">
          <div class="grid one-col">
            <div class="row"><span class="label">申請之身份別：</span><span>{{ caseData.identityType || '—' }}</span></div>
          </div>
          <ul class="file-list" v-if="(caseData.files?.length || 0) > 0">
            <li v-for="(f, idx) in caseData.files" :key="idx" class="file-item">
              <span class="thumb" v-if="isImageFile(f) && fileHref(f)">
                <img :src="fileHref(f)" alt="preview" />
              </span>
              <span class="file-name">{{ f.name }}</span>
              <div class="file-actions">
                <button
                  v-if="canPreview(f)"
                  type="button"
                  class="btn small ghost"
                  @click="openPreview(f)"
                >預覽</button>
                <a
                  class="btn small primary"
                  :href="fileHref(f) || fallbackDownloadUrl()"
                  :download="downloadName(f)"
                  target="_blank"
                  rel="noopener noreferrer"
                >下載</a>
              </div>
            </li>
          </ul>
          <div v-else class="empty-text">無附件</div>
        </div>
      </div>

      <!-- Preview Modal -->
      <div v-if="preview.visible" class="preview-overlay" @click.self="closePreview">
        <div class="preview-card">
          <div class="preview-header">
            <span class="preview-title">{{ preview.file?.name || '預覽' }}</span>
            <button class="preview-close" @click="closePreview">×</button>
          </div>
          <div class="preview-body">
            <img v-if="isImageFile(preview.file) && fileHref(preview.file)" :src="fileHref(preview.file)" alt="image" />
            <iframe v-else-if="isPdfFile(preview.file) && fileHref(preview.file)" :src="fileHref(preview.file)" title="pdf" />
            <div v-else class="preview-fallback">
              無法預覽此檔案，請使用下載功能。
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom actions -->
      <div class="bottom-row">
        <template v-if="caseData.status === WAITING">
          <button class="btn primary" @click="admit" :disabled="!admitAgency || !admitClass">錄取</button>
        </template>
        <template v-else-if="caseData.status === ADMITTED">
          <button class="btn danger" @click="revoke">退托</button>
        </template>
        <button class="btn ghost" @click="goBack">返回</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Status constants (centralized mapping requested)
const PROCESSING = '審核中'
const SUPPLEMENT = '需要補件'
const REJECTED = '已退件'
const WAITING = '錄取候補中' // waitingForAdmission
const REVOKE_PROCESSING = '撤銷申請審核中'
const REVOKED = '撤銷申請通過'
const ADMITTED = '已錄取'
const WITHDRAWN = '已退托'

const caseId = ref(route.params.id)
const caseData = ref({})

// Collapsible sections state - default collapsed
const openSections = ref({ applicant: false, parents: false, child: false, files: false })
const toggle = (key) => { openSections.value[key] = !openSections.value[key] }

// Admit selections
const admitAgency = ref('')
const admitClass = ref('')

// Applied agency is fixed from case data
const appliedAgency = computed(() => (caseData.value?.selectedAgency || caseData.value?.institution || ''))
watch(appliedAgency, (val) => { admitAgency.value = val || '' })

// mock agency -> classes mapping
const agencyClasses = ref({
  '幸福幼兒園': ['小班', '中班', '大班'],
  '快樂托育中心': ['小班', '中班']
})
const classOptions = computed(() => {
  if (!admitAgency.value) return []
  return agencyClasses.value[admitAgency.value] || []
})
watch(admitAgency, () => { admitClass.value = '' })

// 退托說明（僅供 ADMITTED 使用）
const withdrawNote = ref('')

// Helper: file preview
const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
const isImageFile = (f) => {
  if (!f) return false
  if (f.type && String(f.type).startsWith('image/')) return true
  const name = (f.name || '').toLowerCase()
  return imageExts.some(ext => name.endsWith(ext))
}

// Helpers for href/preview/download
const fileHref = (f) => f?.url || f?.previewUrl || ''
const isPdfFile = (f) => {
  const t = (f?.type || '').toLowerCase()
  if (t.includes('pdf')) return true
  const n = (f?.name || '').toLowerCase()
  return n.endsWith('.pdf')
}
const canPreview = (f) => (isImageFile(f) || isPdfFile(f)) && !!fileHref(f)
const downloadName = (f) => f?.name || 'attachment'
const fallbackDownloadUrl = () => 'data:application/octet-stream,'

// Preview modal state
const preview = ref({ visible: false, file: null })
const openPreview = (f) => { preview.value.visible = true; preview.value.file = f }
const closePreview = () => { preview.value.visible = false; preview.value.file = null }

// Mock dataset (replace by API later)
const mockCases = {
  'C1001': {
    id: 'C1001',
    applyDate: '2025/10/01',
    status: WAITING,
    institution: '幸福幼兒園',
    identityType: '中低收入戶',
    queueNo: 12,
    applicant: { name: '王小明', birth: '1990-03-12', id: 'A123456789', homeAddress: '臺中市西屯區...', mailAddress: '臺中市西屯區...', mobile: '0912-345-678', email: 'test@example.com' },
    parent1: { name: '王爸爸', birth: '1985-07-10', id: 'B123456789', parentType: '父親', homeAddress: '臺中市...', contactAddress: '臺中市...', mobile: '0911-111-111', email: 'dad@example.com', company: 'OOO公司', gender: '男', isLeave: false, leaveStart: '', leaveEnd: '' },
    parent2: { name: '李媽媽', birth: '1987-01-20', id: 'C123456789', parentType: '母親', homeAddress: '臺中市...', contactAddress: '臺中市...', mobile: '0922-222-222', email: 'mom@example.com', company: 'XXX公司', gender: '女', isLeave: true, leaveStart: '2025-08-01', leaveEnd: '2026-01-31' },
    selectedAgency: '幸福幼兒園',
    selectedClass: '小班',
    withdrawNote: null,
    children: [{ name: '小寶', gender: '男', age: '3', birth: '2022-03-15' }],
    files: [ { name: '身份證明.pdf', url: '' }, { name: '戶口名簿.jpg', url: '/vite.svg', type: 'image/svg+xml' } ]
  },
  'C1002': {
    id: 'C1002',
    applyDate: '2025/10/05',
    status: ADMITTED,
    institution: '快樂托育中心',
    identityType: '一般',
    queueNo: null,
    applicant: { name: '陳小華', birth: '1992-12-01', id: 'D223456789', homeAddress: '臺中市北區......................................', mailAddress: '臺中市北區...', mobile: '0933-333-333', email: 'user@example.com' },
    parent1: { name: '陳爸爸', birth: '1989-05-12', id: 'E123456789', parentType: '父親', homeAddress: '臺中市...', contactAddress: '臺中市...', mobile: '0910-000-000', email: 'pa@example.com', company: 'ABC', gender: '男', isLeave: false },
    parent2: { name: '陳媽媽', birth: '1990-07-30', id: 'F123456789', parentType: '母親', homeAddress: '臺中市...', contactAddress: '臺中市...', mobile: '0910-999-999', email: 'ma@example.com', company: 'DEF', gender: '女', isLeave: false },
    selectedAgency: '快樂托育中心',
    selectedClass: '中班',
    // 新增：預填退托原因（供 UI 顯示與編輯）
    withdrawNote: '',
    children: [{ name: '小美', gender: '女', age: '4', birth: '2021-07-20' }],
    files: [ { name: '證明文件.pdf', url: '' }, { name: '證件影本.png', url: '/vite.svg', type: 'image/svg+xml' } ]
  },

  // 以下為新增的 mock cases，覆蓋各種非錄取/非候補狀態，僅供檢視（不會顯示錄取/退托按鈕）
  'C1003': {
    id: 'C1003',
    applyDate: '2025/09/20',
    status: PROCESSING,
    institution: '彩虹托育所',
    identityType: '一般',
    queueNo: null,
    applicant: { name: '吳媽媽', birth: '1988-04-10', id: 'G123456789', homeAddress: '臺中市南屯區...', mailAddress: '', mobile: '0928-111-222', email: 'wu@example.com' },
    parent1: { name: '吳先生', birth: '1985-04-01', id: 'H123456789', parentType: '父親', homeAddress: '臺中市...', contactAddress: '臺中市...', mobile: '0913-222-333', email: 'husband@example.com', company: '服務業', gender: '男', isLeave: false },
    parent2: null,
    selectedAgency: '彩虹托育所',
    selectedClass: '',
    withdrawNote: null,
    children: [{ name: '小亮', gender: '男', age: '2', birth: '2023-06-10' }],
    files: []
  },
  'C1004': {
    id: 'C1004',
    applyDate: '2025/08/12',
    status: SUPPLEMENT,
    institution: '小太陽幼兒園',
    identityType: '低收入戶',
    queueNo: null,
    applicant: { name: '林小英', birth: '1991-11-22', id: 'I223456789', homeAddress: '臺中市西區...', mailAddress: 'lin@example.com', mobile: '0955-444-555', email: 'lin@example.com' },
    parent1: { name: '林爸爸', birth: '1965-02-14', id: 'J123456789', parentType: '父親', homeAddress: '臺中市...', contactAddress: '臺中市...', mobile: '0988-666-777', email: 'father@example.com', company: '製造業', gender: '男', isLeave: false },
    parent2: { name: '林媽媽', birth: '1968-09-30', id: 'K123456789', parentType: '母親', homeAddress: '臺中市...', contactAddress: '臺中市...', mobile: '0987-777-888', email: 'mother@example.com', company: '家庭主婦', gender: '女', isLeave: false },
    selectedAgency: '小太陽幼兒園',
    selectedClass: '小班',
    withdrawNote: null,
    children: [{ name: '小光', gender: '男', age: '1', birth: '2024-01-05' }],
    files: [ { name: '戶口名簿.pdf', url: '' } ]
  },
  'C1005': {
    id: 'C1005',
    applyDate: '2025/07/01',
    status: REJECTED,
    institution: '安心托育',
    identityType: '一般',
    queueNo: null,
    applicant: { name: '張小姐', birth: '1994-06-06', id: 'L123456789', homeAddress: '臺中市北區...', mailAddress: '', mobile: '0944-555-666', email: 'zhang@example.com' },
    parent1: { name: '張爸爸', birth: '1970-03-03', id: 'M123456789', parentType: '父親', homeAddress: '臺中市...', contactAddress: '', mobile: '0919-000-111', email: '', company: '', gender: '男', isLeave: false },
    parent2: null,
    selectedAgency: '',
    selectedClass: '',
    withdrawNote: null,
    children: [{ name: '小安', gender: '女', age: '0', birth: '2025-07-10' }],
    files: []
  },
  'C1006': {
    id: 'C1006',
    applyDate: '2025/06/15',
    status: REJECTED,
    institution: '快樂托育中心',
    identityType: '一般',
    queueNo: null,
    applicant: { name: '劉先生', birth: '1980-01-01', id: 'N123456789', homeAddress: '臺中市東區...', mailAddress: 'liu@example.com', mobile: '0966-111-222', email: 'liu@example.com' },
    parent1: { name: '劉媽媽', birth: '1982-02-02', id: 'O123456789', parentType: '母親', homeAddress: '臺中市...', contactAddress: '臺中市...', mobile: '0900-123-456', email: 'momliu@example.com', company: '金融', gender: '女', isLeave: false },
    parent2: null,
    selectedAgency: '快樂托育中心',
    selectedClass: '',
    withdrawNote: null,
    children: [{ name: '小星', gender: '男', age: '5', birth: '2019-04-01' }],
    files: [ { name: '證明.pdf', url: '' } ]
  },
  'C1007': {
    id: 'C1007',
    applyDate: '2025/05/20',
    status: REVOKED,
    institution: '愛心幼兒園',
    identityType: '中低收入戶',
    queueNo: null,
    applicant: { name: '高太太', birth: '1990-10-10', id: 'P123456789', homeAddress: '臺中市...', mailAddress: 'gao@example.com', mobile: '0977-222-333', email: 'gao@example.com' },
    parent1: { name: '高先生', birth: '1988-08-08', id: 'Q123456789', parentType: '父親', homeAddress: '臺中市...', contactAddress: '', mobile: '0955-333-444', email: '', company: 'IT', gender: '男', isLeave: false },
    parent2: null,
    selectedAgency: '',
    selectedClass: '',
    withdrawNote: null,
    children: [{ name: '小心', gender: '女', age: '2', birth: '2023-08-20' }],
    files: []
  }
}

onMounted(() => {
  // Load mock data or redirect back if not found
  const data = mockCases[caseId.value]
  if (data) {
    caseData.value = JSON.parse(JSON.stringify(data))
    // initialize admit selections for waiting cases
    if (caseData.value.status === WAITING) {
      admitAgency.value = appliedAgency.value || ''
      admitClass.value = caseData.value.selectedClass || ''
    }
    // Prefill withdrawNote ref from case data if present (allows null)
    withdrawNote.value = caseData.value.withdrawNote ?? ''
  } else {
    router.push('/admin/case-management')
  }
})

function admit() {
  if (caseData.value.status === WAITING) {
    if (!admitAgency.value || !admitClass.value) {
      alert('請先選擇申請單位與就讀班級')
      return
    }
    // Assign chosen agency and class
    caseData.value.institution = admitAgency.value
    caseData.value.selectedAgency = admitAgency.value
    caseData.value.selectedClass = admitClass.value
  }
  if (!confirm('確定要執行錄取嗎？')) return
  caseData.value.status = ADMITTED
  alert('已錄取')
  // 停留於本頁
}

function revoke() {
  // If currently admitted, require a withdraw note
  if (caseData.value.status === ADMITTED) {
    if (!withdrawNote.value || !withdrawNote.value.trim()) {
      alert('請填寫退托原因說明後再執行退托')
      return
    }
    // attach note to case data for record
    caseData.value.withdrawNote = withdrawNote.value.trim()
  }
  if (!confirm('確定要執行退托嗎？')) return
  // mark as withdrawn (已退托)
  caseData.value.status = WITHDRAWN
  alert('已退托')
  // 停留於本頁（不自動返回）
}

function goBack() {
  router.push('/admin/case-management')
}

// Compute child's age from birth date string as "X月 Y周 Z天"
function computeChildAge(birth) {
  if (!birth) return ''
  // try to parse common formats
  const bd = new Date(birth)
  if (isNaN(bd)) return ''
  const now = new Date()

  // If birth is in the future, return 0天
  if (bd > now) return '0天'

  // months difference
  let months = (now.getFullYear() - bd.getFullYear()) * 12 + (now.getMonth() - bd.getMonth())
  // adjust if day of month not yet reached
  if (now.getDate() < bd.getDate()) months -= 1

  // compute date after adding months to birth
  const tmp = new Date(bd.getTime())
  tmp.setMonth(tmp.getMonth() + months)

  // remaining days difference
  let daysDiff = Math.floor((now - tmp) / (1000 * 60 * 60 * 24))
  if (isNaN(daysDiff) || daysDiff < 0) daysDiff = 0

  const weeks = Math.floor(daysDiff / 7)
  const days = daysDiff % 7

  const parts = []
  if (months > 0) parts.push(`${months}月`)
  if (weeks > 0) parts.push(`${weeks}周`)
  if (days > 0) parts.push(`${days}天`)
  if (parts.length === 0) return '0天'
  return parts.join(' ')
}
</script>

<style scoped>
.case-page { display: flex; justify-content: center; width: 85%;}
.case-card{width: 100%;}
.title-row { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px; margin-top: 60px; }
.title-left { display:flex; align-items:center; gap:12px; }
.title-right { display:flex; align-items:center; gap:12px; flex-wrap: wrap; }
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700; }

.detail-card { background: #fff; border: 1px solid #e6e6ea; border-radius: 12px; padding: 24px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(16,24,40,0.04); }
.detail-card h3 { color: #2e6fb7; font-size: 1.2rem; margin-bottom: 16px; border-bottom: 2px solid #e6f2ff; padding-bottom: 8px; }
.detail-info { display: grid; gap: 10px; }
.info-row { display: flex; align-items: center; }
.info-label { width: 120px; font-weight: 600; color: #2e6fb7; }
.info-value { color: #334e5c; font-weight: 500; }

.wait-extra { display: flex; gap: 12px; margin: 12px 0 24px; flex-wrap: wrap; }
.wait-chip { background: #fff3cd; border: 1px solid #ffe69c; color: #7a5d00; padding: 8px 12px; border-radius: 20px; }
.wait-chip .label { color: #7a5d00; margin-right: 6px; font-weight: 600; }
.admit-setup { width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; background: #f8fbff; border: 1px dashed #b3d4fc; border-radius: 8px; padding: 12px; }
.form-row { display: flex; align-items: center; gap: 10px; }
.select-input { padding: 8px 10px; border-radius: 6px; border: 1px solid #d8dbe0; min-width: 180px; }

/* textarea style for withdraw note */
.text-input { padding: 8px 10px; border-radius: 6px; border: 1px solid #d8dbe0; min-width: 100%; resize: vertical; }

.section-card { background: #fff; border: 1px solid #e6e6ea; border-radius: 12px; margin-bottom: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(16,24,40,0.04); }
.section-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: #f8fbff; border-bottom: 1px solid #e6f2ff; }
.section-header h3 { margin: 0; color: #2e6fb7; font-size: 1.1rem; }
.collapse-btn { border: 1px solid #b3d4fc; color: #2e6fb7; background: #e6f2ff; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
.section-body { padding: 16px 20px; }
.grid.two-col { display: grid; grid-template-columns: repeat(2, minmax(240px, 1fr)); gap: 10px 24px; }
.grid.one-col { display: grid; grid-template-columns: 1fr; gap: 10px; }
.row { display: flex; gap: 8px; align-items: center; min-height: 28px; }
.row .label { width: 140px; color: #2e6fb7; font-weight: 600; flex-shrink: 0; }
.parent-block { padding: 12px; border: 1px solid #b3d4fc; border-radius: 8px; background: #fff; margin-bottom: 12px; }
.parent-title { font-weight: 700; color: #334e5c; margin-bottom: 8px; }

.children-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin-top: 8px; }
.child-card { background: #fff; border: 1px solid #b3d4fc; border-radius: 8px; padding: 12px; }
.child-header { font-weight: 700; color: #334e5c; margin-bottom: 8px; }

.file-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.file-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: #FFF8F6; border: 1px solid #F9AFAE; border-radius: 8px; }
.file-actions { margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap; }
.btn.small { padding: 6px 12px; font-size: 0.9rem; }
.btn.small.ghost { background: transparent; color: #2563eb; border: 1px solid #b3d4fc; }
.btn.small.primary { background: #2563eb; color: #fff; }

/* Preview modal */
.preview-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.preview-card { background: #fff; border-radius: 12px; width: min(900px, 92vw); height: min(80vh, 900px); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.25); }
.preview-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #eee; }
.preview-title { font-weight: 700; color: #334e5c; }
.preview-close { background: transparent; border: none; font-size: 1.6rem; line-height: 1; cursor: pointer; color: var(--secondary-text-color); }
.preview-body { flex: 1; display: flex; align-items: center; justify-content: center; padding: 12px; }
.preview-body img { max-width: 100%; max-height: 100%; object-fit: contain; }
.preview-body iframe { width: 100%; height: 100%; border: none; }
.preview-fallback { color: var(--secondary-text-color); }

.bottom-row { display:flex; justify-content:center; gap:12px; margin: 24px 0; }
.btn { padding: 10px 18px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; font-size: 1rem; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
.btn.danger { background:#ff7b8a; color:#fff }
.btn[disabled] { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 900px){
  .case-card{ width: 100%; padding: 0 12px; }
  .grid.two-col{ grid-template-columns: 1fr; }
  .row .label{ width: 120px; }
}

.children-summary { margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.children-summary li { list-style: none; color: #334e5c; }
.children-summary .sep { color: #98a2b3; margin: 0 6px; }
</style>
