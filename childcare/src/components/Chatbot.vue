<template>
  <div></div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
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
    #dify-chatbot-bubble-button {
      background-color: #e35d6a !important;
      position: fixed !important;
      width: 80px !important;
      height: 80px !important;
      border-radius: 50% !important;
      bottom: 100px !important;
      right: 100px !important;
    }
    #dify-chatbot-bubble-button svg {
      width: 30px !important;
      height: 30px !important;
    }
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
</script>

<style scoped>
</style>

