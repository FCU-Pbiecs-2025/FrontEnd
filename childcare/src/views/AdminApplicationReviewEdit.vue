<template>
  <div class="announcement-page">
    <div class="announcement-card">
      <!-- Title Section -->
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/approval.png" class="icon" alt="icon" />
        <span class="main-title">申請審核 </span>
      </div>

      <!-- Application Summary Card -->
      <div class="detail-card">
        <h3>申請摘要</h3>
        <div class="detail-info">
          <div class="info-row">
            <label class="info-label">申請編號：</label>
            <span class="info-value">{{ applicationData.caseNumber }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">申請日期：</label>
            <span class="info-value">{{ applicationData.applicationDate }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">申請機構：</label>
            <span class="info-value">{{ applicationData.institutionName }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">當前狀態：</label>
            <span class="info-value">{{ childList.length > 0 ? childList[0].status : applicationData.status }}</span>
          </div>

        </div>
      </div>

      <!-- 身分證影像 Card - 顯示檔名列表，點擊預覽 -->
      <div class="detail-card" v-if="childList && childList.length > 0">
        <h3>身分別：{{ getIdentityOrderLabel(applicationData.identityType) }}</h3>
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

      <!-- Family Information Section -->
      <div class="collapse-card">
        <div class="collapse-header" @click="parentOpen = !parentOpen">
          <span class="collapse-title">家長資料</span>
          <span class="collapse-toggle">{{ parentOpen ? '收合' : '展開' }}</span>
        </div>
        <transition name="collapse">
          <div v-show="parentOpen" class="collapse-content">
            <template v-for="(parent, idx) in parentList" :key="idx">
              <div class="parent-title">家長 {{ idx + 1 }}</div>
              <div class="info-grid">
                <div class="grid-row">
                  <label class="grid-label">身分證字號/護照號碼：</label>
                  <span class="grid-value">{{ parent.nationalID }}</span>
                </div>
                <div class="grid-row">
                  <label class="grid-label">姓名：</label>
                  <span class="grid-value">{{ parent.name }}</span>
                </div>
                <div class="grid-row">
                  <label class="grid-label">性別：</label>
                  <span class="grid-value">{{ parent.gender }}</span>
                </div>
                <div class="grid-row">
                  <label class="grid-label">與幼兒關係：</label>
                  <span class="grid-value">{{ parent.relationShip }}</span>
                </div>
                <div class="grid-row">
                  <label class="grid-label">職業：</label>
                  <span class="grid-value">{{ parent.occupation }}</span>
                </div>
                <div class="grid-row">
                  <label class="grid-label">電話：</label>
                  <span class="grid-value">{{ parent.phoneNumber }}</span>
                </div>
                <div class="grid-row">
                  <label class="grid-label">戶籍地址：</label>
                  <span class="grid-value">{{ parent.householdAddress }}</span>
                </div>
                <div class="grid-row">
                  <label class="grid-label">通訊地址：</label>
                  <span class="grid-value">{{ parent.mailingAddress }}</span>
                </div>
                <div class="grid-row">
                  <label class="grid-label">電子信箱：</label>
                  <span class="grid-value">{{ parent.email }}</span>
                </div>
                <div class="grid-row">
                  <label class="grid-label">出生年月日：</label>
                  <span class="grid-value">{{ parent.birthDate }}</span>
                </div>
                <div class="grid-row">
                  <label class="grid-label">是否留停：</label>
                  <span class="grid-value">{{ parent.isSuspended ? '是' : '否' }}</span>
                </div>
                <div class="grid-row">
                  <label class="grid-label">留停訖：</label>
                  <span class="grid-value">{{ parent.suspendEnd }}</span>
                </div>
              </div>
              <div v-if="idx !== parentList.length - 1" class="divider"></div>
            </template>
          </div>
        </transition>
      </div>

      <!-- Children Information Section -->
      <div class="collapse-card">
        <div class="collapse-header" @click="childOpen = !childOpen">
          <span class="collapse-title">幼兒資料</span>
          <span class="collapse-toggle">{{ childOpen ? '收合' : '展開' }}</span>
        </div>
        <transition name="collapse">
          <div v-show="childOpen" class="collapse-content">
            <div class="children-grid">
              <template v-for="(child, idx) in childList" :key="idx">
                <div class="child-card">
                  <div class="child-header">幼兒 {{ idx + 1 }}</div>
                  <div class="info-grid">
                    <div class="grid-row">
                      <label class="grid-label">身分證字號：</label>
                      <span class="grid-value">{{ child.nationalID }}</span>
                    </div>
                    <div class="grid-row">
                      <label class="grid-label">姓名：</label>
                      <span class="grid-value">{{ child.name }}</span>
                    </div>
                    <div class="grid-row">
                      <label class="grid-label">性別：</label>
                      <span class="grid-value">{{ child.gender }}</span>
                    </div>
                    <div class="grid-row">
                      <label class="grid-label">出生年月日：</label>
                      <span class="grid-value">{{ child.birthDate }}</span>
                    </div>
                    <div class="grid-row">
                      <label class="grid-label">年齡：</label>
                      <span class="grid-value">{{ child.age }}</span>
                    </div>
                    <div class="grid-row">
                      <label class="grid-label">通訊地址：</label>
                      <span class="grid-value">{{ child.mailingAddress }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </transition>
      </div>

      <!-- Review Form Section -->
      <div class="review-card">
        <h3>審核資訊</h3>
        <div class="review-form">
          <div class="form-row">
            <label class="form-label">審核結果：</label>
            <select v-model="reviewResult" class="form-input">
              <option value="">請選擇</option>
              <option value="候補中">候補中</option>
              <option value="需要補件">需要補件</option>
              <option value="已退件">退件</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">備註說明：</label>
            <textarea v-model="reviewNote" class="form-input" rows="4" placeholder="請輸入審核備註..."></textarea>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="bottom-row">
        <button class="btn primary" @click="confirmReview">送出審核</button>
        <button class="btn query" @click="goBack">返回列表</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getApplicationById, updateApplicationCase } from '@/api/application.js'

const router = useRouter()
const route = useRoute()

// route may use different param names; normalize to a single routeId
const routeId = route.params.id || route.params.applicationId || route.params.applicationID || route.params.appId || ''
const applicationId = ref(routeId)

const applicationData = ref({})
const reviewDate = ref('')
const reviewResult = ref('')
const reviewNote = ref('')
const parentOpen = ref(false)
const childOpen = ref(false)
const parentList = ref([])
const childList = ref([])
const preview = ref({ visible: false, file: null })

// 計算幼兒年齡
function getChildAge(birthDate) {
  if (!birthDate) return '';
  let birthArr = birthDate.includes('/') ? birthDate.split('/') : birthDate.split('-');
  let birthYear = parseInt(birthArr[0]);
  let birthMonth = parseInt(birthArr[1]);
  let birthDay = parseInt(birthArr[2]);
  let nowYear = 2025;
  let nowMonth = 10;
  let nowDay = 27;
  let totalMonths = (nowYear - birthYear) * 12 + (nowMonth - birthMonth);
  let days = nowDay - birthDay;
  if (days < 0) {
    totalMonths--;
    let prevMonth = nowMonth - 1;
    let prevYear = nowYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear--;
    }
    let daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
    days = daysInPrevMonth + days;
  }
  let years = Math.floor(totalMonths / 12);
  let months = totalMonths % 12;
  let weeks = Math.floor(days / 7);
  return `${years}歲${months}月${weeks}周`;
}

// identityType 對應顯示序位文字
const getIdentityOrderLabel = (identityType) => {
  const t = (identityType ?? '').toString()
  if (t === '1') return '第一序位'
  if (t === '2') return '第二序位'
  if (t === '3') return '第三序位'
  return ''
}

// 根據後端回傳的附件路徑組成身份證照片 URL
// 優先順序：AttachmentPath > AttachmentPath1 > AttachmentPath2 > AttachmentPath3
const getChildImageUrl = (child) => {
  if (!applicationData.value) return ''
  const a = applicationData.value
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
    { path: applicationData.value.AttachmentPath || applicationData.value.attachmentPath, name: '附件1' },
    { path: applicationData.value.AttachmentPath1 || applicationData.value.attachmentPath1, name: '附件2' },
    { path: applicationData.value.AttachmentPath2 || applicationData.value.attachmentPath2, name: '附件3' },
    { path: applicationData.value.AttachmentPath3 || applicationData.value.attachmentPath3, name: '附件4' }
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

// 關閉檔案預覽
const closePreview = () => {
  preview.value.visible = false
  preview.value.file = null
}

// 透過 API 載入申請資料，可傳入 optional nationalID 當作 query
const normalize = s => (s || '').toString().trim().toUpperCase();

const loadApplication = async (nationalID) => {
  try {
    const response = await getApplicationById(applicationId.value, nationalID || undefined)
    applicationData.value = response

    // parents
    if (applicationData.value.parents && applicationData.value.parents.length > 0) {
      parentList.value = applicationData.value.parents
    } else {
      parentList.value = []
    }

    // children
    // 支援後端可能回傳 children、participants 或其他欄位，先合併再處理
    let children = []
    if (Array.isArray(applicationData.value.children)) children = children.concat(applicationData.value.children)
    if (Array.isArray(applicationData.value.participants)) children = children.concat(applicationData.value.participants)

    // 如果後端沒有以 nationalID 過濾，前端也做一次保險過濾
    if (nationalID) {
      const n = normalize(nationalID)
      children = children.filter(c => {
        if (!c) return false
        const cand = normalize(c.nationalID) || normalize(c.NationalID) || normalize(c.nationalId) || normalize(c.id) || ''
        return cand === n
      })
    }

    if (children.length > 0) {
      childList.value = children.map(child => ({ ...child }))
      childList.value.forEach(child => {
        child.age = getChildAge(child.birthDate)
      })
    } else {
      childList.value = []
    }
  } catch (error) {
    console.error('載入申請資料失敗:', error)
  }
}

onMounted(async () => {
  // 優先從 history.state（router.push state）取得 selection，再從 sessionStorage，最後才看 route.query
  let selection = null
  try {
    const hist = window && window.history && window.history.state ? window.history.state.applicationReviewSelection : null
    if (hist) selection = hist
  } catch (e) {
    console.warn('Failed to read history.state', e)
  }

  if (!selection) {
    try {
      const raw = sessionStorage.getItem('applicationReviewSelection')
      if (raw) selection = JSON.parse(raw)
    } catch (e) {
      console.warn('Failed to parse session selection', e)
      selection = null
    }
  }

  // 若 selection 存在且 applicationId 符合，使用 selection 的 nationalID 或 childName
  // declare filter variables here to avoid ReferenceError
  let nationalID = ''
  let childName = ''
  const selectionMatchesRoute = selection && selection.applicationId && (selection.applicationId === applicationId.value || selection.applicationId === route.params.applicationId || selection.applicationId === route.params.applicationID || selection.applicationId === route.params.appId)
  if (selectionMatchesRoute) {
    nationalID = selection.nationalID || ''
    childName = selection.childName || ''
    // 如果有 applicationData，直接使用它以避免再次呼叫 API
    if (selection.applicationData) {
      applicationData.value = selection.applicationData
      // parents
      parentList.value = Array.isArray(applicationData.value.parents) ? applicationData.value.parents : []
      // children merge
      let children = []
      if (Array.isArray(applicationData.value.children)) children = children.concat(applicationData.value.children)
      if (Array.isArray(applicationData.value.participants)) children = children.concat(applicationData.value.participants)
      // apply nationalID filter if present in selection
      if (nationalID) {
        const n = normalize(nationalID)
        children = children.filter(c => c && (normalize(c.nationalID) === n || normalize(c.NationalID) === n || normalize(c.nationalId) === n))
      }
      // apply childName filter if present
      if (!nationalID && childName) {
        const tn = normalize(childName)
        children = children.filter(c => {
          const names = [c.pname, c.name, c.childName, c.cname].filter(Boolean)
          return names.some(nm => normalize(nm) === tn || normalize(nm).includes(tn) || tn.includes(normalize(nm)))
        })
      }

      // 如果沒有提供 nationalID 或 childName，嘗試自動挑選一筆幼兒（優先 participantType 含 '幼' 或 '0'），以避免在 edit 頁顯示多筆
      if (!nationalID && !childName && children.length > 1) {
        const auto = children.find(c => (c.participantType && c.participantType.toString().includes('幼')) || c.participantType === '0' || c.participantType === 0) || children[0]
        if (auto) {
          children = [auto]
        }
      }

      childList.value = children.map(c => ({ ...(c || {}) }))
      childList.value.forEach(child => { child.age = getChildAge(child.birthDate) })
      // 清除選取（避免下一次亂用）
      try { sessionStorage.removeItem('applicationReviewSelection') } catch (e) {}
    } else {
      // 清除選取（避免下一次亂用）
      try { sessionStorage.removeItem('applicationReviewSelection') } catch (e) {}
    }
  }

  // 若沒有 session/history selection，再檢查 route.query
  if (!nationalID) {
    nationalID = route.query.nationalID || ''
  }
  if (!childName) {
    childName = route.query.childName || ''
  }

  // 優先以 nationalID 呼叫 loadApplication；若沒有 nationalID 但有 childName，先呼叫 loadApplication() 不帶 nationalID，後面以 name 過濾
  if (!applicationData.value || Object.keys(applicationData.value).length === 0) {
    if (nationalID) {
      await loadApplication(nationalID)
    } else {
      await loadApplication()
      // 若後端回傳多筆 children，且有 childName，做前端以 name 過濾
      if (childName && childList.value && childList.value.length > 1) {
        const normalizeLocal = s => (s || '').toString().replace(/\s+/g, '').trim().toUpperCase()
        const tn = normalizeLocal(childName)
        const filtered = childList.value.filter(c => {
          const names = [c.pname, c.name, c.childName, c.cname].filter(Boolean).map(normalizeLocal)
          return names.some(n => n === tn || n.includes(tn) || tn.includes(n))
        })
        if (filtered.length > 0) {
          childList.value = filtered
        }
      }
    }
  }
})

// 最簡單的返回與送出處理（後續可接真正 API）
const goBack = () => {
  router.back()
}

const confirmReview = async () => {
  // 驗證必填欄位
  if (!reviewResult.value) {
    alert('請選擇審核結果')
    return
  }

  // 如果沒有選擇幼兒，無法進行審核
  if (!childList.value || childList.value.length === 0) {
    alert('無幼兒資料，無法審核')
    return
  }

  try {
    // 提取當前選擇的幼兒身分證
    const selectedChild = childList.value[0]
    const childNationalID = selectedChild.nationalID || selectedChild.NationalID || selectedChild.nationalId

    if (!childNationalID) {
      alert('無法取得幼兒身分證，無法審核')
      return
    }

    // 呼叫 updateApplicationCase API
    const response = await updateApplicationCase(applicationId.value, {
      nationalID: childNationalID,
      status: reviewResult.value,
      reason: reviewNote.value || '',
      children: [{ nationalID: childNationalID }]
    })

    // 更新畫面上的狀態資訊
    if (response && response.children && response.children.length > 0) {
      const updatedChild = response.children[0]
      childList.value[0].status = updatedChild.status || reviewResult.value
      childList.value[0].reason = updatedChild.reason || reviewNote.value || ''
      childList.value[0].reviewDate = updatedChild.reviewDate || new Date().toISOString()
    } else {
      childList.value[0].status = reviewResult.value
      childList.value[0].reason = reviewNote.value || ''
      childList.value[0].reviewDate = new Date().toISOString()
    }

    alert('審核已送出成功')
    router.back()
  } catch (error) {
    console.error('送出審核失敗:', error)
    alert('送出審核失敗，請稍後重試')
  }
}
</script>

<style scoped>
.announcement-page {
  display: flex;
  justify-content: center;
  width: 85%;
}

.announcement-card {
  width: 100%;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  margin-top: 60px;
}

.icon {
  width: 32px;
  height: 32px;
}

.main-title {
  font-size: 1.35rem;
  color: #2e6fb7;
  font-weight: 700;
}

.detail-card {
  background: #fff;
  border: 1px solid #e6e6ea;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(16, 24, 40, 0.04);
}

.detail-card h3 {
  color: #2e6fb7;
  font-size: 1.2rem;
  margin-bottom: 16px;
  border-bottom: 2px solid #e6f2ff;
  padding-bottom: 8px;
}

.detail-info {
  display: grid;
  gap: 10px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-label {
  width: 120px;
  font-weight: 600;
  color: #2e6fb7;
  flex-shrink: 0;
}

.info-value {
  color: #334e5c;
  font-weight: 500;
}

.collapse-card {
  background: #fff;
  border: 1px solid #e6e6ea;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(16, 24, 40, 0.04);
}

.collapse-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 16px 20px;
  background: #f8fbff;
  border-bottom: 1px solid #e6f2ff;
}

.collapse-title {
  font-weight: 600;
  color: #2e6fb7;
  font-size: 1.1rem;
}

.collapse-toggle {
  font-size: 18px;
  color: #2e6fb7;
  background: #e6f2ff;
  border: 1px solid #b3d4fc;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.collapse-content {
  padding: 16px 20px;
}

.parent-title {
  font-weight: 700;
  color: #334e5c;
  margin: 8px 0;
}

.info-row hr {
  border: none;
  border-top: 1px solid #e6e6ea;
  margin: 12px 0;
}

/* Grid Layout for Information Display */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 24px;
}

.grid-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  min-height: 28px;
}

.grid-label {
  width: 140px;
  color: #2e6fb7;
  font-weight: 600;
  flex-shrink: 0;
}

.grid-value {
  color: #334e5c;
  font-weight: 500;
  flex: 1;
}

.divider {
  border-top: 1px solid #e6e6ea;
  margin: 16px 0;
}

/* Children Grid */
.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.child-card {
  background: #fff;
  border: 1px solid #b3d4fc;
  border-radius: 8px;
  padding: 12px;
}

.child-header {
  font-weight: 700;
  color: #334e5c;
  margin-bottom: 12px;
}

.child-card .info-grid {
  grid-template-columns: 1fr;
}

.review-card {
  background: #fff;
  border: 1px solid #e6e6ea;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(16, 24, 40, 0.04);
}

.review-card h3 {
  color: #2e6fb7;
  font-size: 1.2rem;
  margin-bottom: 16px;
  border-bottom: 2px solid #e6f2ff;
  padding-bottom: 8px;
}

.review-form {
  display: grid;
  gap: 16px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #2e6fb7;
  font-size: 1rem;
}

.form-input,
.form-input textarea {
  padding: 10px 12px;
  border: 1px solid #d8dbe0;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  font-family: inherit;
}

.form-input:focus,
.form-input textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
}

