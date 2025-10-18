<template>
  <div class="class-list-page">
    <div class="class-card">
      <div v-if="!isChildRoute">
        <div class="title-row">
          <img src="https://img.icons8.com/ios/48/2e6fb7/classroom.png" class="icon" alt="icon" />
          <span class="main-title">{{ institution?.name }} </span>
        </div>

        <div class="table-section">
          <table class="class-table">
            <thead>
              <tr>
                <th>班級名稱</th>
                <th>收托人數</th>
                <th>在園人數</th>
                <th>收托年齡</th>
                <th>備註</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredClasses.length > 0" v-for="cls in filteredClasses" :key="cls.id">
                <td>{{ cls.unit }}</td>
                <td>{{ cls.capacity }}</td>
                <td>{{ cls.enrolled }}</td>
                <td>{{ cls.age_from }} - {{ cls.age_to }}</td>
                <td>{{ cls.notes }}</td>
                <td class="action-cell">
                  <button class="btn small" @click="editClass(cls)">編輯</button>
                  <button class="btn small danger" @click="deleteClass(cls)">刪除</button>
                </td>
              </tr>
              <tr v-if="filteredClasses.length === 0">
                <td colspan="6" class="empty-tip">目前沒有班級資料</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="bottom-row">
          <button class="btn primary" @click="showAddClass">新增班級</button>
          <button class="btn ghost" @click="goBack">返回機構列表</button>
        </div>
      </div>
      <router-view v-else />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const STORAGE_KEY = 'admin_classes'
const classes = ref([])
const institution = ref(null)

// 機構假資料
const institutions = [
  { id: 1, name: '快樂幼兒園', age_from: 2, age_to: 6, capacity: 60, enrolled: 48 },
  { id: 2, name: '幸福幼兒園', age_from: 3, age_to: 5, capacity: 40, enrolled: 35 },
  { id: 3, name: '希望幼兒園', age_from: 2, age_to: 4, capacity: 30, enrolled: 20 }
]

const loadClasses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return parsed || []
  } catch (e) {
    console.error('載入班級資料失敗:', e)
    return []
  }
}

const saveClasses = (list) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

const filteredClasses = computed(() => {
  const institutionId = Number(route.params.institutionId)
  return classes.value.filter(cls => cls.institutionId === institutionId)
})

const isChildRoute = computed(() => {
  return route.name === 'AdminClassNew' || route.name === 'AdminClassEdit'
})

const showAddClass = () => {
  router.push({
    name: 'AdminClassNew',
    params: { institutionId: route.params.institutionId }
  })
}

const editClass = (cls) => {
  router.push({
    name: 'AdminClassEdit',
    params: {
      institutionId: route.params.institutionId,
      id: cls.id
    }
  })
}

const deleteClass = (cls) => {
  if (confirm('確定要刪除這個班級嗎？')) {
    const idx = classes.value.findIndex(c => c.id === cls.id)
    if (idx !== -1) {
      classes.value.splice(idx, 1)
      saveClasses(classes.value)
    }
  }
}

const goBack = () => {
  router.push({ name: 'AdminClassManager' })
}

watch(() => route.name, (newName) => {
  if (newName === 'AdminClassList') {
    classes.value = loadClasses()
  }
})

onMounted(() => {
  const institutionId = Number(route.params.institutionId)
  institution.value = institutions.find(i => i.id === institutionId)

  if (!institution.value) {
    alert('找不到指定的機構')
    router.push({ name: 'AdminClassManager' })
    return
  }

  classes.value = loadClasses()
})
</script>

<style scoped>
.class-list-page {
  display: flex;
  justify-content: center;

}
.class-card {
  min-width: 100%
}
.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 60px;
  margin-top: 60px;
}
.icon {
  width: 32px;
  height: 32px;
}
.main-title {
  font-size: 1.35rem;
  color: #2e6fb7;
  font-weight: 700;
}
.table-section {
  margin-bottom: 50px;
}
.class-table {
  width: 100%;
  border-collapse: collapse;
}
.class-table thead th {
  background: #cfe8ff;
  color: #2e6fb7;
  padding: 10px;
  text-align: left;
  font-weight: 700;
}
.class-table td {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}
.action-cell {
  text-align: left;
}
.empty-tip {
  color: #999;
  text-align: center;
  padding: 18px 0;
}
.btn {
  padding: 7px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.btn.primary {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  color: #fff;
}
.btn.ghost {
  background: transparent;
  border: 1px solid #3b82f6;
  color: #2563eb;
}
.btn.small {
  padding: 6px 12px;
  font-size: 0.95rem;
  background: #f3f4f6;
  margin-right: 6px;
}
.btn.danger {
  background: #ff7b8a;
  color: #fff;
}
.bottom-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}
</style>
