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
                <select v-model="selectedTown">
                  <option value="">請選擇</option>
                  <option v-for="t in towns" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>托育類型</label>
                <select v-model="selectedType">
                  <option value="">請選擇</option>
                  <option value="0">公立托育機構</option>
                  <option value="1">準公共托育機構</option>
                </select>
              </div>
            </div>
            <button class="search-btn" @click="handleSearch">搜尋機構</button>
          </div>
        </div>

        <div class="results-section">
          <div>
            <div class="list-title">搜尋結果</div>
            <div class="title-decoration"></div>
          </div>

          <!-- 載入狀態顯示 -->
          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>載入托育機構資料中...</p>
          </div>

          <!-- 錯誤狀態顯示 -->
          <div v-else-if="error" class="error-state">
            <p class="error-message">{{ error }}</p>
            <button @click="loadAgenciesData" class="retry-btn">重新載入</button>
          </div>

          <!-- 機構列表 -->
          <div v-else class="agency-list">
            <div v-if="filteredAgencies.length === 0 && searchTriggered" class="no-results">
              <p>未找到符合條件的機構</p>
            </div>
            <div v-else-if="!searchTriggered" class="no-results">
              <p>請選擇條件並點擊搜尋</p>
            </div>
            <div v-else>
              <div class="agency-item" v-for="agency in filteredAgencies" :key="agency.id" @click="goToInfo(agency)" style="cursor:pointer;">
                <div class="agency-info">
                  <h3>{{ agency.name }}</h3>
                  <p class="agency-address">地址: {{ agency.address }}</p>
                  <p class="agency-phone" v-if="agency.phone">聯絡電話: {{ agency.phone }}</p>
                  <p class="agency-email" v-if="agency.email">信箱:{{ agency.email }}</p>
                  <p class="agency-description" v-if="agency.description">特色描述: {{ agency.description }}</p>
                </div>
                <div class="agency-rating-wrapper">
                  <PlaceRating
                    :placeName="agency.name + ' ' + agency.address"
                    :latitude="agency.latitude"
                    :longitude="agency.longitude"
                    inline
                    fallbackText="無評分資料"
                    class="agency-rating"
                  />
                </div>
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
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PlaceRating from '@/components/PlaceRating.vue'
import { getAllAgencies } from '@/api/agencies.js'

