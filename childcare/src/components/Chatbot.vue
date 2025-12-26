<template>
  <div v-if="!isAdminRelatedPage()">
    <!-- 浮動按鈕 -->
    <div class="chatbot-bubble" @click="toggleChat">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <div class="tooltip">嗨！我是客服，有需要可以跟我說喔</div>
    </div>

    <!-- 聊天視窗 -->
    <transition name="slide-fade">
      <div v-if="isChatOpen" class="chatbot-window">
        <!-- 標題欄 -->
        <div class="chatbot-header">
          <h3>客服聊天</h3>
          <button @click="toggleChat" class="close-btn">✕</button>
        </div>

        <!-- 訊息列表 -->
        <div class="chatbot-messages" ref="messagesContainer">
          <div v-if="messages.length === 0" class="welcome-message">
            <p>👋 您好！我是公托服務的客服機器人</p>
            <p>有什麼可以幫您的嗎？</p>
          </div>
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message', msg.role]"
          >
            <div class="message-content">
              <div class="message-avatar">
                {{ msg.role === 'user' ? '👤' : '🤖' }}
              </div>
              <div class="message-text">
                <p v-if="msg.role === 'user'">{{ msg.content }}</p>
                <div v-else v-html="renderMarkdown(msg.content)" class="markdown-content"></div>
                <span class="message-time">{{ msg.time }}</span>
              </div>
            </div>
          </div>
          <div v-if="isLoading" class="message assistant">
            <div class="message-content">
              <div class="message-avatar">🤖</div>
              <div class="message-text">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 輸入框 -->
        <div class="chatbot-input">
          <input
            v-model="userInput"
            @keyup.enter="sendMessage"
            :disabled="isLoading"
            placeholder="輸入訊息..."
            type="text"
          />
          <button
            @click="sendMessage"
            :disabled="isLoading || !userInput.trim()"
            class="send-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>

          <!-- 麥克風按鈕 -->
          <button
            v-if="isSttSupported"
            @click="toggleListening"
            :class="['mic-btn', { active: isListening }]"
            :disabled="isLoading"
            :title="isListening ? '停止語音輸入' : '語音輸入'"
            aria-label="語音輸入"
          >
            <!-- mic icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
              <path d="M19 11a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7 7 0 006 6.93V20H9a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07A7 7 0 0019 11z" />
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const route = useRoute();

// 狀態管理
const isChatOpen = ref(false);
const userInput = ref('');
const messages = ref([]);
const isLoading = ref(false);
const messagesContainer = ref(null);
const conversationId = ref('');

// 讓 user 在整個 session 固定，Dify 才能正確延續對話/權限
const difyUserId = (() => {
  const key = 'dify_user_id';
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const created = `web-${Math.random().toString(16).slice(2)}-${Date.now()}`;
  sessionStorage.setItem(key, created);
  return created;
})();

// API 配置（從環境變數讀取）
const DIFY_API_URL = import.meta.env.VITE_DIFY_API_URL || '/dify-api/v1/chat-messages';
const DIFY_API_KEY = import.meta.env.VITE_DIFY_API_KEY;

// 檢查是否為後台頁面
const isAdminRelatedPage = () => {
  const isAdminPath = route.path.startsWith('/admin');
  const isAdminLogin = route.name === 'AdminLogin';
  return isAdminPath || isAdminLogin;
};

// 切換聊天視窗
const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
  if (isChatOpen.value) {
    nextTick(() => {
      scrollToBottom();
    });
  }
};

// 滾動到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 獲取當前時間
const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

