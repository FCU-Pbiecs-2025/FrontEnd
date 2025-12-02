<template>
  <div class="case-page">
    <!-- 加載中提示 -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>正在加載案件數據...</p>
    </div>

    <!-- 錯誤提示 -->
    <div v-else-if="loadError" class="error-container">
      <p class="error-message">{{ loadError }}</p>
      <button class="btn ghost" @click="goBack">返回</button>
    </div>

    <!-- 案件數據 -->
    <div v-else class="case-card">
      <!-- Title -->
      <div class="title-row">
        <div class="title-left">
          <img src="https://img.icons8.com/ios/48/2e6fb7/treatment-plan.png" class="icon" alt="icon" />
          <span class="main-title">個案管理編輯</span>
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




      <div v-if="caseData.status === '錄取候補中'" class="wait-extra">
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

          <!-- 顯示附件檔名列表 -->
          <div v-if="getAttachmentFiles().length > 0" class="attachment-list">
            <h4>附件檔案</h4>
            <ul>
              <li v-for="(file, idx) in getAttachmentFiles()" :key="idx" class="attachment-item">
                <a href="javascript:void(0)" @click="openFilePreview(file)" class="file-link">
                  📎 {{ file.name }}
                </a>
              </li>
            </ul>
          </div>
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
            <img v-if="preview.file && preview.file.url" :src="preview.file.url" alt="preview" />
            <div v-else class="preview-fallback">
              無法預覽此檔案。
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom actions -->
      <div class="bottom-row">
        <template v-if="caseData.status === '錄取候補中'">
          <button class="btn primary" @click="admit" :disabled="!admitAgency || !admitClass">錄取</button>
        </template>
        <template v-else-if="caseData.status === '已錄取'">
          <button class="btn danger" @click="revoke">退托</button>
        </template>
        <button class="btn ghost" @click="goBack">返回</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { IDENTITY_TYPE_MAP, CASE_STATUS_MAP } from '@/api/application'
import { useRouter, useRoute } from 'vue-router'
import { getApplicationCaseByParticipantID } from '@/api/applicationCase.js'
import { getClassByInstitutionId } from '@/api/class.js'

const router = useRouter()
const route = useRoute()

// Status constants (from CASE_STATUS_MAP)
const PROCESSING = CASE_STATUS_MAP['1']      // '審核中'
const SUPPLEMENT = CASE_STATUS_MAP['2']      // '需要補件'
const REJECTED = CASE_STATUS_MAP['3']        // '已退件'
const WAITING = CASE_STATUS_MAP['4']         // '錄取候補中'
const REVOKE_PROCESSING = CASE_STATUS_MAP['5'] // '撤銷申請審核中'
const REVOKED = CASE_STATUS_MAP['6']         // '撤銷申請通過'
const WITHDRAWN = CASE_STATUS_MAP['7']       // '已退托'
const ADMITTED = CASE_STATUS_MAP['8']        // '已錄取'

const caseId = ref(route.params.id)
const applicationId = ref(route.params.participantID || '')
const caseData = ref({})
const isLoading = ref(false)
const loadError = ref('')

// Collapsible sections state - default collapsed
const openSections = ref({ applicant: false, parents: false, child: false, files: false })
const toggle = (key) => { openSections.value[key] = !openSections.value[key] }

// Admit selections
const admitAgency = ref('')
const admitClass = ref('')

// Applied agency is fixed from case data
const appliedAgency = computed(() => (caseData.value?.selectedAgency || caseData.value?.institution || ''))
watch(appliedAgency, (val) => { admitAgency.value = val || '' })

// 班級列表 - 使用 API 動態加載
const classList = ref([])

const classOptions = computed(() => {
  if (!classList.value || classList.value.length === 0) return []
  return classList.value.map(c => c.className || c.name)
})

