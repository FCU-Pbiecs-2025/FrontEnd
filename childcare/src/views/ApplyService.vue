<template>
  <div class="apply-service-page">
    <!-- 頁面標題與路徑 -->

    <!-- 步驟條 -->
    <div class="step-bar-outer">
      <div class="step-bar-4">
        <div class="step4" :class="{active: step === 1, completed: step > 1}">
          <div class="step-icon">
            <img src="https://img.icons8.com/fluency/48/000000/edit.png" alt="填寫資料" />
          </div>
          <span>填寫申請表</span>
        </div>
        <div class="arrow">
          <img src="https://img.icons8.com/fluency/24/000000/forward.png" alt="下一步" />
        </div>
        <div class="step4" :class="{active: step === 2, completed: step > 2}">
          <div class="step-icon">
            <img src="https://img.icons8.com/fluency/48/000000/upload-to-cloud.png" alt="上傳身份附件" />
          </div>
          <span>上傳身份附件</span>
        </div>
        <div class="arrow">
          <img src="https://img.icons8.com/fluency/24/000000/forward.png" alt="下一步" />
        </div>
        <div class="step4" :class="{active: step === 3, completed: step > 3}">
          <div class="step-icon">
            <img src="https://img.icons8.com/fluency/48/000000/school.png" alt="選擇機構" />
          </div>
          <span>選擇機構</span>
        </div>
        <div class="arrow">
          <img src="https://img.icons8.com/fluency/24/000000/forward.png" alt="下一步" />
        </div>
        <div class="step4" :class="{active: step === 4, completed: false}">
          <div class="step-icon">
            <img src="https://img.icons8.com/fluency/48/000000/checked.png" alt="完成" />
          </div>
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
        <div class="notice-card">
          <h3>⚠️ 重要提醒：</h3>
          <div class="review-comment">登入後即可進行申請</div>
        </div>
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
          <div class="form-grid">
            <div class="form-row">
              <label>姓名</label>
              <input v-model="form.applicant.name" type="text" :disabled="sameAsMember.applicant" />
            </div>
            <div class="form-row">
              <label>生日</label>
              <input v-model="form.applicant.birth" type="date" :disabled="sameAsMember.applicant" />
            </div>
            <div class="form-row">
              <label>身分證</label>
              <input v-model="form.applicant.id" type="text" :disabled="sameAsMember.applicant" />
            </div>