// 發送訊息
const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  if (!DIFY_API_KEY) {
    messages.value.push({
      role: 'assistant',
      content: '未設定 Dify API Key（VITE_DIFY_API_KEY），請先在 .env 填好並重啟 dev server。',
      time: getCurrentTime()
    });
    return;
  }

  const messageText = userInput.value.trim();

  // 添加使用者訊息
  messages.value.push({
    role: 'user',
    content: messageText,
    time: getCurrentTime()
  });

  userInput.value = '';
  isLoading.value = true;

  nextTick(() => {
    scrollToBottom();
  });

  try {
    const requestData = {
      inputs: {},
      query: messageText,
      response_mode: 'blocking',
      user: difyUserId
    };

    if (conversationId.value) {
      requestData.conversation_id = conversationId.value;
    }

    console.log('Sending message to Dify API:', {
      url: DIFY_API_URL,
      method: 'POST',
      data: requestData,
      apiKey: DIFY_API_KEY ? `${DIFY_API_KEY.substring(0, 15)}...` : 'missing'
    });

    const response = await axios.post(DIFY_API_URL, requestData, {
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Dify API Response:', response.data);

    if (response.data?.conversation_id) {
      conversationId.value = response.data.conversation_id;
    }

    messages.value.push({
      role: 'assistant',
      content: response.data?.answer || '抱歉，我現在無法回答。',
      time: getCurrentTime()
    });
  } catch (error) {
    const status = error.response?.status;
    const serverMsg = error.response?.data?.message || error.response?.data?.error;

    console.error('Chatbot API Error:', error);
    console.error('Error details:', {
      message: error.message,
      status,
      response: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });

    let errorMessage = '抱歉，發生了一些錯誤，請稍後再試。';
    if (status === 401) {
      errorMessage = '認證失敗（401），請檢查 Dify API Key 是否正確。';
    } else if (status === 404) {
      errorMessage = '請求路徑不存在（404）。如果你看到是 http://localhost:5173/dify-api/...，代表 Vite proxy 沒生效：請停止並重啟 npm run dev。';
    } else if (status) {
      errorMessage = `請求失敗（${status}）${serverMsg ? `：${serverMsg}` : ''}`;
    } else if (error.message?.includes('Network Error')) {
      errorMessage = 'Network Error：通常是 CORS / proxy 沒生效 / 或網路阻擋。請確認 Vite proxy 與重啟。';
    }

    messages.value.push({
      role: 'assistant',
      content: errorMessage,
      time: getCurrentTime()
    });
  } finally {
    isLoading.value = false;
    nextTick(() => {
      scrollToBottom();
    });
  }
};

// Markdown 轉 HTML（並做基本清理）
const renderMarkdown = (text) => {
  const raw = marked.parse(text ?? '', {
    breaks: true, // 單換行也會換行
    gfm: true
  });
  return DOMPurify.sanitize(raw);
};

// =====================
// Speech to Text (Web Speech API)
// =====================
const isSttSupported = ref(false);
const isListening = ref(false);
let recognition = null;

const initSpeechRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    isSttSupported.value = false;
    return;
  }

  isSttSupported.value = true;
  recognition = new SpeechRecognition();

  // 語系：優先繁中，其次中文
  recognition.lang = 'zh-TW';
  recognition.interimResults = true;
  recognition.continuous = false; // 每次按下錄一次，較穩定

  recognition.onstart = () => {
    isListening.value = true;
  };

  recognition.onend = () => {
    isListening.value = false;
  };

  recognition.onerror = (e) => {
    console.error('SpeechRecognition error:', e);
    isListening.value = false;
  };

  recognition.onresult = (event) => {
    // 將結果整理成文字
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }

    // 即時顯示在輸入框
    userInput.value = transcript.trim();

    // 如果是最終結果，停掉錄音（避免卡住）
    const last = event.results[event.results.length - 1];
    if (last && last.isFinal) {
      // 讓使用者有機會看一下內容，不自動送出
      // 如果你想自動送出，可改成： setTimeout(() => sendMessage(), 100);
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    }
  };
};

const toggleListening = () => {
  if (!isSttSupported.value) {
    messages.value.push({
      role: 'assistant',
      content: '此瀏覽器不支援語音轉文字（建議使用 Chrome）。',
      time: getCurrentTime()
    });
    return;
  }

  if (!recognition) initSpeechRecognition();

  if (!recognition) return;

  if (isListening.value) {
    try {
      recognition.stop();
    } catch {
      // ignore
    }
    return;
  }

  try {
    recognition.start();
  } catch (e) {
    // 某些瀏覽器在連續 start 會丟錯
    console.error('SpeechRecognition start failed:', e);
  }
};

onBeforeUnmount(() => {
  try {
    recognition?.stop?.();
  } catch {
    // ignore
  }
});

// 初始化支援偵測
initSpeechRecognition();

// 監聽路由變化
watch(() => route.path, () => {
  if (isAdminRelatedPage()) {
    isChatOpen.value = false;
  }
});
</script>

