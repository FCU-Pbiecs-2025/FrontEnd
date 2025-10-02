<template>
  <div class="agency-search-page">
    <div class="page-header">
      <h1>查詢托育機構</h1>
      <p class="page-description">尋找符合需求的優質托育機構，提供安全可靠的托育服務</p>
    </div>

    <div class="content-area">
      <div class="search-section">
        <div class="search-form">
          <div class="form-row">
            <div class="form-group">
              <label>縣市</label>
              <select>
                <option>新竹縣</option>
              </select>
            </div>
            <div class="form-group">
              <label>鄉鎮市區</label>
              <select>
                <option>請選擇</option>
                <option>竹北市</option>
                <option>竹東鎮</option>
                <option>新埔鎮</option>
                <option>關西鎮</option>
              </select>
            </div>
            <div class="form-group">
              <label>托育類型</label>
              <select>
                <option>請選擇</option>
                <option>公立托嬰中心</option>
                <option>私立托嬰中心</option>
                <option>居家托育</option>
              </select>
            </div>
          </div>
          <button class="search-btn">搜尋機構</button>
        </div>
      </div>

      <div class="results-section">
        <h2>搜尋結果</h2>
        <div class="agency-list">
          <div class="agency-item">
            <div class="agency-info">
              <h3>新竹縣公立托嬰中心</h3>
              <p class="agency-address">📍 新竹縣竹北市中正東路123號</p>
              <p class="agency-phone">📞 03-1234567</p>
              <p class="agency-capacity">👶 收托人數：30人</p>
            </div>
            <div class="agency-status">
              <span class="status-badge available">有名額</span>
            </div>
          </div>

          <div class="agency-item">
            <div class="agency-info">
              <h3>竹東托嬰中心</h3>
              <p class="agency-address">📍 新竹縣竹東鎮東林路456號</p>
              <p class="agency-phone">📞 03-2345678</p>
              <p class="agency-capacity">👶 收托人數：25人</p>
            </div>
            <div class="agency-status">
              <span class="status-badge full">額滿</span>
            </div>
          </div>

          <div class="agency-item">
            <div class="agency-info">
              <h3>新埔幼兒園附設托嬰中心</h3>
              <p class="agency-address">📍 新竹縣新埔鎮中正路789號</p>
              <p class="agency-phone">📞 03-3456789</p>
              <p class="agency-capacity">👶 收托人數：20人</p>
            </div>
            <div class="agency-status">
              <span class="status-badge available">有名額</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgencySearch'
}
</script>

<style scoped>
.agency-search-page {
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

.search-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 40px;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  color: #333;
  font-weight: bold;
  margin-bottom: 8px;
}

.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #F9AFAE;
  border-radius: 8px;
  font-size: 1rem;
}

.search-btn {
  background: #F9AFAE;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #f5a1a1;
}

.results-section h2 {
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 24px;
}

.agency-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.agency-item {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.agency-info h3 {
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 12px;
}

.agency-info p {
  color: #666;
  margin: 4px 0;
  font-size: 0.95rem;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
}

.status-badge.available {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-badge.full {
  background: #ffebee;
  color: #c62828;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 16px;
  }

  .agency-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
