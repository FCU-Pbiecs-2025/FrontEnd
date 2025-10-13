<template>
  <div class="apply-service-page">
    <!-- 頁面標題與路徑 -->

    <!-- 步驟條 -->
    <div class="step-bar-outer">
      <div class="step-bar-4">
        <div class="step4" :class="{active: step === 1}">
          <img src="https://img.icons8.com/ios-filled/50/4a90e2/edit-user-male.png" alt="填寫資料" />
          <span>填寫申請表</span>
        </div>
        <div class="arrow">&raquo;</div>
        <div class="step4" :class="{active: step === 2}">
          <img src="https://img.icons8.com/ios/60/4a90e2/upload.png" alt="上傳身份附件" />
          <span>上傳身份附件</span>
        </div>
        <div class="arrow">&raquo;</div>
        <div class="step4" :class="{active: step === 3}">
          <img src="https://img.icons8.com/ios/60/4a90e2/classroom.png" alt="選擇機構" />
          <span>選擇機構</span>
        </div>
        <div class="arrow">&raquo;</div>
        <div class="step4" :class="{active: step === 4}">
          <img src="https://img.icons8.com/ios/60/4a90e2/ok.png" alt="完成" />
          <span>完成</span>
        </div>
      </div>
    </div>

    <!-- 粉色圓角大按鈕 -->
    <div class="section-btn-row">
      <div class="section-btn">填 寫 申 請 表</div>
    </div>

    <div class="apply-container">
      <!-- 登入判斷 -->
      <div v-if="!authStore.isLoggedIn" class="login-section">
        <div class="login-tip">提醒：登入後即可進行申請</div>
        <LoginView />
      </div>

      <!-- 步驟一：申請表單 -->
      <form v-else-if="step === 1" class="apply-form" @submit.prevent="submitForm">
        <!-- 申請人資料 fieldset 上方的同會員資料，靠右 -->
        <div class="form-row form-row-top">
          <div class="form-top-right">
            <input type="checkbox" id="sameAsMemberApplicant" v-model="sameAsMember.applicant" />
            <label for="sameAsMemberApplicant" class="legend-check-text">同會員資料</label>
          </div>
        </div>

        <!-- 申請人資料 -->
        <fieldset class="form-section">
          <legend class="form-legend">
            <span class="legend-title">申請人資料</span>
          </legend>
          <div class="form-row">
            <label>姓名</label>
            <input v-model="form.applicant.name" type="text" />
          </div>
          <div class="form-row">
            <label>生日</label>
            <input v-model="form.applicant.birth" type="date" />
          </div>
          <div class="form-row">
            <label>身分證</label>
            <input v-model="form.applicant.id" type="text" />
          </div>
          <div class="form-row">
            <label>家長類別</label>
            <select v-model="form.applicant.parentType">
              <option value="">請選擇</option>
              <option value="父親">父親</option>
              <option value="母親">母親</option>
              <option value="監護人">監護人</option>
            </select>
          </div>
          <div class="form-row">
            <label>教育程度</label>
            <select v-model="form.applicant.education">
              <option value="">請選擇</option>
              <option value="國小">國小</option>
              <option value="國中">國中</option>
              <option value="高中">高中</option>
              <option value="大學">大學</option>
              <option value="碩士">碩士</option>
              <option value="博士">博士</option>
            </select>
          </div>
        </fieldset>

        <!-- 聯絡資料 -->
        <fieldset class="form-section">
          <legend class="form-legend">
            <span class="legend-title">申請人聯絡資料</span>
          </legend>
          <div class="form-row">
            <label>戶籍地址</label>
            <input v-model="form.contact.homeAddress" type="text" />
          </div>
          <div class="form-row">
            <label>通訊地址</label>
            <input v-model="form.contact.mailAddress" type="text" />
          </div>
          <div class="form-row">
            <label>行動電話</label>
            <input v-model="form.contact.mobile" type="tel" />
          </div>
          <div class="form-row">
            <label>電子信箱</label>
            <input v-model="form.contact.email" type="email" />
          </div>
        </fieldset>

        <!-- 家長1 fieldset 上方的同會員資料，靠右 -->
        <div class="form-row form-row-top">
          <div class="form-top-right">
            <input type="checkbox" id="sameAsMemberParent1" v-model="sameAsMember.parent1" />
            <label for="sameAsMemberParent1" class="legend-check-text">同會員資料</label>
          </div>
        </div>
        <!-- 家長1資料 -->
        <fieldset class="form-section">
          <legend class="form-legend">
            <span class="legend-title">家長1</span>
          </legend>
          <div class="form-row">
            <label>姓名</label>
            <input v-model="form.parent1.name" type="text" />
          </div>
          <div class="form-row">
            <label>生日</label>
            <input v-model="form.parent1.birth" type="date" />
          </div>
          <div class="form-row">
            <label>身分證</label>
            <input v-model="form.parent1.id" type="text" />
          </div>
          <div class="form-row">
            <label>家長類別</label>
            <select v-model="form.parent1.parentType">
              <option value="">請選擇</option>
              <option value="父親">父親</option>
              <option value="母親">母親</option>
              <option value="監護人">監護人</option>
            </select>
          </div>
          <div class="form-row">
            <label>教育程度</label>
            <select v-model="form.parent1.education">
              <option value="">請選擇</option>
              <option value="國小">國小</option>
              <option value="國中">國中</option>
              <option value="高中">高中</option>
              <option value="大學">大學</option>
              <option value="碩士">碩士</option>
              <option value="博士">博士</option>
            </select>
          </div>
          <div class="form-row">
            <label>戶籍地址</label>
            <input v-model="form.parent1.homeAddress" type="text" />
          </div>
          <div class="form-row">
            <label>行動電話</label>
            <input v-model="form.parent1.mobile" type="tel" />
          </div>
          <div class="form-row">
            <label>任職單位</label>
            <input v-model="form.parent1.company" type="text" />
          </div>
        </fieldset>

        <!-- 家長2資料 -->
        <fieldset class="form-section">
          <legend class="form-legend">
            <span class="legend-title">家長2</span>
          </legend>
          <div class="form-row">
            <label>姓名</label>
            <input v-model="form.parent2.name" type="text" />
          </div>
          <div class="form-row">
            <label>生日</label>
            <input v-model="form.parent2.birth" type="date" />
          </div>
          <div class="form-row">
            <label>身分證</label>
            <input v-model="form.parent2.id" type="text" />
          </div>
          <div class="form-row">
            <label>家長類別</label>
            <select v-model="form.parent2.parentType">
              <option value="">請選擇</option>
              <option value="父親">父親</option>
              <option value="母親">母親</option>
              <option value="監護人">監護人</option>
            </select>
          </div>
          <div class="form-row">
            <label>教育程度</label>
            <select v-model="form.parent2.education">
              <option value="">請選擇</option>
              <option value="國小">國小</option>
              <option value="國中">國中</option>
              <option value="高中">高中</option>
              <option value="大學">大學</option>
              <option value="碩士">碩士</option>
              <option value="博士">博士</option>
            </select>
          </div>
          <div class="form-row">
            <label>戶籍地址</label>
            <input v-model="form.parent2.homeAddress" type="text" />
          </div>
          <div class="form-row">
            <label>行動電話</label>
            <input v-model="form.parent2.mobile" type="tel" />
          </div>
          <div class="form-row">
            <label>任職單位</label>
            <input v-model="form.parent2.company" type="text" />
          </div>
        </fieldset>

        <div class="form-actions">
          <button type="submit" class="submit-btn">送出</button>
          <button type="reset" class="reset-btn">重設</button>
        </div>
      </form>



      <!-- 步驟二：上傳身份附件 -->
      <div v-else-if="step === 2" class="upload-section">
        <!-- 新增：申請之身分別下拉選單，顯示於步驟2（上傳附件）上方 -->
        <label style="min-width: 120px;">申請之身分別</label>
        <select v-model="identityTypeSelect">
          <option value="">請選擇申請之身分別</option>
          <option value="低收入戶">低收入戶</option>
          <option value="中低收入戶">中低收入戶</option>
        </select>
        <h2 class="upload-title">上傳身份附件</h2>
        <div class="upload-tip">請上傳您的身份證明文件（如身分證、戶口名簿等）</div>
        <input type="file" class="upload-input" multiple @change="handleFileChange" />
        <ul class="file-list" v-if="uploadedFiles.length">
          <li v-for="(item, idx) in uploadedFiles" :key="item.file.name + item.file.size + item.file.lastModified" class="file-item">
            <span v-if="item.previewUrl">
              <img :src="item.previewUrl" alt="預覽" class="file-preview" />
            </span>
            <span>{{ item.file.name }}</span>
            <button type="button" class="file-remove" @click="removeFile(idx)">刪除</button>
          </li>
        </ul>
        <div class="upload-actions">
          <button class="submit-btn" type="button" @click="handleUpload" :disabled="!uploadedFiles.length">完成上傳</button>
        </div>
      </div>

      <!-- 步驟三：選擇機構與幼兒資料 -->
      <div v-else-if="step === 3" class="agency-step">
        <div class="agency-block">
          <label class="agency-label">選擇機構：</label>
          <select v-model="selectedAgency" class="agency-select">
            <option value="">請選擇</option>
            <option v-for="a in agencyOptions" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
        <div class="children-block">
          <div class="children-header">
            <h2 class="children-title">幼兒資料</h2>
            <button type="button" class="add-child-btn" @click="addChild" :disabled="children.length >= maxChildren">新增幼兒</button>
          </div>
          <div class="child-forms">
            <div v-for="(child, idx) in children" :key="child.id" class="child-form-card">
              <div class="child-form-header">
                <span class="child-tag">幼兒{{ idx + 1 }}</span>
                <button type="button" class="remove-child-btn" v-if="children.length > 1" @click="removeChild(idx)">刪除</button>
              </div>
              <div class="child-form-grid">
                <label class="child-field">
                  <span class="field-label">幼兒</span>
                  <select v-model="child.name" class="field-select">
                    <option value="">請選擇</option>
                    <option v-for="n in childNameOptions" :key="n" :value="n">{{ n }}</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
          <div class="children-footer">
            <button type="button" class="prev-btn" @click="step = 2">回上一步</button>
            <button type="button" class="next-btn" @click="goToFinish" :disabled="!canProceedStep3">下一步</button>
          </div>
        </div>
      </div>

      <!-- 步驟四：完成頁面 -->
      <div v-else-if="step === 4" class="finish-step">
        <div class="finish-card">
          <div class="finish-icon">✅</div>
          <h2 class="finish-title">申請已完成送出</h2>
          <p class="finish-desc">以下為您此次填寫的摘要，可截圖或列印保存。</p>
          <div class="finish-summary">
            <div class="summary-block">
              <h3>機構</h3>
              <p v-if="selectedAgency">{{ selectedAgency }}</p>
              <p v-else class="empty-text">未選擇</p>
            </div>
            <div class="summary-block">
              <h3>幼兒名單 ({{ children.length }} 位)</h3>
              <ul>
                <li v-for="c in children" :key="c.id">{{ c.name || '未選擇' }}</li>
              </ul>
            </div>
            <div class="summary-block">
              <h3>附件檔案 ({{ uploadedFiles.length }} 件)</h3>
              <ul>
                <li v-for="(f,i) in uploadedFiles" :key="i">{{ f.file.name }}</li>
              </ul>
            </div>
          </div>
          <div class="finish-actions">
            <button type="button" class="finish-btn primary" @click="startNew">再填一份</button>
            <button type="button" class="finish-btn secondary" @click="goHome">回首頁</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import LoginView from './LoginView.vue'