<style scoped>
/* 浮動按鈕 */
.chatbot-bubble {
  position: fixed;
  bottom: 120px;
  right: 200px;
  width: 60px;
  height: 60px;
  background-color: #e35d6a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(227, 93, 106, 0.12);
  z-index: 2001;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.chatbot-bubble:hover {
  transform: scale(1.08);
  box-shadow: 0 12px 24px rgba(227, 93, 106, 0.18);
}

.chatbot-bubble svg {
  width: 36px;
  height: 36px;
  color: white;
  transition: transform 0.15s ease;
}

.chatbot-bubble:hover svg {
  transform: scale(1.14);
}

.chatbot-bubble .tooltip {
  position: absolute;
  bottom: calc(100% + 12px);
  left: -12px;
  background: white;
  color: #333;
  border: 1px solid #e35d6a;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s ease, transform 0.12s ease;
  transform: translateY(6px) scale(0.98);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.chatbot-bubble:hover .tooltip {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.chatbot-bubble .tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 20px;
  width: 8px;
  height: 8px;
  background: white;
  border-right: 1px solid #e35d6a;
  border-bottom: 1px solid #e35d6a;
  transform: translateY(-4px) rotate(45deg);
}

/* 聊天視窗 */
.chatbot-window {
  position: fixed;
  bottom: 150px;
  right: 300px;
  width: 400px;
  height: 800px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 2000;
  overflow: hidden;
}

/* 標題欄 */
.chatbot-header {
  background: linear-gradient(135deg, #e35d6a 0%, #f27280 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chatbot-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 訊息列表 */
.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
}

.welcome-message {
  text-align: center;
  color: #666;
  margin-top: 40px;
}

.welcome-message p {
  margin: 8px 0;
  font-size: 16px;
}

.message {
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease;
}

.message-content {
  display: flex;
  gap: 10px;
}

.message.user .message-content {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #e35d6a;
}

.message.assistant .message-avatar {
  background: #6c757d;
}

.message-text {
  max-width: 70%;
  position: relative;
}

.message-text p {
  margin: 0;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message.user .message-text p {
  background: #e35d6a;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-text p {
  background: white;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-time {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  padding: 0 4px;
}

.message.user .message-time {
  text-align: right;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-8px);
  }
}

/* 輸入框 */
.chatbot-input {
  display: flex;
  gap: 8px;
  padding: 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.chatbot-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.chatbot-input input:focus {
  border-color: #e35d6a;
}

.chatbot-input input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.send-btn {
  width: 44px;
  height: 44px;
  background: #e35d6a;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, transform 0.1s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #d14d5a;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.send-btn svg {
  width: 20px;
  height: 20px;
}

/* 麥克風按鈕：弱化風格（預設低調），錄音中才高亮 */
.mic-btn {
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: 999px;
  color: rgba(0, 0, 0, 0.55);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
  flex-shrink: 0;
}

.mic-btn:hover:not(:disabled) {
  border-color: rgba(0, 0, 0, 0.28);
  color: rgba(0, 0, 0, 0.7);
}

.mic-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.mic-btn.active {
  background: rgba(227, 93, 106, 0.12);
  border-color: rgba(227, 93, 106, 0.55);
  color: #e35d6a;
}

.mic-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mic-btn svg {
  width: 18px;
  height: 18px;
}

/* 動畫 */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滾動條樣式 */
.chatbot-messages::-webkit-scrollbar {
  width: 6px;
}

.chatbot-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chatbot-messages::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.chatbot-messages::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* assistant 回覆：用「一個」氣泡包住整段 Markdown，避免每個 <p>/<ul> 都變成一個框 */
.message.assistant .markdown-content {
  background: #fff;
  color: #333;
  padding: 12px 16px;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message.assistant .markdown-content :deep(p) {
  margin: 0;
  line-height: 1.6;
}

.message.assistant .markdown-content :deep(p + p) {
  margin-top: 8px;
}

.message.assistant .markdown-content :deep(ul),
.message.assistant .markdown-content :deep(ol) {
  margin: 8px 0 0;
  padding-left: 20px;
}

.message.assistant .markdown-content :deep(li) {
  margin: 4px 0;
}

.message.assistant .markdown-content :deep(pre) {
  margin: 10px 0 0;
  padding: 12px 14px;
  background: #0b1020;
  color: #e6e6e6;
  border-radius: 10px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.5;
}

.message.assistant .markdown-content :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.message.assistant .markdown-content :deep(:not(pre) > code) {
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 6px;
}

.message.assistant .markdown-content :deep(blockquote) {
  margin: 10px 0 0;
  padding: 10px 12px;
  border-left: 4px solid #e35d6a;
  background: #fff5f6;
  border-radius: 10px;
}

.message.assistant .markdown-content :deep(h1),
.message.assistant .markdown-content :deep(h2),
.message.assistant .markdown-content :deep(h3) {
  margin: 0 0 6px;
  font-size: 14px;
}

.message.assistant .markdown-content :deep(a) {
  color: #e35d6a;
  text-decoration: underline;
}

/* user 氣泡 */
.message.user .message-text p {
  background: #e35d6a;
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  border-bottom-right-radius: 4px;
}

/* =====================
   RWD / Responsive
   ===================== */

/* 平板：縮小窗體，靠右下但留安全距 */
@media (max-width: 1024px) {
  .chatbot-window {
    right: 24px;
    bottom: 90px;
    width: 360px;
    height: 560px;
  }

  .chatbot-bubble {
    right: 24px;
    bottom: 24px;
  }
}

/* 手機：聊天視窗全螢幕（更像 App），按鈕移到右下 */
@media (max-width: 768px) {
  .chatbot-window {
    right: 0;
    left: 0;
    bottom: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }

  /* 讓內容不會被手機瀏覽器底部 bar 擠到 */
  .chatbot-messages {
    padding-bottom: 24px;
  }

  .chatbot-bubble {
    right: 16px;
    bottom: 16px;
  }
}

/* 更小螢幕：再縮小按鈕，避免太佔 */
@media (max-width: 360px) {
  .chatbot-bubble {
    width: 52px;
    height: 52px;
  }

  .chatbot-bubble svg {
    width: 30px;
    height: 30px;
  }

  .chatbot-window {
    height: 100dvh; /* 支援新型瀏覽器動態視窗高度 */
  }
}
</style>
