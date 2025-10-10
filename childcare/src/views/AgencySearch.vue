<template>
  <div class="agency-search-page">
    <div class="page-wrapper">
      <div class="view-toggle" v-if="!isInfoView">
        <button
          :class="['toggle-btn', { active: !isMapView }]"
          @click="switchView('list')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          <span>列表</span>
        </button>
        <button
          :class="['toggle-btn', { active: isMapView }]"
          @click="switchView('map')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
          <span>地圖</span>
        </button>
      </div>

      <!-- 列表視圖 - 顯示搜尋表單和結果 -->
      <div class="content-area" v-if="!isMapView && !isInfoView">
        <div class="search-section">
          <div class="search-form">
            <div class="form-row">
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
                  <option>公立托育機構</option>
                  <option>準公共托育機構</option>
                </select>
              </div>
            </div>
            <button class="search-btn">搜尋機構</button>
          </div>
        </div>

        <div class="results-section">
          <h2>搜尋結果</h2>

          <div class="agency-list">
            <div class="agency-item" v-for="agency in agencies" :key="agency.id" @click="goToInfo(agency)" style="cursor:pointer;">
              <div class="agency-info">
                <h3>{{ agency.name }}</h3>
                <p class="agency-address">📍 {{ agency.address }}</p>
                <p class="agency-phone">📞 {{ agency.phone }}</p>
                <p class="agency-capacity">👶 收托人數：{{ agency.capacity }}人</p>
              </div>
              <div class="agency-status">
                <span class="status-badge" :class="agency.statusClass">{{ agency.statusText }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 地圖視圖 - 使用 router-view 替換整個 content-area -->
      <div class="content-area" v-if="isMapView && !isInfoView">
        <router-view />
      </div>

      <!-- 機構資訊視圖 -->
      <div class="content-area" v-if="isInfoView">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'AgencySearch',
  setup() {
    const router = useRouter()
    const route = useRoute()

    const agencies = [
      { id: 1, name: '新竹縣公立托嬰中心', address: '新竹縣竹北市中正東路123號', phone: '03-1234567', capacity: 30, statusText: '有名額', statusClass: 'available' },
      { id: 2, name: '竹東托嬰中心', address: '新竹縣竹東鎮東林路456號', phone: '03-2345678', capacity: 25, statusText: '額滿', statusClass: 'full' },
      { id: 3, name: '新埔幼兒園附設托嬰中心', address: '新竹縣新埔鎮中正路789號', phone: '03-3456789', capacity: 20, statusText: '有名額', statusClass: 'available' }
    ]

    const isMapView = computed(() => route.name === 'AgencyMap')
    const isInfoView = computed(() => route.name === 'AgencyInfo')

    function switchView(view) {
      if (view === 'list') {
        router.push({ name: 'AgencySearch' })
      } else if (view === 'map') {
        router.push({ name: 'AgencyMap' })
      }
    }

    function goToInfo(agency) {
      router.push({ name: 'AgencyInfo' })
    }

    return { agencies, isMapView, isInfoView, switchView, goToInfo }
  }
}
</script>

<style scoped>
.agency-search-page {
  min-height: calc(100vh - 160px);

}

.view-toggle{
  display: flex;
  gap: 5px;
  margin-left: 71%;
  margin-bottom: 20px;
}
.toggle-btn {
  background: white;
  border: 2px solid #F9AFAE;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.toggle-btn:hover {
  background: #f9a1a1;
  transform: translateY(-2px);
}

.toggle-btn.active {
  background: #F9AFAE;
  color: white;
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
  transition: transform 0.2s, box-shadow 0.2s;
}

.agency-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(249, 175, 174, 0.2);
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
  .view-toggle {
    top: 0;
    right: 0;
    flex-direction: column;
    gap: 8px;
  }
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
