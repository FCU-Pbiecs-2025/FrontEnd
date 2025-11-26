<template>
  <div class="agency-map-view">
    <div class="map-header">
      <h2>地圖檢視</h2>
    </div>
    <div class="map-container">
      <div id="map" class="leaflet-map"></div>

      <!-- 載入提示 -->
      <div v-if="isLoadingAgencies" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>載入機構資料中...</p>
      </div>

      <!-- 錯誤提示 -->
      <div v-if="loadError && !isLoadingAgencies" class="error-overlay">
        <p>⚠️ {{ loadError }}</p>
      </div>

      <!-- 定位按鈕（使用 inline pink crosshair SVG 確保可見） -->
      <button
        class="locate-btn map-layer"
        @click="requestLocation"
        :title="isLocating ? '定位中...' : '定位到我的位置'"
        :aria-pressed="isLocating"
      >
        <!-- inline pink crosshair -->
        <svg class="locate-icon" width="28" height="28" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <g fill="none" stroke="#F36F6F" stroke-width="10">
            <circle cx="32" cy="32" r="18" />
            <path d="M32 8v8" />
            <path d="M32 56v-8" />
            <path d="M8 32h8" />
            <path d="M56 32h-8" />
          </g>
          <circle cx="32" cy="32" r="4" fill="#F36F6F" />
        </svg>
      </button>

      <!-- 在地圖上顯示的浮動資訊卡，點擊標記後會顯示 -->
      <div v-if="selectedAgency" class="agency-popup">
        <div class="popup-row">
          <div class="popup-title">
            {{ selectedAgency.name }}
            <!-- Inline rating next to title -->
            <PlaceRating
              v-if="selectedAgency"
              :placeName="selectedAgency.name"
              :latitude="selectedAgency.latitude"
              :longitude="selectedAgency.longitude"
              :inline="true"
              class="popup-rating"
            />
          </div>
          <button class="popup-close" @click="closePopup">✕</button>
        </div>
        <div class="popup-body">
          <div class="popup-item"><strong>地址：</strong>{{ selectedAgency.address }}</div>
          <div class="popup-item"><strong>電話：</strong>{{ selectedAgency.phone }}</div>
        </div>
        <div class="popup-actions">
          <button class="popup-btn" @click="goToInfo">查看該機構</button>
          <button class="popup-secondary" @click="closePopup">關閉</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import PlaceRating from '@/components/PlaceRating.vue';
import { getAllAgencies } from '@/api/agencies.js';

export default {
  name: 'AgencyMap',
  components: { PlaceRating },
  data() {
    return {
      map: null,
      agencies: [],          // 儲存從 API 獲取的機構列表
      agencyMarkers: {},     // 儲存 marker 對應的 agency
      selectedAgency: null,  // 用來儲存點擊的機構資料並顯示浮動卡
      userMarker: null,      // 使用者位置 marker
      userAccuracyCircle: null, // 精準度圓圈
      isLocating: false,
      isLoadingAgencies: true,  // 載入機構資料中
      loadError: null        // 載入錯誤訊息
    }
  },
  mounted() {
    this.$nextTick(async () => {
      try {
        // 先加載機構資料
        await this.loadAgencies();
      } catch (err) {
        console.error('加載機構失敗:', err);
        this.loadError = '無法加載機構資料，地圖將顯示空白';
      } finally {
        this.isLoadingAgencies = false;
      }
      // 無論是否成功，都初始化地圖
      this.onMount();
    });
  },
  beforeUnmount() {
    // 清理地圖資源
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  },
  methods: {
    onMount() {
      // 確認地圖容器存在
      const mapContainer = document.getElementById('map');
      if (!mapContainer) {
        console.error('地圖容器未正確渲染');
        return;
      }
      // 檢查 Leaflet 是否已經加載
      if (typeof L !== 'undefined') {
        // 避免重複初始化
        if (mapContainer._leaflet_id) {
          mapContainer._leaflet_id = null;
          mapContainer.innerHTML = '';
        }
        this.map = L.map('map').setView([24.1631, 120.6476], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        // 使用 API 獲取的機構資料添加標記
        if (this.agencies && this.agencies.length > 0) {
          this.agencies.forEach(agency => {
            // 驗證機構是否有有效的經緯度
            if (!agency.latitude || !agency.longitude) {
              console.warn(`機構 ${agency.name} 缺少經緯度資訊`);
              return;
            }

            // 建立標記
            const marker = L.marker([agency.latitude, agency.longitude]).addTo(this.map);
            this.agencyMarkers[agency.id] = { marker, agency };

            // 點擊標記時顯示浮動卡片
            marker.on('click', () => {
              this.selectedAgency = agency;
              // 將地圖放大並置中到該標記
              if (this.map) this.map.setView([agency.latitude, agency.longitude], 15, { animate: true });
            });
          });
        } else {
          console.warn('沒有可用的機構資料');
        }

        // 點擊地圖其他位置時關閉浮動資訊卡
        this.map.on('click', () => {
          this.selectedAgency = null;
        });

        // 強制觸發地圖 resize
        setTimeout(() => {
          this.map.invalidateSize();
        }, 300);
      } else {
        console.error('Leaflet 未加載，請確認 index.html 已正確引入 leaflet.js');
      }
    },
    // 從 API 加載機構資料
    async loadAgencies() {
      try {
        const response = await getAllAgencies();
        // API 返回的結構可能是 { content: [...] } 或直接是陣列
        let rawAgencies = [];
        if (response && response.content) {
          rawAgencies = response.content;
        } else if (response && Array.isArray(response)) {
          rawAgencies = response;
        } else if (response && response.data) {
          rawAgencies = Array.isArray(response.data) ? response.data : [response.data];
        }

        // 將 API 返回的欄位映射到本地使用的欄位名稱
        this.agencies = rawAgencies.map(item => ({
          id: item.institutionID || item.id,
          name: item.institutionName || item.name,
          address: item.address,
          phone: item.phoneNumber || item.phone,
          latitude: item.latitude,
          longitude: item.longitude,
          // 保留原始資料以備未來使用
          ...item
        }));

        console.log(`成功加載 ${this.agencies.length} 個機構`);
      } catch (error) {
        console.error('從 API 加載機構失敗:', error);
        this.loadError = error.message;
        throw error;
      }
    },
    // 使用者定位：嘗試取得 GPS 位置並在地圖上標示
    requestLocation() {
      if (!('geolocation' in navigator)) {
        alert('此瀏覽器不支援定位功能');
        return;
      }
      if (!this.map) {
        console.warn('地圖尚未初始化');
        return;
      }
      this.isLocating = true;
      const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
      navigator.geolocation.getCurrentPosition(
        pos => this.onLocationSuccess(pos),
        err => this.onLocationError(err),
        options
      );
    },
    onLocationSuccess(position) {
      this.isLocating = false;
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = position.coords.accuracy || 0;

      // 清除舊的 marker / circle
      if (this.userMarker) {
        try { this.map.removeLayer(this.userMarker); } catch(e){}
        this.userMarker = null;
      }
      if (this.userAccuracyCircle) {
        try { this.map.removeLayer(this.userAccuracyCircle); } catch(e){}
        this.userAccuracyCircle = null;
      }

      // 使用 circleMarker 作為使用者位置的視覺化
      this.userMarker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: '#2a9df4',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1
      }).addTo(this.map);

      // 顯示精準度圓圈（以公尺為單位）
      this.userAccuracyCircle = L.circle([lat, lng], {
        radius: accuracy,
        color: '#2a9df4',
        fillColor: '#2a9df4',
        fillOpacity: 0.08,
        weight: 1
      }).addTo(this.map);

      // 將地圖置中到使用者位置，並依精準度調整縮放（若精準度大則不放太大）
      const zoomTarget = accuracy <= 50 ? 15 : (accuracy <= 200 ? 14 : 13);
      this.map.setView([lat, lng], zoomTarget, { animate: true });
    },
    onLocationError(err) {
      this.isLocating = false;
      console.warn('定位失敗', err);
      if (err && err.code === 1) {
        alert('定位權限被拒絕，請允許定位以使用此功能');
      } else if (err && err.code === 3) {
        alert('定位逾時，請稍後再試');
      } else {
        alert('取得定位失敗');
      }
    },
    goToInfo() {
      // 導到機構詳細頁（router 名稱為 AgencyInfo）
      if (this.$router && this.selectedAgency) {
        const agencyId = this.selectedAgency.id;
        this.selectedAgency = null;
        if (agencyId) {
          this.$router.push({ name: 'AgencyInfo', params: { id: agencyId } });
        } else {
          console.warn('機構缺少 ID 資訊');
        }
      }
    },
    closePopup() {
      this.selectedAgency = null;
    }
  }
}
</script>

