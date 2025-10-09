<template>
  <div class="subsidy-page">

    <!-- 分頁導覽 -->
    <div class="section-btn-row">
      <div class="section-btn">身 分 資 格 輸 入</div>
    </div>
    <!-- 表單區塊 -->
    <div class="subsidy-form-container">
      <form class="subsidy-form" @submit.prevent>
        <div class="form-row">
          <div class="form-item">
            <label for="isCitizen">是否為新竹縣縣民</label>
            <select id="isCitizen" v-model="form.isCitizen" required>
              <option value="" disabled>請選擇</option>
              <option value="yes">是</option>
              <option value="no">否</option>
            </select>
          </div>
          <div class="form-item">
            <label for="fetusCount">胎數</label>
            <select id="fetusCount" v-model="form.fetusCount" required>
              <option value="" disabled>請選擇</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3+</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-item">
            <label for="childAge">申請幼兒年紀</label>
            <select id="childAge" v-model="form.childAge" required>
              <option value="" disabled>請選擇</option>
              <option value="0-2">0-2歲</option>
              <option value="3-6">2-6歲</option>
            </select>
          </div>
          <div class="form-item">
            <label for="isParentalLeave">正育嬰留停中</label>
            <select id="isParentalLeave" v-model="form.isParentalLeave" required>
              <option value="" disabled>請選擇</option>
              <option value="yes">是</option>
              <option value="no">否</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-item">
            <label for="identity">申請身分別</label>
            <select id="identity" v-model="form.identity" required>
              <option value="" disabled>請選擇</option>
              <option value="normal">一般</option>
              <option value="midlow">中低收入戶</option>
              <option value="low">低收入戶</option>
            </select>
          </div>
          <div class="form-item">
            <label for="org">托育機構選擇</label>
            <select id="org" v-model="form.org" required>
              <option value="" disabled>請選擇</option>
              <option value="A">公共托育機構</option>
              <option value="B">準公共托育機構</option>
            </select>
          </div>
        </div>
        <div class="btn-row">
          <button type="submit" class="submit-btn" @click="calcSubsidy">試算補助金額</button>
        </div>
        <div v-if="result !== null" class="result-row">
          <span>補助金額：</span>
          <span class="result-amount">{{ result }} 元/月</span>
        </div>
        <div v-else-if="tried" class="result-row not-eligible">
          不符合申請資格
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const form = ref({
  isCitizen: '',
  fetusCount: '',
  childAge: '',
  isParentalLeave: '',
  identity: '',
  org: ''
})
const result = ref(null)
const tried = ref(false)
function calcSubsidy() {
  tried.value = true
  // 不符合申請條件：非新竹縣縣民、育嬰留停、3-6歲
  if (
    form.value.isCitizen !== 'yes' ||
    form.value.isParentalLeave === 'yes' ||
    form.value.childAge === '3-6' ||
    !form.value.fetusCount ||
    !form.value.identity ||
    !form.value.org
  ) {
    result.value = null
    return
  }
  let base = 0
  let isPublic = form.value.org === 'A'
  let isQuasi = form.value.org === 'B'
  // 身分
  let id = form.value.identity
  // 胎數
  let fetus = Number(form.value.fetusCount)
  // 公托
  if (isPublic) {
    if (id === 'normal') base = 7000
    else if (id === 'midlow') base = 9000
    else if (id === 'low') base = 11000
  }
  // 準公托
  if (isQuasi) {
    if (id === 'normal') base = 13000
    else if (id === 'midlow') base = 15000
    else if (id === 'low') base = 17000
  }
  // 胎數加成
  if (fetus === 2) base += 1000
  if (fetus >= 3) base += 2000
  result.value = base
}
</script>

<style scoped>
.subsidy-page {
  min-height: 100vh;
  padding-bottom: 40px;
}
.page-header {
  padding: 24px 0 0 0;
  margin-bottom: 0;
}
.breadcrumb {
  color: #222;
  font-size: 1.1rem;
  margin-left: 32px;
  margin-bottom: 8px;
  font-weight: 500;
}
.main-title-row {
  display: flex;
  align-items: center;
  margin-left: 32px;
  margin-bottom: 0;
}
.main-title-icon {
  width: 48px;
  margin-right: 10px;
}
.main-title {
  color: #2176d2;
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: 2px;
}
.section-btn-row {
  display: flex;
  justify-content: center;
  margin: 32px 0 18px 0;
}
.section-btn {
  background: #f9afae;
  color: #333;
  font-size: 1.4rem;
  font-weight: bold;
  border-radius: 32px;
  padding: 12px 48px;
  letter-spacing: 8px;
  box-shadow: 0 2px 8px #f8b6b633;
  border: none;
  text-align: center;
  min-width: 320px;
}
.subsidy-form-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px #f8b6b633;
  max-width: 700px;
  margin: 0 auto;
  padding: 32px 24px 32px 24px;
  border: 1.5px solid #e0e0e0;
}
.subsidy-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.form-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}
.form-item {
  display: flex;
  flex-direction: column;
  width: 45%;
}
.form-item label {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
  letter-spacing: 2px;
  margin-left: 2px;
}
select {
  width: 100%;
  padding: 12px 10px;
  height: 48px;
  border: 1.5px solid #bdbdbd;
  border-radius: 8px;
  font-size: 18px;
  background: #f5f5f5;
  color: #666;
  outline: none;
  transition: border 0.2s;
}
select:focus {
  border: 1.5px solid #2176d2;
}
.btn-row {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
.submit-btn {
  width: 140px;
  height: 44px;
  font-size: 1.1rem;
  border-radius: 8px;
  background: #e3eaff;
  color: #2563eb;
  border: 2px solid #b2c6ff;
  box-shadow: 0 2px 8px #0001;
  font-weight: bold;
  letter-spacing: 1px;
  transition: 0.2s;
}
.submit-btn:hover {
  background: #2563eb;
  color: #fff;
}
.result-row {
  margin-top: 24px;
  text-align: center;
  font-size: 1.3rem;
  color: #2563eb;
  font-weight: bold;
  letter-spacing: 2px;
}
.result-row.not-eligible {
  color: #e57373;
  font-size: 1.3rem;
  font-weight: bold;
  letter-spacing: 2px;
  margin-top: 24px;
  text-align: center;
}
.result-amount {
  color: #e57373;
  font-size: 1.6rem;
  margin-left: 8px;
}
@media (max-width: 800px) {
  .main-title-row, .breadcrumb {
    margin-left: 10px;
  }
  .section-btn {
    min-width: 180px;
    font-size: 1.1rem;
    padding: 8px 16px;
  }
  .subsidy-form-container {
    max-width: 98vw;
    padding: 12px 2vw 24px 2vw;
  }
}
</style>
