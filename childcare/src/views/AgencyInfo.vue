<template>
  <div class="agency-info-page">

    <div class="info-card">
      <div class="info-header">
        <img src="https://img.icons8.com/fluency/48/000000/school-building.png" class="info-icon" />
        <span class="info-title">托育機構介紹</span>
      </div>
      <div class="agency-card">
        <div class="agency-name-label">" {{ agency.name }} "</div>
        <div class="agency-carousel">
          <button class="carousel-btn left" @click="prevImg">&#x276E;</button>
          <div class="carousel-img-box">
            <img :src="agency.images[currentImg]" alt="機構照片" class="carousel-img" />
          </div>
          <button class="carousel-btn right" @click="nextImg">&#x276F;</button>
        </div>
        <div class="agency-info-table">
          <div class="info-row"><span>聯絡人：</span><span>{{ agency.contact }}</span></div>
          <div class="info-row"><span>機構地址：</span><span>{{ agency.address }}</span></div>
          <div class="info-row"><span>電話：</span><span>{{ agency.phone }}</span></div>
          <div class="info-row"><span>傳真：</span><span>{{ agency.fax }}</span></div>
          <div class="info-row"><span>電子信箱：</span><span>{{ agency.email }}</span></div>
          <div class="info-row"><span>粉絲團：</span><span>{{ agency.fanpage }}</span></div>
          <div class="info-row"><span>立案資料：</span><span>{{ agency.license }}</span></div>
        </div>
        <div class="class-section">
          <div class="class-title">班級資訊</div>
          <table class="class-table">
            <thead>
              <tr><th>班級名稱</th><th>就讀年齡</th></tr>
            </thead>
            <tbody>
              <tr v-for="cls in agency.classes" :key="cls.name">
                <td>{{ cls.name }}</td>
                <td>{{ cls.age }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const agency = ref({
  name: '新竹縣公立托嬰中心',
  images: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80'
  ],
  contact: '王小美',
  address: '新竹縣竹北市中正東路123號',
  phone: '03-1234567',
  fax: '03-1234568',
  email: 'info@childcare.com',
  fanpage: 'https://facebook.com/childcare',
  license: '立案字號：新竹縣府社字第123456號',
  classes: [
    { name: '嬰幼班', age: '0-2歲' },
    { name: '幼幼班', age: '2-3歲' },
    { name: '大班', age: '3-6歲' }
  ]
})
const currentImg = ref(0)
function prevImg() {
  currentImg.value = (currentImg.value - 1 + agency.value.images.length) % agency.value.images.length
}
function nextImg() {
  currentImg.value = (currentImg.value + 1) % agency.value.images.length
}
</script>

<style scoped>


.info-card {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 18px 40px 18px;
}
.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.info-icon {
  width: 38px;
  height: 38px;
}
.info-title {
  color: #2a4fa7;
  font-size: 1.4rem;
  font-weight: bold;
  letter-spacing: 2px;
}
.info-switch-group {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.info-switch-btn {
  background: #f7f7fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2a4fa7;
  font-size: 1.1rem;
  cursor: pointer;
}
.info-switch-btn.active {
  background: #e3eaff;
  border-color: #b3cfff;
}
.agency-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(249, 175, 174, 0.10);
  padding: 32px 18px 24px 18px;
  border: 1px solid #f3e6e6;
  margin-top: 8px;
}
.agency-name-label {
  display: block;
  background: #f9afae;
  color: #333;
  font-size: 1.3rem;
  font-weight: bold;
  border-radius: 18px;
  text-align: center;
  padding: 10px 0;
  margin: 0 auto 24px auto;
  max-width: 340px;
  letter-spacing: 2px;
  box-shadow: 0 2px 8px #f8b6b633;
}
.agency-carousel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-bottom: 24px;
}
.carousel-btn {
  background: #ffe5e5;
  border: none;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  font-size: 1.5rem;
  color: #f9afae;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(249, 175, 174, 0.10);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.carousel-btn:hover {
  background: #ffd6d6;
}
.carousel-img-box {
  width: 320px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(249, 175, 174, 0.10);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.agency-info-table {
  margin: 24px 0 0 0;
  padding: 0 8px;
}
.info-row {
  display: flex;
  gap: 12px;
  font-size: 1.08rem;
  color: #333;
  margin-bottom: 8px;
  border-bottom: 1px dashed #f3e6e6;
  padding-bottom: 6px;
}
.info-row span:first-child {
  min-width: 100px;
  color: #888;
}
.class-section {
  margin-top: 32px;
}
.class-title {
  font-size: 1.15rem;
  font-weight: bold;
  color: #2a4fa7;
  margin-bottom: 12px;
  letter-spacing: 1px;
}
.class-table {
  width: 100%;
  border-collapse: collapse;
  background: #f9f9fc;
  border-radius: 8px;
  overflow: hidden;
}
.class-table th, .class-table td {
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}
.class-table th {
  background: #e3eaff;
  color: #2a4fa7;
  font-weight: bold;
}
.class-table tr:last-child td {
  border-bottom: none;
}
@media (max-width: 600px) {
  .info-card, .agency-card {
    padding: 10px 2vw;
  }
  .carousel-img-box {
    width: 98vw;
    height: 140px;
  }
  .agency-name-label {
    font-size: 1.05rem;
    padding: 7px 0;
  }
  .class-table th, .class-table td {
    padding: 7px 2px;
    font-size: 0.98rem;
  }
}
</style>
