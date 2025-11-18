<template>
  <div class="announcement-page">
    <div class="announcement-card">
      <div class="title-row">
        <img src="https://img.icons8.com/ios/48/2e6fb7/approval.png" class="icon" alt="icon" />
        <span class="main-title">審核申請</span>
      </div>

      <div class="query-card">
        <div class="query-container">
          <div class="query-row">
            <div class="search-area">
              <label class="type-label">機構名稱：</label>
              <select v-model="filters.institution" class="date-input" style="width:180px">
                <option value="">全部</option>
                <option v-for="name in institutionOptions" :key="name" :value="name">{{ name }}</option>
              </select>
            </div>
          </div>
          <div class="query-row">
            <div class="search-area">
              <label class="type-label">申請編號：</label>
              <input v-model="filters.applicationId" placeholder="請輸入申請編號" class="date-input" style="width:200px" />
            </div>
          </div>
          <div class="query-row">
            <div class="search-area">
              <label class="type-label">申請人身分證：</label>
              <input v-model="filters.applicant" placeholder="身分證" class="date-input" style="width:200px" />
            </div>
          </div>
        </div>
        <div class="btn-query">
          <button class="btn query" @click="search">查詢</button>
        </div>
      </div>

      <div class="table-section">
        <table class="announcement-table">
          <thead>
            <tr>
              <th>申請編號</th>
              <th>申請日期</th>
              <th>申請人</th>
              <th>機構</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedItems" :key="item.id">
              <td class="date-cell">{{ item.id }}</td>
              <td class="date-cell">{{ item.Date }}</td>
              <td class="title-cell">{{ item.applicant }}</td>
              <td class="title-cell">{{ item.institution }}</td>
              <td class="title-cell">{{ item.status }}</td>
              <td class="action-cell">
                <button class="btn small" @click="openDetail(item)">審核</button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="6" class="empty-tip">目前沒有符合條件的申請</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-row">
        <div class="pagination-info">
          共 {{ totalElements }} 筆資料，第 {{ currentPage }} / {{ totalPages }} 頁
        </div>
        <div class="pagination-controls">
          <button class="btn small pagination-btn" :disabled="currentPage === 1 || totalPages <= 1" @click="prevPage">上一頁</button>
          <button
            v-for="page in pageNumbers"
            :key="page"
            class="btn small pagination-btn"
            :class="{ 'btn-active': page === currentPage }"
            :disabled="totalPages <= 1"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button class="btn small pagination-btn" :disabled="currentPage === totalPages || totalPages <= 1" @click="nextPage">下一頁</button>
        </div>
      </div>

      <div class="bottom-row" v-show="showBack">
        <button class="btn primary" @click="goBack">返回</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getApplicationsByOffset, searchApplications } from '@/api/application.js';

const router = useRouter()
const filters = ref({ institution: '', applicationId: '', applicant: '' })

const today = new Date();
const pad = n => n.toString().padStart(2, '0');
const formatDate = d => `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())}`;

// 分頁設定
const PAGE_SIZE = 10;
const currentPage = ref(1);
const totalPages = ref(1);
const totalElements = ref(0);

// 原始完整資料列表
const fullList = ref([]);
const items = ref([]);

async function fetchApplications() {
  try {
    const offset = (currentPage.value - 1) * PAGE_SIZE;
    const data = await getApplicationsByOffset(offset, PAGE_SIZE);

    if (data && data.content && Array.isArray(data.content)) {
      fullList.value = data.content.map(item => ({
        id: item.applicationID,
        Date: item.applicationDate,
        applicant: item.name || '未提供',
        institution: item.institutionName || '未提供',
        status: item.status || '未提供'
      }));
      items.value = [...fullList.value];
      totalElements.value = data.totalElements || fullList.value.length;
      totalPages.value = data.totalPages || Math.ceil(totalElements.value / PAGE_SIZE);
    } else {
      fullList.value = [];
      items.value = [];
      totalElements.value = 0;
      totalPages.value = 1;
    }
  } catch (e) {
    console.error('Failed to fetch applications:', e);
    fullList.value = [];
    items.value = [];
    totalElements.value = 0;
    totalPages.value = 1;
  }
}

async function searchApplicationsByFilters() {
  try {
    const params = {
      institutionID: filters.value.institution,
      institutionName: '',
      applicationID: filters.value.applicationId
    };

    const data = await searchApplications(params);

    if (data && data.content && Array.isArray(data.content)) {
      items.value = data.content.map(item => ({
        id: item.applicationID,
        Date: item.applicationDate,
        applicant: item.name || '未提供',
        institution: item.institutionName || '未提供',
        status: item.status || '未提供'
      }));
      totalElements.value = data.totalElements || items.value.length;
      totalPages.value = data.totalPages || Math.ceil(totalElements.value / PAGE_SIZE);
    } else {
      items.value = [];
      totalElements.value = 0;
      totalPages.value = 1;
    }
  } catch (e) {
    console.error('Failed to search applications:', e);
    items.value = [];
    totalElements.value = 0;
    totalPages.value = 1;
  }
}

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchApplications();
}

