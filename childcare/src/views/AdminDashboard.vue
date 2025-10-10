<template>
  <div class="admin-announcement">
    <!-- 代辦事項通知區塊 -->
    <h2 class="section-title">代辦事項通知</h2>
    <div class="news-list-section">
      <div class="news-list-header">
        <span>發布日期</span>
        <span>事項標題</span>
        <span>內容</span>
      </div>
      <div v-for="item in todoList" :key="item.id" class="news-list-row">
        <span class="news-date-cell">{{ item.date }}</span>
        <span class="news-title-cell" :title="item.title">{{ item.title.length > 18 ? item.title.slice(0, 18) + '...' : item.title }}</span>
        <span class="news-content-cell">{{ item.content }}</span>
      </div>
      <div v-if="todoList.length === 0" class="empty-tip">目前沒有代辦事項</div>
    </div>

    <!-- 後台系統公告區塊 -->
    <h2 class="section-title">後台系統公告</h2>
    <div class="news-list-section">
      <div class="news-list-header">
        <span>發布日期</span>
        <span>公告標題</span>
        <span>公告內容</span>
      </div>
      <div v-for="item in announcementList" :key="item.id" class="news-list-row">
        <span class="news-date-cell">{{ item.date }}</span>
        <span class="news-title-cell" :title="item.title">{{ item.title.length > 18 ? item.title.slice(0, 18) + '...' : item.title }}</span>
        <span class="news-content-cell">{{ item.content }}</span>
      </div>
      <div v-if="announcementList.length === 0" class="empty-tip">目前沒有公告</div>
    </div>
  </div>
</template>

<script setup>
const todoList = [
  { id: 1, title: '審核新申請', content: '有 3 筆新申請待審核', date: '2025/10/10' },
  { id: 2, title: '補位抽籤', content: '本週需進行補位抽籤', date: '2025/10/09' }
]
const announcementList = [
  { id: 1, title: '系統維護通知', content: '後台系統將於本週末進行維護，請提前完成重要作業。', date: '2025/10/08' },
  { id: 2, title: '新功能上線', content: '公告管理功能已上線，歡迎使用。', date: '2025/10/05' }
]
</script>

<style scoped>
/* reuse the same styles present in AdminHome for news list */
.section-title {
  font-size: 1.35rem;
  color: #e35d6a;
  font-weight: bold;
  margin: 24px 0 8px 0;
  letter-spacing: 1px;
}
.news-list-section {
  background-color: #fff;
  border: 2px solid #F9AFAE;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(249, 175, 174, 0.15);
  overflow-y: auto;
}
.news-list-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  color: #e35d6a;
  font-size: 1.1rem;
  border-bottom: 2px solid #FFE5C2;
  padding-bottom: 12px;
  margin-bottom: 8px;
}
.news-list-header span { flex:1; text-align:left; }
.news-list-row { display:flex; align-items:center; padding:18px 0; border-bottom:1px solid #FFE5C2; }
.news-list-row:hover { background:#fffbe6; }
.news-date-cell { flex:1; color:#888; font-size:1rem; min-width:110px; }
.news-title-cell { flex:2; color:#333; font-weight:bold; font-size:1.05rem; min-width:180px; }
.news-content-cell { flex:3; color:#555; font-size:1rem; min-width:220px; }
.empty-tip { color:#aaa; text-align:center; padding:24px 0; }
</style>