<!--            新增性別欄位-->
            <div class="form-row">
              <label>性別</label>
              <select v-model="form.applicant.gender" :disabled="sameAsMember.applicant">
                <option value="">請選擇</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div class="form-row">
              <label>通訊地址</label>
              <input v-model="form.applicant.mailAddress" type="text" :disabled="sameAsMember.applicant" />
            </div>
            <div class="form-row">
              <label>行動電話</label>
              <input v-model="form.applicant.mobile" type="tel" :disabled="sameAsMember.applicant" />
            </div>
            <div class="form-row">
              <label>電子信箱</label>
              <input v-model="form.applicant.email" type="email" :disabled="sameAsMember.applicant" />
            </div>
          </div>
        </fieldset>

        <!-- 家長1 fieldset 上方的同會員資料，靠右 -->
        <div class="form-row form-row-top">
          <div class="form-top-right">
            <input type="checkbox" id="sameAsMemberParent1" v-model="sameAsMember.parent1" />
            <label for="sameAsMemberParent1" class="legend-check-text">同會員資料家長1</label>
          </div>
        </div>
        <!-- 家長1資料 -->
        <fieldset class="form-section">
          <legend class="form-legend">
            <span class="legend-title">家長1</span>
          </legend>
          <div class="form-grid">
            <div class="form-row">
              <label>姓名</label>
              <input v-model="form.parent1.name" type="text" />
            </div>
            <div class="form-row">
              <label>性別</label>
              <select v-model="form.parent1.gender">
                <option value="">請選擇</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div class="form-row">
              <label>生日</label>
              <input v-model="form.parent1.birth" type="date" />
            </div>
            <div class="form-row">
              <label>身分證</label>
              <input v-model="form.parent1.id" type="text" :disabled="sameAsMember.parent1" />
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
              <label>戶籍地址</label>
              <input v-model="form.parent1.homeAddress" type="text" />
            </div>
            <div class="form-row">
              <label>通訊地址</label>
              <input v-model="form.parent1.contactAddress" type="text" />
            </div>
            <div class="form-row">
              <label>行動電話</label>
              <input v-model="form.parent1.mobile" type="tel" />
            </div>
            <div class="form-row">
              <label>電子信箱</label>
              <input v-model="form.parent1.email" type="email" />
            </div>
            <div class="form-row">
              <label>任職單位</label>
              <input v-model="form.parent1.company" type="text" />
            </div>
            <div class="form-row">
              <label>是否留停</label>
              <input type="checkbox" v-model="form.parent1.isLeave" />
            </div>
            <div v-if="form.parent1.isLeave" class="leave-fields">
              <div class="form-row">
                <label>留停起</label>
                <input v-model="form.parent1.leaveStart" type="date" />
              </div>
              <div class="form-row">
                <label>留停訖</label>
                <input v-model="form.parent1.leaveEnd" type="date" />
              </div>
            </div>
          </div>
        </fieldset>

        <!-- 家長2資料 -->
        <div class="form-row form-row-top">
          <div class="form-top-right">
            <input type="checkbox" id="sameAsMemberParent2" v-model="sameAsMember.parent2" />
            <label for="sameAsMemberParent2" class="legend-check-text">同會員資料家長2</label>
          </div>
        </div>
        <fieldset class="form-section">
          <legend class="form-legend">
            <span class="legend-title">家長2</span>
          </legend>
          <div class="form-grid">
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
              <input v-model="form.parent2.id" type="text" :disabled="sameAsMember.parent2" />
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
              <label>任職單位</label>
              <input v-model="form.parent2.company" type="text" />
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
              <label>性別</label>
              <select v-model="form.parent2.gender">
                <option value="">請選擇</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div class="form-row">
              <label>通訊地址</label>
              <input v-model="form.parent2.contactAddress" type="text" />
            </div>
            <div class="form-row">
              <label>電子信箱</label>
              <input v-model="form.parent2.email" type="email" />
            </div>
            <div class="form-row">
              <label>是否留停</label>
              <input type="checkbox" v-model="form.parent2.isLeave" />
            </div>
            <div v-if="form.parent2.isLeave" class="leave-fields">
              <div class="form-row">
                <label>留停起</label>
                <input v-model="form.parent2.leaveStart" type="date" />
              </div>
              <div class="form-row">
                <label>留停訖</label>
                <input v-model="form.parent2.leaveEnd" type="date" />
              </div>
            </div>
          </div>
        </fieldset>

        <div class="form-actions">
          <button type="submit" class="submit-btn">送出</button>
          <button type="button" class="reset-btn" @click="startNew">重設</button>
        </div>
      </form>



      <!-- 步驟二：上傳身份附件 -->
      <div v-else-if="step === 2" class="upload-section">
        <!-- 驗證提示訊息區域 -->
        <div v-if="validationMessage" class="validation-msg">{{ validationMessage }}</div>

        <!-- 新增：申請之身分別下拉選單，顯示於步驟2（上傳附件）上方 -->
        <label style="min-width: 120px;">申請之身分別</label>
        <select v-model="identityTypeSelect" class="agency-select">
          <option value="">請選擇申請之身分別</option>
          <optgroup label="第一序位（名額為總收托人數20%）">
            <option value="弱勢家庭(含低收入戶、中低收入戶、危機家庭、特殊境遇家庭或經濟困難未成年父母)">1. 弱勢家庭(含低收入戶、中低收入戶、危機家庭、特殊境遇家庭或經社工評估有經濟困難未成年父母)</option>
            <option value="具原住民身分之嬰幼兒">2. 具原住民身分之嬰幼兒</option>
            <option value="發展遲緩或持有輕度身心障礙證明之嬰幼兒">3. 發展遲緩或持有輕度身心障礙證明之嬰幼兒</option>
            <option value="嬰幼兒其手足或父母或監護人之一為中度以上身心障礙者">4. 嬰幼兒其手足或父母或監護人之一為中度以上身心障礙者</option>
            <option value="家庭內育有雙胞胎或三位以上同胞子女之家庭">5. 家庭內育有雙胞胎或三位以上同胞子女之家庭</option>
          </optgroup>
          <optgroup label="第二序位（名額為總收托人數10%）">
            <option value="該公共托育機構員工之子女">1. 該公共托育機構員工之子女</option>
            <option value="提供辦理該公共托育機構場地之學校教職員工之子女">2. 提供辦理該公共托育機構場地之學校教職員工之子女</option>
          </optgroup>
          <optgroup label="第三序位">
            <option value="設籍本縣一般家庭嬰幼兒">設籍本縣一般家庭嬰幼兒</option>
          </optgroup>
        </select>
        <h2 class="upload-title">上傳身份附件</h2>
        <div class="notice-card">
          <h3>⚠️ 重要提醒</h3>
          <p class="review-comment">請上傳您的身份證明文件（如身分證、戶口名簿等），支援 JPG、PNG、PDF 格式，單檔不超過 5MB</p>
        </div>
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
          <button type="button" class="prev-btn" @click="step = 1">回上一步</button>
          <button type="button" class="next-btn" @click="goToNextStep" :disabled="!canProceedStep2">下一步</button>
        </div>
      </div>

      <!-- 步驟三：選擇機構與幼兒資料 -->
      <div v-else-if="step === 3" class="agency-step">

        <div class="agency-row">
          <label class="agency-label">申請之就讀機構</label>
          <select v-model="selectedAgency" class="agency-select">
            <option value="">請選擇申請之就讀機構</option>
            <option v-for="a in agencyOptions" :key="a" :value="a">{{ a }}</option>
            <option value="市政府">市政府</option>
          </select>
        </div>


        <div class="children-block">
          <div class="children-header">
            <h2 class="children-title">選擇就學幼兒</h2>
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
import { ref, onBeforeUnmount, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import LoginView from './LoginView.vue'
import { useAuthStore } from '@/store/auth.js'
import { getInstitutionsSimpleAll } from '@/api/Institution.js'

const authStore = useAuthStore()

const step = ref(1) // 目前步驟，預設1
const validationMessage = ref('') // 新增：儲存驗證提示訊息
const identityTypeSelect = ref('') // 新增：申請之身分別選擇

// 申請表單資料
const form = ref({
  applicant: { name: '', birth: '', id: '', homeAddress: '', mailAddress: '', mobile: '', email: '' },
  parent1: { name: '', birth: '', id: '', parentType: '', homeAddress: '', mobile: '', company: '', gender: '', contactAddress: '', email: '', isLeave: false, leaveStart: '', leaveEnd: '' },
  parent2: { name: '', birth: '', id: '', parentType: '', homeAddress: '', mobile: '', company: '', gender: '', contactAddress: '', email: '', isLeave: false, leaveStart: '', leaveEnd: '' }
})

// 改為三筆模擬資料：申請人 / 家長1 / 家長2
const mockProfiles = ref({
  applicant: {
    name: '陳小華',
    birth: '1992-03-15',
    id: 'B987654321',
    homeAddress: '台中市西屯區市政路100號',
    mailAddress: '台中市西屯區市政路100號',
    contactAddress: '台中市西屯區市政路100號',
    mobile: '0966888777',
    email: 'applicant@example.com',
    gender: '女',
    company: '申請人公司'
  },
  parent1: {
    name: '李大明',
    birth: '1985-01-20',
    id: 'C234567890',
    parentType: '父親',
    homeAddress: '台中市北區中清路200號',
    contactAddress: '台中市北區中清路200號',
    mobile: '0911222333',
    email: 'parent1@example.com',
    gender: '男',
    company: '家長公司A',
    // 模擬此位家長有留停
    isLeave: true,
    leaveStart: '2025-01-01',
    leaveEnd: '2025-06-30'
  },
  parent2: {
    name: '吳小英',
    birth: '1987-07-07',
    id: 'D345678901',
    parentType: '母親',
    homeAddress: '台中市南區復興路50號',
    contactAddress: '台中市南區復興路50號',
    mobile: '0922333444',
    email: 'parent2@example.com',
    gender: '女',
    company: '家長公司B',
    isLeave: false,
    leaveStart: '',
    leaveEnd: ''
  }
})


// 同會員資料 checkbox 狀態
const sameAsMember = ref({
  applicant: false,
  parent1: false,
  parent2: false
})

// 監聽同會員資料勾選，帶入或清空資料
watch(() => sameAsMember.value.applicant, (val) => {
  if (val) {
    // 帶入申請人專屬模擬資料（完整鎖死）
    const m = JSON.parse(JSON.stringify(mockProfiles.value.applicant))
    form.value.applicant = {
      name: m.name || '',
      birth: m.birth || '',
      id: m.id || '',
      homeAddress: m.homeAddress || '',
      mailAddress: m.mailAddress || m.contactAddress || '',
      mobile: m.mobile || '',
      email: m.email || ''
    }
  } else {
    // 取消勾選 -> 清空申請人資料
    form.value.applicant = { name:'', birth:'', id:'', homeAddress:'', mailAddress:'', mobile:'', email:'' }
  }
})

watch(() => sameAsMember.value.parent1, (val) => {
  if (val) {
    // 帶入家長1模擬資料（身分證欄位在 template 已設定 :disabled）
    const m = JSON.parse(JSON.stringify(mockProfiles.value.parent1))
    form.value.parent1 = {
      name: m.name || '',
      birth: m.birth || '',
      id: m.id || '',
      parentType: m.parentType || '',
      homeAddress: m.homeAddress || '',
      mobile: m.mobile || '',
      company: m.company || '',
      gender: m.gender || '',
      contactAddress: m.contactAddress || '',
      email: m.email || '',
      isLeave: !!m.isLeave,
      leaveStart: m.leaveStart || '',
      leaveEnd: m.leaveEnd || ''
    }
  } else {
    // 取消勾選 -> 清空家長1
    form.value.parent1 = { name:'', birth:'', id:'', parentType:'', homeAddress:'', mobile:'', company:'', gender:'', contactAddress:'', email:'', isLeave:false, leaveStart:'', leaveEnd:'' }
  }
})

watch(() => sameAsMember.value.parent2, (val) => {
  if (val) {
    const m = JSON.parse(JSON.stringify(mockProfiles.value.parent2))
    form.value.parent2 = {
      name: m.name || '',
      birth: m.birth || '',
      id: m.id || '',
      parentType: m.parentType || '',
      homeAddress: m.homeAddress || '',
      mobile: m.mobile || '',
      company: m.company || '',
      gender: m.gender || '',
      contactAddress: m.contactAddress || '',
      email: m.email || '',
      isLeave: !!m.isLeave,
      leaveStart: m.leaveStart || '',
      leaveEnd: m.leaveEnd || ''
    }
  } else {
    form.value.parent2 = { name:'', birth:'', id:'', parentType:'', homeAddress:'', mobile:'', company:'', gender:'', contactAddress:'', email:'', isLeave:false, leaveStart:'', leaveEnd:'' }
  }
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

// Step2 導航相關方法
const canProceedStep2 = computed(() => {
  // 檢查是否選擇了身分別和至少上傳一個檔案
  return identityTypeSelect.value && uploadedFiles.value.length > 0
})

const goToNextStep = () => {
  if (canProceedStep2.value) {
    validationMessage.value = ''
    step.value = 3 // 進入選擇機構步驟
  } else {
    if (!identityTypeSelect.value) {
      validationMessage.value = '請選擇申請之身分別'
    } else if (!uploadedFiles.value.length) {
      validationMessage.value = '請先選擇至少一個檔案再繼續'
    }
  }
}

// Step3 選擇機構與幼兒資料狀態
// 存儲從 API 獲取的機構列表（包含 institutionId 和 institutionName）
const institutionsData = ref([])
// agencyOptions 存儲機構名稱供下拉選單顯示
const agencyOptions = ref([])
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

// 轉換身分別描述為數字
function convertIdentityTypeToNumber(identityDescription) {
  const identityMap = {
    '弱勢家庭(含低收入戶、中低收入戶、危機家庭、特殊境遇家庭或經濟困難未成年父母)': 1,
    '具原住民身分之嬰幼兒': 1,
    '發展遲緩或持有輕度身心障礙證明之嬰幼兒': 1,
    '嬰幼兒其手足或父母或監護人之一為中度以上身心障礙者': 1,
    '家庭內育有雙胞胎或三位以上同胞子女之家庭': 1,
    '該公共托育機構員工之子女': 2,
    '提供辦理該公共托育機構場地之學校教職員工之子女': 2,
    '設籍本縣一般家庭嬰幼兒': 3
  }
  return identityMap[identityDescription] || 0
}

// 建構案件資料 JSON
function buildCaseData() {
  console.log('========== buildCaseData 被調用 ==========')
  
  const now = new Date()
  const applyDate = now.toISOString().split('T')[0]
  
  // 獲取選中機構的真實 ID
  let realInstitutionId = ''
  let realInstitutionName = selectedAgency.value || ''
  
  if (selectedAgency.value === '市政府') {
    realInstitutionId = '市政府'
    realInstitutionName = '市政府'
  } else if (selectedAgency.value) {
    const found = institutionsData.value.find(inst => inst.institutionName === selectedAgency.value)
    if (found) {
      realInstitutionId = found.institutionID || ''
      realInstitutionName = found.institutionName
      console.log('✅ 找到機構 ID:', realInstitutionId)
    }
  }
  
  console.log('🏢 機構信息 - ID:', realInstitutionId, ', Name:', realInstitutionName)

  // 轉換身分別為序位數字 (確保為整數)
  const identityTypeNumber = convertIdentityTypeToNumber(identityTypeSelect.value)

  // 建構家長列表 (只包含 parent1 和 parent2)
  const parentsList = []
  
  if (form.value.parent1.name) {
    parentsList.push({
      participantType: 1, // 整數 1 表示家長
      name: form.value.parent1.name,
      gender: form.value.parent1.gender,
      birthDate: form.value.parent1.birth,
      nationalID: form.value.parent1.id,
      parentType: form.value.parent1.parentType,
      homeAddress: form.value.parent1.homeAddress,
      contactAddress: form.value.parent1.contactAddress,
      mobile: form.value.parent1.mobile,
      email: form.value.parent1.email,
      company: form.value.parent1.company,
      isLeave: form.value.parent1.isLeave,
      leaveStart: form.value.parent1.leaveStart,
      leaveEnd: form.value.parent1.leaveEnd,
      classID: null
    })
  }
  
  if (form.value.parent2.name) {
    parentsList.push({
      participantType: 1, // 整數 1 表示家長
      name: form.value.parent2.name,
      gender: form.value.parent2.gender,
      birthDate: form.value.parent2.birth,
      nationalID: form.value.parent2.id,
      parentType: form.value.parent2.parentType,
      homeAddress: form.value.parent2.homeAddress,
      contactAddress: form.value.parent2.contactAddress,
      mobile: form.value.parent2.mobile,
      email: form.value.parent2.email,
      company: form.value.parent2.company,
      isLeave: form.value.parent2.isLeave,
      leaveStart: form.value.parent2.leaveStart,
      leaveEnd: form.value.parent2.leaveEnd,
      classID: null
    })
  }

  // 建構幼兒列表
  const childrenList = children.value.map((child, idx) => ({
    participantType: 0, // 整數 0 表示幼兒
    name: child.name,
    gender: child.gender,
    age: child.age,
    nationality: child.nationality,
    classID: null // 設置為 null
  }))

  const caseData = {
    caseNumber: Date.now(),
    applyDate: applyDate,
    identityType: identityTypeNumber,
    institutionId: realInstitutionId,
    institutionName: realInstitutionName,
    selectedClass: null, // 設置為 null
    status: '審核中', // 設置初始狀態為審核中
    currentOrder: 1,
    User: {
      name: form.value.applicant.name,
      birthDate: form.value.applicant.birth,
      nationalID: form.value.applicant.id,
      homeAddress: form.value.applicant.homeAddress,
      mailAddress: form.value.applicant.mailAddress,
      mobile: form.value.applicant.mobile,
      email: form.value.applicant.email,
      gender: form.value.applicant.gender
    },
    parents: parentsList,
    children: childrenList
  }

  console.log('📋 buildCaseData 完成:', JSON.stringify(caseData, null, 2))
  return caseData
}

function goToFinish(){
  if(canProceedStep3.value){
    // 建構並輸出案件資料
    const caseData = buildCaseData()
    console.log('🚀 準備提交的案件資料:', caseData)
    step.value = 4
  }
}

// 組件掛載時獲取機構列表
onMounted(async () => {
  try {
    console.log('📡 開始獲取機構列表...')
    const response = await getInstitutionsSimpleAll()
    console.log('📡 getInstitutionsSimpleAll 回應:', response)
    
    if (Array.isArray(response)) {
      institutionsData.value = response
      agencyOptions.value = response.map(inst => inst.institutionName)
      console.log('✅ 機構列表已載入:', institutionsData.value)
    } else {
      console.warn('⚠️ getInstitutionsSimpleAll 回傳非陣列')
      // 保留預設值
      agencyOptions.value = ['機構A', '機構B', '機構C', '機構D']
    }
  } catch (error) {
    console.error('❌ 獲取機構列表失敗:', error)
    // 發生錯誤時保留預設值
    agencyOptions.value = ['機構A', '機構B', '機構C', '機構D']
  }
})

function startNew(){
  // 釋放舊的預覽 URL
  uploadedFiles.value.forEach(f=>{ if(f.previewUrl) URL.revokeObjectURL(f.previewUrl) })
  uploadedFiles.value = []
  selectedAgency.value = ''
  children.value = [{ id: Date.now(), name: '', gender:'', age:'', nationality:'' }]
  form.value = {
    applicant:{ name:'', birth:'', id:'', homeAddress:'', mailAddress:'', mobile:'', email:'' },
    parent1:{ name:'', birth:'', id:'', parentType:'', homeAddress:'', mobile:'', company:'', gender:'', contactAddress:'', email:'', isLeave:false, leaveStart:'', leaveEnd:'' },
    parent2:{ name:'', birth:'', id:'', parentType:'', homeAddress:'', mobile:'', company:'', gender:'', contactAddress:'', email:'', isLeave:false, leaveStart:'', leaveEnd:'' }
  }
  sameAsMember.value = { applicant:false, parent1:false, parent2:false }
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
  min-height: calc(100vh - 160px);

  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 步驟條樣式 */
.step-bar-outer {
  max-width: 75%;
  margin: 20px auto;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.93);
}

.step-bar-4 {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px 20px;
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 140px;
  position: relative;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #FFF8F6, #fff);
  box-shadow: 0 8px 24px rgba(249, 175, 174, 0.3);
}

.step4 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 20px;
  border-radius: 16px;
  min-width: 140px;
}

/* 未完成狀態 */
.step4:not(.active):not(.completed) {
  opacity: 0.5;
  transform: scale(0.95);
}

.step4:not(.active):not(.completed) .step-icon {
  filter: grayscale(100%) brightness(0.8);
}

/* 當前步驟狀態 */
.step4.active {
  transform: scale(1.05);
}

.step4.active .step-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 8px rgba(249, 175, 174, 0.3));
}

