<template>
  <div class="member-center-page">
    <div class="page-header">
      <h1>會員中心</h1>
      <p class="page-description">管理您的個人資料、查看申請進度與托育服務狀況</p>
    </div>

    <div class="content-area">
      <div class="member-info-section">
        <h2>個人資料</h2>
        <div class="member-card">
          <div class="member-avatar">
            <img src="https://img.icons8.com/ios-filled/100/F9AFAE/user-male-circle.png" alt="會員頭像" />
          </div>
          <div class="member-details">
            <h3>王小明</h3>
            <p>📧 email: wang@example.com</p>
            <p>📱 電話: 0912-345-678</p>
            <p>🏠 地址: 新竹縣竹北市中正東路123號</p>
            <button class="edit-btn">編輯資料</button>
          </div>
        </div>
      </div>

      <div class="services-section">
        <h2>我的服務</h2>
        <div class="services-grid">
          <div class="service-card">
            <div class="service-icon">📋</div>
            <h3>申請進度查詢</h3>
            <p>查看托育服務申請的處理進度</p>
            <button class="service-btn">查看詳情</button>
          </div>

          <div class="service-card">
            <div class="service-icon">📝</div>
            <h3>申請托育服務</h3>
            <p>線上申請公共托育服務</p>
            <button class="service-btn">立即申請</button>
          </div>

          <div class="service-card">
            <div class="service-icon">💰</div>
            <h3>補助試算</h3>
            <p>計算您可申請的托育補助金額</p>
            <button class="service-btn">開始試算</button>
          </div>

          <div class="service-card">
            <div class="service-icon">📊</div>
            <h3>服務記錄</h3>
            <p>查看過往的申請與服務記錄</p>
            <button class="service-btn">查看記錄</button>
          </div>
        </div>
      </div>

      <div class="applications-section">
        <h2>申請狀態</h2>
        <div class="applications-list">
          <div class="application-item">
            <div class="application-info">
              <h4>公共托育服務申請</h4>
              <p class="application-date">申請日期: 2024/01/15</p>
              <p class="application-details">申請人: 王小明 | 嬰兒: 王小寶 (6個月)</p>
            </div>
            <div class="application-status">
              <span class="status-badge processing">審核中</span>
            </div>
          </div>

          <div class="application-item">
            <div class="application-info">
              <h4>托育補助申請</h4>
              <p class="application-date">申請日期: 2024/01/10</p>
              <p class="application-details">補助類型: 一般家庭托育補助</p>
            </div>
            <div class="application-status">
              <span class="status-badge approved">已核准</span>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-actions-section">
        <h2>快速功能</h2>
        <div class="quick-actions">
          <button class="quick-action-btn">
            <span class="action-icon">🔄</span>
            <span>更新個人資料</span>
          </button>
          <button class="quick-action-btn">
            <span class="action-icon">📞</span>
            <span>聯絡客服</span>
          </button>
          <button class="quick-action-btn">
            <span class="action-icon">📋</span>
            <span>下載申請表</span>
          </button>
          <button class="quick-action-btn">
            <span class="action-icon">🚪</span>
            <span>登出系統</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MemberCenter'
}
</script>

<style scoped>
.member-center-page {
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

.member-info-section,
.services-section,
.applications-section,
.quick-actions-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
}

.member-info-section h2,
.services-section h2,
.applications-section h2,
.quick-actions-section h2 {
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 24px;
  border-bottom: 3px solid #F9AFAE;
  padding-bottom: 8px;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: #FFF8F6;
  border-radius: 12px;
}

.member-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.member-details h3 {
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 12px;
}

.member-details p {
  color: #666;
  margin: 6px 0;
  font-size: 1rem;
}

.edit-btn {
  background: #F9AFAE;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 12px;
  transition: background 0.2s;
}

.edit-btn:hover {
  background: #f5a1a1;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.service-card {
  padding: 24px;
  background: #FFF8F6;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(249, 175, 174, 0.2);
}

.service-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.service-card h3 {
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 12px;
}

.service-card p {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
}

.service-btn {
  background: #F9AFAE;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.service-btn:hover {
  background: #f5a1a1;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.application-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #FFF8F6;
  border-radius: 8px;
  border-left: 4px solid #F9AFAE;
}

.application-info h4 {
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.application-date,
.application-details {
  color: #666;
  font-size: 0.9rem;
  margin: 4px 0;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.85rem;
}

.status-badge.processing {
  background: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #FFF8F6;
  border: 2px solid #F9AFAE;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.quick-action-btn:hover {
  background: #F9AFAE;
  color: white;
}

.action-icon {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .member-card {
    flex-direction: column;
    text-align: center;
  }

  .application-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
