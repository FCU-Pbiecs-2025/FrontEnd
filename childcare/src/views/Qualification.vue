<template>
  <div class="qualification-container">
    <!-- 錯誤提示 -->
    <div v-if="error" class="alert alert-error">
      {{ error }}
    </div>
    <!-- 成功提示 -->
    <div v-if="success" class="alert alert-success">
      {{ success }}
    </div>
    <!-- 載入提示 -->
    <div v-if="loading" class="alert alert-info">
      載入中...
    </div>

    <div class="content-area">
      <!-- 服務內容與時間 -->
      <section class="service-section">
        <h2 class="section-title">服務內容與時間</h2>
        <div class="content-card">
          <div class="content-display" v-html="serviceContentAndTime"></div>
        </div>
      </section>
      <!-- 收費及退費原則 -->
      <section class="fee-section">
        <h2 class="section-title">收費及退費原則</h2>
        <div class="content-card">
          <div class="content-display" v-html="feeAndRefundPolicy"></div>
        </div>
      </section>
      <!-- 收托資格 -->
      <section class="qualification-section">
        <h2 class="section-title">收托資格</h2>
        <div class="content-card">
          <div class="content-display" v-html="admissionEligibility"></div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { getRules } from '../api/rules'

export default {
  name: 'Qualification',
  data() {
    return {
      ruleId: 1,
      admissionEligibility: '',
      serviceContentAndTime: '',
      feeAndRefundPolicy: '',
      loading: false,
      error: '',
      success: ''
    }
  },
  mounted() {
    this.fetchRule()
  },
  methods: {
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
        }
        this.error = ''
      } catch (err) {
        console.error('取得資料失敗:', err)
        this.error = '取得資料失敗: ' + (err.response?.data?.message || err.message)
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

.content-display {
  line-height: 1.6;
  color: #2c3e50;
}

.content-display ul, .content-display ol {
  padding-left: 20px;
  margin: 10px 0;
}

.content-display li {
  margin: 5px 0;
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