.step4.active span {
  color: #F9AFAE;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(249, 175, 174, 0.2);
}



.step4.completed .step-icon::after {
  content: '✓';
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #7bb679;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 2px 4px rgb(122, 181, 120);
}

.step4.completed span {
  color: #7bb679;
  font-weight: 600;
}

/* 步驟圖標容器 */
.step-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.step-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(249, 175, 174, 0.1), transparent);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.step4.active .step-icon::before {
  opacity: 1;
}

.step-icon img {
  width: 36px;
  height: 36px;
  transition: all 0.3s ease;
  z-index: 1;
  position: relative;
}

/* 箭頭樣式 */
.arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.arrow img {
  width: 20px;
  height: 20px;
  filter: opacity(0.6);
  transition: all 0.3s ease;
}

.step4.active + .arrow img,
.step4.completed + .arrow img {
  filter: opacity(1);
  transform: scale(1.1);
}

/* 步驟文字 */
.step4 span {
  font-size: 0.95rem;
  font-weight: 500;
  color: #666;
  text-align: center;
  transition: all 0.3s ease;
  line-height: 1.2;
  letter-spacing: 0.5px;
}



/* 粉色按鈕樣式 */
.section-btn-row {
  text-align: center;
  margin-bottom: 40px;
}

.section-btn {
  background: linear-gradient(135deg, #F9AFAE, #f5a1a1);
  color: white;
  padding: 16px 40px;
  border-radius: 25px;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 2px;
  box-shadow: 0 4px 16px rgba(249, 175, 174, 0.3);
  transition: all 0.3s ease;
  display: inline-block;
}

.section-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(249, 175, 174, 0.4);
}