import { useAuthStore } from '@/store/auth.js'

const authStore = useAuthStore()

const step = ref(1) // 目前步驟，預設1

// 登入表單
const loginForm = ref({
  username: '',
  password: '',
  captcha: ''
})
const login = () => {
  // 模擬登入
  authStore.isLoggedIn = true
}

// 申請表單資料
const form = ref({
  applicant: {
    name: '',
    birth: '',
    id: '',
    parentType: '',
    education: ''
  },
  contact: {
    homeAddress: '',
    mailAddress: '',
    mobile: '',
    email: ''
  },
  parent1: {
    name: '',
    birth: '',
    id: '',
    parentType: '',
    education: '',
    homeAddress: '',
    mobile: '',
    company: ''
  },
  parent2: {
    name: '',
    birth: '',
    id: '',
    parentType: '',
    education: '',
    homeAddress: '',
    mobile: '',
    company: ''
  }
})

// 同會員資料 checkbox 狀態
const sameAsMember = ref({
  applicant: false,
  parent1: false
})

// 上傳檔案狀態
const uploadedFiles = ref([])

function handleFileChange(e) {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    // 檢查是否已存在
    if (!uploadedFiles.value.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) {
      let previewUrl = ''
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file)
      }
      uploadedFiles.value.push({ file, previewUrl })
    }
  })
  e.target.value = ''
}
function removeFile(idx) {
  const removed = uploadedFiles.value.splice(idx, 1)[0]
  if (removed && removed.previewUrl) {
    URL.revokeObjectURL(removed.previewUrl)
  }
}
function handleUpload() {
  if(!uploadedFiles.value.length){
    alert('請先選擇至少一個檔案再繼續')
    return
  }
  // TODO: 可在此呼叫實際上傳 API，成功後再前往下一步
  step.value = 3 // 上傳完成 -> 進入選擇機構步驟
}
onBeforeUnmount(() => {
  // 釋放所有預覽網址
  uploadedFiles.value.forEach(f => {
    if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
  })
})
const submitForm = () => {
  // 不檢查內容，直接進入下一步
  step.value = 2 // 切換到上傳附件步驟
}

