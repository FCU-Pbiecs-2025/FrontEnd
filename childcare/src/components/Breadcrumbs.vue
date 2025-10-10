<!-- src/components/Breadcrumbs.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, RouteLocationMatched } from 'vue-router'

const route = useRoute()
const router = useRouter()

type Crumb = { label: string; to?: string }

function getLabel(r: RouteLocationMatched): string | null {
  const bc = r.meta?.breadcrumb
  if (!bc || r.meta?.breadcrumbHidden) return null
  return typeof bc === 'function' ? bc(route) : String(bc)
}

// 依序把 matched 路由轉成可點擊的路徑（最後一個不給連結）
const crumbs = computed<Crumb[]>(() => {
  const matched = route.matched.filter(r => getLabel(r) !== null)

  return matched.map((r, idx) => {
    const label = getLabel(r)!
    // 合成從根到這一層的 path，避免手刻字串
    const slice = matched.slice(0, idx + 1)
    const toPath = router.resolve({
      name: slice[slice.length - 1].name as string,
      params: route.params,           // 帶入現有的 params
      query: undefined,               // 若要保留查詢可改成 route.query
    }).href

    // 最後一節不設連結
    return idx < matched.length - 1 ? { label, to: toPath } : { label }
  })
})
</script>

<template>
  <nav class="text-sm" aria-label="Breadcrumb">
    <div class="breadcrumbs-row">
      <span v-for="(c, i) in crumbs" :key="i" class="breadcrumb-item">
        <template v-if="c.to">
          <RouterLink :to="c.to" class="text-blue-600 hover:underline">
            {{ c.label }}
          </RouterLink>
          <span v-if="i < crumbs.length - 1" class="breadcrumb-separator">/</span>
        </template>
        <template v-else>
          <span class="text-gray-600" aria-current="page">{{ c.label }}</span>
        </template>
      </span>
    </div>
  </nav>
</template>

<style scoped>
.breadcrumbs-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  overflow-x: auto;
  margin-bottom: 20px;
}
.breadcrumb-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
}
.breadcrumb-separator {
  margin: 0 0.5em;
  color: #bdbdbd;
}
</style>