.btn.primary {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  color: #fff;
}

.btn.query {
  background: transparent;
  border: 1px solid #3b82f6;
  color: #2563eb;
}

.btn:hover {
  opacity: 0.9;
}

.btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.bottom-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 24px 0;
}

@media (max-width: 900px) {
  .announcement-page {
    width: 100%;
  }

  .announcement-card {
    width: 100%;
    padding: 0 12px;
  }

  .info-label {
    width: 100px;
  }

  .info-row {
    flex-direction: column;
    gap: 4px;
  }
}

/* Preview modal */
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-card {
  background: #fff;
  border-radius: 12px;
  width: min(900px, 92vw);
  height: min(80vh, 900px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #eee;
}

.preview-title {
  font-weight: 700;
  color: #334e5c;
}

.preview-close {
  background: transparent;
  border: none;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  color: #666;
}

.preview-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.preview-body img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-fallback {
  color: #666;
}

/* 附件列表樣式 */
.attachment-list {
  margin-top: 16px;
}

.attachment-list h4 {
  color: #2e6fb7;
  font-size: 1rem;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.attachment-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  padding: 10px 12px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
}

.file-link {
  color: #2563eb;
  text-decoration: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.file-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.empty-text {
  color: #666;
  font-size: 0.95rem;
  margin-top: 8px;
}
</style>
