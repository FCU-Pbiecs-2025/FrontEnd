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
          <h3>⚠️ 申請前準備</h3>
          <div class="review-comment">
            <p>申請托育服務前，請依照以下步驟完成準備：</p>
            <ol style="margin: 12px 0; padding-left: 20px;">
              <li>登入您的帳號</li>
              <li>前往「會員中心」填寫家長及幼兒資料</li>
              <li>確認資料填寫完整後，即可開始進行申請</li>
            </ol>
          </div>
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
          <p class="review-comment">
            <span v-if="!identityTypeSelect">請先選擇申請之身分別，查看所需文件清單</span>
            <span v-else>
              <strong>{{ requiredDocuments.title }}：</strong><br />
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li v-for="(doc, idx) in requiredDocuments.documents" :key="idx">
                  {{ doc }}
                </li>
              </ul>
              支援 JPG、PNG、PDF 格式，單檔不超過 5MB，最多上傳 4 個檔案
            </span>
          </p>
        </div>
        <input type="file" class="upload-input" multiple @change="handleFileChange" :disabled="uploadedFiles.length >= 4" />
        <div v-if="uploadedFiles.length > 0" class="file-count-info">
          {{ fileValidationMsg }}
        </div>
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
          <select @change="onAgencyChange" class="agency-select">
            <option value="">請選擇申請之就讀機構</option>
            <option v-for="inst in agencyOptions" :key="inst.institutionName" :value="inst.institutionName">
              {{ inst.institutionName }}
            </option>
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
                    <option v-for="n in getAvailableChildNames(idx)" :key="n" :value="n">{{ n }}</option>
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
              <p v-if="selectedAgency.name">{{ selectedAgency.name }}</p>
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
import { ref, onBeforeUnmount, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LoginView from './LoginView.vue'
import { useAuthStore } from '@/store/auth.js'
import { getUserFamilyInfo } from '@/api/user.js'
import { submitApplicationCase } from '@/api/application.js'
import { getInstitutionsSimpleAll } from '@/api/Institution.js'

const authStore = useAuthStore()
const router = useRouter()

const step = ref(1) // 目前步驟，預設1
const validationMessage = ref('') // 新增：儲存驗證提示訊息
const identityTypeSelect = ref('') // 新增：申請之身分別選擇

// 身分別轉換函數：將選中的身分別描述轉換為序位數字
// 第一序位（所有選項）-> 1，第二序位（所有選項）-> 2，第三序位 -> 3
function convertIdentityTypeToNumber(identityDescription) {
  console.log('🔄 convertIdentityTypeToNumber 被調用，輸入:', identityDescription);

  // 定義身分別對應的序位數字
  const identityMap = {
    // 第一序位 - 所有選項都回傳 1
    '弱勢家庭(含低收入戶、中低收入戶、危機家庭、特殊境遇家庭或經濟困難未成年父母)': 1,
    '具原住民身分之嬰幼兒': 1,
    '發展遲緩或持有輕度身心障礙證明之嬰幼兒': 1,
    '嬰幼兒其手足或父母或監護人之一為中度以上身心障礙者': 1,
    '家庭內育有雙胞胎或三位以上同胞子女之家庭': 1,
    // 第二序位 - 所有選項都回傳 2
    '該公共托育機構員工之子女': 2,
    '提供辦理該公共托育機構場地之學校教職員工之子女': 2,
    // 第三序位 - 回傳 3
    '設籍本縣一般家庭嬰幼兒': 3
  };

  const identityNumber = identityMap[identityDescription] || 0;
  console.log('📍 身分別序位轉換結果:', identityNumber, `(第${identityNumber}序位 - ${identityDescription})`);
  return identityNumber;
}

// 申請表單資料
const form = ref({
  applicant: { name: '', birth: '', id: '', gender: '', homeAddress: '', mailAddress: '', mobile: '', email: '' },
  parent1: { name: '', birth: '', id: '', parentType: '', homeAddress: '', mobile: '', company: '', gender: '', contactAddress: '', email: '', isLeave: false, leaveStart: '', leaveEnd: '' },
  parent2: { name: '', birth: '', id: '', parentType: '', homeAddress: '', mobile: '', company: '', gender: '', contactAddress: '', email: '', isLeave: false, leaveStart: '', leaveEnd: '' }
})

// 從 API 獲取的家庭資料
const familyData = ref({
  userInfo: {},
  parents: [],
  children: []
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
    // 帶入申請人的 API 資料（從 familyData.userInfo 取得）
    const userInfo = familyData.value.userInfo
    form.value.applicant = {
      name: userInfo.name || '',
      birth: userInfo.birthDate || '',
      id: userInfo.nationalID || '',
      gender: userInfo.gender === false ? '女' : '男',
      homeAddress: userInfo.householdAddress || '',
      mailAddress: userInfo.mailingAddress || userInfo.householdAddress || '',
      mobile: userInfo.phoneNumber || '',
      email: userInfo.email || ''
    }
    console.log('✅ 已綁定申請人資料:', form.value.applicant)
  } else {
    // 取消勾選 -> 清空申請人資料
    form.value.applicant = { name:'', birth:'', id:'', gender:'', homeAddress:'', mailAddress:'', mobile:'', email:'' }
    console.log('🔄 已清空申請人資料')
  }
})

