<template>
  <div class="banner-manager-page">
    <div class="banner-card">
      <h2>前台海報管理</h2>
      <div class="query-row">
        <button class="btn" @click="openNew()">新增</button>
        <button class="btn ghost" @click="goBack">返回</button>
      </div>

      <table class="banner-table">
        <thead>
          <tr>
            <th>Banner</th>
            <th>連結</th>
            <th>顯示日期</th>
            <th>狀態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(b, idx) in banners" :key="b.id">
            <td class="img-cell"><img :src="b.image" alt="banner" /></td>
            <td>{{ b.link }}</td>
            <td>{{ b.displayDate }}</td>
            <td>{{ b.status }}</td>
            <td>
              <button class="small" @click="goEdit(idx)">編輯</button>
               <button class="small danger" @click="remove(idx)">刪除</button>
             </td>
           </tr>
           <tr v-if="banners.length === 0">
             <td colspan="5" class="empty">目前沒有海報</td>
           </tr>
         </tbody>
       </table>
     </div>

    <!-- 編輯/新增在獨立頁面處理 -->
   </div>
 </template>

 <script setup>
 import { ref, onMounted } from 'vue'
 import { useRouter } from 'vue-router'

 const router = useRouter()
 const storageKey = 'siteBanners'
 const banners = ref([])

 const load = () => {
   const raw = localStorage.getItem(storageKey)
   banners.value = raw ? JSON.parse(raw) : []
 }
 const persist = () => localStorage.setItem(storageKey, JSON.stringify(banners.value))

 onMounted(load)

 const openNew = () => {
   router.push({ name: 'AdminBannerNew' })
 }
 const goEdit = (idx) => {
   const b = banners.value[idx]
   if (!b) return
   router.push({ name: 'AdminBannerEdit', params: { id: b.id } })
 }
 const remove = (idx) => {
   if (!confirm('確定要刪除這筆海報嗎？')) return
   banners.value.splice(idx, 1)
   persist()
 }
 const goBack = () => {
   // simply clear section by navigating to /admin (AdminHome will show default)
   router.replace({ path: '/admin' })
 }
 </script>

 <style scoped>
 .banner-manager-page { padding: 18px 0; display:flex; justify-content:center }
 .banner-card { width: 820px; background: #fff; border:1px solid #F1E9E9; border-radius:10px; padding:18px; box-shadow:0 8px 24px rgba(0,0,0,0.04)}
 .banner-card h2 { color:#2e6fb7; margin-bottom:12px }
 .query-row { display:flex; gap:8px; align-items:center; margin-bottom:12px }
 .btn { padding:8px 14px; border-radius:8px; border:none; background:#3b82f6; color:#fff; cursor:pointer }
 .btn.ghost { background:transparent; border:1px solid #3b82f6; color:#2563eb }
 .banner-table { width:100%; border-collapse:collapse; }
 .banner-table thead th { background:#cfe8ff; padding:10px; text-align:left }
 .banner-table td { padding:10px; border-bottom:1px solid #f3f4f6 }
 .img-cell img { width:160px; height:56px; object-fit:cover; border-radius:6px }
 .small { padding:6px 8px; border-radius:6px; border:none; cursor:pointer; margin-right:6px }
 .small.danger { background:#ff7b8a; color:#fff }
 .small { background:#f3f4f6 }
 .empty { text-align:center; padding:18px; color:#888 }
 /* modal styles removed — editing now handled on a separate page (AdminBannerEdit.vue) */
 </style>