<style scoped>
.agency-map-view {
  width: 100%;
  min-height: 600px;
}

.map-header {
  margin-bottom: 24px;
  position: relative;
  z-index: 10; /* Ensure header stays above the map */
}

.map-header h2 {
  color: #333;
  font-size: 1.8rem;
  margin: 0;
}

.map-container {
  width: 100%;
  min-height: 550px;
  position: relative; /* for absolute positioned popup */
}

.leaflet-map {
  width: 100%;
  height: 550px;
  border-radius: 12px;
  border: 2px solid #F9AFAE;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
  z-index: 1; /* Ensure map stays below the header */
}

/* 定位按鈕 */
.locate-btn.map-layer {
  position: absolute;
  top: 100px;
  left: 6px; /* 放在地圖左側 */
  z-index: 1200; /* 放在地圖之上 */
  width: 44px;
  height: 44px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: transparent; /* no extra background */
  box-shadow: none;
  transition: transform 0.12s ease, opacity 0.12s ease;
}
.locate-btn.map-layer svg.locate-icon {
  width: 40px;
  height: 40px;
  display: block;
}
.locate-btn.map-layer:hover { transform: translateY(-2px); }
.locate-btn.map-layer[aria-pressed="true"] { opacity: 0.85; transform: scale(0.98); }
.locate-btn.map-layer svg.locate-icon { stroke-linecap: round; stroke-linejoin: round; }

/* 浮動機構資訊卡 */
.agency-popup {
  position: absolute;
  bottom: 24px;
  left: 24px;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  border: 1px solid #eee;
  padding: 16px;
  z-index: 1000;
}
.popup-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.popup-title {
  font-weight: 700;
  color: #2a4fa7;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.popup-close {
  background: transparent;
  border: none;
  font-size: 1rem;
  cursor: pointer;
}
.popup-body { margin-top: 8px; }
.popup-item { margin-bottom: 6px; color: #444; font-size: 0.95rem; }
.popup-actions { margin-top: 12px; display:flex; gap:8px; justify-content:flex-end; }
.popup-btn {
  background: linear-gradient(135deg, #F9AFAE, #f5a1a1);
  color: white;
  padding: 8px 14px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.popup-secondary {
  background: transparent;
  border: 2px solid #F9AFAE;
  color: #F9AFAE;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
}

/* 載入和錯誤提示 */
.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  z-index: 999;
  border-radius: 12px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #F9AFAE;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p,
.error-overlay p {
  color: #666;
  font-size: 1rem;
  margin: 0;
}
</style>