// Step3 選擇機構與幼兒資料狀態
const agencyOptions = ref(["機構A","機構B","機構C","機構D"])
const selectedAgency = ref("")
const maxChildren = 5
// 動態幼兒名單資料（後端取得）
const children = ref([
  { id: Date.now(), name: "", gender: "", age: "", nationality: "" }
])
const childNameOptions = ref(['小明', '小芳', '小安', '小美', '小寶', '小華', '小強', '小麗', '小宇', '小晴'])
function addChild(){
  if(children.value.length < maxChildren){
    children.value.push({ id: Date.now() + Math.random(), name: "", gender: "", age: "", nationality: "" })
  }
}
function removeChild(index){
  children.value.splice(index,1)
}
// 若已登入並直接跳到第3步（保險）
if(step.value === 3) fetchChildren()

const canProceedStep3 = computed(()=>{
  if(!selectedAgency.value) return false
  // 僅檢查幼兒姓名 (目前介面只有姓名下拉)
  return children.value.every(c=>c.name)
})
function goToFinish(){
  if(canProceedStep3.value){
    step.value = 4
  }
}

function startNew(){
  // 釋放舊的預覽 URL
  uploadedFiles.value.forEach(f=>{ if(f.previewUrl) URL.revokeObjectURL(f.previewUrl) })
  uploadedFiles.value = []
  selectedAgency.value = ''
  children.value = [{ id: Date.now(), name: '', gender:'', age:'', nationality:'' }]
  form.value = {
    applicant:{ name:'', birth:'', id:'', parentType:'', education:'' },
    contact:{ homeAddress:'', mailAddress:'', mobile:'', email:'' },
    parent1:{ name:'', birth:'', id:'', parentType:'', education:'', homeAddress:'', mobile:'', company:'' },
    parent2:{ name:'', birth:'', id:'', parentType:'', education:'', homeAddress:'', mobile:'', company:'' }
  }
  sameAsMember.value = { applicant:false, parent1:false }
  step.value = 1
  window.scrollTo({top:0, behavior:'smooth'})
}
const router = useRouter()
function goHome(){
  // 使用路由跳轉回首頁
  router.push('/')
}
</script>

