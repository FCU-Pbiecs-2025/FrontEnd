<template>
  <div class="news-page">
    <div class="page-header">
      <h1>最新消息</h1>
      <p class="page-description">查看新竹縣公共托育服務的最新公告與重要消息</p>
    </div>

    <div class="content-area">
      <div class="news-list">
        <div class="news-item">
          <div class="news-date">2024/01/15</div>
          <div class="news-content">
            <h3>新竹縣公共托育服務申請流程更新通知</h3>
            <p>為提供更優質的托育服務，本縣公共托育申請流程將於近期進行調整，請家長注意相關變更內容...</p>
          </div>
        </div>

        <div class="news-item">
          <div class="news-date">2024/01/10</div>
          <div class="news-content">
            <h3>托育補助申請期限提醒</h3>
            <p>提醒各位家長，本年度托育補助申請將於月底截止，尚未申請的家長請儘速辦理相關手續...</p>
          </div>
        </div>

        <div class="news-item">
          <div class="news-date">2024/01/05</div>
          <div class="news-content">
            <h3>托育機構評鑑結果公告</h3>
            <p>新竹縣各托育機構評鑑結果已公布，家長可至本系統查詢各機構的評鑑等級與服務品質...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'News'
}
</script>

<style scoped>
.news-page {
  min-height: calc(100vh - 160px); /* 減去 header 和 footer 的高度 */
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

.news-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.news-item {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
  border-left: 4px solid #F9AFAE;
  transition: transform 0.2s, box-shadow 0.2s;
}

.news-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(249, 175, 174, 0.2);
}

.news-date {
  color: #F9AFAE;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.news-content h3 {
  color: #333;
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.news-content p {
  color: #666;
  line-height: 1.6;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .news-page {
    padding: 20px 0;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .content-area {
    padding: 0 16px;
  }

  .news-item {
    padding: 20px;
  }
}
</style>
