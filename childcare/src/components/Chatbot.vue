<template>
  <div></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// 檢查是否為後台頁面的函數
const isAdminRelatedPage = () => {
  const isAdminPath = route.path.startsWith('/admin');
  const isAdminLogin = route.name === 'AdminLogin';
  return isAdminPath || isAdminLogin;
};

// 移除聊天機器人的函數
const removeChatbot = () => {
  // 移除 script
  const script = document.getElementById('OydbPowUUbPfBaYp');
  if (script) {
    script.remove();
  }

  // 移除 style
  const styles = document.querySelectorAll('style');
  styles.forEach(style => {
    if (style.textContent && style.textContent.includes('dify-chatbot-bubble-button')) {
      style.remove();
    }
  });

  // 移除聊天框元素
  const bubble = document.getElementById('dify-chatbot-bubble-button');
  const window_ = document.getElementById('dify-chatbot-bubble-window');
  if (bubble) bubble.remove();
  if (window_) window_.remove();

  // 清除配置
  if (window.difyChatbotConfig) {
    delete window.difyChatbotConfig;
  }
  if (window.difyChatbot) {
    delete window.difyChatbot;
  }
};

onMounted(() => {
  // 檢查是否為後台頁面或後台登入頁
  if (isAdminRelatedPage()) {
    console.log('Chatbot: Skipped loading on admin page');
    return;
  }

  window.difyChatbotConfig = {
    token: 'OydbPowUUbPfBaYp',
    inputs: {},
    systemVariables: {},
    userVariables: {},
  };

  const script = document.createElement('script');
  script.src = 'https://udify.app/embed.min.js';
  script.id = 'OydbPowUUbPfBaYp';
  script.defer = true;
  document.head.appendChild(script);

  const style = document.createElement('style');
  style.textContent = `
    /* Ensure the injected widget bubble is larger and has hover behavior */
    #dify-chatbot-bubble-button {
      background-color: #e35d6a !important;
      position: fixed !important;
      width: 60px !important;
      height: 60px !important;
      border-radius: 50% !important;
      bottom: 100px !important;
      right: 100px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: transform 0.15s ease, box-shadow 0.15s ease !important;
      box-shadow: 0 6px 16px rgba(227,93,106,0.12) !important;
      z-index: 2001 !important;
      cursor: pointer !important;
      /* create local stacking context for pseudo elements */
    }

    /* Hover enlarges the bubble and increases shadow */
    #dify-chatbot-bubble-button:hover {
      transform: scale(1.08) !important;
      box-shadow: 0 12px 24px rgba(227,93,106,0.18) !important;
    }

    /* Make the inner icon scale a bit on hover */
    #dify-chatbot-bubble-button svg,
    #dify-chatbot-bubble-button img {
      width: 36px !important;
      height: 36px !important;
      transition: transform 0.15s ease !important;
    }
    #dify-chatbot-bubble-button:hover svg,
    #dify-chatbot-bubble-button:hover img {
      transform: scale(1.14) !important;
    }

    /* Tooltip that appears at the button's top-left on hover */
    #dify-chatbot-bubble-button::before {
      content: "嗨！我是客服，有需要可以跟我說喔";
      position: absolute !important;
      /* place above and slightly to the left of the button */
      bottom: calc(100% + 12px) !important; /* above the button */
      left: -12px !important; /* shift to the left */
      transform-origin: right bottom !important;
      background: #fff !important;
      color: #333 !important;
      border: 1px solid #e35d6a !important;
      padding: 8px 12px !important;
      border-radius: 10px !important;
      font-size: 13px !important;
      white-space: nowrap !important;
      opacity: 0 !important;
      pointer-events: none !important;
      transition: opacity 0.12s ease, transform 0.12s ease !important;
      transform: translateY(6px) scale(0.98) !important;
      z-index: 2002 !important;
      box-shadow: 0 8px 20px rgba(0,0,0,0.08) !important;
    }

    /* small arrow */
    #dify-chatbot-bubble-button::after {
      content: "";
      position: absolute !important;
      bottom: calc(100% + 4px) !important;
      left: 12px !important;
      width: 8px !important;
      height: 8px !important;
      background: #fff !important;
      border-left: 1px solid #e35d6a !important;
      border-top: 1px solid #e35d6a !important;
      transform: rotate(45deg) !important;
      opacity: 0 !important;
      transition: opacity 0.12s ease !important;
      z-index: 2002 !important;
      pointer-events: none !important;
    }

    /* Chat window positioning (keeps it above the bubble) */
    #dify-chatbot-bubble-window {
      width: 24rem !important;
      height: 60rem !important;
      position: fixed !important;
      bottom: 60px !important;
      right: 200px !important;
    }
  `;
  document.head.appendChild(style);
});

onBeforeUnmount(() => {
  // 組件卸載前移除聊天機器人
  removeChatbot();
});

// 監聽路由變化，如果進入後台頁面則移除聊天機器人
watch(() => route.path, (newPath) => {
  if (isAdminRelatedPage()) {
    removeChatbot();
  }
}, { immediate: false });
</script>

<style scoped>
</style>
