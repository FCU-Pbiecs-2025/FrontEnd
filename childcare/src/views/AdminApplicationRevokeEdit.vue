<template>
  <div class="announcement-page">
    <div class="announcement-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/delete-sign.png" class="icon" alt="icon" />
        <span class="main-title">撤銷審核 - {{ revokeData.caseNumber || routeCaseNumber || revokeId }}</span>
      </div>

      <div class="detail-card">
        <h3>申請詳情</h3>
        <div class="detail-info">
          <div class="info-row">
            <label class="info-label">流水案號：</label>
            <span class="info-value">{{ revokeData.caseNumber || routeCaseNumber || revokeData.id }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">申請日期：</label>
            <span class="info-value">{{ revokeData.Date }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">申請人：</label>
            <span class="info-value">{{ revokeData.applicant }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">機構：</label>
            <span class="info-value">{{ revokeData.institution }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">撤銷原因：</label>
            <span class="info-value">{{ revokeData.reason }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">申請人身分證：</label>
            <span class="info-value">{{ revokeData.nationalID }}</span>
          </div>
        </div>
      </div>

      <!-- 摺疊區塊一：家長資料 -->
      <div class="collapse-card">
        <div class="collapse-header" @click="parentOpen = !parentOpen">
          <span class="collapse-title">家長資料</span>
          <span class="collapse-toggle">{{ parentOpen ? '▲' : '▼' }}</span>
        </div>
        <transition name="collapse">
          <div v-show="parentOpen" class="collapse-content">
            <template v-for="(parent, idx) in parentList" :key="idx">
              <div class="parent-title">家長資料{{ idx + 1 }}</div>
              <div class="info-row"><label class="info-label">身分證字號/護照號碼：</label><span class="info-value">{{ parent.id }}</span></div>
              <div class="info-row"><label class="info-label">姓名：</label><span class="info-value">{{ parent.name }}</span></div>
              <div class="info-row"><label class="info-label">性別：</label><span class="info-value">{{ parent.gender }}</span></div>
              <div class="info-row"><label class="info-label">與幼兒關係：</label><span class="info-value">{{ parent.relation }}</span></div>
              <div class="info-row"><label class="info-label">職業：</label><span class="info-value">{{ parent.job }}</span></div>
              <div class="info-row"><label class="info-label">電話：</label><span class="info-value">{{ parent.phone }}</span></div>
              <div class="info-row"><label class="info-label">戶籍地址：</label><span class="info-value">{{ parent.householdAddr }}</span></div>
              <div class="info-row"><label class="info-label">通訊地址：</label><span class="info-value">{{ parent.contactAddr }}</span></div>
              <div class="info-row"><label class="info-label">電子信箱：</label><span class="info-value">{{ parent.email }}</span></div>
              <div class="info-row"><label class="info-label">出生年月日：</label><span class="info-value">{{ parent.birth }}</span></div>
              <div class="info-row"><label class="info-label">是否留停：</label><span class="info-value">{{ parent.suspend }}</span></div>
              <div class="info-row"><label class="info-label">留停訖：</label><span class="info-value">{{ parent.suspendEnd }}</span></div>
              <div class="info-row"><label class="info-label">參與身分類型：</label><span class="info-value">{{ parent.participantType }}</span></div>
              <hr v-if="idx !== parentList.length - 1" />
            </template>
          </div>
        </transition>
      </div>

      <!-- 摺疊區塊二：幼兒資料 -->
      <div class="collapse-card">
        <div class="collapse-header" @click="childOpen = !childOpen">
          <span class="collapse-title">幼兒資料</span>
          <span class="collapse-toggle">{{ childOpen ? '▲' : '▼' }}</span>
        </div>
        <transition name="collapse">
          <div v-show="childOpen" class="collapse-content">
            <div class="info-row"><label class="info-label">身分證字號：</label><span class="info-value">{{ childData.id }}</span></div>
            <div class="info-row"><label class="info-label">姓名：</label><span class="info-value">{{ childData.name }}</span></div>
            <div class="info-row"><label class="info-label">性別：</label><span class="info-value">{{ childData.gender }}</span></div>
            <div class="info-row"><label class="info-label">出生年月日：</label><span class="info-value">{{ childData.birth }}</span></div>
            <div class="info-row"><label class="info-label">年齡：</label><span class="info-value">{{ childData.age }}</span></div>
            <div class="info-row"><label class="info-label">戶籍地址：</label><span class="info-value">{{ childData.householdAddr }}</span></div>
            <div class="info-row"><label class="info-label">通訊地址：</label><span class="info-value">{{ childData.contactAddr }}</span></div>
          </div>
        </transition>
      </div>

      <div class="bottom-row">
        <button class="btn danger" @click="confirmRevoke">確認撤銷</button>
        <button class="btn query" @click="goBack">返回列表</button>
      </div>

      <div v-if="isLoading" class="loading">資料載入中...</div>
      <div v-else-if="notFound" class="not-found">未找到此撤銷申請資料（ID: {{ revokeId }}）</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchRevokeDetails } from '@/api/revokes'
import http from '@/api/http'

// 取得路由參數與查詢
const router = useRouter()
const route = useRoute()

// 從路由參數取得 cancellationID，nationalID 可以從 query 或 params 傳入
const revokeId = ref(route.params.id)
const routeCaseNumber = ref(route.query.caseNumber || '') // 改為從 query 讀取 caseNumber
const nationalIDParam = ref(route.query.nationalID || route.params.nationalID || '')

// 基本資料
const revokeData = ref({})
const parentList = ref([])
const childData = ref({})
const parentOpen = ref(false)
const childOpen = ref(false)
const isLoading = ref(false)
const notFound = ref(false)

// 計算幼兒年齡函式保留
function getChildAge(birthDate) {
  if (!birthDate) {
    console.log('No birthDate provided')
    return ''
  }

  console.log('Calculating age for birthDate:', birthDate)

  try {
    let birthArr
    if (birthDate.includes('/')) {
      birthArr = birthDate.split('/')
    } else if (birthDate.includes('-')) {
      birthArr = birthDate.split('-')
    } else {
      console.log('Invalid date format:', birthDate)
      return ''
    }

    let birthYear = parseInt(birthArr[0])
    let birthMonth = parseInt(birthArr[1])
    let birthDay = parseInt(birthArr[2])

    console.log('Parsed birth date:', { birthYear, birthMonth, birthDay })

    if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) {
      console.log('Invalid date components')
      return ''
    }

    let now = new Date()
    let nowYear = now.getFullYear()
    let nowMonth = now.getMonth() + 1
    let nowDay = now.getDate()

    console.log('Current date:', { nowYear, nowMonth, nowDay })

    let totalMonths = (nowYear - birthYear) * 12 + (nowMonth - birthMonth)
    let days = nowDay - birthDay

    if (days < 0) {
      totalMonths--
      let prevMonth = nowMonth - 1
      let prevYear = nowYear
      if (prevMonth === 0) {
        prevMonth = 12
        prevYear--
      }
      let daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate()
      days = daysInPrevMonth + days
    }

    let years = Math.floor(totalMonths / 12)
    let months = totalMonths % 12
    let weeks = Math.floor(days / 7)

    const result = `${years}歲${months}月${weeks}周`
    console.log('Calculated age:', result)
    return result
  } catch (error) {
    console.error('Error calculating age:', error)
    return ''
  }
}

// 載入撤銷申請詳細資料（必須有 cancellationID 與 nationalID 才能撈完整詳細）
onMounted(async () => {
  console.log('Component mounted, revokeId:', revokeId.value, 'nationalID:', nationalIDParam.value)
  isLoading.value = true
  notFound.value = false

  try {
    if (!revokeId.value) {
      console.warn('No cancellationID provided')
      notFound.value = true
      revokeData.value = { id: '' }
      return
    }

    const data = await fetchRevokeDetails(revokeId.value, nationalIDParam.value)
    console.log('Received data from API (mapped):', data)

    if (data && data.revokeInfo) {
      revokeData.value = data.revokeInfo
      parentList.value = data.parents || []
      childData.value = data.child || {}

      // 若 child 有出生日期則計算年齡
      if (childData.value.birth) {
        childData.value.age = getChildAge(childData.value.birth)
      }
    } else {
      console.log('No mapped data received, setting notFound to true')
      notFound.value = true
      revokeData.value = { id: revokeId.value }
    }
  } catch (e) {
    console.error('載入撤銷申請失敗:', e)
    notFound.value = true
    revokeData.value = { id: revokeId.value }
  } finally {
    isLoading.value = false
  }
})

async function confirmRevoke() {
  // 取得撤銷ID
  const cancellationID = revokeId.value
  // 取得今天日期 yyyy-MM-dd
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const confirmDate = `${yyyy}-${mm}-${dd}`

  try {
    // 第一個 PUT：更新撤銷確認日期
    await http.put('/revoke/confirm-date', {
      cancellationID,
      confirmDate
    })

    // 第二個 PUT：更新 application_participants 表的 Status 為 '撤銷申請通過'
    console.log('revokeData for update-participant-status:', revokeData.value)
    await http.put('/revoke/update-participant-status', {
      ApplicationID: revokeData.value.applicationID.toUpperCase(),
      NationalID: revokeData.value.nationalID.toUpperCase(),
      Status: '撤銷申請通過'
    })

    // 成功後返回列表
    goBack()
  } catch (e) {
    alert('確認撤銷失敗，請稍後再試')
    console.error(e)
  }
}

function goBack() {
  router.push({ name: 'AdminApplicationRevoke', query: { refresh: '1' } })
}
</script>

<style scoped>
.announcement-page {
  display: flex;
  justify-content: center;
}

.announcement-card {
  max-width: 820px;
  min-width: 85%;
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
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(16, 24, 40, 0.04);
}

.detail-card h3 {
  color: #2e6fb7;
  font-size: 1.2rem;
  margin-bottom: 20px;
  border-bottom: 2px solid #e6f2ff;
  padding-bottom: 10px;
}

.detail-info {
  display: grid;
  gap: 16px;
}

.info-row {
  display: flex;
  align-items: center;
}

.info-label {
  width: 120px;
  font-weight: 600;
  color: #2e6fb7;
}

.info-value {
  color: #334e5c;
  font-weight: 500;
}

.bottom-row {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn.danger {
  background: linear-gradient(90deg, #ef4444, #dc2626);
  color: #fff;
}

.btn.danger:hover {
  background: linear-gradient(90deg, #dc2626, #b91c1c);
}

.btn.query {
  background: #e6f2ff;
  color: #2e6fb7;
  border: 1px solid #b3d4fc;
}

.btn.query:hover {
  background: #d1e7ff;
}

.collapse-card {
  background: #fff;
  border: 1px solid #e6e6ea;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(16, 24, 40, 0.04);
}
.collapse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 18px 24px;
  font-weight: 600;
  color: #2e6fb7;
  font-size: 1.1rem;
  border-bottom: 1px solid #e6f2ff;
}
.collapse-title {
  letter-spacing: 1px;
}
.collapse-toggle {
  font-size: 1.2rem;
}
.collapse-content {
  padding: 18px 24px;
  animation: fadeIn 0.3s;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.parent-title {
  font-weight: bold;
  color: #2e6fb7;
  margin-bottom: 8px;
  margin-top: 12px;
}
hr {
  border: none;
  border-top: 1px solid #e6e6ea;
  margin: 16px 0;
}

.loading { padding: 24px; text-align:center; color:#2e6fb7; font-weight:600 }
.not-found { padding: 24px; text-align:center; color:#dc2626; font-weight:600 }

@media (max-width: 900px) {
  .announcement-card {
    width: 100%;
    padding: 16px;
  }

  .detail-card {
    padding: 16px;
  }
}
</style>
