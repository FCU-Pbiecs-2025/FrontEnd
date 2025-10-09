<template>
  <div class="status-page">

    <h1 class="status-title">申請進度查詢</h1>
    <div class="status-list">
      <div class="status-header">
        <span>案號</span>
        <span>申請日期</span>
        <span>身分類別</span>
        <span>目前審核狀態</span>
      </div>
      <div v-for="item in applications" :key="item.caseNo" class="status-row">
        <span class="case-no">{{ item.caseNo }}</span>
        <span>{{ item.applyDate }}</span>
        <span>{{ item.identityType }}</span>
        <span :class="['status-badge', item.statusClass]">{{ item.status }}</span>
      </div>
      <div v-if="applications.length === 0" class="empty-tip">目前沒有申請紀錄</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// 假資料，後續可串接API
const applications = ref([
  {
    caseNo: 'A20241009001',
    applyDate: '2025-10-01',
    identityType: '低收入戶',
    status: '審核中',
    statusClass: 'pending'
  },
  {
    caseNo: 'A20240915002',
    applyDate: '2025-09-15',
    identityType: '低收入戶',
    status: '已通過',
    statusClass: 'approved'
  },
  {
    caseNo: 'A20240820003',
    applyDate: '2025-08-20',
    identityType: '低收入戶',
    status: '退件',
    statusClass: 'rejected'
  }
])
</script>

<style scoped>
.status-page {
  max-width: 900px;
  margin: 40px auto 0 auto;
  padding: 0 16px 40px 16px;
}
.main-title-row {
  display: flex;
  align-items: center;
  margin-left: 32px;
  margin-bottom: 0;
}
.main-title-icon {
  width: 48px;
  margin-right: 10px;
}
.main-title {
  color: #2176d2;
  font-size: 2rem;
}
.status-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 32px;
  text-align: center;
}
.status-list {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(249, 175, 174, 0.12);
  padding: 32px 24px;
}
.status-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  color: #f9afae;
  font-size: 1.1rem;
  border-bottom: 2px solid #ffe5c2;
  padding-bottom: 12px;
  margin-bottom: 18px;
}
.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid #ffe5c2;
  font-size: 1.08rem;
  transition: background 0.2s;
}
.status-row:last-child {
  border-bottom: none;
}
.status-row:hover {
  background: #fff8f6;
}
.case-no {
  font-family: 'Consolas', 'monospace';
  color: #a67c52;
}
.status-badge {
  padding: 4px 16px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1rem;
  letter-spacing: 1px;
  min-width: 70px;
  text-align: center;
}
.status-badge.pending {
  background: #fffbe6;
  color: #f9afae;
  border: 1px solid #ffe5c2;
}
.status-badge.approved {
  background: #e6ffe6;
  color: #3bb273;
  border: 1px solid #b2f2b2;
}
.status-badge.rejected {
  background: #ffeaea;
  color: #e74c3c;
  border: 1px solid #ffb6b9;
}
.empty-tip {
  text-align: center;
  color: #aaa;
  padding: 32px 0 0 0;
  font-size: 1.1rem;
}
@media (max-width: 600px) {
  .status-header, .status-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .status-list {
    padding: 16px 4px;
  }
}
</style>