// 當機構改變時，加載該機構的班級
watch(admitAgency, async () => {
  admitClass.value = ''
  classList.value = []

  if (!admitAgency.value) return

  try {
    // 這裡需要機構 ID，暫時使用 mock 的機構 ID 映射
    // 實際應該從 caseData 中獲取機構 ID
    const institutionId = caseData.value?.institutionId || ''
    if (institutionId) {
      const response = await getClassByInstitutionId(institutionId)
      classList.value = response.data || response || []
      console.log('[Watch admitAgency] Loaded classes:', classList.value)
    }
  } catch (error) {
    console.error('[Watch admitAgency] Failed to load classes:', error)
  }
})

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

// 獲取幼兒圖片 URL
const getChildImageUrl = (child) => {
  if (!caseData.value) return ''
  const a = caseData.value
  const path =
    a.AttachmentPath ||
    a.attachmentPath ||
    a.AttachmentPath1 ||
    a.attachmentPath1 ||
    a.AttachmentPath2 ||
    a.attachmentPath2 ||
    a.AttachmentPath3 ||
    a.attachmentPath3
  if (!path) return ''
  // 若後端已回傳完整 URL，直接使用；若已是 /identity-files 開頭，補上網域
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  if (path.startsWith('/')) {
    return `http://localhost:8080${path}`
  }
  // 其餘情況視為 /identity-files 底下的檔名
  return `http://localhost:8080/identity-files/${path}`
}

// 獲取所有附件檔案列表
const getAttachmentFiles = () => {
  const files = []
  const pathFields = [
    { path: caseData.value.attachmentPath, name: '附件1' },
    { path: caseData.value.attachmentPath1, name: '附件2' },
    { path: caseData.value.attachmentPath2, name: '附件3' },
    { path: caseData.value.attachmentPath3, name: '附件4' }
  ]

  pathFields.forEach((field, idx) => {
    if (field.path) {
      files.push({
        path: field.path,
        name: field.name,
        index: idx,
        url: getChildImageUrl({ AttachmentPath: field.path })
      })
    }
  })

  return files
}

// 打開檔案預覽
const openFilePreview = (file) => {
  preview.value.visible = true
  preview.value.file = {
    name: file.name,
    url: file.url,
    type: 'image/jpeg'
  }
}

// Mock dataset (replace by API later)

