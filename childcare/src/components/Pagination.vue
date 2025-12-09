<template>
  <div class="pagination">
    <div v-if="showInfo" class="pagination__info">
      共 {{ actualTotalElements }} 筆資料，第 {{ actualCurrentPage }} / {{ actualTotalPages }} 頁
    </div>
    <div class="pagination__controls" :class="`pagination--${size}`">
      <button
        class="pagination__btn"
        :disabled="actualCurrentPage === 1 || actualTotalPages <= 1"
        @click="$emit('prev')"
      >
        ‹ 上一頁
      </button>
      <div class="pagination__pages">
        <button
          v-for="page in actualPageNumbers"
          :key="page"
          class="pagination__page"
          :class="{ 'is-active': page === actualCurrentPage }"
          :disabled="actualTotalPages <= 1"
          @click="$emit('goToPage', page)"
        >
          {{ page }}
        </button>
      </div>
      <button
        class="pagination__btn"
        :disabled="actualCurrentPage === actualTotalPages || actualTotalPages <= 1"
        @click="$emit('next')"
      >
        下一頁 ›
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  totalElements: { type: Number, required: true },
  pageNumbers: { type: Array, required: true },
  // 新增：當前顯示的資料筆數（用於查詢過濾後）
  displayCount: { type: Number, default: null },
  // 新增：大小與是否顯示資訊區
  size: { type: String, default: 'md' }, // sm | md | lg
  showInfo: { type: Boolean, default: true },
})

// 計算實際顯示的數據
const actualTotalElements = computed(() => {
  // 如果有 displayCount，表示有查詢過濾，使用過濾後的數量
  return props.displayCount !== null ? props.displayCount : props.totalElements
})

const actualTotalPages = computed(() => {
  // 如果有查詢過濾，則固定為 1 頁（所有過濾結果都在當前頁顯示）
  if (props.displayCount !== null) {
    return 1
  }
  return props.totalPages
})

const actualCurrentPage = computed(() => {
  // 如果有查詢過濾，當前頁固定為 1
  if (props.displayCount !== null) {
    return 1
  }
  return props.currentPage
})

const actualPageNumbers = computed(() => {
  // 如果有查詢過濾，只顯示第 1 頁
  if (props.displayCount !== null) {
    return [1]
  }
  return props.pageNumbers
})
</script>

<style scoped>
/* Container */
.pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin: 24px 0;
}

/* Info */
.pagination__info {
  font-size: 0.95rem;
  color: #334e5c;
  font-weight: 600;
}

/* Controls */
.pagination__controls {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

/* Size modifiers */
.pagination--sm .pagination__btn,
.pagination--sm .pagination__page { min-width: 36px; height: 36px; font-size: 0.9rem; padding: 0 10px }
.pagination--md .pagination__btn,
.pagination--md .pagination__page { min-width: 42px; height: 42px; font-size: 1rem; padding: 0 12px }
.pagination--lg .pagination__btn,
.pagination--lg .pagination__page { min-width: 48px; height: 48px; font-size: 1.05rem; padding: 0 14px }

/* Buttons */
.pagination__btn,
.pagination__page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d0d7de;
  border-radius: 999px; /* pill style */
  background: #fff;
  color: #2e6fb7;
  font-weight: 600;
  transition: all 0.18s ease;
}

.pagination__btn:hover:not(:disabled),
.pagination__page:hover:not(:disabled) {
  background: #f6f8fa;
  border-color: #2e6fb7;
}

.pagination__btn:disabled,
.pagination__page:disabled {
  background: #f6f8fa;
  color: #8b949e;
  cursor: not-allowed;
  border-color: #d0d7de;
}

/* Page list */
.pagination__pages { display: inline-flex; gap: 6px; flex-wrap: wrap }

/* Active page */
.pagination__page.is-active {
  background: #2563eb; /* solid blue */
  color: #fff;
  border-color: #2563eb;
}
.pagination__page.is-active:hover {
  background: #1d4ed8; /* darker solid blue on hover */
}
</style>