watch(() => sameAsMember.value.parent1, (val) => {
  if (val) {
    // 帶入家長1的 API 資料（從 familyData.parents[0] 取得）
    const parent1 = familyData.value.parents[0]
    if (parent1) {
      form.value.parent1 = {
        name: parent1.name || '',
        birth: parent1.birthDate || '',
        id: parent1.nationalID || '',
        parentType: parent1.relationship || '',
        homeAddress: parent1.householdAddress || '',
        mobile: parent1.phoneNumber || '',
        company: parent1.occupation || '',
        gender: parent1.gender || '',
        contactAddress: parent1.mailingAddress || parent1.householdAddress || '',
        email: parent1.email || '',
        isLeave: !!parent1.isSuspended,
        leaveStart: parent1.suspendStart || '',
        leaveEnd: parent1.suspendEnd || ''
      }
      console.log('✅ 已綁定家長1資料:', form.value.parent1)
    }
  } else {
    // 取消勾選 -> 清空家長1
    form.value.parent1 = { name:'', birth:'', id:'', parentType:'', homeAddress:'', mobile:'', company:'', gender:'', contactAddress:'', email:'', isLeave:false, leaveStart:'', leaveEnd:'' }
    console.log('🔄 已清空家長1資料')
  }
})

watch(() => sameAsMember.value.parent2, (val) => {
  if (val) {
    // 帶入家長2的 API 資料（從 familyData.parents[1] 取得）
    const parent2 = familyData.value.parents[1]
    if (parent2) {
      form.value.parent2 = {
        name: parent2.name || '',
        birth: parent2.birthDate || '',
        id: parent2.nationalID || '',
        parentType: parent2.relationship || '',
        homeAddress: parent2.householdAddress || '',
        mobile: parent2.phoneNumber || '',
        company: parent2.occupation || '',
        gender: parent2.gender || '',
        contactAddress: parent2.mailingAddress || parent2.householdAddress || '',
        email: parent2.email || '',
        isLeave: !!parent2.isSuspended,
        leaveStart: parent2.suspendStart || '',
        leaveEnd: parent2.suspendEnd || ''
      }
      console.log('✅ 已綁定家長2資料:', form.value.parent2)
    }
  } else {
    // 取消勾選 -> 清空家長2
    form.value.parent2 = { name:'', birth:'', id:'', parentType:'', homeAddress:'', mobile:'', company:'', gender:'', contactAddress:'', email:'', isLeave:false, leaveStart:'', leaveEnd:'' }
    console.log('🔄 已清空家長2資料')
  }
})