/* 主容器 */
.apply-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 登入區塊 */
.login-section {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
  text-align: left;
}

.login-tip {
  color: #F9AFAE;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 24px;
  padding: 16px;
  background: #FFF8F6;
  border-radius: 8px;
  border-left: 4px solid #F9AFAE;
}

/* 表單樣式 */
.apply-form {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
}

.form-row-top {
  margin-bottom: 16px;
}

.form-top-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}

.legend-check-text {
  color: #F9AFAE;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-section {
  border: 2px solid #F9AFAE;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  background: #FFF8F6;
}

.form-legend {
  background: white;
  padding: 0 16px;
  margin: 0;
  color: #333;
}

.legend-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #F9AFAE;
}

/* 表單網格佈局 - 兩欄一排 */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 32px;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row label {
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.form-row input,
.form-row select {
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  width: 100%;
}

.form-row input:focus,
.form-row select:focus {
  outline: none;
  border-color: #F9AFAE;
  box-shadow: 0 0 0 3px rgba(249, 175, 174, 0.1);
}

/* 特殊欄位處理 */
.form-row.full-width {
  grid-column: 1 / -1;
}

.form-row input[type="checkbox"] {
  width: auto;
  transform: scale(1.2);
  margin-right: 8px;
}

/* 是否留停欄位 - 改為水平排列 */
.form-row:has(input[type="checkbox"]) {
  flex-direction: row;
  align-items: center;
}

.form-row input[type="file"] {
  padding: 8px;
  border: 2px dashed #F9AFAE;
  background: #FFF8F6;
}

/* 留停相關欄位 */
.leave-fields {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 32px;
  margin-top: 16px;
  padding: 16px;
  background: rgba(249, 175, 174, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(249, 175, 174, 0.2);
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e1e8ed;
}

.submit-btn,
.reset-btn {
  padding: 14px 32px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn {
  background: linear-gradient(135deg, #F9AFAE, #f5a1a1);
  color: white;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #f5a1a1, #f19594);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(249, 175, 174, 0.3);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.reset-btn {
  background: transparent;
  color: #F9AFAE;
  border: 2px solid #F9AFAE;
}

.reset-btn:hover {
  background: #F9AFAE;
  color: white;
}

/* 上傳區塊樣式 */
.upload-section {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
}

.upload-title {
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 24px;
  border-bottom: 3px solid #F9AFAE;
  padding-bottom: 8px;
  text-align: center;
}

.upload-tip {
  display: flex;
  align-items: flex-start;

}

.tip-icon {
  font-size: 1.5rem;
  color: #856404;
  flex-shrink: 0;
  margin-top: 2px;
}

.tip-content {
  flex: 1;
}

.tip-content strong {
  display: block;
  color: #856404;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.tip-content p {
  color: #664d03;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
  font-weight: 500;
}

.upload-input {
  width: 100%;
  padding: 20px;
  border: 3px dashed #F9AFAE;
  border-radius: 12px;
  background: #FFF8F6;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.upload-input:hover {
  border-color: #f5a1a1;
  background: #fff0ef;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #FFF8F6;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #F9AFAE;
}

.file-preview {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.file-remove {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-left: auto;
}

.file-remove:hover {
  background: #c82333;
}

.upload-actions {
  display: flex;
  justify-content: center;
  text-align: center;
   gap: 20px;
}

/* 機構選擇步驟 */
.agency-step {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
}

.agency-block {
  display: flex;
  align-items: center;
  margin:auto;
  gap: 16px;
  margin-bottom: 40px;
  padding: 24px;
  background: #FFF8F6;
  border-radius: 12px;
  border: 2px solid #F9AFAE;
  width: 70%;
}

.agency-label {
  font-weight: 600;
  color: #F9AFAE;
  margin-bottom: 8px;
  display: inline-block;
}

.agency-select {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #F9AFAE;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  max-width: 300px;

}

.children-block {
  margin-top: 32px;
}

.children-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 3px solid #F9AFAE;
}

.children-title {
  color: #333;
  font-size: 1.8rem;
  margin: 0 auto;

}

.add-child-btn {
  background: linear-gradient(135deg, #5f8ba8, #4a7c95);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;

}

.add-child-btn:hover {
  background: linear-gradient(135deg, #4a7c95, #3d6b7d);
  transform: translateY(-1px);
}

.add-child-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* 幼兒表單區塊 - 固定三欄佈局 */
.child-forms {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.child-form-card {
  background: #FFF8F6;
  border: 2px solid #F9AFAE;
  border-radius: 12px;
  padding: 20px;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.child-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.child-tag {
  background: #F9AFAE;
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
}

.remove-child-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.remove-child-btn:hover {
  background: #c82333;
  transform: scale(1.05);
}

.child-form-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.child-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.field-select {
  padding: 10px 12px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  transition: all 0.3s ease;
}

.field-select:focus {
  outline: none;
  border-color: #F9AFAE;
  box-shadow: 0 0 0 3px rgba(249, 175, 174, 0.1);
}

/* 完成步驟樣式 */
.finish-step {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
}

.finish-card {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.finish-icon {
  font-size: 4rem;
  margin-bottom: 24px;
}

.finish-title {
  color: #333;
  font-size: 2rem;
  margin-bottom: 16px;
  font-weight: 600;
}

.finish-desc {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 32px;
  line-height: 1.6;
}

.finish-summary {
  background: #FFF8F6;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  text-align: left;
  border: 2px solid #F9AFAE;
}

.summary-block {
  margin-bottom: 24px;
}

.summary-block:last-child {
  margin-bottom: 0;
}

.summary-block h3 {
  color: #F9AFAE;
  font-size: 1.2rem;
  margin-bottom: 12px;
  font-weight: 600;
  border-bottom: 2px solid #F9AFAE;
  padding-bottom: 8px;
}

.summary-block p,
.summary-block ul {
  color: #555;
  margin: 8px 0;
  line-height: 1.5;
}

.summary-block ul {
  list-style: none;
  padding-left: 0;
}

.summary-block li {
  padding: 4px 0;
  border-bottom: 1px solid #eee;
}

.summary-block li:last-child {
  border-bottom: none;
}

.empty-text {
  color: #999;
  font-style: italic;
}

.finish-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.finish-btn {
  padding: 14px 32px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.finish-btn.primary {
  background: linear-gradient(135deg, #F9AFAE, #f5a1a1);
  color: white;
}

.finish-btn.primary:hover {
  background: linear-gradient(135deg, #f5a1a1, #f19594);
  transform: translateY(-1px);
}

.finish-btn.secondary {
  background: transparent;
  color: #F9AFAE;
  border: 2px solid #F9AFAE;
}

.finish-btn.secondary:hover {
  background: #F9AFAE;
  color: white;
}

/* 驗證提示訊息樣式 - 與補件申請一致 */
.validation-msg {
  color: #dc3545;
  font-size: 0.9rem;
  margin-bottom: 16px;
}
.apply-form {
  text-align: left;
}


.notice-card {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 32px;
}

.notice-card h3 {
  color: #856404;
  margin-bottom: 12px;
}

.review-comment {
  color: #856404;
  line-height: 1.6;
  margin: 0;
}

/* 身分別選擇樣式 */
.upload-section label {
  font-weight: 600;
  color: #F9AFAE;
  margin-bottom: 8px;
  display: inline-block;
}

.upload-section select {
  padding: 12px 16px;
  border: 2px solid #F9AFAE;
  border-radius: 6px;
  background: white;
  margin-bottom: 24px;
  width: 100%;
  max-width: 300px;
}

/* Step 3 按鈕區域樣式 - 與 Step 2 一致 */
.children-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e1e8ed;
}

.prev-btn,
.next-btn {
  padding: 14px 32px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.prev-btn {
  background: transparent;
  color: #F9AFAE;
  border: 2px solid #F9AFAE;
}

.prev-btn:hover {
  background: #F9AFAE;
  color: white;
}

.next-btn {
  background: linear-gradient(135deg, #F9AFAE, #f5a1a1);
  color: white;
}

.next-btn:hover {
  background: linear-gradient(135deg, #f5a1a1, #f19594);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(249, 175, 174, 0.3);
}

.next-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .apply-service-page {
    padding: 20px 0;
  }

  .step-bar-4 {
    flex-direction: column;
    gap: 16px;
    padding: 24px 16px;
  }

  .step4 {
    min-width: auto;
    width: 100%;
  }

  .arrow {
    transform: rotate(90deg);
  }

  .apply-container {
    padding: 0 16px;
  }

  .apply-form,
  .upload-section,
  .agency-step,
  .finish-step {
    padding: 24px;
  }

  /* 手機上表單網格變為單欄 */
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .leave-fields {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .form-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .form-row label {
    text-align: left;
    min-width: auto;
  }

  .agency-block {
    flex-direction: column;
    align-items: stretch;
  }

  .agency-label {
    min-width: auto;
  }

  .children-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .children-footer {
    flex-direction: column;
  }

  .finish-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .section-btn {
    padding: 12px 24px;
    font-size: 1rem;
  }

  .step4 img {
    width: 32px;
    height: 32px;
  }

  .step4 span {
    font-size: 0.8rem;
  }

  .form-section {
    padding: 16px;
  }

  .form-grid {
    gap: 12px;
  }
}

/* 響應式設計調整 */
@media (max-width: 1024px) {
  .child-forms {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .child-form-card {
    min-height: 140px;
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .child-forms {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .child-form-card {
    min-height: 120px;
    padding: 16px;
  }

  .upload-tip {
    flex-direction: column;
    text-align: center;
    padding: 16px 20px;
  }

  .tip-icon {
    align-self: center;
    margin-top: 0;
  }
}

@media (max-width: 480px) {
  .child-forms {
    gap: 12px;
  }

  .child-form-card {
    padding: 14px;
    min-height: 110px;
  }

  .child-tag {
    padding: 4px 10px;
    font-size: 0.8rem;
  }

  .upload-tip {
    padding: 14px 16px;
  }

  .tip-content strong {
    font-size: 1rem;
    margin-bottom: 6px;
  }

  .tip-content p {
    font-size: 0.9rem;
  }
}

/* 機構選擇橫向排列與間距 */
.agency-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
@media (max-width: 768px) {
  .agency-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}
</style>
