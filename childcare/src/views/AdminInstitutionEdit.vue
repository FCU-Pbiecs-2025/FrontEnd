<template>
  <div class="institution-edit-page">
    <!-- 加載中提示 -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>正在加載機構資料...</p>
    </div>

    <div v-else class="institution-edit-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/organization.png" class="icon" alt="icon" />
        <span class="main-title">機構管理</span>
      </div>
      <div class="tab-row">
        <span class="tab-title">{{ isNew ? '新增各托機構' : '編輯各托機構' }}</span>
      </div>
      <div class="edit-form-card">
        <div class="form-row">
          <label class="form-label">機構名稱：</label>
          <input v-model="form.institutionName" class="form-input" placeholder="請輸入機構名稱" />
        </div>
        <div class="form-row">
          <label class="form-label">連絡人：</label>
          <input v-model="form.contactPerson" class="form-input" placeholder="請輸入連絡人" />
        </div>
        <div class="form-row">
          <label class="form-label">機構地址：</label>
          <input v-model="form.address" class="form-input" placeholder="請輸入機構地址" />
        </div>
        <div class="form-row">
          <label class="form-label">緯度：</label>
          <input v-model="form.latitude" class="form-input" placeholder="例如 24.123456" />
        </div>
        <div class="form-row">
          <label class="form-label">經度：</label>
          <input v-model="form.longitude" class="form-input" placeholder="例如 120.654321" />
        </div>
        <div class="form-row">
          <label class="form-label">機構電話：</label>
          <input v-model="form.phoneNumber" class="form-input" placeholder="請輸入機構電話" />
        </div>
        <div class="form-row">
          <label class="form-label">傳真：</label>
          <input v-model="form.fax" class="form-input" placeholder="請輸入傳真" />
        </div>
        <div class="form-row">
          <label class="form-label">電子信箱：</label>
          <input v-model="form.email" class="form-input" placeholder="請輸入電子信箱" />
        </div>
        <div class="form-row">
          <label class="form-label">相關連結：</label>
          <input v-model="form.relatedLinks" class="form-input" placeholder="請輸入相關連結" />
        </div>
        <div class="form-row">
          <label class="form-label">機構說明：</label>
          <textarea v-model="form.description" class="form-textarea" rows="4" placeholder="請輸入機構說明"></textarea>
        </div>
        <div class="form-row">
          <label class="form-label">負責人：</label>
          <input v-model="form.responsiblePerson" class="form-input" placeholder="請輸入負責人" />
        </div>
        <div class="form-row">
          <label class="form-label">機構類型：</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" :value="true" v-model="form.institutionsType" />
              <span>公托</span>
            </label>
            <label class="radio-label">
              <input type="radio" :value="false" v-model="form.institutionsType" />
              <span>準公托</span>
            </label>
          </div>
        </div>
        <div class="form-row">
          <label class="form-label">帳號狀態：</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" :value="1" v-model.number="form.accountStatus" />
              <span>啟用</span>
            </label>
            <label class="radio-label">
              <input type="radio" :value="0" v-model.number="form.accountStatus" />
              <span>停用</span>
            </label>
          </div>
        </div>
        <div class="form-row">
          <label class="form-label">圖片：</label>
          <div class="file-upload-section">
            <div class="file-btn">
              <button class="btn secondary" @click="uploadPhoto">瀏覽檔案</button>
              <span v-if="selectedImage" class="file-name">{{ selectedImage.name }}</span>
            </div>
            <!-- 圖片預覽區域 -->
            <div class="image-preview-container">
              <!-- 新選擇的圖片預覽 -->
              <div v-if="previewImage" class="preview-item">
                <p class="preview-label">新圖片預覽：</p>
                <div class="preview-box">
                  <img :src="previewImage" :alt="selectedImage?.name || '新圖片'" class="preview-img" />
                  <button class="btn-remove" @click="removeImage" title="移除圖片">✕</button>
                </div>
              </div>
              <!-- 原始圖片預覽（編輯時顯示） -->
              <div v-else-if="!isNew && currentImageUrl" class="preview-item">
                <p class="preview-label">當前圖片：</p>
                <div class="preview-box">
                  <img :src="currentImageUrl" :alt="form.institutionName" class="preview-img" @error="handleImageError" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bottom-row">
        <button class="btn ghost" @click="goBack" :disabled="isSaving">返回</button>
        <button class="btn primary" @click="save" :disabled="isSaving">
          {{ isSaving ? '儲存中...' : '儲存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getInstitutionById, updateInstitution, createInstitution } from '@/api/Institution.js'

const route = useRoute()
const router = useRouter()

const form = ref({
  institutionID: null,
  institutionName: '',
  contactPerson: '',
  address: '',
  latitude: '',
  longitude: '',
  phoneNumber: '',
  fax: '',
  email: '',
  relatedLinks: '',
  description: '',
  responsiblePerson: '',
  imagePath: '',
  institutionsType: true
})

const originalData = ref(null)
const selectedImage = ref(null)
const previewImage = ref(null)
const isLoading = ref(false)
const isSaving = ref(false)

const isNew = computed(() => route.name === 'AdminInstitutionNew' || !route.params.institutionID)

// 計算圖片的完整 URL
const currentImageUrl = computed(() => {
  console.log('========== 計算 currentImageUrl ==========')
  console.log('[AdminInstitutionEdit] form.imagePath:', form.value.imagePath)

  if (!form.value.imagePath) {
    console.log('[AdminInstitutionEdit] imagePath 為空，返回 null')
    return null
  }

  const imagePath = form.value.imagePath

  // 如果已經是完整的 HTTP URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('[AdminInstitutionEdit] 已是完整 URL:', imagePath)
    return imagePath
  }

  // 路徑映射：
  // API 返回: /InstitutionResource/filename
  // 提取文件名: filename
  // 前端訪問 URL: http://localhost:8080/institution-files/filename

  const backendBaseUrl = 'http://localhost:8080/institution-files'

  // 提取文件名（移除 /InstitutionResource/ 前綴）
  const fileName = imagePath.replace('/InstitutionResource/', '')
  const fullUrl = `${backendBaseUrl}/${fileName}`

  console.log('[AdminInstitutionEdit] imagePath 來源:', imagePath)
  console.log('[AdminInstitutionEdit] 提取的文件名:', fileName)
  console.log('[AdminInstitutionEdit] 後端基礎 URL:', backendBaseUrl)
  console.log('[AdminInstitutionEdit] 完整 URL:', fullUrl)
  console.log('========== currentImageUrl 計算完成 ==========')

  return fullUrl
})

const loadInstitution = async () => {
  if (isNew.value) return

  try {
    isLoading.value = true
    const institutionId = route.params.institutionID

    console.log('========== 載入機構資料 ==========')
    console.log('機構 ID:', institutionId)

    const data = await getInstitutionById(institutionId)

    console.log('API 回傳資料:', data)

    originalData.value = data

    form.value = {
      institutionID: data.institutionID,
      institutionName: data.institutionName || '',
      contactPerson: data.contactPerson || '',
      address: data.address || '',
      latitude: data.latitude || '',
      longitude: data.longitude || '',
      phoneNumber: data.phoneNumber || '',
      fax: data.fax || '',
      email: data.email || '',
      relatedLinks: data.relatedLinks || '',
      description: data.description || '',
      responsiblePerson: data.responsiblePerson || '',
      imagePath: data.imagePath || '',
      institutionsType: data.institutionsType,
      accountStatus: data.accountStatus ?? 1,
      createdUser: data.createdUser,
      createdTime: data.createdTime,
      updatedUser: data.updatedUser,
      updatedTime: data.updatedTime
    }

    console.log('映射後的表單資料:', form.value)
    console.log('accountStatus:', form.value.accountStatus)
    console.log('========== 載入完成 ==========')

  } catch (error) {
    console.error('載入機構資料失敗:', error)
    alert('載入機構資料失敗，請稍後再試')
    goBack()
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  console.log('AdminInstitutionEdit mounted, route.params:', route.params)
  if (!isNew.value) {
    loadInstitution()
  }
})

const validate = () => {
  if (!form.value.institutionName) {
    alert('請輸入機構名稱')
    return false
  }
  if (!form.value.contactPerson) {
    alert('請輸入連絡人')
    return false
  }
  if (!form.value.address) {
    alert('請輸入機構地址')
    return false
  }
  if (form.value.latitude && isNaN(Number(form.value.latitude))) {
    alert('緯度格式錯誤，請輸入數字（例如 24.123456）')
    return false
  }
  if (form.value.longitude && isNaN(Number(form.value.longitude))) {
    alert('經度格式錯誤，請輸入數字（例如 120.654321）')
    return false
  }
  if (!form.value.phoneNumber) {
    alert('請輸入機構電話')
    return false
  }
  if (!form.value.email) {
    alert('請輸入電子信箱')
    return false
  }
  if (!form.value.responsiblePerson) {
    alert('請輸入負責人')
    return false
  }
  return true
}

const save = async () => {
  if (!validate()) return

  try {
    isSaving.value = true

    if (isNew.value) {
      console.log('========== 準備新增機構資料 ==========')

      const createData = {
        institutionName: form.value.institutionName,
        contactPerson: form.value.contactPerson,
        address: form.value.address,
        latitude: form.value.latitude ? Number(form.value.latitude) : 0,
        longitude: form.value.longitude ? Number(form.value.longitude) : 0,
        phoneNumber: form.value.phoneNumber,
        fax: form.value.fax || '',
        email: form.value.email,
        relatedLinks: form.value.relatedLinks || '',
        description: form.value.description || '',
        responsiblePerson: form.value.responsiblePerson,
        imagePath: form.value.imagePath || '',
        institutionsType: form.value.institutionsType,
        accountStatus: form.value.accountStatus ?? 1,
        createdUser: 'admin',
        updatedUser: 'admin',
        createdTime: new Date().toISOString(),
        updatedTime: new Date().toISOString()
      }

      console.log('新增資料:', createData)
      console.log('圖片檔案:', selectedImage.value)

      const result = await createInstitution(createData)

      console.log('========== 新增成功 ==========')
      console.log('新增結果:', result)

      // 如果有選擇圖片，新增成功後立即更新圖片
      if (selectedImage.value && result.institutionID) {
        try {
          console.log('========== 上傳圖片 ==========')
          const updateWithImageResult = await updateInstitution(
            result.institutionID,
            result,
            selectedImage.value
          )
          console.log('圖片上傳成功:', updateWithImageResult)
        } catch (imageError) {
          console.error('圖片上傳失敗:', imageError)
          alert('機構新增成功，但圖片上傳失敗，請編輯機構後重新上傳圖片')
        }
      }

      alert('新增成功！')
      goBack()
    } else {
      console.log('========== 準備更新機構資料 ==========')

      const updateData = {
        institutionID: form.value.institutionID,
        institutionName: form.value.institutionName,
        contactPerson: form.value.contactPerson,
        address: form.value.address,
        latitude: form.value.latitude ? Number(form.value.latitude) : 0,
        longitude: form.value.longitude ? Number(form.value.longitude) : 0,
        phoneNumber: form.value.phoneNumber,
        fax: form.value.fax,
        email: form.value.email,
        relatedLinks: form.value.relatedLinks,
        description: form.value.description,
        responsiblePerson: form.value.responsiblePerson,
        imagePath: form.value.imagePath,
        institutionsType: form.value.institutionsType,
        accountStatus: form.value.accountStatus ?? 1,
        createdUser: form.value.createdUser,
        createdTime: form.value.createdTime,
        updatedUser: form.value.updatedUser || 'admin'
        // 注意：不發送 updatedTime，讓後端自動生成
      }

      console.log('更新資料:', updateData)
      console.log('圖片檔案:', selectedImage.value)

      // 🔧 修復：採用分離更新策略，避免後端 multipart/form-data 的 Bug
      // 1. 先用純 JSON 更新資料（確保 accountStatus 等欄位能正確更新）
      const result = await updateInstitution(
        form.value.institutionID,
        updateData,
        null  // 第一步不傳圖片
      )

      console.log('========== 資料更新成功 ==========')
      console.log('更新結果:', result)

      // 2. 如果有選擇新圖片，再單獨上傳圖片
      let finalResult = result
      if (selectedImage.value) {
        try {
          console.log('========== 上傳圖片 ==========')
          finalResult = await updateInstitution(
            form.value.institutionID,
            result,  // 使用第一步返回的最新資料
            selectedImage.value
          )
          console.log('圖片上傳成功:', finalResult)
        } catch (imageError) {
          console.error('圖片上傳失敗:', imageError)
          alert('資料更新成功，但圖片上傳失敗')
        }
      }

      console.log('========== 更新完成 ==========')
      console.log('最終結果:', finalResult)

      // 更新表單資料為後端返回的最新資料
      form.value = {
        institutionID: finalResult.institutionID,
        institutionName: finalResult.institutionName || '',
        contactPerson: finalResult.contactPerson || '',
        address: finalResult.address || '',
        latitude: finalResult.latitude || '',
        longitude: finalResult.longitude || '',
        phoneNumber: finalResult.phoneNumber || '',
        fax: finalResult.fax || '',
        email: finalResult.email || '',
        relatedLinks: finalResult.relatedLinks || '',
        description: finalResult.description || '',
        responsiblePerson: finalResult.responsiblePerson || '',
        imagePath: finalResult.imagePath || '',
        institutionsType: finalResult.institutionsType,
        accountStatus: finalResult.accountStatus ?? 1,
        createdUser: finalResult.createdUser,
        createdTime: finalResult.createdTime,
        updatedUser: finalResult.updatedUser,
        updatedTime: finalResult.updatedTime
      }

      // 清除選擇的圖片
      selectedImage.value = null
      previewImage.value = null

      alert('儲存成功！')
      goBack()
    }

  } catch (error) {
    console.error('儲存失敗:', error)

    if (error.response?.status === 404) {
      alert('找不到該機構，請確認機構是否存在')
    } else if (error.response?.status === 400) {
      alert('資料格式錯誤，請檢查輸入內容')
    } else {
      alert('儲存失敗，請稍後再試')
    }
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.push({ name: 'AdminInstitution' })
}

const uploadPhoto = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('請選擇圖片檔案')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('圖片大小不能超過 5MB')
        return
      }

      selectedImage.value = file

      // 生成圖片預覽 URL
      const reader = new FileReader()
      reader.onload = (event) => {
        previewImage.value = event.target.result
        console.log('已選擇圖片:', file.name)
        console.log('圖片預覽已生成')
      }
      reader.readAsDataURL(file)
    }
  }

  input.click()
}