// ========== 在組件掛載時載入用戶家庭資料 ==========
onMounted(async () => {
  console.log('========== ApplyService.vue 已掛載 ==========')

  // 檢查用戶是否已登入
  if (!authStore.isLoggedIn) {
    console.warn('用戶未登入，跳過載入家庭資料')
    return
  }

  const userID = authStore.user?.UserID
  if (!userID) {
    console.error('無法從 authStore 獲取 userID')
    return
  }

  try {
    console.log('========== 開始調用 getUserFamilyInfo API ==========')
    console.log('userID:', userID)

    const response = await getUserFamilyInfo(userID)

    if (!response || !response.data) {
      console.error('❌ API 回應為空')
      return
    }

    const data = response.data
    console.log('========== API 返回的完整數據 ==========')
    console.log('data:', data)

    // 存放用戶個人信息
    familyData.value.userInfo = {
      name: data.name || '',
      email: data.email || '',
      phoneNumber: data.phoneNumber || '',
      nationalID: data.nationalID || '',
      birthDate: data.birthDate || '',
      gender: data.gender,
      occupation: data.occupation || '',
      householdAddress: data.householdAddress || '',
      mailingAddress: data.mailingAddress || ''
    }

    // 存放家長資料
    if (Array.isArray(data.parents)) {
      familyData.value.parents = data.parents.map((parent, idx) => ({
        index: idx,
        name: parent.name || '',
        phoneNumber: parent.phoneNumber || '',
        nationalID: parent.nationalID || '',
        birthDate: parent.birthDate || '',
        gender: parent.gender === false ? '女' : '男',
        relationship: parent.relationship || '',
        occupation: parent.occupation || '',
        householdAddress: parent.householdAddress || '',
        mailingAddress: parent.mailingAddress || '',
        isSuspended: parent.isSuspended || false,
        suspendStart: parent.suspendStart || '',
        suspendEnd: parent.suspendEnd || '',
        email: parent.email || ''
      }))
    }

    // 存放幼兒資料
    if (Array.isArray(data.children)) {
      familyData.value.children = data.children.map((child, idx) => ({
        index: idx,
        name: child.name || '',
        nationalID: child.nationalID || '',
        birthDate: child.birthDate || '',
        gender: child.gender === false ? '女' : '男'
      }))
    }

    console.log('✅ 已成功載入家庭資料:')
    console.log('userInfo:', familyData.value.userInfo)
    console.log('parents:', familyData.value.parents)
    console.log('children:', familyData.value.children)

    // 獲取機構列表
    try {
      console.log('========== 開始調用 getInstitutionsSimpleAll API ==========')
      const institutionsResponse = await getInstitutionsSimpleAll()
      console.log('[API] 機構列表響應:', institutionsResponse)

      if (institutionsResponse && Array.isArray(institutionsResponse)) {
        agencyOptions.value = institutionsResponse
        console.log('✅ 已成功載入機構列表:', agencyOptions.value)
      } else {
        console.warn('⚠️ 機構列表為空或格式錯誤')
        agencyOptions.value = []
      }
    } catch (error) {
      console.error('❌ 獲取機構列表失敗:', error)
      agencyOptions.value = []
    }


  } catch (error) {
    console.error('❌ 載入家庭資料失敗:', error)
    if (error.response) {
      console.error('API 錯誤狀態碼:', error.response.status)
      console.error('API 錯誤訊息:', error.response.data)
    }
  }
})


const uploadedFiles = ref([])

// 計算屬性：根據身分別動態生成所需文件提示
const requiredDocuments = computed(() => {
  const identityNumber = convertIdentityTypeToNumber(identityTypeSelect.value)

  let title = '所需文件'
  let documents = []

  if (identityNumber === 1) {
    // 第一序位 - 一般民眾
    title = '所需文件'
    documents = [
      '戶口名簿正本',
      '身分別證明文件正本'
    ]
  } else if (identityNumber === 2) {
    // 第二序位
    const identityDesc = identityTypeSelect.value
    if (identityDesc.includes('該公共托育機構員工')) {
      // 機構員工之子女
      documents = [
        '戶口名簿正本',
        '托育機構就職證明文件'
      ]
    } else if (identityDesc.includes('提供辦理該公共托育機構場地之學校教職員工')) {
      // 學校教職員工之子女
      documents = [
        '戶口名簿正本',
        '托育機構就職證明文件'
      ]
    }
  } else if (identityNumber === 3) {
    // 第三序位 - 設籍本縣一般家庭嬰幼兒
    documents = [
      '戶口名簿正本'
    ]
  }

  return {
    title,
    documents,
    identityNumber
  }
})

