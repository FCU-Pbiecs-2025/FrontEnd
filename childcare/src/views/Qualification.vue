<template>
  <div class="qualification-container">
    <div class="content-area">
      <!-- 錯誤和成功訊息 -->
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>
      <div v-if="loading" class="alert alert-info">處理中...</div>

      <!-- 服務內容與時間 -->
      <section class="service-section">
        <h2 class="section-title">服務內容與時間</h2>
        <div class="content-card">
          <div ref="serviceEditor"></div>
        </div>
      </section>
      <!-- 收費及退費原則 -->
      <section class="fee-section">
        <h2 class="section-title">收費及退費原則</h2>
        <div class="content-card">
          <div ref="feeEditor"></div>
        </div>
      </section>
      <!-- 收托資格 -->
      <section class="qualification-section">
        <h2 class="section-title">收托資格</h2>
        <div class="content-card">
          <div ref="admissionEditor"></div>
        </div>
      </section>
      <button @click="saveRule" class="save-btn" :disabled="loading">
        {{ loading ? '儲存中...' : '儲存' }}
      </button>
    </div>
  </div>
</template>

<script>
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { getRules, updateRule } from '../api/rules'

export default {
  name: 'Qualification',
  data() {
    return {
      ruleId: 1,
      admissionEligibility: '',
      serviceContentAndTime: '',
      feeAndRefundPolicy: '',
      quillAdmission: null,
      quillService: null,
      quillFee: null,
      loading: false,
      error: '',
      success: ''
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initQuillEditors()
      this.fetchRule()
    })
  },
  methods: {
    initQuillEditors() {
      const toolbarOptions = [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['clean']
      ]

      this.quillService = new Quill(this.$refs.serviceEditor, {
        theme: 'snow',
        modules: {
          toolbar: toolbarOptions
        }
      })
      this.quillFee = new Quill(this.$refs.feeEditor, {
        theme: 'snow',
        modules: {
          toolbar: toolbarOptions
        }
      })
      this.quillAdmission = new Quill(this.$refs.admissionEditor, {
        theme: 'snow',
        modules: {
          toolbar: toolbarOptions
        }
      })
    },
    async fetchRule() {
      this.loading = true
      try {
        console.log('開始取得規則資料...')
        const res = await getRules()
        console.log('API 回應:', res)
        if (res.data && res.data.length > 0) {
          const rule = res.data[0]
          this.ruleId = rule.id
          this.admissionEligibility = rule.admissionEligibility || ''
          this.serviceContentAndTime = rule.serviceContentAndTime || ''
          this.feeAndRefundPolicy = rule.feeAndRefundPolicy || ''

          // 確保 Quill 編輯器已初始化
          if (this.quillAdmission && this.quillService && this.quillFee) {
            this.quillAdmission.root.innerHTML = this.admissionEligibility
            this.quillService.root.innerHTML = this.serviceContentAndTime
            this.quillFee.root.innerHTML = this.feeAndRefundPolicy
          }
        }
        this.error = ''
      } catch (err) {
        console.error('取得資料失敗:', err)
        this.error = '取得資料失敗: ' + (err.response?.data?.message || err.message)
      } finally {
        this.loading = false
      }
    },
    async saveRule() {
      this.loading = true
      this.error = ''
      this.success = ''

      // 確保 Quill 編輯器存在
      if (!this.quillAdmission || !this.quillService || !this.quillFee) {
        this.error = '編輯器尚未初始化完成，請稍後再試'
        this.loading = false
        return
      }

      const data = {
        admissionEligibility: this.quillAdmission.root.innerHTML,
        serviceContentAndTime: this.quillService.root.innerHTML,
        feeAndRefundPolicy: this.quillFee.root.innerHTML
      }

      console.log('儲存資料至 /api/rules/' + this.ruleId)

      try {
        await updateRule(this.ruleId, data)
        console.log('✅ 儲存成功')
        this.success = '儲存成功！資料已更新'
        setTimeout(() => {
          this.success = ''
        }, 3000)
      } catch (err) {
        console.error('❌ 儲存失敗:', err)

        const status = err.response?.status
        let errorMsg = '儲存失敗'

        // 根據狀態碼給出具體提示
        if (!status) {
          errorMsg = '無法連接到後端伺服器，請確認後端是否正常運行'
        } else if (status === 401) {
          errorMsg = '認證失敗，請重新登入'
        } else if (status === 403) {
          errorMsg = '權限不足，無法執行此操作'
        } else if (status === 404) {
          errorMsg = '找不到對應的資源'
        } else if (status === 500) {
          errorMsg = '伺服器內部錯誤，請稍後再試'
        } else if (err.response?.data?.message) {
          errorMsg = err.response.data.message
        } else {
          errorMsg = err.message || '未知錯誤'
        }

        this.error = errorMsg
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.qualification-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Microsoft JhengHei', sans-serif;
}

.content-area {
  padding: 0 20px;
}

.section-title {
  color: #34495e;
  font-size: 1.8em;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 3px solid #3498db;
}

.content-card {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.save-btn {
  display: block;
  margin: 30px auto 0 auto;
  padding: 12px 32px;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1.2em;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  transition: background 0.2s;
}

.save-btn:hover {
  background: #2176d2;
}

.save-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.alert {
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-weight: bold;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .qualification-container {
    padding: 15px;
  }

  .section-title {
    font-size: 1.5em;
  }

  .content-card {
    padding: 20px;
  }
}
</style>