export default {
  components: { PlaceRating },
  name: 'AgencySearch',
  setup() {
    const router = useRouter()
    const route = useRoute()

    // Provide API key from env to PlaceRating (can be overridden per-component via prop)
    const API_KEY = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || null

    // 響應式資料
    const agencies = ref([])
    const isLoading = ref(false)
    const error = ref(null)
    const displayedAgencies = ref([] )// 用於存儲要顯示的機構列表

    // 新竹縣鄉鎮列表
    const towns = [
      '竹北市',
      '竹東鎮',
      '關西鎮',
      '新埔鎮',
      '湖口鄉',
      '新豐鄉',
      '芎林鄉',
      '寶山鄉',
      '橫山鄉',
      '峨眉鄉',
      '五峰鄉',
      '尖石鄉'
    ]
    const selectedTown = ref('')
    const selectedType = ref('')
    const searchTriggered = ref(false)

    // 載入托育機構資料
    const loadAgenciesData = async () => {
      isLoading.value = true
      error.value = null
      try {
        const response = await getAllAgencies()
        // 處理後端返回的數據格式
        agencies.value = response.data
          .map(item => ({
            id: item.institutionID,
            name: item.institutionName,
            address: item.address,
            phone: item.phoneNumber || '',
            email: item.email || '',
            fax: item.fax || '',
            description: item.description || '',
            institutionsType: item.institutionsType,
            latitude: item.latitude ?? null,
            longitude: item.longitude ?? null
          }))
      } catch (err) {
        console.error('載入托育機構資料失敗:', err)
        if (err.response) {
          error.value = `載入失敗: ${err.response.status} ${err.response.statusText}`
        } else if (err.request) {
          error.value = '網路連接失敗，請檢查網路連接'
        } else {
          error.value = '載入托育機構資料失敗，請稍後再試'
        }
        // 如果 API 失敗，使用預設資料作為後備
        agencies.value = [
          { id: 1, name: '新竹市東區公共托嬰中心', address: '新竹市東區金城一路50-8號1樓', phone: '', institutionsType: true, latitude: null, longitude: null },
          { id: 2, name: '禾田托嬰中心 Hetian Baby Care Center', address: '新竹市北區金竹路146號148號', phone: '', institutionsType: false, latitude: null, longitude: null },
          { id: 3, name: '新竹市私立樂橙托嬰中心', address: '新竹市北區水田街1號2樓', phone: '', institutionsType: true, latitude: null, longitude: null }
        ]
      } finally {
        isLoading.value = false
      }
    }

    // 計算過濾後的機構列表
    const filteredAgencies = computed(() => displayedAgencies.value)

    // 搜尋機構處理函數
    const handleSearch = async () => {
      isLoading.value = true
      error.value = null

      try {
        // 進行過濾
        let result = agencies.value
        if (selectedTown.value) {
          result = result.filter(agency => agency.address.includes(selectedTown.value))
        }
        if (selectedType.value !== '') {
          const isPublic = selectedType.value === '0'
          result = result.filter(agency => agency.institutionsType === isPublic)
        }

        displayedAgencies.value = result

        console.log('========== 搜尋機構 ==========')
        console.log('選定鄉鎮:', selectedTown.value || '全部')
        console.log('選定類型:', selectedType.value || '全部')
        console.log('過濾結果數量:', result.length)
        console.log('過濾結果:', result)
      } catch (err) {
        console.error('搜尋失敗:', err)
        error.value = '搜尋失敗，請稍後再試'
        displayedAgencies.value = []
      } finally {
        isLoading.value = false
      }
    }

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
      router.push({ name: 'AgencyInfo', params: { id: agency.id } })
    }

    // 組件掛載時自動載入所有機構資料
    onMounted(async () => {
      isLoading.value = true
      try {
        const response = await getAllAgencies()
        agencies.value = response.data
          .map(item => ({
            id: item.institutionID,
            name: item.institutionName,
            address: item.address,
            phone: item.phoneNumber || '',
            email: item.email || '',
            fax: item.fax || '',
            description: item.description || '',
            institutionsType: item.institutionsType,
            latitude: item.latitude ?? null,
            longitude: item.longitude ?? null
          }))
        // 初始時顯示所有機構
        displayedAgencies.value = agencies.value
        searchTriggered.value = true // 設置為已搜尋狀態以顯示結果
        console.log('初始載入完成，共', agencies.value.length, '個機構')
      } catch (err) {
        console.error('初始載入機構資料失敗:', err)
        error.value = '載入機構資料失敗，請稍後再試'
      } finally {
        isLoading.value = false
      }
    })

    return {
      agencies,
      isLoading,
      error,
      isMapView,
      isInfoView,
      switchView,
      goToInfo,
      loadAgenciesData,
      API_KEY,
      towns,
      selectedTown,
      selectedType,
      filteredAgencies,
      handleSearch,
      searchTriggered
    }
  }
}
</script>

<style scoped>
.agency-search-page {
  min-height: calc(100vh - 160px);
}

.list-title{
  text-align:center;
  font-size:1.5rem;
  font-weight:bold;
  margin:50px 0 16px 0;
  letter-spacing:2px;
}

.title-decoration{
  width: 80%;
  height: 2px;
  border-radius: 4px;
  background: var(--4th-text-color);
  margin: 10px auto;
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
}

.agency-item {
  background: white;
  margin-bottom: 20px;
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

.agency-info {
  flex: 1;
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

.agency-rating-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-left: 20px;
  flex-shrink: 0;
}

.agency-rating {
  font-size: 0.8rem;
  white-space: nowrap;
}

/* 無搜尋結果提示 */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 1.1rem;
}

/* 載入狀態樣式 */
.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #F9AFAE;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #666;
  font-size: 1.1rem;
}

/* 錯誤狀態樣式 */
.error-state {
  text-align: center;
  padding: 40px 20px;
}

.error-message {
  color: #c62828;
  font-size: 1.1rem;
  margin-bottom: 20px;
  padding: 15px;
  background: #ffebee;
  border-radius: 8px;
  border: 1px solid #ffcdd2;
}

.retry-btn {
  background: #F9AFAE;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #f5a1a1;
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
  .agency-rating-wrapper {
    margin-left: 0;
    justify-content: flex-start;
  }
}
</style>