// 計算屬性：驗證訊息（含檔案限制說明）
const fileValidationMsg = computed(() => {
  const remaining = 4 - uploadedFiles.value.length
  if (remaining <= 0) {
    return '已達上傳檔案上限（最多4個）'
  }
  return `已上傳 ${uploadedFiles.value.length} 個檔案，還可上傳 ${remaining} 個`
})

// 檔案驗證函數
const validateFile = (file) => {
  // 檢查文件類型
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
  const fileExtension = file.name.split('.').pop().toLowerCase()
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf']

  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      message: `${file.name} 不是支援的格式。請上傳 JPG、PNG 或 PDF 檔案。`
    }
  }

  // 檢查文件大小（5MB = 5242880 bytes）
  if (file.size > 5242880) {
    return {
      valid: false,
      message: `${file.name} 檔案過大。單個檔案不能超過 5MB。`
    }
  }

  return { valid: true, message: '' }
}

function handleFileChange(e) {
  const files = Array.from(e.target.files)

  files.forEach(file => {
    // 檢查是否已達上限
    if (uploadedFiles.value.length >= 4) {
      alert('已達上傳檔案上限（最多4個）')
      return
    }

    // 驗證檔案
    const validation = validateFile(file)
    if (!validation.valid) {
      alert(validation.message)
      return
    }

    // 檢查是否已存在
    if (!uploadedFiles.value.some(f => f.file.name === file.name && f.file.size === file.size && f.file.lastModified === file.lastModified)) {
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
  // 新增：檢查家長1與家長2戶籍地址是否有新竹縣
  const p1 = form.value.parent1.homeAddress || ''
  const p2 = form.value.parent2.homeAddress || ''
  const isHsinchu1 = p1.includes('新竹縣')
  const isHsinchu2 = p2.includes('新竹縣')
  if (!isHsinchu1 && !isHsinchu2) {
    alert('兩位家長戶籍地皆非新竹縣! \n \n 本服務僅限新竹縣民申請服務')

    return
  }
  // ✅ 新增：驗證留職停薪欄位
  // 檢查家長1的留職停薪驗證
  if (form.value.parent1.name && form.value.parent1.isLeave) {
    if (!form.value.parent1.leaveStart || form.value.parent1.leaveStart.trim() === '') {
      alert('❌ 家長1已勾選「是否留停」，請填寫「留停起」日期')
      return
    }
    if (!form.value.parent1.leaveEnd || form.value.parent1.leaveEnd.trim() === '') {
      alert('❌ 家長1已勾選「是否留停」，請填寫「留停訖」日期')
      return
    }
  }

  // 檢查家長2的留職停薪驗證
  if (form.value.parent2.name && form.value.parent2.isLeave) {
    if (!form.value.parent2.leaveStart || form.value.parent2.leaveStart.trim() === '') {
      alert('❌ 家長2已勾選「是否留停」，請填寫「留停起」日期')
      return
    }
    if (!form.value.parent2.leaveEnd || form.value.parent2.leaveEnd.trim() === '') {
      alert('❌ 家長2已勾選「是否留停」，請填寫「留停訖」日期')
      return
    }
  }

  // 通過驗證，進入下一步
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
const agencyOptions = ref([])
const selectedAgency = ref({
  id: '',
  name: ''
})

// 機構選擇事件處理
const onAgencyChange = (event) => {
  const selectedName = event.target.value;

  console.log('========== 🏢 機構選擇變化 ==========');
  console.log('選擇的機構名稱:', selectedName);

  // 詳細顯示所有可用的機構選項
  console.log('📋 當前 agencyOptions 內容:');
  console.log('  - 總數:', agencyOptions.value.length);
  agencyOptions.value.forEach((inst, idx) => {
    console.log(`  [${idx}] institutionName: "${inst.institutionName}"`);
    console.log(`       institutionID: "${inst.institutionID}"`);
  });

  if (selectedName === '') {
    selectedAgency.value = { id: '', name: '' };
    console.log('❌ 未選擇機構（空值）');
    return;
  }

  if (selectedName === '市政府') {
    selectedAgency.value = { id: '市政府', name: '市政府' };
    console.log('✅ 選擇的機構: 市政府 (特殊選項)');
    return;
  }

  // 從 agencyOptions 中查找該機構的完整信息（使用 institutionName）
  const selectedInst = agencyOptions.value.find(inst => inst.institutionName === selectedName);

  if (selectedInst) {
    // 使用 institutionID 作為 id（API 返回的真實 UUID）
    selectedAgency.value = {
      id: selectedInst.institutionID,
      name: selectedInst.institutionName
    };

    console.log('✅ 找到該機構的 API 參數詳情:');
    console.log('=' .repeat(50));

    // 遍歷該機構對象的所有鍵值對
    Object.entries(selectedInst).forEach(([key, value]) => {
      console.log(`  📌 ${key}: ${JSON.stringify(value)}`);
    });

    console.log('=' .repeat(50));
    console.log('🎯 核心參數:');
    console.log('  - institutionID (真實 ID):', selectedInst.institutionID);
    console.log('  - institutionName:', selectedInst.institutionName);
    console.log('📊 selectedAgency 對象:', selectedAgency.value);
  } else {
    console.warn('⚠️ 未找到該機構:', selectedName);
    selectedAgency.value = { id: '', name: '' };
  }
}

const maxChildren = 5
// 動態幼兒名單資料（後端取得）
const children = ref([
  { id: Date.now(), name: "", gender: "", age: "", nationality: "" }
])
const childNameOptions = computed(() => {
  // 從 familyData.children 中提取幼兒名稱，但排除已被其他幼兒選擇的名稱
  const allChildNames = familyData.value.children.map(child => child.name).filter(name => name)
  const selectedChildNames = children.value.map(child => child.name).filter(name => name)

  // 只返回還未被選中的幼兒名稱
  return allChildNames.filter(name => !selectedChildNames.includes(name))
})

// 根據幼兒索引返回可用的名稱列表（允許當前幼兒選擇自己的名稱，但排除其他已選擇的名稱）
const getAvailableChildNames = (currentIndex) => {
  const allChildNames = familyData.value.children.map(child => child.name).filter(name => name)
  const currentChildName = children.value[currentIndex]?.name || ""

  // 返回所有名稱，但排除其他幼兒已選擇的名稱（除了當前幼兒自己）
  return allChildNames.filter(name => {
    // 如果是當前幼兒的名稱，總是包含
    if (name === currentChildName) return true

    // 如果其他幼兒已選擇了這個名稱，則排除
    return !children.value.some((child, idx) => idx !== currentIndex && child.name === name)
  })
}

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

// 構建案件資訊數據
const buildCaseData = () => {
  console.log('========== buildCaseData 被調用 ==========');
  console.log('📝 開始構建案件數據...');

  // 驗證 UserID
  console.log('👤 檢查 UserID:');
  console.log('  - authStore.user:', authStore.user);
  console.log('  - authStore.user?.UserID:', authStore.user?.UserID);

  const userID = authStore.user?.UserID || authStore.user?.userId || authStore.user?.userID || '';
  console.log('  - 最終 UserID:', userID);

  if (!userID) {
    console.error('❌ UserID 為空！無法提交申請');
    alert('❌ 錯誤：無法獲取用戶 ID，請重新登入後再試');
    throw new Error('UserID is required');
  }

  // 構建 User 對象
  const userObject = {
    UserID: userID,
    Name: form.value.applicant.name || '',
    Gender: form.value.applicant.gender === '女' ? 'F' : 'M',
    BirthDate: form.value.applicant.birth || '',
    MailingAddress: form.value.applicant.mailAddress || '',
    email: form.value.applicant.email || '',
    PhoneNumber: form.value.applicant.mobile || '',
    NationalID: form.value.applicant.id || ''
  };
  console.log('✅ User 對象構建完成:', userObject);

  // 構建家長列表 (只包含家長1和家長2，不包含申請人)
  const parentsList = [];

  // 添加家長 1
  if (form.value.parent1.name) {
    console.log('✅ 添加家長 1:', form.value.parent1.name);
    parentsList.push({
      participantType: 1,
      nationalID: form.value.parent1.id || '',
      name: form.value.parent1.name,
      gender: form.value.parent1.gender === '女' ? 'F' : 'M',
      relationShip: form.value.parent1.parentType || '',
      occupation: form.value.parent1.company || '',
      phoneNumber: form.value.parent1.mobile || '',
      householdAddress: form.value.parent1.homeAddress || '',
      mailingAddress: form.value.parent1.contactAddress || '',
      email: form.value.parent1.email || '',
      birthDate: form.value.parent1.birth || '',
      isSuspended: form.value.parent1.isLeave || false,
      suspendEnd: form.value.parent1.leaveEnd || null,

    });
  } else {
    console.log('ℹ️ 家長 1 姓名為空，跳過');
  }

  // 添加家長 2
  if (form.value.parent2.name) {
    console.log('✅ 添加家長 2:', form.value.parent2.name);
    parentsList.push({
      participantType: 1,
      nationalID: form.value.parent2.id || '',
      name: form.value.parent2.name,
      gender: form.value.parent2.gender === '女' ? 'F' : 'M',
      relationShip: form.value.parent2.parentType || '',
      occupation: form.value.parent2.company || '',
      phoneNumber: form.value.parent2.mobile || '',
      householdAddress: form.value.parent2.homeAddress || '',
      mailingAddress: form.value.parent2.contactAddress || '',
      email: form.value.parent2.email || '',
      birthDate: form.value.parent2.birth || '',
      isSuspended: form.value.parent2.isLeave || false,
      suspendEnd: form.value.parent2.leaveEnd || null,

    });
  } else {
    console.log('ℹ️ 家長 2 姓名為空，跳過');
  }
  console.log('👨‍👩‍👧 家長列表構建完成，總數:', parentsList.length);

  // 構建幼兒列表
  const childrenList = children.value.map((child, idx) => {
    console.log(`✅ 添加幼兒 ${idx + 1}:`, child.name, `(性別: ${child.gender})`);

    // 從 familyData.children 中查找對應的幼兒信息
    const familyChild = familyData.value.children.find(fc => fc.name === child.name);
    const childNationalID = familyChild?.nationalID || '';
    const childBirthDate = familyChild?.birthDate || '';
    const childGender = familyChild?.gender === '女' ? 'F' : 'M';

    console.log(`  - nationalID: "${childNationalID}"`);
    console.log(`  - birthDate: "${childBirthDate}"`);

    return {
      participantType: 0,
      nationalID: childNationalID,
      name: child.name || '',
      gender: childGender,
      relationShip: '幼兒',
      occupation: null,
      phoneNumber: null,
      householdAddress: form.value.applicant.homeAddress || '',
      mailingAddress: form.value.applicant.mailAddress || '',
      email: null,
      birthDate: childBirthDate,
      isSuspended: false,
      suspendEnd: null,

      status: '審核中',
      reason: null,
      classID: null,
      reviewDate: null
    };
  });
  console.log('👶 幼兒列表構建完成，總數:', childrenList.length);

  // 獲取今天的日期
  const today = new Date();
  const applyDate = today.toISOString().split('T')[0];
  console.log('📅 申請日期:', applyDate);

  // 構建完整的案件資訊
  // 轉換身分別為序位數字 (確保為整數)
  const identityTypeNumber = convertIdentityTypeToNumber(identityTypeSelect.value);
  console.log('🔢 身分別轉換完成:', identityTypeSelect.value, '->', identityTypeNumber, '(類型:', typeof identityTypeNumber, ')');

  // 生成案件編號：使用時間戳（暫時註釋，改由後端生成）
  // const caseNumber = Date.now();
  const caseNumber = null; // 讓後端自動生成
  console.log('📋 案件編號設為 null (由後端生成)');

  const caseData = {
    caseNumber: caseNumber,
    applyDate: applyDate,
    identityType: identityTypeNumber,
    institutionId: selectedAgency.value.id || '',
    institutionName: selectedAgency.value.name || '',
    selectedClass: null,
    currentOrder: null,
    reviewDate: null,
    applicationID: null,
    // ✅ 頂層添加 UserID（後端需要用於 applications 表插入）
    UserID: userID,
    User: userObject,
    parents: parentsList,
    children: childrenList,
    attachmentPath: null,
    attachmentPath1: null,
    attachmentPath2: null,
    attachmentPath3: null
  };

  console.log('✅ buildCaseData 完成，最終案件數據:');
  console.log('  - caseNumber:', caseData.caseNumber);
  console.log('  - applyDate:', caseData.applyDate);
  console.log('  - identityType:', caseData.identityType, '(類型:', typeof caseData.identityType, ')');
  console.log('  - institutionId:', caseData.institutionId);
  console.log('  - institutionName:', caseData.institutionName);
  console.log('  - UserID (頂層):', caseData.UserID);
  console.log('  - User (對象):', caseData.User);
  console.log('  - parents 數量:', caseData.parents.length);
  console.log('  - children 數量:', caseData.children.length);

  return caseData;
};

// 構建檔案對象
const buildFilesData = () => {
  console.log('========== buildFilesData 被調用 ==========');
  const filesData = {};

  console.log('📦 上傳的檔案總數:', uploadedFiles.value.length);

  uploadedFiles.value.forEach((file, idx) => {
    if (idx === 0) {
      filesData.file = file.file;
      console.log(`✅ 第 ${idx} 個檔案 -> filesData.file:`, file.file.name, `(${(file.file.size / 1024).toFixed(2)}KB)`);
    } else if (idx < 4) {
      filesData[`file${idx}`] = file.file;
      console.log(`✅ 第 ${idx} 個檔案 -> filesData.file${idx}:`, file.file.name, `(${(file.file.size / 1024).toFixed(2)}KB)`);
    } else {
      console.warn(`⚠️ 第 ${idx} 個檔案超過上限(最多4個)，已跳過`);
    }
  });

  console.log('✅ buildFilesData 完成，最終檔案對象 keys:', Object.keys(filesData));

  return filesData;
};

// 提交案件
async function submitCase() {
  try {
    console.log('========== 開始提交申請案件 (submitCase) ==========');

    // 構建案件數據和檔案數據
    const caseDataObj = buildCaseData();
    const filesData = buildFilesData();

    console.log('📋 案件資訊構建完成:');
    console.log('  - caseNumber:', caseDataObj.caseNumber);
    console.log('  - applyDate:', caseDataObj.applyDate);
    console.log('  - identityType:', caseDataObj.identityType);
    console.log('  - institutionId:', caseDataObj.institutionId);
    console.log('  - institutionName:', caseDataObj.institutionName);
    console.log('  - User:', caseDataObj.User);
    console.log('  - parents 數量:', caseDataObj.parents.length);
    console.log('  - children 數量:', caseDataObj.children.length);
    console.log('完整案件資訊:', caseDataObj);

    console.log('📎 附件檔案:');
    console.log('  - 檔案總數:', Object.keys(filesData).length);
    Object.keys(filesData).forEach(key => {
      console.log(`  - ${key}:`, filesData[key].name, `(${(filesData[key].size / 1024).toFixed(2)}KB)`);
    });

    // 打印完整的 JSON 請求 body
    console.log('========== 📤 完整的請求 Body (JSON 格式) ==========');
    console.log(JSON.stringify(caseDataObj, null, 2));

    // 打印完整的 FormData 內容
    console.log('========== 📤 完整的 FormData 內容 ==========');
    console.log('FormData 鍵值對:');
    console.log('  - caseData:', JSON.stringify(caseDataObj, null, 2));
    console.log('  - Files:');
    Object.keys(filesData).forEach(key => {
      console.log(`    - ${key}: ${filesData[key].name} (${(filesData[key].size / 1024).toFixed(2)}KB)`);
    });

    // 調用 API 提交案件
    console.log('🚀 正在調用 submitApplicationCase API...');
    const response = await submitApplicationCase(caseDataObj, filesData);

    console.log('✅ 申請案件已成功提交:');
    console.log('API 回應數據:', response);

    // 儲存申請成功的信息
    localStorage.setItem('lastApplicationResult', JSON.stringify(response));
    console.log('💾 申請結果已儲存到 localStorage: lastApplicationResult');

    // 顯示成功提示
    alert('✅ 您的申請已成功提交！');

    return response;
  } catch (error) {
    console.error('========== ❌ 提交申請案件失敗 ==========');
    console.error('錯誤信息:', error.message);
    console.error('錯誤詳情:', error);

    let errorMessage = '❌ 提交申請失敗';

    if (error.response) {
      console.error('API 錯誤狀態碼:', error.response.status);
      console.error('API 錯誤數據:', error.response.data);

      // 根據不同的 HTTP 狀態碼提供相應的錯誤訊息
      if (error.response.status === 400) {
        // 400 Bad Request - 驗證失敗（例如幼兒申請案件超過限制）
        const apiErrorMessage = typeof error.response.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response.data);
        console.error('❌ 驗證失敗:', apiErrorMessage);
        errorMessage = '❌ 提交失敗\n\n' + apiErrorMessage;
      } else if (error.response.status === 500) {
        errorMessage = '❌ 伺服器內部錯誤\n\n' + (error.response.data || '請聯絡客服');
      } else {
        errorMessage = '❌ 提交失敗 (HTTP ' + error.response.status + ')\n\n' + (error.response.data || error.message);
      }
    }

    if (error.config) {
      console.error('請求配置:', error.config);
    }

    alert(errorMessage);
    throw error;
  }
}

const canProceedStep3 = computed(()=>{
  if(!selectedAgency.value.id) return false
  // 僅檢查幼兒姓名 (目前介面只有姓名下拉)
  return children.value.every(c=>c.name)
})
function goToFinish(){
  console.log('========== goToFinish 被調用 ==========');
  console.log('canProceedStep3.value:', canProceedStep3.value);
  console.log('selectedAgency.value:', selectedAgency.value);
  console.log('children.value:', children.value);

  if(canProceedStep3.value){
    console.log('✅ 驗證通過，開始提交案件');
    // 提交案件
    submitCase().then(() => {
      console.log('✅ submitCase promise 已resolve，進入完成頁面 (step 4)');
      // 提交成功後進入完成頁面
      step.value = 4;
    }).catch((error) => {
      // 提交失敗，保留在當前步驟
      console.error('❌ submitCase promise 已reject:', error);
      console.error('提交案件失敗，保留在步驟 3');
    });
  } else {
    console.warn('❌ 驗證失敗，無法提交:');
    if(!selectedAgency.value.id) console.warn('  - 未選擇機構');
    if(!children.value.every(c=>c.name)) console.warn('  - 幼兒姓名不完整');
  }
}

function startNew(){
  // 釋放舊的預覽 URL
  uploadedFiles.value.forEach(f=>{ if(f.previewUrl) URL.revokeObjectURL(f.previewUrl) })
  uploadedFiles.value = []
  selectedAgency.value = { id: '', name: '' }
  children.value = [{ id: Date.now(), name: '', gender:'', age:'', nationality:'' }]
  form.value = {
    applicant:{ name:'', birth:'', id:'', gender:'', homeAddress:'', mailAddress:'', mobile:'', email:'' },
    parent1:{ name:'', birth:'', id:'', parentType:'', homeAddress:'', mobile:'', company:'', gender:'', contactAddress:'', email:'', isLeave:false, leaveStart:'', leaveEnd:'' },
    parent2:{ name:'', birth:'', id:'', parentType:'', homeAddress:'', mobile:'', company:'', gender:'', contactAddress:'', email:'', isLeave:false, leaveStart:'', leaveEnd:'' }
  }
  sameAsMember.value = { applicant:false, parent1:false, parent2:false }
  step.value = 1
  window.scrollTo({top:0, behavior:'smooth'})
}
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

.upload-input {
  display: block;
  margin-bottom: 16px;
  padding: 12px;
  border: 2px dashed #F9AFAE;
  border-radius: 8px;
  background: #FFF8F6;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.upload-input:hover:not(:disabled) {
  border-color: #f5a1a1;
  background: #fff0ee;
}

.upload-input:disabled {
  background: #f5f5f5;
  border-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
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

.review-comment ul {
  list-style: disc;
  margin: 8px 0 0 0 !important;
}

.review-comment li {
  margin: 4px 0;
}

.file-count-info {
  color: #F9AFAE;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 16px;
  padding: 12px;
  background: #FFF8F6;
  border-radius: 6px;
  border-left: 4px solid #F9AFAE;
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