function prevPage() {
  goToPage(currentPage.value - 1);
}

function nextPage() {
  goToPage(currentPage.value + 1);
}

const paginatedItems = computed(() => {
  return items.value;
});

// 機構名稱選項（去重）
const institutionOptions = computed(() => {
  const set = new Set(fullList.value.map(item => item.institution))
  return Array.from(set)
})

// 顯示的資料列表（初始顯示全部）
items.value = [...fullList.value]

const showBack = ref(false)

async function searchByApplicationId() {
  const applicationId = filters.value.applicationId.trim();
  if (!applicationId) {
    alert('請輸入申請編號');
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/applications/${applicationId}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    if (data) {
      items.value = [{
        id: data.applicationID,
        Date: data.applicationDate,
        applicant: data.name || '未提供',
        institution: data.institutionName || '未提供',
        status: data.status || '未提供'
      }];
      totalElements.value = 1;
      totalPages.value = 1;
    } else {
      items.value = [];
      totalElements.value = 0;
      totalPages.value = 1;
    }
  } catch (e) {
    console.error('Failed to fetch application by ID:', e);
    alert('查詢失敗，請確認申請編號是否正確');
  }
}

function search() {
  if (filters.value.applicationId.trim()) {
    searchByApplicationId();
  } else {
    fetchApplications();
  }
}

function openDetail(item) {
  // 導航到編輯頁面
  router.push(`/admin/application-review/${item.id}/edit`)
}

function goBack() {
  // 重置所有查詢條件
  filters.value = { institution: '', applicationId: '', applicant: '' }
  // 恢復顯示全部資料
  items.value = [...fullList.value]
  // 隱藏返回按鈕
  showBack.value = false
}

onMounted(() => {
  fetchApplications();
});
</script>

<style scoped>
.announcement-page {
  display: flex;
  justify-content: center;
}
.announcement-card {
  max-width:820px;min-width: 85%

}
.title-row { display:flex; align-items:center; gap:12px; margin-bottom:10px;margin-top: 60px }
.icon { width:32px; height:32px; }
.main-title { font-size:1.35rem; color:#2e6fb7; font-weight:700 }
.query-card { background:#fff; border:1px solid #e6e6ea; border-radius:12px; padding:14px 18px; margin-bottom:50px; box-shadow:0 2px 8px rgba(16,24,40,0.04); margin-top:50px; }
.query-container { display: flex; flex-wrap: wrap; gap: 12px; }
.query-row { display:flex; width: 50%; flex: 0 0 calc(50% - 6px); margin-bottom:12px; }
.search-area { gap:30px; display:flex; align-items:center; width: 100%; }
.type-label { font-weight:600; color:#2e6fb7; min-width: 100px; }
.date-input { padding:8px 10px; border-radius:6px; border:1px solid #d8dbe0; flex: 1; max-width:200px; }
.btn-query { display: flex;justify-content: center;margin-top: 30px; }
.btn { padding:7px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:600; }
.btn.primary { background: linear-gradient(90deg,#3b82f6,#2563eb); color:#fff }
.btn.query { background:#e6f2ff; color:#2e6fb7; border:1px solid #b3d4fc }
.btn.small { padding:6px 12px; font-size:0.95rem; background:#f3f4f6; margin-right:6px; }
.announcement-table { width:100%; border-collapse:collapse ;margin-bottom:40px; }
.announcement-table thead th { background:#cfe8ff; color:#2e6fb7; padding:10px; text-align:left; font-weight:700; }
.announcement-table td { padding:12px; border-bottom:1px solid #f3f4f6; vertical-align: middle; }
.date-cell { font-weight:600; color:#334e5c }
.title-cell { color:#334e5c }
.action-cell { text-align:left }
.empty-tip { color:#999; text-align:center; padding:18px 0 }
.bottom-row { display:flex; justify-content:center; gap:12px; margin-top:10vh; }
.pagination-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin: 30px 0;
  padding: 20px;
  background: #fff;
  border: 2px solid #e6f3ff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.pagination-info {
  font-size: 1rem;
  color: #2e6fb7;
  font-weight: 600;
}
.pagination-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}
.pagination-btn {
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  background: #fff;
  color: #2e6fb7;
  font-weight: 600;
  transition: all 0.2s;
}
.pagination-btn:hover:not(:disabled) {
  background: #f6f8fa;
  border-color: #2e6fb7;
}
.pagination-btn:disabled {
  background: #f6f8fa;
  color: #8b949e;
  cursor: not-allowed;
  border-color: #d0d7de;
}
.btn-active {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}
@media (max-width:900px){ .announcement-card{ width:100%; padding:16px } .date-input{ width:100px } .query-row{ width:100%; flex: 0 0 100%; } }
</style>
