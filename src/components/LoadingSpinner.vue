<template>
  <div class="loading-overlay">
    <div class="loading-spinner">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>
    <p class="loading-text">加载中...</p>
  </div>
</template>

<script setup lang="ts">
/**
 * 加载指示器组件
 * 显示全屏加载动画
 */
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(10px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.loading-spinner {
  position: relative;
  width: 100px;
  height: 100px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.05);
  }
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px solid transparent;
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: #667eea;
  animation-delay: -0.45s;
  filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.6));
}

.spinner-ring:nth-child(2) {
  border-right-color: #764ba2;
  animation-delay: -0.3s;
  filter: drop-shadow(0 0 8px rgba(118, 75, 162, 0.6));
}

.spinner-ring:nth-child(3) {
  border-bottom-color: #f093fb;
  animation-delay: -0.15s;
  filter: drop-shadow(0 0 8px rgba(240, 147, 251, 0.6));
}

.spinner-ring:nth-child(4) {
  border-left-color: #ffd89b;
  filter: drop-shadow(0 0 8px rgba(255, 216, 155, 0.6));
}

.loading-text {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  margin-top: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  background: linear-gradient(135deg, #fff, #f0f0f0);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: textGlow 2s ease-in-out infinite;
}

@keyframes textGlow {
  0%, 100% {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
  50% {
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7), 0 0 15px rgba(255, 255, 255, 0.3);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
    border-width: 4px;
  }
  50% {
    border-width: 6px;
  }
  100% {
    transform: rotate(360deg);
    border-width: 4px;
  }
}

/* 深色主题适配 */
.dark-theme .loading-overlay {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6));
}

.dark-theme .spinner-ring:nth-child(1) {
  border-top-color: #818cf8;
  filter: drop-shadow(0 0 8px rgba(129, 140, 248, 0.6));
}

.dark-theme .spinner-ring:nth-child(2) {
  border-right-color: #a78bfa;
  filter: drop-shadow(0 0 8px rgba(167, 139, 250, 0.6));
}

.dark-theme .spinner-ring:nth-child(3) {
  border-bottom-color: #c4b5fd;
  filter: drop-shadow(0 0 8px rgba(196, 181, 253, 0.6));
}

.dark-theme .spinner-ring:nth-child(4) {
  border-left-color: #ddd6fe;
  filter: drop-shadow(0 0 8px rgba(221, 214, 254, 0.6));
}

.dark-theme .loading-text {
  background: linear-gradient(135deg, #f1f5f9, #cbd5e0);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-spinner {
    width: 80px;
    height: 80px;
  }
  
  .loading-text {
    font-size: 1.1rem;
    margin-top: 1.5rem;
  }
}

@media (max-width: 480px) {
  .loading-spinner {
    width: 60px;
    height: 60px;
  }
  
  .loading-text {
    font-size: 1rem;
    margin-top: 1.2rem;
  }
  
  .spinner-ring {
    border-width: 3px;
  }
}
</style>