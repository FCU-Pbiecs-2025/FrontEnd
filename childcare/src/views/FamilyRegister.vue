<template>
  <div class="family-register">
    <h2>家長資料</h2>
    <div v-for="(parent, pIdx) in parents" :key="pIdx" class="parent-form">
      <h3>家長 {{ pIdx + 1 }}</h3>
      <label>姓名 <input v-model="parent.name" required /></label>
      <label>性別
        <select v-model="parent.gender">
          <option value="">請選擇</option>
          <option value="男">男</option>
          <option value="女">女</option>
        </select>
      </label>
      <label>與幼兒關係 <input v-model="parent.relation" /></label>
      <label>職業 <input v-model="parent.job" /></label>
      <label>電話 <input v-model="parent.phone" /></label>
      <label>戶籍地址 <input v-model="parent.address" /></label>
      <label>通訊地址 <input v-model="parent.contactAddress" /></label>
      <label>電子信箱 <input v-model="parent.email" type="email" /></label>
      <label>出生年月日 <input v-model="parent.birth" type="date" /></label>
      <label>附件 <input type="file" @change="onFileChange($event, pIdx)" /></label>
      <label>是否留停 <input type="checkbox" v-model="parent.isLeave" /></label>
      <div v-if="parent.isLeave">
        <label>留停起 <input v-model="parent.leaveStart" type="date" /></label>
        <label>留停訖 <input v-model="parent.leaveEnd" type="date" /></label>
      </div>
      <button @click="removeParent(pIdx)" v-if="parents.length > 1">移除家長</button>
    </div>
    <!-- 新增家長按鈕移到幼兒資料和家長資料區塊之間，使用與新增幼兒相同的按鈕類別以保持長度一致 -->
    <hr />
    <button class="add-child-btn" @click="addParent">新增家長</button>
    <hr />
    <h2>幼兒資料</h2>
    <div v-for="(child, cIdx) in children" :key="cIdx" class="child-form">
      <h3>幼兒 {{ cIdx + 1 }}</h3>
      <label>身分證字號 <input v-model="child.id" @blur="validateChildId(cIdx)" /></label>
      <span class="error" v-if="childIdErrors[cIdx]">{{ childIdErrors[cIdx] }}</span>
      <label>姓名 <input v-model="child.name" /></label>
      <label>性別
        <select v-model="child.gender">
          <option value="">請選擇</option>
          <option value="男">男</option>
          <option value="女">女</option>
        </select>
      </label>
      <button @click="removeChild(cIdx)" v-if="children.length > 1">移除幼兒</button>
    </div>
    <button @click="addChild">新增幼兒</button>

    <div class="actions">
      <button @click="submitForm">儲存</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FamilyRegister',
  data() {
    return {
      parents: [this.defaultParent()],
      children: [this.defaultChild()],
      childIdErrors: [],
    };
  },
  methods: {
    defaultParent() {
      return {
        name: '', gender: '', relation: '', job: '', phone: '', address: '', contactAddress: '', email: '', birth: '', file: null, isLeave: false, leaveStart: '', leaveEnd: ''
      };
    },
    defaultChild() {
      return { id: '', name: '', gender: '' };
    },
    addParent() {
      this.parents.push(this.defaultParent());
    },
    removeParent(idx) {
      this.parents.splice(idx, 1);
    },
    addChild() {
      this.children.push(this.defaultChild());
      this.childIdErrors.push('');
    },
    removeChild(idx) {
      this.children.splice(idx, 1);
      this.childIdErrors.splice(idx, 1);
    },
    onFileChange(e, idx) {
      this.parents[idx].file = e.target.files[0];
    },
    validateChildId(idx) {
      const id = this.children[idx].id;
      // 簡單的身分證字號格式驗證：僅允許字母和數字，長度為10或18
      const regex = /^[A-Za-z0-9]{10,18}$/;
      this.childIdErrors[idx] = regex.test(id) ? '' : '身分證字號格式錯誤';
    },
    submitForm() {
      // 送出前檢查所有幼兒身分證字號
      for (let i = 0; i < this.children.length; i++) {
        this.validateChildId(i);
        if (this.childIdErrors[i]) {
          alert('請修正幼兒身分證字號錯誤後再提交');
          return;
        }
      }
      // TODO: API串接或emit事件
      alert('表單已送出');
    }
  }
};
</script>

<style scoped>
.family-register {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.family-register h2 {
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
  margin: 30px 0 20px 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.family-register h3 {
  color: #34495e;
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  font-weight: 500;
}

.parent-form, .child-form {
  background: #FFF8F6;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s ease;
}

.parent-form:hover, .child-form:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

label {
  display: block;
  margin-bottom: 15px;
  font-weight: 500;
  color: #555;
}

label span {
  display: block;
  margin-bottom: 5px;
  font-size: 0.9rem;
}

input, select {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background: white;
  box-sizing: border-box;
}

input:focus, select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
  transform: scale(1.2);
}

input[type="file"] {
  padding: 8px;
  border: 2px dashed #bdc3c7;
  background: #f8f9fa;
}

input[type="file"]:hover {
  border-color: #3498db;
}

button {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 10px;
  margin-top: 10px;
}

button:hover {
  background: linear-gradient(135deg, #2980b9, #1f6391);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

button:active {
  transform: translateY(0);
}

/* 移除按鈕樣式 */
.parent-form button:last-child,
.child-form button:last-child {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  margin-top: 15px;
}

.parent-form button:last-child:hover,
.child-form button:last-child:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
}

/* 新增按鈕樣式（保留配色，但使用與 .add-child-btn 相同的尺寸/置中規則） */
.family-register > button,
.add-child-btn {
  background: linear-gradient(135deg, #27ae60, #219a52);
  display: block;
  margin: 20px auto;
  padding: 12px 24px;
  width: 180px;
  text-align: center;
  color: white;
  border: none;
  border-radius: 6px;
}

.family-register > button:hover,
.add-child-btn:hover {
  background: linear-gradient(135deg, #219a52, #1e8449);
}

.actions {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
}

.actions button {
  background: linear-gradient(135deg, #8e44ad, #7d3c98);
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
}

.actions button:hover {
  background: linear-gradient(135deg, #7d3c98, #6c3483);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .family-register {
    padding: 16px;
    margin: 0;
  }

  .parent-form, .child-form {
    padding: 16px;
  }

  input, select {
    padding: 8px 10px;
  }
}

/* 留停相關樣式 */
.parent-form > div {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
  border-left: 4px solid #f39c12;
}

/* 改善複選框樣式 */
input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #bdc3c7;
  border-radius: 3px;
  background: white;
  position: relative;
  cursor: pointer;
  margin-right: 8px;
}

input[type="checkbox"]:checked {
  background: #3498db;
  border-color: #3498db;
}

input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.error {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: -10px;
  margin-bottom: 10px;
}
</style>
