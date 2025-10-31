<template>
  <div class="agency-map-view">
    <div class="map-header">
      <h2>地圖檢視</h2>
    </div>
    <div class="map-container">
      <div id="map" class="leaflet-map"></div>

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
            <PlaceRating v-if="selectedAgency" :placeName="selectedAgency.name" :inline="true" class="popup-rating" />
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
export default {
  name: 'AgencyMap',
  components: { PlaceRating },
  data() {
    return {
      map: null,
      selectedAgency: null, // 用來儲存點擊的機構資料並顯示浮動卡
      userMarker: null, // 使用者位置 marker
      userAccuracyCircle: null, // 精準度圓圈
      isLocating: false
    }
  },
  mounted() {
    this.$nextTick(() => {
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
        // 假資料
        const agencies = [
          { name: '逢甲大學', lat: 24.1788, lng: 120.6469, address: '逢甲路1號', phone: '03-1234567' },
          { name: '台中火車站', lat: 24.1368, lng: 120.6853, address: '台中市中區', phone: '04-2345678' },
          { name: '台中市政府', lat: 24.1631, lng: 120.6476, address: '台中市西屯區', phone: '04-3456789' },
          { name: '國立自然科學博物館', lat: 24.1579, lng: 120.6655, address: '台中市北區', phone: '04-4567890' },
          { name: '秋紅谷廣場', lat: 24.1672, lng: 120.6395, address: '台中市西區', phone: '04-5678901' }
        ];
        agencies.forEach(agency => {
          // 建立標記但不要綁定 Leaflet 的內建 popup（避免點擊時出現預設彈窗）
          const marker = L.marker([agency.lat, agency.lng]).addTo(this.map);

          // 點擊標記時使用 Vue 狀態顯示浮動卡片，並把地圖移到該點
          marker.on('click', () => {
            this.selectedAgency = agency;
            // 將地圖放大並置中到該標記，讓使用者更容易看到位置
            if (this.map) this.map.setView([agency.lat, agency.lng], 15, { animate: true });
          });
        });
        // 點擊地圖其他位置時關閉自訂浮動資訊卡
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
      // 這裡使用 $router，確保 this 在 options API 中可用
      if (this.$router && this.selectedAgency && this.selectedAgency.id) {
        // 先關閉浮動面板，然後導頁
        const agencyId = this.selectedAgency.id;
        this.selectedAgency = null;
        this.$router.push({ name: 'AgencyInfo', params: { id: agencyId } });
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
</style>