// 轉換 API 數據為前端格式
const transformApiData = (apiData) => {
  if (!apiData) return {}

  // 轉換狀態代碼為文字
  const STATUS_MAP = {
    '審核中': '審核中',
    '需要補件': '需要補件',
    '已退件': '已退件',
    '錄取候補中': '錄取候補中',
    '撤銷申請審核中': '撤銷申請審核中',
    '撤銷申請通過': '撤銷申請通過',
    '已退托': '已退托',
    '已錄取': '已錄取'
  }


  // 提取申請人信息 (來自 user 欄位)
  const userData = apiData.user || {}
  const applicant = {
    name: userData.name || '',
    birth: userData.birthDate || '',
    id: userData.nationalID || '',
    homeAddress: userData.mailingAddress || '',
    mailAddress: userData.mailingAddress || '',
    mobile: userData.phoneNumber || '',
    email: userData.email || ''
  }

  // 提取家長信息
  const parentsArray = apiData.parents || []
  const parent1Data = parentsArray[0] || {}
  const parent2Data = parentsArray[1] || {}

  const parent1 = parent1Data.name ? {
    name: parent1Data.name || '',
    birth: parent1Data.birthDate || '',
    id: parent1Data.nationalID || '',
    parentType: parent1Data.relationShip || '',
    homeAddress: parent1Data.householdAddress || '',
    contactAddress: parent1Data.mailingAddress || '',
    mobile: parent1Data.phoneNumber || '',
    email: parent1Data.email || '',
    company: parent1Data.occupation || '',
    gender: parent1Data.gender || '',
    isLeave: parent1Data.isSuspended || false,
    leaveStart: parent1Data.isSuspended ? (parent1Data.suspendEnd ? '' : '') : '',
    leaveEnd: parent1Data.suspendEnd || ''
  } : null

  const parent2 = parent2Data.name ? {
    name: parent2Data.name || '',
    birth: parent2Data.birthDate || '',
    id: parent2Data.nationalID || '',
    parentType: parent2Data.relationShip || '',
    homeAddress: parent2Data.householdAddress || '',
    contactAddress: parent2Data.mailingAddress || '',
    mobile: parent2Data.phoneNumber || '',
    email: parent2Data.email || '',
    company: parent2Data.occupation || '',
    gender: parent2Data.gender || '',
    isLeave: parent2Data.isSuspended || false,
    leaveStart: parent2Data.isSuspended ? (parent2Data.suspendEnd ? '' : '') : '',
    leaveEnd: parent2Data.suspendEnd || ''
  } : null

  // 提取幼兒信息
  const childrenArray = apiData.children || []
  const children = childrenArray.map(child => ({
    name: child.name || '',
    gender: child.gender || '',
    birth: child.birthDate || '',
    age: '',
    id: child.nationalID || ''
  }))



  // 取得狀態 (從幼兒的 status 欄位)
  const childStatus = childrenArray.length > 0 ? (childrenArray[0].status || '') : ''
  const mappedStatus = STATUS_MAP[childStatus] || childStatus || '審核中'

  return {
    id: apiData.caseNumber || '',
    applyDate: apiData.applyDate || '',
    status: mappedStatus,
    institution: apiData.institutionName || '',
    institutionId: apiData.institutionId || '',
    identityType: IDENTITY_TYPE_MAP[apiData.identityType] || '',
    queueNo: apiData.currentOrder || null,
    applicant,
    parent1,
    parent2,
    children,
    selectedAgency: apiData.institutionName || '',
    selectedClass: apiData.selectedClass || '',
    withdrawNote: childrenArray.length > 0 ? (childrenArray[0].reason || '') : '',
    attachmentPath: apiData.attachmentPath || '',
    attachmentPath1: apiData.attachmentPath1 || '',
    attachmentPath2: apiData.attachmentPath2 || '',
    attachmentPath3: apiData.attachmentPath3 || ''
  }
}

