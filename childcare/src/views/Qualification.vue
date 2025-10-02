<template>
  <div class="qualification-page">
    <div class="page-header">
      <h1>公托資格說明</h1>
      <p class="page-description">了解新竹縣公共托育服務申請資格與相關規定</p>
    </div>

    <div class="content-area">
      <div class="qualification-section">
        <h2>申請資格</h2>
        <div class="qualification-list">
          <div class="qualification-item">
            <div class="qualification-icon">👶</div>
            <div class="qualification-content">
              <h3>年齡條件</h3>
              <p>嬰幼兒年齡須滿2個月至未滿2歲，且設籍於新竹縣</p>
            </div>
          </div>

          <div class="qualification-item">
            <div class="qualification-icon">🏠</div>
            <div class="qualification-content">
              <h3>戶籍條件</h3>
              <p>申請人（父母之一方）須設籍新竹縣滿6個月以上</p>
            </div>
          </div>

          <div class="qualification-item">
            <div class="qualification-icon">💼</div>
            <div class="qualification-content">
              <h3>就業條件</h3>
              <p>申請人須有就業事實或特殊情況需要托育服務</p>
            </div>
          </div>

          <div class="qualification-item">
            <div class="qualification-icon">💰</div>
            <div class="qualification-content">
              <h3>收入條件</h3>
              <p>家庭年所得須符合相關規定標準</p>
            </div>
          </div>
        </div>
      </div>

      <div class="documents-section">
        <h2>應備文件</h2>
        <div class="documents-grid">
          <div class="document-item">
            <h4>📋 申請表</h4>
            <p>公共托育服務申請表（需親自簽名）</p>
          </div>
          <div class="document-item">
            <h4>🆔 身分證明</h4>
            <p>申請人及嬰幼兒戶口名簿或戶籍謄本</p>
          </div>
          <div class="document-item">
            <h4>💼 就業證明</h4>
            <p>在職證明書或相關就業文件</p>
          </div>
          <div class="document-item">
            <h4>💰 所得證明</h4>
            <p>最近一年度綜合所得稅各類所得資料清單</p>
          </div>
          <div class="document-item">
            <h4>🏥 健康證明</h4>
            <p>嬰幼兒健康檢查證明</p>
          </div>
          <div class="document-item">
            <h4>💉 預防接種</h4>
            <p>嬰幼兒預防接種時程及紀錄表</p>
          </div>
        </div>
      </div>

      <div class="process-section">
        <h2>申請流程</h2>
        <div class="process-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>準備文件</h4>
              <p>備齊所有必要申請文件</p>
            </div>
          </div>
          <div class="step-arrow">→</div>

          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>線上申請</h4>
              <p>至本系統填寫申請表並上傳文件</p>
            </div>
          </div>
          <div class="step-arrow">→</div>

          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>審核作業</h4>
              <p>相關單位進行資格審核（約7-14個工作天）</p>
            </div>
          </div>
          <div class="step-arrow">→</div>

          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>結果通知</h4>
              <p>審核結果將以簡訊或電話通知</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Qualification'
}
</script>

<style scoped>
.qualification-page {
  min-height: calc(100vh - 160px);
  background: #FFF8F6;
  padding: 40px 0;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  color: #333;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 16px;
}

.page-description {
  color: #666;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

.content-area {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.qualification-section,
.documents-section,
.process-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
}

.qualification-section h2,
.documents-section h2,
.process-section h2 {
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 24px;
  border-bottom: 3px solid #F9AFAE;
  padding-bottom: 8px;
}

.qualification-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.qualification-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #FFF8F6;
  border-radius: 8px;
}

.qualification-icon {
  font-size: 2rem;
  width: 60px;
  text-align: center;
}

.qualification-content h3 {
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 8px;
}

.qualification-content p {
  color: #666;
  line-height: 1.5;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.document-item {
  padding: 20px;
  background: #FFF8F6;
  border-radius: 8px;
  border-left: 4px solid #F9AFAE;
}

.document-item h4 {
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.document-item p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
}

.process-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 150px;
}

.step-number {
  width: 50px;
  height: 50px;
  background: #F9AFAE;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 12px;
}

.step-content h4 {
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.step-content p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.step-arrow {
  font-size: 1.5rem;
  color: #F9AFAE;
  font-weight: bold;
}

@media (max-width: 768px) {
  .qualification-item {
    flex-direction: column;
    text-align: center;
  }

  .process-steps {
    flex-direction: column;
  }

  .step-arrow {
    transform: rotate(90deg);
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }
}
</style>
