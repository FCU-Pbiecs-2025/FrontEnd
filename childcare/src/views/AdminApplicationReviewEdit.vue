<template>
  <div class="announcement-page">
    <div class="announcement-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/approval.png" class="icon" alt="icon" />
        <span class="main-title">審核申請 - {{ applicationId }}</span>
      </div>

      <div class="detail-card">
        <h3>申請詳情</h3>
        <div class="detail-info">
          <div class="info-row">
            <label class="info-label">申請編號：</label>
            <span class="info-value">{{ applicationData.applicationId }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">申請日期：</label>
            <span class="info-value">{{ applicationData.applicationDate }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">機構：</label>
            <span class="info-value">{{ applicationData.institutionName }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">當前狀態：</label>
            <span class="info-value">{{ applicationData.status }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">審核日期：</label>
            <span class="info-value">{{ applicationData.reviewDate }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">審核員：</label>
            <span class="info-value">{{ applicationData.reviewer }}</span>
          </div>
          <div class="info-row">
            <label class="info-label">備註說明：</label>
            <span class="info-value">{{ applicationData.reason }}</span>
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
              <div class="info-row"><label class="info-label">身分證字號/護照號碼：</label><span class="info-value">{{ parent.nationalID }}</span></div>
              <div class="info-row"><label class="info-label">姓名：</label><span class="info-value">{{ parent.name }}</span></div>
              <div class="info-row"><label class="info-label">性別：</label><span class="info-value">{{ parent.gender }}</span></div>
              <div class="info-row"><label class="info-label">與幼兒關係：</label><span class="info-value">{{ parent.relationShip }}</span></div>
              <div class="info-row"><label class="info-label">職業：</label><span class="info-value">{{ parent.occupation }}</span></div>
              <div class="info-row"><label class="info-label">電話：</label><span class="info-value">{{ parent.phoneNumber }}</span></div>
              <div class="info-row"><label class="info-label">戶籍地址：</label><span class="info-value">{{ parent.householdAddress }}</span></div>
              <div class="info-row"><label class="info-label">通訊地址：</label><span class="info-value">{{ parent.mailingAddress }}</span></div>
              <div class="info-row"><label class="info-label">電子信箱：</label><span class="info-value">{{ parent.email }}</span></div>
              <div class="info-row"><label class="info-label">出生年月日：</label><span class="info-value">{{ parent.birthDate }}</span></div>
              <div class="info-row"><label class="info-label">是否留停：</label><span class="info-value">{{ parent.isSuspended ? '是' : '否' }}</span></div>
              <div class="info-row"><label class="info-label">留停訖：</label><span class="info-value">{{ parent.suspendEnd }}</span></div>
              <div class="info-row"><label class="info-label">狀態：</label><span class="info-value">{{ parent.status }}</span></div>
              <div class="info-row"><label class="info-label">備註：</label><span class="info-value">{{ parent.reason }}</span></div>
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
            <template v-for="(child, idx) in childList" :key="idx">
              <div class="parent-title">幼兒資料{{ idx + 1 }}</div>
              <div class="info-row"><label class="info-label">身分證字號：</label><span class="info-value">{{ child.nationalID }}</span></div>
              <div class="info-row"><label class="info-label">姓名：</label><span class="info-value">{{ child.name }}</span></div>
              <div class="info-row"><label class="info-label">性別：</label><span class="info-value">{{ child.gender }}</span></div>
              <div class="info-row"><label class="info-label">與家長關係：</label><span class="info-value">{{ child.relationShip }}</span></div>
              <div class="info-row"><label class="info-label">職業：</label><span class="info-value">{{ child.occupation }}</span></div>
              <div class="info-row"><label class="info-label">電話：</label><span class="info-value">{{ child.phoneNumber }}</span></div>
              <div class="info-row"><label class="info-label">戶籍地址：</label><span class="info-value">{{ child.householdAddress }}</span></div>
              <div class="info-row"><label class="info-label">通訊地址：</label><span class="info-value">{{ child.mailingAddress }}</span></div>
              <div class="info-row"><label class="info-label">電子信箱：</label><span class="info-value">{{ child.email }}</span></div>
              <div class="info-row"><label class="info-label">出生年月日：</label><span class="info-value">{{ child.birthDate }}</span></div>
              <div class="info-row"><label class="info-label">年齡：</label><span class="info-value">{{ child.age }}</span></div>
              <div class="info-row"><label class="info-label">是否留停：</label><span class="info-value">{{ child.isSuspended ? '是' : '否' }}</span></div>
              <div class="info-row"><label class="info-label">留停訖：</label><span class="info-value">{{ child.suspendEnd }}</span></div>
              <div class="info-row"><label class="info-label">狀態：</label><span class="info-value">{{ child.status }}</span></div>
              <div class="info-row"><label class="info-label">備註：</label><span class="info-value">{{ child.reason }}</span></div>
              <hr v-if="idx !== childList.length - 1" />
            </template>
          </div>
        </transition>
      </div>

      <div class="review-card">
        <h3>審核資訊</h3>
        <div class="review-form">
          <div class="form-row">
            <label class="form-label">審核日期：</label>
            <input type="date" v-model="reviewDate" class="form-input" />
          </div>
          <div class="form-row">
            <label class="form-label">審核結果：</label>
            <select v-model="reviewResult" class="form-input">
              <option value="">請選擇</option>
              <option value="通過">通過</option>
              <option value="需要補件">需要補件</option>
              <option value="退件">退件</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">備註說明：</label>
            <textarea v-model="reviewNote" class="form-input" rows="5" placeholder="請輸入審核備註..."></textarea>
          </div>
        </div>
      </div>

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
import { getApplicationById } from '@/api/application.js'

const router = useRouter()
const route = useRoute()

const applicationId = ref(route.params.id)
const applicationData = ref({})
const reviewDate = ref('')
const reviewResult = ref('')
const reviewNote = ref('')
const parentOpen = ref(false)
const childOpen = ref(false)
const parentList = ref([])
const childList = ref([])

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

onMounted(async () => {
  // 取得申請資料
  const response = await getApplicationById(applicationId.value)
  applicationData.value = response // 直接賦值，不用 response.data

  // 處理家長資料
  if (applicationData.value.parents && applicationData.value.parents.length > 0) {
    parentList.value = applicationData.value.parents
  }

  // 處理幼兒資料
  if (applicationData.value.children && applicationData.value.children.length > 0) {
    childList.value = applicationData.value.children
    childList.value.forEach(child => {
      child.age = getChildAge(child.birthDate)
    })
  }
})
</script>

<style scoped>
.announcement-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f4f9;
}

.announcement-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 800px;
  padding: 24px;
}

.title-row {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.icon {
  width: 48px;
  height: 48px;
  margin-right: 16px;
}

.main-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.detail-card, .review-card {
  background-color: #f9f9fb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.detail-info, .review-form {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.info-label {
  font-weight: 500;
  color: #555;
}

.info-value {
  font-weight: 400;
  color: #333;
}

.collapse-card {
  margin-bottom: 16px;
}

.collapse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 12px;
  background-color: #e9ecef;
  border-radius: 8px;
}

.collapse-title {
  font-weight: 500;
  color: #333;
}

.collapse-toggle {
  font-size: 18px;
  color: #777;
}

.collapse-content {
  padding: 0 12px 12px;
}

.parent-title {
  font-weight: 500;
  color: #007bff;
  margin: 16px 0 8px;
}

.review-card {
  background-color: #f9f9fb;
  border-radius: 8px;
  padding: 16px;
}

.form-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.form-label {
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
}

.form-input {
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
  color: #333;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.btn.primary {
  background-color: #007bff;
  color: #fff;
}

.btn.query {
  background-color: #6c757d;
  color: #fff;
}

.bottom-row {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}
</style>