onMounted(async () => {
  try {
    isLoading.value = true
    loadError.value = ''
    // 1. 優先呼叫 API 取得資料
    try {
      const apiData = await getApplicationCaseByParticipantID(applicationId.value)
      if (apiData) {
        caseData.value = transformApiData(apiData)
        if (caseData.value.status === WAITING) {
          admitAgency.value = appliedAgency.value || ''
          admitClass.value = caseData.value.selectedClass || ''
        }
        withdrawNote.value = caseData.value.withdrawNote ?? ''
        isLoading.value = false
        return
      }
    } catch (apiError) {
      // API 404 或失敗才 fallback
      console.warn('[onMounted] API 查詢失敗，fallback localStorage/mock', apiError)
    }
    // 2. sessionStorage 中的列表數據 fallback
    let listItemData = null
    try {
      const sessionItem = sessionStorage.getItem('caseManagementItem')
      if (sessionItem) {
        listItemData = JSON.parse(sessionItem)
        console.log('[onMounted] Retrieved item from sessionStorage:', listItemData)
      }
    } catch (e) {
      console.warn('[onMounted] sessionStorage retrieval failed:', e)
    }

    if (listItemData) {
      // 根據列表數據構建案件對象
      caseData.value = {
        id: listItemData.id,
        applyDate: listItemData.applyDate,
        status: listItemData.status,
        institution: listItemData.institution,
        identityType: listItemData.identityType,
        queueNo: listItemData.queueNo,
        participant: {
          name: listItemData.applicantName || '',
          id: listItemData.participantID || ''
        },
        children: [{
          name: listItemData.childName || '',
          birth: listItemData.childBirth || ''
        }],
        selectedAgency: listItemData.institution,
        selectedClass: '',
        attachmentPath: listItemData.attachmentPath || '',
        attachmentPath1: listItemData.attachmentPath1 || '',
        attachmentPath2: listItemData.attachmentPath2 || '',
        attachmentPath3: listItemData.attachmentPath3 || ''

      }
      if (caseData.value.status === WAITING) {
        admitAgency.value = appliedAgency.value || ''
        admitClass.value = caseData.value.selectedClass || ''
      }
      try { sessionStorage.removeItem('caseManagementItem') } catch (e) {}
      isLoading.value = false
      return
    }

    // 3. localStorage/sessionStorage fallback
    let payload = null
    const sessionData = sessionStorage.getItem('caseManagementSelection')
    if (sessionData) {
      payload = JSON.parse(sessionData)
    } else {
      const localData = localStorage.getItem('caseManagementSelection')
      if (localData) {
        payload = JSON.parse(localData)
      }
    }
    if (payload && payload.caseData && (payload.caseData.participantID === participantID.value || payload.participantID === participantID.value)) {
      caseData.value = JSON.parse(JSON.stringify(payload.caseData))
      if (caseData.value.status === WAITING) {
        admitAgency.value = appliedAgency.value || ''
        admitClass.value = caseData.value.selectedClass || ''
      }
      withdrawNote.value = caseData.value.withdrawNote ?? ''
      try { sessionStorage.removeItem('caseManagementSelection') } catch (e) {}
      try { localStorage.removeItem('caseManagementSelection') } catch (e) {}
      isLoading.value = false
      return
    }
    // 3. 其他 fallback
    loadError.value = '無法加載案件數據'
  } catch (error) {
    console.error('[onMounted] 加載數據失敗:', error)
    router.push('/admin/case-management')
  } finally {
    isLoading.value = false
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

  function computeChildAge(birth) {
    if (!birth) return ''
    const bd = new Date(birth)
    if (isNaN(bd)) return ''
    const now = new Date('2025-10-27')

    if (bd > now) return '0歲0月0周'

    // 計算總月數
    let months = (now.getFullYear() - bd.getFullYear()) * 12 + (now.getMonth() - bd.getMonth())
    if (now.getDate() < bd.getDate()) months -= 1

    // 計算年、月
    const years = Math.floor(months / 12)
    const remainMonths = months % 12

    // 計算剩餘天數
    const tmp = new Date(bd.getTime())
    tmp.setMonth(tmp.getMonth() + months)
    let daysDiff = Math.floor((now - tmp) / (1000 * 60 * 60 * 24))
    if (isNaN(daysDiff) || daysDiff < 0) daysDiff = 0

    const weeks = Math.floor(daysDiff / 7)

    return `${years}歲${remainMonths}月${weeks}周`
  }
</script>

<style scoped>
.loading-container, .error-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; min-height: 400px; }
.spinner { width: 40px; height: 40px; border: 4px solid #e6f2ff; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 20px; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-container { background: #fff; border-radius: 12px; margin: 60px auto; width: min(500px, 90%); padding: 40px; }
.error-message { color: #dc2626; font-size: 1rem; margin-bottom: 20px; text-align: center; }

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

/* 幼兒圖片樣式 */
.child-image-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-top: 16px; }
.child-image-item { display: flex; flex-direction: column; align-items: center; }
.child-image { width: 100%; max-width: 200px; height: auto; border-radius: 8px; border: 1px solid #e6e6ea; box-shadow: 0 2px 8px rgba(16,24,40,0.04); }
.image-placeholder { width: 100%; max-width: 200px; height: 200px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; border: 1px dashed #d8dbe0; border-radius: 8px; color: #666; font-size: 0.9rem; }

/* 附件列表樣式 */
.attachment-list { margin-top: 16px; }
.attachment-list h4 { color: #2e6fb7; font-size: 1rem; margin: 0 0 12px 0; font-weight: 600; }
.attachment-list ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.attachment-item { padding: 10px 12px; background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 6px; }
.file-link { color: #2563eb; text-decoration: none; cursor: pointer; font-weight: 500; transition: all 0.2s ease; }
.file-link:hover { color: #1d4ed8; text-decoration: underline; }
</style>
