//在 LoginView.vue 中，驗證碼圖片的來源是 captchaImg，其值由 generateCaptcha() 產生。
// generateCaptcha 函式從 ../api/captcha.js 匯入，會回傳一個驗證碼圖片的資料。
// 當頁面初始化或點擊驗證碼圖片、刷新按鈕時，會呼叫 refreshCaptcha()，這個方法會更新 captchaImg，讓圖片重新產生。
// 使用者輸入驗證碼後，登入時會將帳號、密碼、驗證碼一起傳給 authStore.loginUser 進行驗證。
export function generateCaptcha() {
  // 產生隨機 4 碼字母數字
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // 用 canvas 產生 base64 圖片（放大尺寸與字體）
  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 48;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 120, 48);
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#333';
  ctx.textBaseline = 'middle';
  ctx.fillText(code, 20, 28);
  // 干擾線
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = '#'+Math.floor(Math.random()*16777215).toString(16);
    ctx.beginPath();
    ctx.moveTo(Math.random()*120, Math.random()*48);
    ctx.lineTo(Math.random()*120, Math.random()*48);
    ctx.stroke();
  }
  const img = canvas.toDataURL('image/png');

  // 存到 sessionStorage
  sessionStorage.setItem('mock_captcha', code);
  return img;
}

export function getMockCaptchaValue() {
  return sessionStorage.getItem('mock_captcha') || '';
}
