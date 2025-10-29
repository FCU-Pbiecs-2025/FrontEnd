<template>
  <div class="announcement-page">
    <div class="announcement-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/delete-sign.png" class="icon" alt="icon" />
        <span class="main-title">撤銷審核 - {{ revokeId }}</span>
      </div>

      <div class="detail-card">
        <h3>申請詳情</h3>
        <div class="detail-info">
          <div class="info-row">
            <label class="info-label">撤銷編號：</label>
            <span class="info-value">{{ revokeData.id }}</span>
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
          </div>
        </transition>
      </div>

      <div class="revoke-card">
        <h3>撤銷確認</h3>
        <div class="revoke-form">
          <div class="form-row">
            <label class="form-label">確認日期：</label>
            <input type="date" v-model="revokeDate" class="form-input" />
          </div>
          <div class="form-row">
            <label class="form-label">備註說明：</label>
            <textarea v-model="revokeNote" class="form-input" rows="5" placeholder="請輸入撤銷備註..."></textarea>
          </div>
        </div>
      </div>

      <div class="bottom-row">
        <button class="btn danger" @click="confirmRevoke">確認撤銷</button>
        <button class="btn query" @click="goBack">返回列表</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const revokeId = ref(route.params.id)
const revokeData = ref({})
const revokeDate = ref(new Date().toISOString().slice(0, 10))
const revokeNote = ref('')
const parentOpen = ref(false)
const childOpen = ref(false)

// 計算幼兒年齡
function getChildAge(birthDate) {
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

// 模擬資料 - 實際應用中這裡會從 API 獲取資料
const mockData = {
  'R2001': {
    id: 'R2001', Date: '2025/01/01', applicant: '張麗麗', institution: '快樂托育', reason: '資格不符', type: 'qualification',
    child: { id: 'B2001', name: '張小寶', gender: '女', birth: '2021/03/15', householdAddr: '台中市西屯區幸福路2號', age: getChildAge('2021/03/15') }
  },
  'R2002': {
    id: 'R2002', Date: '2025/01/01', applicant: '王小明', institution: '幸福幼兒園', reason: '文件不全', type: 'document',
    child: { id: 'B2002', name: '王小明', gender: '男', birth: '2020/05/10', householdAddr: '台北市中正區仁愛路1號', age: getChildAge('2020/05/10') }
  },
  'R2003': {
    id: 'R2003', Date: '2025/01/01', applicant: '李小華', institution: '陽光托育所', reason: '其他原因', type: 'other',
    child: { id: 'B2003', name: '李小華', gender: '男', birth: '2019/12/01', householdAddr: '高雄市鼓山區明誠路3號', age: getChildAge('2019/12/01') }
  },
  'R2004': {
    id: 'R2004', Date: '2025/01/01', applicant: '陳大同', institution: '愛心幼兒園', reason: '資格不符', type: 'qualification',
    child: { id: 'B2004', name: '陳大同', gender: '男', birth: '2022/08/20', householdAddr: '新竹市東區光復路4號', age: getChildAge('2022/08/20') }
  }
}

const parentList = ref([
  {
    id: 'A123456789',
    name: '王媽媽',
    gender: '女',
    relation: '母',
    job: '教師',
    phone: '0912-345678',
    householdAddr: '台北市中正區仁愛路1號',
    contactAddr: '台北市中正區信義路2號',
    email: 'parent1@example.com',
    birth: '1985/03/21',
    suspend: '否',
    suspendEnd: ''
  },
  {
    id: 'A987654321',
    name: '王爸爸',
    gender: '男',
    relation: '父',
    job: '工程師',
    phone: '0922-876543',
    householdAddr: '台北市中正區仁愛路1號',
    contactAddr: '台北市中正區信義路2號',
    email: 'parent2@example.com',
    birth: '1982/07/15',
    suspend: '否',
    suspendEnd: ''
  }
])

const childData = ref({
  id: 'B987654321',
  name: '王小明',
  gender: '男',
  birth: '2020/05/10',
  householdAddr: '台北市中正區仁愛路1號',
  age: ''
})

onMounted(() => {
  // 載入撤銷資料
  if (mockData[revokeId.value]) {
    revokeData.value = { ...mockData[revokeId.value] }
    childData.value = { ...mockData[revokeId.value].child }
    // 如果已有撤銷記錄，載入之前的撤銷資料
    if (revokeData.value.revokeDate) {
      revokeDate.value = revokeData.value.revokeDate
    }
    if (revokeData.value.revokeNote) {
      revokeNote.value = revokeData.value.revokeNote
    }
  } else {
    // 如果找不到資料，返回列表頁
    router.push('/admin/application-revoke')
  }
  if (!childData.value.age) {
    childData.value.age = getChildAge(childData.value.birth)
  }
})

function confirmRevoke() {
  if (!revokeNote.value.trim()) {
    alert('請輸入立案資料')
    return
  }

  // 這裡應該發送 API 請求保存撤銷結果
  console.log('撤銷資料:', {
    revokeId: revokeId.value,
    revokeDate: revokeDate.value,
    revokeNote: revokeNote.value
  })

  alert('撤銷完成！')
  goBack()
}

function goBack() {
  router.push('/admin/application-revoke')
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

.detail-card, .revoke-card {
  background: #fff;
  border: 1px solid #e6e6ea;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(16, 24, 40, 0.04);
}

.detail-card h3, .revoke-card h3 {
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

.revoke-form {
  display: grid;
  gap: 20px;
}

.form-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.form-label {
  width: 120px;
  font-weight: 600;
  color: #2e6fb7;
  margin-top: 8px;
}

.form-input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #d8dbe0;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2e6fb7;
  box-shadow: 0 0 0 2px rgba(46, 111, 183, 0.1);
}

.form-input[type="date"] {
  width: 200px;
}

select.form-input {
  width: 200px;
}

textarea.form-input {
  resize: vertical;
  min-height: 120px;
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
.collapse-enter-active, .collapse-leave-active {
  transition: max-height 0.3s cubic-bezier(.4,0,.2,1);
}
.collapse-enter-from, .collapse-leave-to {
  max-height: 0;
  overflow: hidden;
}
.collapse-enter-to, .collapse-leave-from {
  max-height: 300px;
  overflow: hidden;
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

@media (max-width: 900px) {
  .announcement-card {
    width: 100%;
    padding: 16px;
  }

  .detail-card, .revoke-card {
    padding: 16px;
  }

  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .form-label {
    width: auto;
    margin-top: 0;
    margin-bottom: 8px;
  }

  .form-input[type="date"], select.form-input {
    width: 100%;
  }
}
</style>
