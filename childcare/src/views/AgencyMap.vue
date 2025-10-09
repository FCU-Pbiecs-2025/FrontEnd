<template>
  <div class="agency-map-view">
    <div class="map-header">
      <h2>地圖檢視</h2>
    </div>
    <div class="map-container">
      <div class="map-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#F9AFAE" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <p>地圖功能開發中...</p>
        <p class="map-info">將顯示托育機構的地理位置</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgencyMap'
}
</script>

<style scoped>
.agency-map-view {
  width: 100%;
  min-height: 600px;
}

.map-header {
  margin-bottom: 24px;
}

.map-header h2 {
  color: #333;
  font-size: 1.8rem;
  margin: 0;
}

.map-container {
  width: 100%;
  min-height: 550px;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 550px;
  background: white;
  border-radius: 12px;
  border: 2px dashed #F9AFAE;
  text-align: center;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.1);
}

.map-placeholder svg {
  margin-bottom: 12px;
}

.map-placeholder p {
  color: #999;
  font-size: 1.1rem;
  margin: 8px 0;
}

.map-info {
  font-size: 0.9rem !important;
  color: #666 !important;
}
</style>