const removeImage = () => {
  selectedImage.value = null
  previewImage.value = null
  console.log('已移除選擇的圖片')
}

const handleImageError = (event) => {
  console.error('========== 圖片加載失敗 DEBUG ==========')
  console.error('[AdminInstitutionEdit] 失敗的 URL:', event.target.src)
  console.error('[AdminInstitutionEdit] form.imagePath:', form.value.imagePath)
  console.error('[AdminInstitutionEdit] currentImageUrl:', currentImageUrl.value)
  console.error('[AdminInstitutionEdit] 時間戳:', new Date().toISOString())

  // 診斷信息
  console.error('========== 為什麼圖片無法顯示 ==========')
  console.error('❌ 當前狀態：後端未配置靜態資源服務')
  console.error('')
  console.error('✓ 前端已正確構建 HTTP URL')
  console.error('  URL: http://localhost:8080/institution-files/a2b1140e-2b46-40eb-828b-57bfcd343712_%E8%9E%A2%E5%B9%95...')
  console.error('')
  console.error('❌ 缺少的配置：後端靜態資源映射')
  console.error('  需要配置: /institution-files/** → C:\\...\\後端\\Childcare\\InstitutionResource\\')
  console.error('')
  console.error('========== 後端配置方案 ==========')
  console.error('1️⃣ 創建文件：src/main/java/com/example/config/WebConfig.java')
  console.error('')
  console.error('2️⃣ 添加以下代碼：')
  console.error('@Configuration')
  console.error('public class WebConfig implements WebMvcConfigurer {')
  console.error('    @Override')
  console.error('    public void addResourceHandlers(ResourceHandlerRegistry registry) {')
  console.error('        registry.addResourceHandler("/institution-files/**")')
  console.error('                .addResourceLocations("file:C:/Users/lovec/OneDrive/Desktop/逢甲課程資料/第三學期/軟體專題製作/後端/Childcare/InstitutionResource/");')
  console.error('    }')
  console.error('}')
  console.error('')
  console.error('3️⃣ 重啟後端服務')
  console.error('')
  console.error('========== 驗證配置 ==========')
  console.error('在瀏覽器中訪問：')
  console.error('http://localhost:8080/institution-files/a2b1140e-2b46-40eb-828b-57bfcd343712_%E8%9E%A2%E5%B9%95%E6%93%B7%E5%8F%96%E7%95%AB%E9%9D%A2%202025-07-06%20131055.png')
  console.error('✓ 能看到圖片 → 後端配置成功，刷新前端頁面')
  console.error('❌ 404 → 後端路由配置錯誤或路徑不對')
  console.error('')
  console.error('========== 加載失敗詳情結束 ==========')

  event.target.style.display = 'none'

  // 添加錯誤提示文本
  const errorDiv = document.createElement('div')
  errorDiv.style.cssText = 'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: #f9f9fb; color: #999; font-size: 12px; text-align: center; padding: 10px; word-break: break-all;'
  errorDiv.innerHTML = `
    <div>
      <div style="margin-bottom: 5px; font-weight: bold;">圖片加載失敗</div>
      <div style="font-size: 11px; color: #ccc; margin-top: 5px;">
        後端未配置靜態資源服務
      </div>
      <div style="font-size: 11px; color: #ccc; margin-top: 5px;">
        查看 Console 瞭解配置步驟
      </div>
    </div>
  `
  event.target.parentElement.appendChild(errorDiv)
}
</script>