<style scoped>
.apply-service-page {
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
.step-bar-outer {
  margin: 0 auto 0 auto;
  max-width: 900px;
  padding: 0 0 0 0;
  display: flex;
  justify-content: center;
}
.step-bar-4 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin: 24px 0 0 0;
}
.step4 {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f5f5f5;
  border-radius: 12px;
  border: 3px solid #e0e0e0;
  min-width: 110px;
  min-height: 110px;
  padding: 10px 8px 6px 8px;
  color: #888;
  font-size: 15px;
  font-weight: bold;
  box-shadow: 0 2px 8px #f8b6b633;
  transition: border 0.2s, background 0.2s, color 0.2s;
}
.step4.active {
  border: 3px solid #4a90e2;
  background: #eaf3fc;
  color: #2176d2;
}
.step4 img {
  width: 48px;
  margin-bottom: 6px;
}
.arrow {
  font-size: 2.2rem;
  color: #bdbdbd;
  margin: 0 10px;
  font-weight: bold;
  user-select: none;
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
.apply-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px #f8b6b633;
  max-width: 700px;
  margin: 0 auto;
  padding: 32px 24px 32px 24px;
}
.step-bar {
  display: none;
}
.login-section {
  background: #f9fafc;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 32px 24px;
  margin-bottom: 24px;
}
.login-tip {
  background: #fffbe6;
  color: #666;
  border: 1px solid #ffe0b2;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 18px;
  font-size: 15px;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.form-row label {
  width: 80px;
  color: #666;
  font-size: 15px;
}
.form-row input,
.form-row select {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 15px;
}
.captcha-row .captcha-img {
  margin-left: 8px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}
.refresh-captcha {
  margin-left: 8px;
  background: none;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  font-size: 13px;
}
.login-btn {
  background: #4a90e2;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 0;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 8px;
}
.apply-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.form-row-top {
  display: flex;
  justify-content: flex-end;
  margin-bottom: -8px;
}
.form-top-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.form-section {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 18px 18px 8px 18px;
  margin-bottom: 18px;
  background: #f9fafc;
}
.form-legend {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 1.1rem;
  font-weight: bold;
  color: #2176d2;
  border-bottom: 3px solid #e0e0e0;
  padding-bottom: 2px;
  margin-bottom: 12px;
  min-width: 180px;
}
.form-legend-right {
  flex-direction: row-reverse;
  justify-content: space-between;
}
.legend-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2176d2;
  letter-spacing: 2px;
}
.legend-check {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}
.legend-check input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #2176d2;
  margin-right: 4px;
}
.legend-check-text {
  color: #2176d2;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
}
.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 12px;
}
.submit-btn, .reset-btn {
  background: #4a90e2;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 32px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}
.reset-btn {
  background: #bdbdbd;
}
.form-top-right input[type="checkbox"],
.form-row-top input[type="checkbox"] {
  appearance: checkbox;
  -webkit-appearance: checkbox;
  width: auto;
  height: auto;
  border: none;
  border-radius: 0;
  background: none;
  outline: none;
  cursor: pointer;
  position: static;
  margin-right: 6px;
  transition: none;
}
.form-top-right input[type="checkbox"]:checked,
.form-row-top input[type="checkbox"]:checked {
  border-color: initial;
  background: initial;
}
.form-top-right input[type="checkbox"]:checked::before,
.form-row-top input[type="checkbox"]:checked::before {
  content: none;
}
.upload-section {
  background: #f9fafc;
  border-radius: 12px;
  box-shadow: 0 2px 8px #f8b6b633;
  padding: 32px 24px;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.upload-title {
  color: #2176d2;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 18px;
}
.upload-tip {
  color: #666;
  font-size: 1rem;
  margin-bottom: 18px;
}
.upload-input {
  margin-bottom: 24px;
}
.upload-actions {
  display: flex;
  justify-content: center;
}
.file-list {
  width: 100%;
  margin-bottom: 18px;
  padding: 0;
  list-style: none;
}
.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #eee;
}
.file-preview {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  margin-right: 10px;
  border: 1px solid #e0e0e0;
  vertical-align: top;
}
.file-remove {
  background: #f9afae;
  color: #333;
  border: none;
  border-radius: 6px;
  padding: 2px 12px;
  font-size: 0.95rem;
  cursor: pointer;
  margin-left: 10px;
}
.file-remove:hover {
  background: #e57373;
  color: #fff;
}
.agency-step {margin-top:8px; display:flex; flex-direction:column; gap:24px;}
.agency-block {display:flex; align-items:center; gap:12px; background:#f9fafc; padding:16px 18px; border:1px solid #e0e0e0; border-radius:12px;}
.agency-label {font-weight:600; color:#2176d2;}
.agency-select {flex:1; padding:6px 10px; border:1px solid #d0d0d0; border-radius:6px;}
.children-block {background:#fff; border:1px solid #e0e0e0; border-radius:16px; padding:20px 20px 28px 20px; box-shadow:0 2px 6px #0000000d;}
.children-header {display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:12px;}
.children-title {color:#2176d2; font-size:1.3rem; letter-spacing:2px; margin:0;}
.add-child-btn {background:#4caf50; color:#fff; border:none; padding:8px 16px; border-radius:8px; cursor:pointer; font-weight:600; box-shadow:0 2px 4px #0000001a;}
.add-child-btn:disabled {background:#a5d6a7; cursor:not-allowed;}
.child-forms {display:flex; flex-direction:column; gap:18px;}
.child-form-card {border:1px solid #e0e0e0; border-radius:12px; background:#f9fafc; padding:16px 18px 12px 18px;}
.child-form-header {display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;}
.child-tag {background:#4a90e2; color:#fff; padding:4px 12px; border-radius:20px; font-size:0.9rem; font-weight:600; letter-spacing:1px;}
.remove-child-btn {background:#f2746b; color:#fff; border:none; padding:4px 12px; border-radius:6px; cursor:pointer; font-size:0.85rem;}
.remove-child-btn:hover {background:#e0554b;}
.child-form-grid {display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:14px 16px;}
.child-field {display:flex; flex-direction:column; gap:4px; font-size:0.85rem;}
.field-label {color:#555; font-weight:600; letter-spacing:1px;}
.field-select {padding:6px 8px; border:1px solid #d0d0d0; border-radius:6px; font-size:0.9rem; background:#fff;}
.children-footer {display:flex; justify-content:center; gap:24px; margin-top:22px;}
.prev-btn, .next-btn {background:#4a90e2; color:#fff; border:none; padding:10px 28px; font-size:1rem; border-radius:8px; cursor:pointer; font-weight:600; letter-spacing:2px;}
.prev-btn {background:#9e9e9e;}
.prev-btn:hover {background:#7d7d7d;}
.next-btn:disabled {background:#b0c9e4; cursor:not-allowed;}
.next-btn:hover:not(:disabled){background:#2176d2;}
.children-fetch-status {display:none;}
.finish-step {display:flex; justify-content:center;}
.finish-card {background:#fff; border:1px solid #e0e0e0; border-radius:18px; padding:32px 28px 40px 28px; max-width:640px; width:100%; text-align:center; box-shadow:0 4px 12px #00000014;}
.finish-icon {font-size:56px; margin-bottom:12px;}
.finish-title {font-size:1.8rem; color:#2176d2; margin:0 0 8px 0; letter-spacing:2px;}
.finish-desc {color:#666; margin:0 0 24px 0;}
.finish-summary {display:grid; gap:20px; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); text-align:left; margin-bottom:28px;}
.summary-block h3 {margin:0 0 6px 0; font-size:1rem; color:#4a90e2;}
.summary-block ul {margin:0; padding-left:18px; font-size:0.9rem; line-height:1.5;}
.summary-block p {margin:0; font-size:0.95rem;}
.empty-text {color:#aaa; font-style:italic;}
.finish-actions {display:flex; justify-content:center; gap:16px; flex-wrap:wrap;}
.finish-btn {border:none; cursor:pointer; padding:10px 26px; font-size:1rem; border-radius:8px; font-weight:600; letter-spacing:1px; box-shadow:0 2px 6px #00000012;}
.finish-btn.primary {background:#4a90e2; color:#fff;}
.finish-btn.primary:hover {background:#2176d2;}
.finish-btn.secondary {background:#bdbdbd; color:#fff;}
.finish-btn.secondary:hover {background:#9e9e9e;}
@media (max-width:760px){
  .child-form-grid {grid-template-columns:repeat(auto-fill,minmax(120px,1fr));}
  .add-child-btn {padding:6px 12px;}
  .prev-btn, .next-btn {padding:8px 20px; font-size:0.9rem;}
}
@media (max-width: 800px) {
  .main-title-row, .breadcrumb, .step-bar-4 {
    margin-left: 10px;
  }
  .section-btn {
    min-width: 180px;
    font-size: 1.1rem;
    padding: 8px 16px;
  }
  .apply-container {
    max-width: 98vw;
    padding: 12px 2vw 24px 2vw;
  }
  .page-title {
    padding-left: 10px;
    font-size: 1.3rem;
  }
  .form-legend {
    min-width: 100px;
    font-size: 1rem;
    gap: 8px;
  }
}
</style>
