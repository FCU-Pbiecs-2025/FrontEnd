<template>
  <div class="agency-list-view">
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
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'AgencyList',
  setup() {
    const router = useRouter()

    const agencies = [
      { id: 1, name: '新竹縣公立托嬰中心', address: '新竹縣竹北市中正東路123號', phone: '03-1234567', capacity: 30, statusText: '有名額', statusClass: 'available' },
      { id: 2, name: '竹東托嬰中心', address: '新竹縣竹東鎮東林路456號', phone: '03-2345678', capacity: 25, statusText: '額滿', statusClass: 'full' },
      { id: 3, name: '新埔幼兒園附設托嬰中心', address: '新竹縣新埔鎮中正路789號', phone: '03-3456789', capacity: 20, statusText: '有名額', statusClass: 'available' }
    ]

    function goToInfo(agency) {
      router.push({ name: 'AgencyInfo' })
    }

    return { agencies, goToInfo }
  }
}
</script>

<style scoped>
.agency-list-view {
  width: 100%;
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
  .agency-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>