<style scoped>
.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; min-height: 400px; }
.spinner { width: 40px; height: 40px; border: 4px solid #e6f2ff; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 20px; }
@keyframes spin { to { transform: rotate(360deg); } }

.institution-edit-page { display:flex; justify-content:center;  }
.institution-edit-card { width: 100%  }
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; margin-top: 60px}
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700;  }
.tab-row { display:flex; justify-content:center; margin-bottom:18px;margin-top: 50px }
.tab-title { background: #f9dada; color:#e35d6a; font-weight:700; font-size:1.15rem; padding:6px 38px; border-radius:18px; letter-spacing:2px; }
.edit-form-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:18px 24px; margin-bottom:22px; box-shadow:0 2px 8px rgba(16,24,40,0.04); }
.form-row { display:flex; align-items:flex-start; gap:18px; margin-bottom:16px; justify-content: center; }
.form-label { font-weight:600; color:#2e6fb7; min-width:100px; margin-top:8px; }
.form-input { width:420px; max-width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; height: 40px}
.form-textarea { width:420px; height:200px;max-width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; resize:vertical; }
.radio-group { display:flex; gap:30px; align-items:center; flex-wrap:wrap; padding-top:8px; width: 420px}
.radio-label { display:flex; align-items:center; gap:8px; cursor:pointer; color:#333; font-weight:500; }
.radio-label input[type="radio"] { cursor:pointer; width:16px; height:16px; }
.radio-label span { user-select:none; }
.btn { padding:7px 18px; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:1rem; transition: all 0.2s; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.file-btn{width: 420px; display: flex; align-items: center; gap: 12px;}
.file-name { color: #2e6fb7; font-size: 0.9rem; }
.file-upload-section { width: 420px; display: flex; flex-direction: column; gap: 16px; }
.image-preview-container { display: flex; flex-direction: column; gap: 16px; }
.preview-item { display: flex; flex-direction: column; gap: 8px; }
.preview-label { margin: 0; font-size: 0.9rem; color: #666; font-weight: 500; }
.preview-box { position: relative; width: 200px; height: 200px; border: 2px solid #e6e6ea; border-radius: 8px; overflow: hidden; background: #f9f9fb; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.btn-remove { position: absolute; top: 4px; right: 4px; background: rgba(227, 93, 106, 0.9); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
.btn-remove:hover { background: rgba(227, 93, 106, 1); }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
.btn.secondary { background:#f3f4f6; color:#333; border:1px solid #d8dbe0; }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:8px; margin-bottom: 20px}
@media (max-width:900px){ .institution-edit-card{ width:100%; padding:16px } .form-input, .form-textarea{ width:100% } }
</style>

